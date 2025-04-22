const express= require('express');
const router = express.Router();
const Cart = require('../model/cartSchema');
const collection = require('../src/config');
const productRequestCollection = require('./requestSchema');

//function to identify logged in or logged out user Cart

const getCart=async(userId,guestId)=>{
    try{
        if(userId){
            return await Cart.findOne({user:userId})
        }
        else if(guestId){
            return await Cart.findOne({guestId})
        }
        return null;
    }
    catch(err){
        throw new Error('Error fetching cart');
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
        let cart =await getCart(userId, guestId)
        if(cart)
            {const productIndex =cart.products.findIndex((p)=>{
            p.productId.toString()== productId&&
            p.color==color&&
            p.size == size
        })
        if(productIndex>-1){
             //increase quantity, calculate totalPrice if cart exist
             cart.products[productIndex].quantity+= quantity;
        }
        else{
            //add new product to existing cart
               cart.products.push({
                productId,
                name: product.name,
                images: product.images[0].url,
                price: product.price,
                size, color, quantity
               });
        }
         //total cartPrice
        cart.totalPrice = cart.products.reduce((acc,item)=>{
            return acc+item.price*item.quantity
        },0);
        await cart.save();
        return res.status(200).json({cart})
    }    
        //add new cart- no existing cart available
        else{
            const newCart = await Cart.create({
                user: userId?userId :undefined,
                guestId: guestId?guestId :"guest_" + new Date().getTime(),
                products:[{
                    productId,
                    name: product.name,
                    images: product.images[0].url,
                    price: product.price,
                    size, color, quantity}],
                   totalPrice :product.price*quantity   
            })
            return res.status(201).json({newCart})
            }
    }
    catch(err){
        console.log(err);
        return res.status(500).send('server error')       
    }
})

//update product qyantity in cart
//@route /api/cart/:id
//@desc update productQuantity
//@acces public

router.put('/update',async(req,res)=>{
    const{productId,size, color, quantity,userId,guestId}= req.body;
    try{
        const cart = await getCart(userId,guestId)
        if(!cart){
            return res.status(500).send('cart does not exist')
        }
        const productIndex= cart.products.findIndex((p)=>{
            p.productId.toString()== productId&&
            p.color==color&&
            p.size == size
        })
       if(productIndex>-1){
            if(quantity>0){
            cart.products[productIndex].quantity= quantity;}
            else{
                //remove product if quantity is 0
                 cart.products.splice(productIndex,1);
            } 
            cart.totalPrice = cart.products.reduce((acc,item)=>{
                acc+item.price* item.quantity
            })
            await cart.save();
       }
       else{
        return res.status(404).send('cart not found')
       }
    }
    catch(err){
        console.log(err)
        return res.status(500).send('product update failed')
    }
})

// delete products from cart
//@route /api/cart/delete
//@desc update productQuantity
//@acces public

router.delete('/delete',async(req,res)=>{
    const{productId,size, color, quantity,userId,guestId}= req.body;
    try{
        let cart = await getCart(userId,guestId);
        if(!cart){
            return res.status(404).send('cart not found');
        }
        const productIndex= cart.products.findByIndex((p)=>{
           p.productId.toString()==productId &&
           p.color==color&&
           p.size == size
        })
           if(productIndex>-1){
                cart.products.splice(productIndex,1);
           }
           cart.totalPrice=cart.products.reduce((acc,item)=>{
               acc+item.price* item.quantity
           })
           await cart.save()
           return res.status(201).json({cart});
     }
    catch(err){
            return res.status(500).send('server error')                
    }
})

module.exports= router;