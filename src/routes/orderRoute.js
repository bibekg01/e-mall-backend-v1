import {Router} from 'express'
import { postOrder, orderCount, deleteOrder, orderList, userOrdersList, updateStatus, orderDetails } from '../controllers/orderController.js'

const router = Router()

router.get('/order-list', orderList)
router.get('/order-count', orderCount)
router.post('/post-order', postOrder)
router.delete('/order-delete/:id', deleteOrder)
router.get('/order-details/:id', orderDetails)
router.get('/user-order-list/:username', userOrdersList)
router.put('/update-status/:id', updateStatus)



export default router