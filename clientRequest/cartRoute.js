const express= require('express');
const router = express.Router();
const Cart = require('../model/cartSchema');
const collection = require('../src/config');
const productRequestCollection = require('./requestSchema');
const { cookiejwtAuth } = require('../middleware/cookieJwtAuth');

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
//@route /api/cart/update
//@desc update productQuantity
//@acces public

router.put('/update',async(req,res)=>{
    const{productId,size, color, quantity,userId,guestId}= req.body;
    try{
        let cart = await getCart(userId,guestId)
        if(!cart){
            return res.status(500).send('cart does not exist')
        }
        const productIndex= cart.products.findIndex((p)=>{
           return p.productId.toString()== productId&&
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
       }
       else{
        return res.status(404).send('product not found')
       }
       cart.totalPrice = cart.products.reduce((acc,item)=>{
        return acc+ item.price* item.quantity
       },0)
       await cart.save(); 
       return res.json({cart});
    }
    catch(err){
        console.log(err);
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
        const productIndex= cart.products.findIndex((p)=>{
          return p.productId.toString()==productId &&
           p.color==color&&
           p.size == size
        })
           if(productIndex>-1){
                cart.products.splice(productIndex,1);
           }
           cart.totalPrice=cart.products.reduce((acc,item)=>{
              return acc+item.price* item.quantity
           },0)
           await cart.save()
           return res.status(200).json({cart});
     }
    catch(err){
            return res.status(500).send('server error')                
    }
})

//@route api/cart/getcart
//@desc findUsersCart
//@access public
   router.get('/',async(req,res)=>{
      const{userId,guestId}= req.query;
        try{
            let cart = await getCart(userId,guestId)
            if(!cart){
                return res.status(404).send('cart not found');
            }
            else{
                return res.status(201).json({
                    cart
                });
            }
        }
        catch(err){
            return res.status(500).send('server error');
        }
   })

//@route api/cart/mergeCart
//@desc merge..only loggedIn users can checkout
//@access public...

router.post('/mergeCart',cookiejwtAuth, async(req,res)=>{
    const{guestId} = req.body;
    const userCart = await Cart.findOne({user:req.user._id})
    const guestCart = await Cart.findOne({guestId});

   try{
    //merge guestCart t0 userCart
   if(guestCart){
    if(guestCart.products.length==0){
        return res.status(404).send('guestCart not found')
    }
    if(userCart){
        //merge guestItem into userCart
        guestCart.products.forEach((guestItem)=>{
            const productIndex= userCart.products.findByIndex((item)=>{
                item.productId.toString()==productId &&
                item.color==color&&
                item.size == size
            })
        })
    if(productIndex>-1){
        //increae quantity if products exist already
        userCart.products[productIndex].quantity+=guestItem.quantity
    }
    else{
        userCart.products.push(guestItem);
    }
    //recalculate
     userCart.totalPrice = userCart.products.reduce((acc,item)=>{
        acc+ item.product* item.quantity
    })
    await userCart.save();
    //delete merged guestCart
    try{
        await Cart.findOneAndDelete({guestId});
    }
    catch(err){
        console.log('error removing merged guestCart');
    }
      return res.status(201).json({userCart});
   }
    //assign user to guestCart if userCart does not exist
   else{
    guestCart.user= req.user._id;
    guestCart.guestId = undefined;
    await guestCart.save();
    return res.status(201).json({guestCart});}
}
   //guest cart has already been merged
   else{
       return res.json({userCart});
   }  
   }
   catch(err){
      return res.status(500).send('server error');
   }   
});
    
module.exports= router;