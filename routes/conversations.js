const router = require("express").Router()
const Conversation = require("../models/Conversation")
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

//new conv

router.post("/", verify_token, async (req,res) => {

    if (!req.body.senderId || !req.body.receiverId) return res.status(403)

    const newConv = new Conversation({
        members:[req.body.senderId, req.body.receiverId],
    })

    try {
        const saveConv = await newConv.save()
        res.status(200).json(saveConv)
    } catch(err) {
        res.status(500).json(err)
    }
})

router.put("/:conversationId", verify_token, async (req, res) => {
    try {
        await Conversation.findByIdAndUpdate(req.params.conversationId, {
            $set: req.body,
        })
        res.status(200)
    } catch (err) {
        res.status(500).json(err)
    }
})

//get conv of user

router.get("/:userId", verify_token, async (req, res) => {
    try {
        const getConv = await Conversation.find({
            members: {$in:[req.params.userId]},
        })
        res.status(200).json(getConv)
    } catch(err) {
        res.status(500).json(err)
    }
})

module.exports = router