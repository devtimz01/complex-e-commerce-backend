const checkout = reqiure('../model/checkoutSchema');
const {cookiejwtAuth,admin} = require('../middleware/cookieJwtAuth');
const Cart = require('../model/cartSchema');
const productRequestCollection = require('./requestSchema');
const Orders = require('../model/orderSchema');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_KEY);
require('dotenv').config();

//route /api/checkout
//@desc checkout..verify if deliveryDetails have been checked
//@access public
router.post('/',cookiejwtAuth,async(req,res)=>{
    const {checkoutItem,shippingAddress,paymentMethod,totalPrice}=req.body;
    if(!checkoutItem||checkoutItem.legnth==0){
        return res.status(404).send('no items in checkout')
    }
    try{
       const newCheckoutList = await checkout.create({
            user,
            checkoutItem,
            shippingAddress,
            paymentMethod,
            totalPrice,
            isPaid: false,
            paymentStatus: "pending",
        });
        //NB: add a delivery fee to the total cartItem.price
        res.status(201).json({newCheckoutList});
    }
    catch(err){
        return res.status(500).send('server error');
    }
});

//route /api/checkout/paymentGateway
//@desc integrate payment gateway with stripe
//@access public
router.post('/paymentGateway',async(req,res)=>{
    const{checkoutItem}= req.body;

    const session = await stripe.checkout.session.create({
        payment_method_type:['card'],
        list_item:[{
            price_data:{
                currency:'',
                product_data:{
                    name:checkoutItem.name,         
                },
                unit_amount: checkoutItem.price*100
            },
            quantity:checkoutItem.quantity
        }],
        mode: "payment",
        success_url:localhost5050,
        cancel_url:localhost5050
    })
})

//route /api/checkout/updatePaymentStatus
//@desc update paymentStatus if it's paid
//@access public
router.put('/:id',async(req,res)=>{
    const{paymentStatus,paymentDetails}= req.body;
    try{
      const updatedCheckout =  await checkout.updateOne({_id:req.params.id},{$set:{isPaid: true, paymentStatus,paymentDetails}})
        return res.status(201).json({updatedCheckout});
    }
    catch(err){
        return res.status(500).send('payment status failed to update')
    }
})

//route /api/checkout/finalize
//@desc finalize after payment
//@access public
router.post('/:id/finalize',cookiejwtAuth,async(req,res)=>{
    //convert your checkout to an order
    try{
        const checkout = await checkout.findById(req.params.id)
        if(!checkout){
            return res.status(404).send('chcekout not found')
        }
           if(checkout.isPaid && !checkoutisFinalized){
            //create a final order
              const finalOrder = await Orders.create({
               user:checkout.user,
               orderItems:checkout.checkoutItem ,
               shippingAddress: checkout.shippingAddress,
               paymentMethod: checkout.paymentMethod,
               totalPrice: checkout.totalPrice,
               isPaid: true,
               paidAt: checkout.paidAt,
               paymentStatus: "paid",
               paymentDetails: checkout.paymentDetails,
               isDelivered : false
              })
              //mark checkout as finalized
              checkout.isFinalized = true;
              checkout.isFinalizedAt= Date.now();

        }
    //delete checkout cart since its already converted to an order
         await Cart.findOneAndDelete({user:checkout.user})
         return res.satus(200).json({finalOrder});
    }
    catch(err){
        return res.satus(500).send('server error detected while processing order');
    }
})

module.exports = router;


