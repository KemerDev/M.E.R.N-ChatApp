const mongoose = require("mongoose");

const ConversationTable = new mongoose.Schema(
    {
        initConv : {
            type : Boolean,
            default : true
        },
        
        members: {
            type: Array,
        },
    },
    {timestamps: true}
);

module.exports = mongoose.model("Conversation", ConversationTable);