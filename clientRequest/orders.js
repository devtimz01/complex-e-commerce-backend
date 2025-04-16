const productRequestCollection = require('./requestSchema');
const express = require('express');
const router = express.Router();
const app = express()
const {cookiejwtAuth, admin} = require('../middleware/cookieJwtAuth');

//product route api/user/
router.post('/',cookiejwtAuth, admin, async(req,res)=>{
    //ensure to identify admin or client Request...
    //upload images with cloudinary 
    try{
        const {
            productName,
            price,
            svu
        }= req.body;

        const products = new productRequestCollection({
            productName,
            price,
            svu,
            user: req.user._id //reference to the admin
        })

        const createdRequest = await products.save();
        return res.status(200).json({
            status: "success",
            message:"new product posted succesfully",
            createdRequest
        })
    }
    catch(err){
        console.log(err);
        return res.status(500).send('new product not posted')
    }
});

//route to update product
router.put('/:id',cookiejwtAuth,admin, async (req,res)=>{
    const {
        productName,
        price,
        imageUrl,
        svu
    }= req.body;

    try{
    const product = await productRequestCollection.findById(req.params.id);
        if(product){
            product.productName = productName||product.productName
            product.price = price||product.price
            product.imageUrl = imageUrl||product.imageUrl
            
        }

       const updatedProduct = await product.save();
        return res.status(201).json({
            message: ' new product added by admin',
            updatedProduct
        })
        
    }
    catch(err){
        return res.status(500).json({
            message: err.message
        })
    }
});

//route to delete product
router.delete('/:id',async(req,res)=>{

    try{
    const product = await productRequestCollection.findById(req.params.id);
        if(product){
            await product.deleteOne();
            return res.status(201).json({
                message: ' product deleted by admin'
            })
        }
    }
    catch(err){
        return res.status(500).json({
            message: err.message
        })
    }
});


module.exports = router;

//Architecture...(RBAC)
//security
//phantom reads..
//Event Messaging
//queue jobs
//integrating ORMs
//Api optimization (Data Caching)
//testing
//CLoud & Deployment..
