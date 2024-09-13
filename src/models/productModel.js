import mongoose from "mongoose";

const {ObjectId }= mongoose.Schema
const productSchema = new mongoose.Schema({
  product_name:{
    type: String,
    required: true,
    trim:true
  },
  slug:{
    type: String,
    unique: true
  },
  product_description:{
    type: String,
    required: true
  },
  product_price:{
    type: Number,
    required: true
  },
  product_rating:{
    type: Number,
    default: 3,
    min:3,
    max:5
  },
  product_images:{
    type:[String], // array of strings
    required: true
  },
  count_in_stock:{
    type: Number,
    required: true,
  },
  category:{
    type: ObjectId,
    ref: 'Category',
    required: true
  }
},{timestamps:true})

export const Product = mongoose.model('Product', productSchema)