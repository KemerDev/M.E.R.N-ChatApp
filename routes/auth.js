const router = require('express').Router()
const User = require('../models/User')
const path = require('path')
const crypto = require('crypto-js')
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const fs = require('fs')

// παραγωγη access token, με private key και αλγοριθμο RS512 και expiration date τα 15 λεπτα
// για χρηση RS512 αλγοριθμου 2048 bits key is minimum required by the JWA specification
const createAccessToken = (user) => {
    // ανοιγμα του αρχειου accPrivate.pem που κραταει το 2048bit RSA private key μας
    const private_key = fs.readFileSync(path.join(process.cwd(), "keys/accPrivate.pem"))

    return jwt.sign( user, 
        private_key, 
        { algorithm : 'RS512', expiresIn : '15m'})
}

//test git 
// παραγωγη refresh token, με private key και αλγοριθμο RS512 και expiration date τα 15 λεπτα
// για χρηση RS512 αλγοριθμου 2048 bits key is minimum required by the JWA specification
const createRefreshToken = (user) => {
    // ανοιγμα του αρχειου refPrivate.pem που κραταει το 2048bit RSA private key μας
    const private_key = fs.readFileSync(path.join(process.cwd(), "keys/refPrivate.pem"))
    
    return jwt.sign( user, 
        private_key, 
        { algorithm : 'RS512', expiresIn : '7d'})
}

const encrypt = (plaintext) => {
    const ciphertext = crypto.AES.encrypt(JSON.stringify(plaintext), 'secret key 123').toString()

    return ciphertext
}

// δημιουργια λογαριασμου χρηστη
router.post("/register", async (req,res)=>{
    try{
        const ename = req.body.Username 
        const mail = req.body.Email
        const pwd = req.body.Password
        const pwd2 = req.body.Password2

        //email valid
        const emailRegexCheck = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,100}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,100}[a-zA-Z0-9])?)*$/
        //Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special characters
        const pwdRegexCheck = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        const userRegexCheck = /^[a-zA-Z0-9]([._](?![._])|[a-zA-Z0-9]){6,18}[a-zA-Z0-9]*$/

        if (!ename) return res.status(400).json({"message" : "Field must not be empty"})
        
        if(!userRegexCheck.test(ename)) return res.status(400).json("test")

        const username = await User.findOne({
            username:ename
        })

        if (username) return res.status(409).json({"message" : "Username is already taken"})
        
        /* -----------------------Email Validator---------------------------------------------------------------- */
        if (!mail) return res.status(400).json({"message" : "Field must not be empty"})

        const validMail = emailRegexCheck.test(mail)
        if (!validMail) return res.status(400).json({"message" : "Email is not Valid"})

        const email = await User.findOne({
            email:mail
        })

        if (email) return res.status(409).json({"message" : "Email is already taken"})

        /* --------------------------------------------------------------------------------------- */

        /* ------------------------Password Validator--------------------------------------------------------------- */
        if (!pwd || !pwd2) return res.status(400).json({"message" : "Field must not be empty"})

        if (pwd !== pwd2) return res.status(400).json({"message" : "Passwords don't much"})

        const validPwd = pwdRegexCheck.test(pwd)
        if(!validPwd) return res.status(400).json({"message" : "Minimum 8 characters, at least one uppercase letter, one lowercase letter, one number and one special character (@$!%*?&)"})
        /* --------------------------------------------------------------------------------------- */

        /* ------------------If all validators pass ecrypt the password before storage------------------------------------ */
        const salt = await bcrypt.genSalt(10);
        const hashedPwd = await bcrypt.hash(pwd, salt)

        const newUser = new User({
            username:ename,
            email:mail,
            password:hashedPwd,
        })

        await newUser.save();
        res.status(200).send("Account created")

    } catch(err) {
        res.status(500).send(err)
    }
})

// συνδεση χρηστη στον λογαριασμο
router.post("/login", async (req,res) => {
    try{
        const user = await User.findOne({
            email:req.body.Email
        })

        // αμα βρεθει ο χρηστης συνεχησε
        if (!user) return res.status(404).send({"message" : "Wrong email or password"})

        // συγκριση κωδικων
        const validPwd = await bcrypt.compare(req.body.Password, user.password)
        if (!validPwd) return res.status(404).send({"message" : "Wrong email or password"})

        const {password, refresh_token, createdAt, updatedAt, additionAc, pendingAc, friends, ...other} = user._doc

        // αποθηκευουμε και τα δυο token μας σε cookies HttpOnly
        const accessToken = encrypt(createAccessToken(other))
        const refreshToken = encrypt(createRefreshToken(other))

        //αποθηκευση του refresh token στην βαση δεδομενων του χρηστη
        await user.updateOne( {$set : { refresh_token : refreshToken }} )

        // δημιουργια cookie για το refresh token δεν θελουμε
        // να ειναι αιβαλοτο σε επιθεσεις xss, CSRF
        res.cookie("refreshCookie", refreshToken, {
            httpOnly : true,
            secure : true,
            sameSite : "Strict",
            expires : true,
            maxAge : 60 * 60 * 24 * 1000 * 7
        })
        .set('x-auth', 'Bearer ' + accessToken)
        .status(200)
        .send("Login Successfull")

    }catch(err) {
        res.status(500).json(err)
    }
})

module.exports = router