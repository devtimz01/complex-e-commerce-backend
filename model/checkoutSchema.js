const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.DATABASE);

const cartOrder = new mongoose.Schema({
        productId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'productRequestCollection',
            required: true
        },
        name: String,
        price: {
            type:Number,
            required: true},
        size: String,
        color: String,
        quantity:{
            type: Number,
            default: 1
        }
    },
       {_id: false}
    )

const checkoutPage = new mongoose.Schema({
    user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'collection',
            required : true
        },
    checkoutItem: [cartOrder],
    shippingAddress:{
        address:{
            type: String,
            required: true
        },
        city:{
            type: String,
            required: true
        },
        postalCode:{
            type: String,
            required: true
        },
        country:{
            type: String,
            required: true
        }
    },
    paymentMethod:{
        type: String,
        required: true
    },
    totalPrice:{
        type: Number,
        required: true
    },
    isPaid:{
        type: Boolean,
        required: true
    },
    paidAt:{
        type: Date,
        required: true
    },
    paymentStatus:{
        type: String,
        default : 'pending'
    },
    paymentDetails:{
        type:mongoose.Schema.Types.Mixed
    },
    isFinalized:{
        type: Boolean,
        default: false
    },
    finalizedAt:{
        type: Date
    },   
},
{timestamps: true}
)

const checkout = new mongoose.model('checkout',checkoutPage,'checkoutData');
module.exports = checkout;
