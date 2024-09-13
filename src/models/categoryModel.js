import mongoose from 'mongoose'


const categorySchema = new mongoose.Schema({
    category_name: {
        type:String,
        unique:true,
        required:true,
    },
    slug:{
        type:String,
        unique:true,
    },
},
{timestamps:true});

export const Category=mongoose.model('Category', categorySchema)