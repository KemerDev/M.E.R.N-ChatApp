const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    username:{
        type:String,
        require:true,
        min:3,
        max:20,
        unique:true
    },
    email:{
        type:String,
        required:true,
        max:50,
        unique:true
    },
    password:{
        type:String,
        required:true,
        min:8
    },
    profilePic:{
        type:String,
        default:"default.png"
    },
    coverPic:{
        type:String,
        default:"defaultCover.png"
    },
    additionAc:{
        type:Array,
        default:[]
    },
    pendingAc:{
        type:Array,
        default:[]
    },
    friends:{
        type:Array,
        default:[]
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    refresh_token : {
        type:String,
        default : "",
        expires : "1800000ms"
    }
}, {timestamps:true})

module.exports = mongoose.model("User", UserSchema)