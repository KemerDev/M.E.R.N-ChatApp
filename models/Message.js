const mongoose = require("mongoose");
const jwt = require("jsonwebtoken")
const fs = require('fs');

const MessageTable = new mongoose.Schema(
    {
        initMess : {
            type: Boolean,
            default: false,
        },

        conversationId:{
            type: String,
        },

        read:{
            type: Boolean,
            default: false,
        },

        data : {
            sender:{
                type: String,
            },
            text:{
                type: String,
            },
        }, 
    },
    {timestamps: true}
);

module.exports = mongoose.model("Message", MessageTable);