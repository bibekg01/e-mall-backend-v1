import mongoose from 'mongoose'
import {OrderItem} from '../models/orderItems.js'
import {Order} from '../models/orderModel.js'

const postOrder = async(req, res) => {
    try{
        //At first, post the order item model and return the stored ids of the orderitem.

        const orderItemIds = await Promise.all(req.body.order_items.map(async(orderItemData)=>{
            let newOrderItem = new OrderItem({
                product: orderItemData.product,
                quantity: orderItemData.quantity
            })

            //save the order item data
            newOrderItem = await newOrderItem.save()
            return newOrderItem._id
        }))
        console.log("Order item id: ", orderItemIds)


        //calculate the tota; amount
        const totalAmount = await Promise.all(orderItemIds.map(async(orderId)=>{
            const itemOrdered = await OrderItem.findById(orderId).populate('product','product_price')

            const total = itemOrdered.quantity * itemOrdered.product.product_price
            return total
        }))
        console.log('total amount: ', totalAmount);
        
        const totalPrice = totalAmount.reduceRight((acc,curr)=> acc + curr,0)

        //post data to orderModel

        let order = new Order({
            order_items : orderItemIds,
            shipping_address1: req.body.shipping_address1,
            shipping_address2: req.body.shipping_address2,
            city: req.body.city,
            zip: req.body.zip,
            phone: req.body.phone,
            user: req.body.user,
            country: req.body.country,
            total_price: totalPrice

        })

        //save the order to db
        order = await order.save()

        if(!order){
            return res.status(400).json({success:true, message: 'Error on placing order'})
        }
        return res.status(200).json({success:true, message:"Order Placed Successfully", order})


    }
    catch(err){
        console.log(err)
        return res.status(500).json({success:false, message: 'Error on product order api. '})
    }
}

const orderCount = async(req, res) => {
    const totalOrders = (await Order.find()).length

    return res.status(200).json({success:true, message: "Total Order Count: ", totalOrders})
}

const deleteOrder = async(req, res) => {
    try{
        const id = req.params.id
        const order = await Order.findByIdAndDelete(id)
        if(!order){
            return res.status(404).json({
                message: "Order Not Found",
                success:false
            })
        }

    }
    catch(error){
        console.log(error)
        if(error instanceof mongoose.Error.CastError){
            return res.status.json({
                message:"Cast Error. Invalid ObjectId"
            })
        }
        return res.status(400).json({
            success:false, message: "Error on deleting the order"
        })
    }
}

const orderList = async(req, res)=> {
    try {
        // fetch the order
        const orders = await Order.find({}).populate('user', 'name').sort({createdAt:-1})

        //check if order is present or not
        if(!orders || orders.length ==0){
            return res.status(404).json({ success:false, message: "Order Not Found"})
        }

        //return orders
        return res.status(200).json({success:true, message: "Orders List", orders, order_count: orders.length})
        //res send(orders)

        }
        catch(error){
            console.log(error)
            if(error instanceof mongoose.Error.CastError){
                return res.status.json({
                    message:"Cast Error. Invalid ObjectId"
                })
            }
            return res.status(400).json({
                success:false, message: "Error on deleting the order"
            })
        }
}


const userOrdersList = async (req, res) => {
    try {
      // Find the user by the provided username
      const user = await User.findOne({ username: req.params.username });
      
      // If no user found, return a 404 response
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
  
      // Get the userId from the found user object
      const userId = user._id;
  
      // Find the orders associated with the user's userId
      const orderList = await Order.find({ user: userId })
      .populate({
        path: 'order_items',
        populate: {
            path: 'product',
            populate: {
                path: 'category',
                select: 'category_name'
            }
        }
    })
    .populate({
        path: 'user',
        select: 'name'
    });
  
      // Check if orderList exists and is not empty
      if (!orderList || orderList.length === 0) {
        return res.status(404).json({ success: false, message: 'No orders for this user.' });
      }
  
      // Send the order list in the success response
      return res.status(200).json({ success: true, message: 'User order list', orderList });
    } catch (err) {
      console.error(err);
      if (err instanceof mongoose.Error.CastError) {
        return res.status(400).json({
          success: false,
          error: 'Invalid ObjectID',
          message: err.message
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Error on getting user order list API.',
        details: err
      });
    }
  };

const updateStatus=async(req,res)=>{
    try{
        // find the order by id and update status
        const order = await Order.findByIdAndUpdate(req.params.id, {
            status:req.body.status
        },{
            new:true
        })

        // check if the order found and updated successfully
        if(!order){
            return res.status(404).json({succes:false, message:"Order Not found."})
        }
        // return the success response
        return res.status(200).json({succes:true, message:"Order status updated successfully.", order})
    }
    catch(err){
        console.log(err)
        if (err instanceof mongoose.Error.CastError){
          res.status(400).json({
              error:"Invalid ObjectID", 
              success:false, 
              message:err.message})
        }
        res.status(500).json({
          error:"Error on updating order status api.", 
          success:false, 
          details:err})
      }
    }

const orderDetails=async(req,res)=>{
        try{
          // get id from params
          const orderId = req.params.id 
          // Validate if id is a valid ObjectId
          if(!mongoose.Types.ObjectId.isValid(orderId)){
            return res.status(400).json({ 
                error: "Invalid ObjectId(id)", 
                success:false});
          }
          const order = await Order.findById(orderId)
                        .populate({
                            path:'user' ,// field name on the Order Model.
                            select:'name email'
                        })
                        .populate({
                            path:'order_items',
                            populate:{
                                path:'product',
                                populate:{
                                    path:'category',
                                    select:'category_name'
                                }
                            }
                        })
          // check if order with the specified id exists:
          if(!order){
            return res.status(404).json({
                error:"Order not found.", 
                success:false})
          }
          res.json({
            message:"order details",
            success: true, 
            order})
    
        }
        catch(err){
          console.log(err)
          if (err instanceof mongoose.Error.CastError){
            res.status(400).json({
                error:"Invalid ObjectID", 
                success:false, 
                message:err.message})
          }
          res.status(500).json({
            error:"Eroor on getting order details api.", 
            success:false, 
            details:err})
        }
      }
    

export {
    postOrder, orderCount, deleteOrder, orderList, orderDetails, updateStatus, userOrdersList
}