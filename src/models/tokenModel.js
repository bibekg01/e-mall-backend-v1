import mongoose from 'mongoose'

const {ObjectId} = mongoose.Schema // ObjectId is used while taking reference (User in this case.)
const tokenSchema = new mongoose.Schema({
    token:{
        type:String,
        require:true,
    },
    user_id:{
        type:ObjectId,
        ref:"User",
        required:true,
    },
    created_at:{
        type:Date,
        default:Date.now(),
        expires:86400,
    },
})

export const Token = mongoose.model("Token", tokenSchema)