const router = require("express").Router()
const Message = require("../models/Message")
const path = require('path')
const jwt = require("jsonwebtoken")
const fs = require('fs')

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

//add
router.post("/", verify_token, async (req, res) => {
    const newMessage = new Message(req.body)

    try {
        const saveMessage = await newMessage.save()
        res.status(200).json(saveMessage)
    } catch(err) {
        res.status(500).json(err)
    }
})

router.put("/:conversationId", verify_token, async (req, res) => {
    try {
        await Message.find({ 
            conversationId:req.params.conversationId,
            read : req.body.read,
            "data.sender" : req.body.sender
        }).updateMany({
            $set : {read : true}
        })

        res.status(200).json("Success")
    } catch (err) {
        res.status(500).json(err)
    }
})

//get
router.get("/:conversationId", verify_token, async (req,res) => {
    try {
        const getMessage = await Message.find({
            conversationId:req.params.conversationId,
        })
        res.status(200).json(getMessage)
    } catch(err) {
        res.status(500).json(err)
    }
})

module.exports = router