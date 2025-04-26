const router = express.Router()
const Orders = require("../model/orderSchema");
const {cookiejwtAuth} = require('../middleware/cookieJwtAuth');

//@route Post/api/order
//@desc- getOrders 
//@access public 
router.get('/',cookiejwtAuth,async(req,res)=>{
    try{
        const order = await Orders.find({user:req.user._id})
        if(!order){
            return res.status(404).send('orders not found')
        }
        else{
            return res.status.json({order});
        }
    }
    catch(err){
        return res.status(500).send("server error");
    }
})

//@route Post/api/sortOrder
//@desc- sortOrders by latest
//@access public 
router.get('/sortOrder',cookiejwtAuth,async(req,res)=>{
    try{
        const sortOrder = await Orders.find({user:req.user._id}).sort({
            createdAt:-1
        })
        return res.status(200).json({sortOrder});
    }
    catch(err){
        return res.status(500).send('server error');

    }
})


