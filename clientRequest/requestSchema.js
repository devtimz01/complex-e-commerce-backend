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
    productName:{
        type: String,
        required: true
    },
    price:{
        type: Number,
        required: true
    },
    imageUrl:{
        type: String,
        required: false
    },
    svu:{
        type: String,
        unique:'true'
    },
    user:{
        type : mongoose.Schema.Types.ObjectId,
        ref : "user"
    }

})

const productRequestCollection = new mongoose.model('productRequestSchema', productSchema,'products');
module.exports = productRequestCollection;


