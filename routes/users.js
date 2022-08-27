const router = require("express").Router()
const User = require("../models/User")
const path = require('path')
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const fs = require('fs')

const pwdRegexCheck = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
const userRegexCheck = /^[a-zA-Z0-9]([._](?![._])|[a-zA-Z0-9]){6,18}[a-zA-Z0-9]*$/
const emailRegexCheck = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,100}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,100}[a-zA-Z0-9])?)*$/

// παραγωγη access token, με private key και αλγοριθμο RS512 και expiration date τα 15 λεπτα
// για χρηση RS512 αλγοριθμου 2048 bits key is minimum required by the JWA specification
// παραγωγη access token, με private key και αλγοριθμο RS512 και expiration date τα 15 λεπτα
// για χρηση RS512 αλγοριθμου 2048 bits key is minimum required by the JWA specification
const createAccessToken = (user) => {
    // ανοιγμα του αρχειου accPrivate.pem που κραταει το 2048bit RSA private key μας
    const private_key = fs.readFileSync(path.join(process.cwd(), "keys/accPrivate.pem"))
    const {exp, iat, ...other} = user

    return jwt.sign( other, 
        private_key, 
        { algorithm : 'RS512', expiresIn : '15m'})
}

// παραγωγη refresh token, με private key και αλγοριθμο RS512 και expiration date τα 15 λεπτα
// για χρηση RS512 αλγοριθμου 2048 bits key is minimum required by the JWA specification
const createRefreshToken = (user) => {
    // ανοιγμα του αρχειου refPrivate.pem που κραταει το 2048bit RSA private key μας
    const private_key = fs.readFileSync(path.join(process.cwd(), "keys/refPrivate.pem"))
    
    return jwt.sign( user, 
        private_key, 
        { algorithm : 'RS512', expiresIn : '7d'})
}

// μεθοδος για την επαληθευση του access token
// αμα ο χρηστης δεν "κουβαλαει" αυτο το access token
// τοτε δεν μπορει και να κανει της παρακατω ενεργειες
const verify_token = (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader) return res.status(401).json("You are not authorized")
    const access_jwt = authHeader.split(" ")[1]

    const public_key = fs.readFileSync(path.join(process.cwd(), "keys/accPublic.pem"))

    jwt.verify(access_jwt, public_key, {algorithms : ['RS512']}, (err, user) => {
        if (err)  return res.status(403).json("Token not valid")

        req.user = user
        next()
    })
}

// κληση API για την επανεκδοση του access key και καινουργιου refresh key
router.post("/refresh/:id", verify_token, async (req, res) => {

    const refreshToken = req.cookies.refreshCookie

    if (!refreshToken) return res.status(401).json("You are not authorized")

    // δες αμα το refresh token υπαρχει μεσα στην βαση δεδομενων
    const tokenExist = await User.findById(req.params.id, {refresh_token : 1, _id : 0} )

    // σε περιπτωση κλωπης του refresh token δεν μπορει να ξανα χρησημοποιηθει για την δημιουργια
    // καινουργιου access token
    if (tokenExist.refresh_token !== refreshToken) return res.status(403).json("refresh token is not valid")


    const public_key = fs.readFileSync(path.join(process.cwd(), "keys/refPublic.pem"))

    jwt.verify(refreshToken, public_key, async (err, user) => {
        err

        const newAccess = createAccessToken(user)

        //await User.findByIdAndUpdate(req.user._id, {$set: {refresh_token : newRefresh} })

        // δημιουργια cookie για το refresh token δεν θελουμε
        // να ειναι εβαλοτο σε επιθεσεις xss, CSRF
        res
        .set('x-auth', 'Bearer ' + newAccess)
        .status(200)
        .json("Refresh success")
    })
})

// αποσυνδεση του χρηση και ακυρωση των access και refresh token
router.post("/logout/:id", async (req, res) => {
    const refreshToken = req.cookies.refreshCookie
    
    const tokenExist = await User.findById(req.params.id , {refresh_token : 1, _id : 0} )

    if (tokenExist !== refreshToken) {
        await User.findByIdAndUpdate(req.params.id, {refresh_token : ""})

        return res.cookie('refreshCookie', '', {
            httpOnly : true,
            secure : true,
            sameSite : 'strict',
            expires : true,
            maxAge : 1000
        })
        .set('x-auth', '')
        .status(200)
        .json("You have logged out")
    } 
})

// κληση get για να παρουμε τους χρηστες που ειναι φιλοι 
router.get("/", verify_token,  async (req,res) => {
    const userId = req.query.userId
    const username = req.query.username
    try {
        const user = userId ? await User.findById(userId) : await User.findOne({username : username})
        const {password, updatedAt, refresh_token, email, friends, isAdmin, createdAt, __v,  ...other} = user._doc
        res.status(200).json(other)
    } catch(err) {
        res.status(500).json(err)
    }
})

// ενημερωση username χρηστη
router.put("/usernameCh/:id", verify_token, async (req, res) => {

    const user = await User.findById(req.params.id, {password : 1})

    const validPwd = await bcrypt.compare(req.body.password, user.password)

    if (validPwd) {
        if (req.body.username) {
            if(userRegexCheck.test(req.body.username)) {
                const username = await User.findOne({
                    username:req.body.username
                })

                if (username) {
                    return res.status(409).send({"message" : "Username is already taken"})
                } else {
                    try {
                        await User.findByIdAndUpdate(req.params.id, {
                            username: req.body.username,
                        })

                        return res.status(200).send({"message" : "Username Updated"})
                    } catch(err) {
                        res.status(500).send(err)
                    }
                }
            } else {
                return res.status(400).send("test") 
            }
        } else {
            return res.status(400).send({"message" : "Field must not be empty"})
        }
    } else {
        return res.status(404).send({"message" : "Wrong password"})
    }
})

// ενημερωση email χρηστη
router.put("/emailCh/:id", verify_token, async (req, res) => {
    const user = await User.findById(req.params.id, {password : 1})

    const validPwd = await bcrypt.compare(req.body.password, user.password)

    if (validPwd) {
        if (!req.body.email) return res.status(400).send({"message" : "Field must not be empty"})

        if (req.body.email !== req.body.ReEmail) return res.status(400).send({"message" : "Emails are not the same"})

        /* -----------------------Email Validator---------------------------------------------------------------- */
        const validMail = emailRegexCheck.test(req.body.email)
        if (!validMail) return req.status(400).send({"message" : "Email is not Valid"})

        const email = await User.findOne({
            email:req.body.email
        })

        if (email) return res.status(409).send({"message" : "Email is already taken"})

        try {
            await User.findByIdAndUpdate(req.params.id, {
                email: req.body.email,
            })
            res.status(200).send({"message" : "Email Updated"})
        } catch(err) {
            res.status(500).send(err)
        }

    } else {
        return res.status(404).json({"Error" : "Wrong password"})
    }
})

// ενημερωση password χρηστη
router.put("/passwordCh/:id", verify_token, async (req, res)=>{
    const user = await User.findById(req.params.id, {password : 1})

    const validPwd = await bcrypt.compare(req.body.OldPassword, user.password)

    if (!validPwd) return res.status(404).send({"message" : "You typed your password wrong"})

    if (!req.body.password|| !req.body.RePassword) return res.status(400).send({"Password" : "Fields must not be empty"})

    const validRegexPwd = pwdRegexCheck.test(req.body.password)
    if(!validRegexPwd) return res.status(400).json({"message" : "Minimum 8 characters, at least one uppercase letter, one lowercase letter, one number and one special character (@$!%*?&)"})

    if (req.body.password !== req.body.RePassword) return res.status(400).send({"message" : "Passwords are not the same"})

    
    const salt = await bcrypt.genSalt(10)
    const hashedPwd = await bcrypt.hash(req.body.password, salt)

    try {
        await User.findByIdAndUpdate(req.params.id, {
            password: hashedPwd,
        })
        res.status(200).send({"message" : "Password Updated"})
    } catch(err) {
        res.status(500).json(err)
    }

})

// διαγραφη του χρηστη απο την βαση δεδομενων
router.delete("/:id", verify_token, async (req,res) => {
    if(req.body.userId === req.params.id || req.body.isAdmin) {
        try {
            await User.findByIdAndDelete(req.params.id)
            res.status(200).json("Delete succefull")
        } catch(err) {
            res.status(500).json(err)
        }
    } else {
        res.status(403).json("You can't delete that account")
    }
})

// get κληση για να παρουμε το array με τους φιλους μας
router.get("/friends/:id", verify_token, async (req,res) => {
    try {
        const user = await User.findById(req.params.id);
        const friends = await Promise.all(
          user.friends.map((friendId) => {
            return User.findById(friendId)
          })
        )

        let friendList = []
        friends.map((friend) => {
          const { _id, username, profilePic, coverPic } = friend
          friendList.push({ _id, username, profilePic, coverPic })
        })

        res.status(200).json(friendList)
      } catch (err) {
        res.status(500).json(err)
      }
})

router.get("/getUsers", verify_token, async (req,res) => {
    try {
        const users = await User.find({}, {username : 1, coverPic : 1, profilePic : 1})
        res.status(200).json(users)
      } catch (err) {
        res.status(500).json(err)
      }
})

// request καποιου ατομου για φιλια
router.put("/:id/friendReq", verify_token, async (req,res) => {
    if(req.params.id !== req.body.userId) {
        try {
            const Fuser = await User.findById(req.params.id)
            const Cuser = await User.findById(req.body.userId)

            if(!Fuser.friends.includes(req.body.userId)) {
                await Fuser.updateOne({ $push:{ additionAc:req.body.userId } })
                await Cuser.updateOne({ $push:{ pendingAc:req.params.id } })
            }

            res.status(200).send({message : "Friend request has been sent"})
            
        } catch (err) {
            res.status(500).json(err)
        }
    } else {
        res.status(403).send({message : "Can't friend request yourself"})
    }
})

router.put("/:id/cancelFriendReq", verify_token, async (req,res) => {
    if(req.params.id !== req.body.userId) {
        try {
            const Fuser = await User.findById(req.params.id)
            const Cuser = await User.findById(req.body.userId)

            if(!Fuser.friends.includes(req.body.userId)) {
                await Fuser.updateOne({ $pull:{ additionAc:req.body.userId } })
                await Cuser.updateOne({ $pull:{ pendingAc:req.params.id } })
                res.status(200).send({message : "Friend request canceled"})
            }

            
        } catch (err) {
            res.status(500).json(err)
        }
    } else {
        res.status(403).send({message : "Can't cancel friend request"})
    }
})

// καταμετρηση των friend request που εχουμε
router.get("/getRequests/:id", verify_token, async (req,res) => {
    try {
        const resArray = await User.findById(req.params.id, {_id : 0, pendingAc:1})

        res.status(200).json(resArray.pendingAc)
    } catch (err) {
        res.status(500).json(err)
    }
})

// array των friend request που καναμε
router.get("/getAdditions/:id", verify_token, async (req,res) => {
    try {
        const resArray = await User.findById(req.params.id, {_id:0, additionAc:1})

        res.status(200).json(resArray.additionAc)
    } catch (err) {
        res.status(500).json(err)
    }
})

// αποδοχη φιλου
router.put("/:id/friend", verify_token, async (req,res) => {
    if(req.params.id !== req.body.userId) {
        try {
            const Fuser = await User.findById(req.params.id)
            const Cuser = await User.findById(req.body.userId)

            if(!Fuser.friends.includes(req.body.userId)) {
                await Fuser.updateOne({ $push:{ friends:req.body.userId } })
                await Cuser.updateOne({ $push:{ friends:req.params.id } })
                await Fuser.updateOne({ $pull:{ pendingAc:req.body.userId } })

                res.status(200).send({message : "User has been added"})
            } else {
                res.status(403).send({message : "You are already friends"})
            }

        } catch(err) {
            res.status(500)
        }
    } else {
        res.status(403).send({message : "You can't add yourself"})
    }
})

router.put("/:id/rejectFriend", async (req, res) => {
    if (req.params.id !== req.body.userId) {
        try {
            const Fuser = await User.findById(req.params.id)
            const Cuser = await User.findById(req.body.userId)

            await Fuser.updateOne({ $pull:{ pendingAc:req.body.userId } })
            await Cuser.updateOne({ $pull:{ additionAc:req.params.id } })

            const pending = await User.findById(req.params.id, {_id : 0, pendingAc : 1})
            res.status(200).send({message : "Friend request canceled", pending : pending.pendingAc})
        } catch (err) {
            res.status(500)
        }
    } else {
        res.status(403).send({message : "You can't reject yourself"})
    }
})

// διαγραφη φιλου
router.put("/:id/unfriend", verify_token, async (req,res) => {
    if(req.params.id !== req.body.userId) {
        try{
            const Fuser = await User.findById(req.params.id)
            const Cuser = await User.findById(req.body.userId)

            if(Fuser.friends.includes(req.body.userId)) {
                await Fuser.updateOne({ $pull:{ friends:req.body.userId } })
                await Cuser.updateOne({ $pull:{ friends:req.params.id } })

                res.status(200).json("User has been unfriended")
            } else {
                res.status(403).json("You are not friends")
            }

        } catch(err) {
            res.status(500).json(err)
        }
    } else {
        res.status(403).json({message : "You can't unfriend yourself"})
    }
})

module.exports = router