const mongoose = require('mongoose')
require('dotenv').config()
const check = mongoose.connect(process.env.DATABASE)

check.then(()=>{
    console.log('cart database connected')

})
.catch((err)=>{
    console.log('cart database not connected')
});

const cartSchema =new mongoose.Schema({
    productId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'productRequestCollection',
        required: true
    },
    name: String,
    price: String,
    size: String,
    color: String,
    quantity:{
        type: Number,
        default: 1
    }
},
   {_id: false}
)

const cartBox = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'collection',
        required: true
    },
    guestId : String,
    products:[cartSchema],
    quantity: {
        type:Number
    },
    totalPrice:{
        type: Number,
        required: true,
        default :0
    },
},
  {timestamps: true}  
)

const cart = new mongoose.model('cart',cartBox,'cart');
module.exports = cart;