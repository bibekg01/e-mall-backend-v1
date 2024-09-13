import {Router} from 'express'
import { processPayment, sendStripeApi } from '../controllers/paymentController.js'
const router = Router()

router.get('/stripeapi', sendStripeApi)
router.post('/process/payment', processPayment)




export default router