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

//route- /api/user
//@desc- sort products by optional query
//access- public
router.get('/',async(req,res)=>{
    const{
        collections,
        category,
        search,
        gender,
        colors,
        brand,
        material,
        limit,
        size,
        sortBy,
        minPrice,
        maxPrice
    } = req.query;

    let query = {};
    try{  //using mongoose operationals $..
        if(collections && collections.toLocaleLowerCase() !='all'){
            query.collections = collections;
        }

       if(category&&category.toLowerCase() !=='all'){
        query.category = category;
       }
       if(gender){
        query.gender = gender
       }
       if(colors){
        query.colors={$in:[color]}
       }
       if(brand){
        query.brand={$in:brand. split(',')}
       }
       if(size){
        query.color ={$in:size. split(',')}
       }
       if(minPrice || maxPrice){
        query.price= {}
        if(minPrice) query.price.gte = Number(minPrice);
        if(maxPrice) query.price.lte = Number(maxPrice);
       }
       if(search){
        query.$or= [
            {
                name:{
                    $regex:search, $options :"i"
                },
                description:{
                    $regex: search, $options :'i'
                }
            }
        ]
       }
       let sort ={}
       if(sortBy){
         switch(sortBy){
            case "priceAsc": {
                sort={
                    price:1
                }
            }
            break;
            case "priceDesc":{
                sort = {
                    price:-1
                }
            }
            break;
            case "popularity" :{
                sort={
                    rating : -1
                }
            }
            break;
            default: break;
         }
       }
       let products =await productRequestCollection.find(query).sort(sort).limit(Number(limit)||0);
       res.json({
        products
       });

    }
    catch(err){
        console.log(err)
        res.status(500).send('server error');
    }
});

//@route /api/user/highestRating
//@desc sort by highest seller
//@access public
router.get('/highestRating',async(req,res)=>{
    try{
        const product = await productRequestCollection.findOne().sort({rating:-1})
        if(!product){
          return res.status(500).send('cannot find product');
        }
        else{
            res.status(201).json({
                product
               });       
        }
    }
    catch(err){
        return res.status(500).send('server error');
    }
});

//@route /api/user/latestProduct
//@desc sort by latestProduct
//@access public
router.get('/latestProduct',async(req,res)=>{
   try{
    const product = await productRequestCollection.find().sort({createdAt:-1}).limit(8);
    if(!product){
        return res.status(500).send('cannot find product');
      }
      else{
          res.status(201).json({
              product
             });       
      }
   }
   catch(err){
        return res.status(500).send('server error');
   }
});

//@route /api/user/:id
//@desc find a single product by id
//@access public
router.get('/:id',async(req,res)=>{
    const{id}= req.params;
    try{
        const product = await productRequestCollection.findById(id)
        if(!product){
            return res.status(500).send('product not found')
        }
        else{
            return res.status(200).json({
                product
            });
        } 
    }
    catch(err){
        console.log(err)
        return res.status(500).send('server error')
    }
})

//@route /api/user/similar/:id
//@desc find similar product
//@access public
router.get('/similar/:id', async(req,res)=>{
    try{
        const products = await productRequestCollection.findById(req.params.id);
        const product = await productRequestCollection.find({
            _id: {$ne: products._id},
            gender: products.gender,
            category: products.category
        })
        if(!product){
        return res.status(500).send('product not found')
        }
        else{
            res.json({
                product
               });   
        }
    }
    catch(err){
        return res.status(500).send('server error')
    }
})

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
