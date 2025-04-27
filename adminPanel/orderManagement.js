//get all orders && update status
const router = express.Router();
const Orders = require('../model/orderSchema')
const { cookiejwtAuth ,admin} = require('../middleware/cookieJwtAuth');

//@route /api/orderStatus
//@desc update order status["pending","delivered"...]
//@acccess private (admin)
router.put("/",cookiejwtAuth,admin, async(req,res)=>{
    const {status}= req.body;
    try{
        const order = await Orders.findById({users:req.body._id})
        if(!order){
            return res.status(404).send('orders not found');
        }
        else{
            //update status of users orders
                order.status= req.body || order.status
                order.isDelivered =req.body==="delivered"?delivered: order.isDelivered
                order.deliveredAt=date.now();
                await order.save();
                return res.send(201).json({
                    order
                });       
        }
    }
    catch(err){
        return res.send(500).json({
            message:"server error"
        }); 
    }

})

module.exports = router;

//send an event to paid/finalized users using socket.io (webSocket)--->
// io.to(paidUsersId).emit("messages",order.status)
//focus on Api Optimization for faster reponses---(store frequent/similar requests in a cache)