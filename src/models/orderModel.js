import mongoose from "mongoose"

const {ObjectId}=mongoose.Schema
const orderSchema=new mongoose.Schema({
    order_items:[{
        type:ObjectId,
        required:true,
        ref:'OrderItem'
 } ],
    shipping_address1:{
        type:String,
        required:true,
    },
    shipping_address2:{
        type:String,
    },
    city:{
        type:String,
        required:true,
    },
    zip:{
        type:Number,
        required:true,
    },
    country:{
        type:String,
        required:true,
    }, 
    phone:{
        type:String,
        required:true,
    },
    total_price:{
        type:Number,
        required:true,
    },
    status:{
        type:String,
        required:true,
        enum:['Pending', 'Processing', 'Shipped','Completed','Cancelled'],
        default:'Pending'
    }, 
    user:{
        type:ObjectId,
        required:true,
        ref:'User'
    }
},{timestamps:true})

export const Order = mongoose.model('Order', orderSchema)