const express= require('express');
const router = express.Router();
const cart = require('../model/cartSchema');
const user = require('../src/config');
const productRequestCollection = require('./requestSchema');

//function to identify logged in or logged out user Cart

const getCart=async(userId,guestId)=>{
    try{
        if(userId){
            return await cart.findOne({user:userId})
        }
        else if(guestId){
            return await cart.findOne({guestId})
        }
        return null;
    }
    catch(err){
        return res.status(500).send('cannot find users')
    }
}
//@route Post/api/cart 
//@desc- add to cart
//@access public 
router.post('/', async(req,res)=>{
    const{productId,size, color, quantity,userId,guestId} = req.body
    try{
        const product = await productRequestCollection.findById(productId);
        if(!product){
        return res.status(500).send('cannot find product')       
        }
        //if cart exist update the quantity, delete, getTotalPrice
        let cart = getCart(guestId, userId)
        const productIndex =cart.products.findIndex((p)=>{
            p.productId.toString()== productId&&
            p.color==color&&
            p.gender == gender
        })
        if(productIndex>-1){
             //increase quantity, calculate totalPrice if cart exist
             cart.products[productIndex].quantity+= quantity;
        }
        else{
            //add new product to existing cart
               cart.products.push({
                productId,size, color, quantity
               });
        }
        //total cartPrice
        cart.totalPrice = cart.product.reduce((acc,item)=>{
            acc+item.price*item.quantity
        });
        await cart.save();
        
    }
    catch(err){
        return res.status(500).send('server erro')       
    }
})

//update and delete products in my cart

module.exports= router;