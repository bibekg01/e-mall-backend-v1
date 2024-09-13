import Stripe from 'stripe'
import dotenv from 'dotenv'
dotenv.config()

const stripe = Stripe(process.env.STRIPE_SECRET_KEY) //initializing stripe with sk


const processPayment = async(req, res) => {
    try {
        const amountInPaisa = Math.round(req.body.amount * 100); // convert NPR to paisa        
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInPaisa,
            currency: 'npr',
            metadata: { integration_check: 'accept_a_payment' }
        });
        res.json({ client_secret: paymentIntent.client_secret });
    } catch (error) {
        console.log("Error processing payment", error);
        return res.status(500).json({error: "Internal Server Error"});
    }
};

//send stripe api key to frontend
const sendStripeApi = async(req, res) => {
    res.json({stripeApiKey:process.env.STRIPE_API_KEY})
}


export {
    processPayment,
    sendStripeApi
}