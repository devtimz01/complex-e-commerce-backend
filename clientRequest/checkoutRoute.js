const checkout = reqiure('../model/checkoutSchema');
const {cookiejwtAuth,admin} = require('../middleware/cookieJwtAuth');
const Cart = require('../model/cartSchema');
const productRequestCollection = require('./requestSchema');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_KEY);
require('dotenv').config();

//route /api/checkout
//@desc checkout..verify if deliveryDetails have been checked
//@access public

router.get('/',cookiejwtAuth,async(req,res)=>{
    const {checkoutItem}=req.body;
    try{
        await checkout.create({
            checkoutItem,
            isPaid: false,
            paymentStatus: pending
        })    
    }
    catch(err){
        return res.status(500).send('server error')
    }
});

//route /api/checkout/paymentGateway
//@desc integrate payment gateway with stripe
//@access public
router.post('/paymentGateway',async(req,res)=>{
    const{products}= req.body;

    const session = await stripe.checkout.session.create({
        payment_method_type:['card'],
        list_item:[{
            price_data:{
                currency:'',
                product_data:{
                    name:products.name,         
                },
                unit_amount: products.price*100
            },
            quantity:products.quantity
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
    const{paymentStatus,isPaid}= req.body;
    try{

    }
    catch(err){

    }
})

//route /api/checkout/finalize
//@desc finalize after payment
//@access public
router.post('/finalize',async(req,res)=>{

})


module.exports = router;


