const mongoose= require('mongoose');
require('dotenv').config();

const check = mongoose.connect(process.env.DATABASE);
check
.then(()=>{
    console.log('order database connected')
})
.catch((err)=>{
    console.log('order database  failed to connect',err)

})

const productSchema = new mongoose.Schema({
    
        name: String,
        description: String,
        price: Number,
        discountPrice: Number,
        countInStock: Number,
        sku: String,
        category: String,
        brand: String,
        sizes: [String],
        colors: [String],
        collections: String,
        material: String,
        gender: String,
        images: [
          {
            url: String,
            altText: String,
          },
          {
            url: String,
            altText: String,
          },
        ],
    
        rating: Number,
        numReviews: Number
      
})

const productRequestCollection = new mongoose.model('productRequestSchema', productSchema,'products');
module.exports = productRequestCollection;


