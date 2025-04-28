const express= require('express');
const router = express.Router()
const Orders = require("../model/orderSchema");
const {cookiejwtAuth} = require('../middleware/cookieJwtAuth');

//@route Post/api/order
//@desc- getOrders 
//@access private 
router.get('/:id',cookiejwtAuth,async(req,res)=>{
    try{
        const order = await Orders.findById(req.params.id).populate("user","name email")
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

//@route Post/api/order/sort
//@desc- sortOrders by latest
//@access private
router.get('/sort',cookiejwtAuth,async(req,res)=>{
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

module.exports = router;


