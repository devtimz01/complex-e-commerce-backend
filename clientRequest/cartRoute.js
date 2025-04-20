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
        else if{
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
        //add new cart- no existing cart available
        else(cart.products==null){
            const newCart = await cart.Create({
                productId,size, color, quantity
            });
            
        }
    }
    catch(err){
        return res.status(500).send('server erro')       
    }
})

//update product qyantity in cart
//@route /api/cart/update
//@desc update productQuantity
//@acces public

router.put('/update',(req,res)=>{

})

// delete products from cart
//@route /api/cart/delete
//@desc update productQuantity
//@acces public

router.delete('/delete',(req,res)=>{

})



module.exports= router;