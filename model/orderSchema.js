const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.DATABASE);

const orderItem = new mongoose.Schema({
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

const orderList = new mongoose.Schema({
     user:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'collection',
                required : true
            },
        orderItems: [orderItem],
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
        isDelivered:{
            type: Boolean,
            default: false
        },
        deliveredAt:{
            type:Date
        },
        paymentStatus:{
            type: String,
            default : 'pending'
        },
        status:{
            type:String,
            enum:["processing","shipped","delivered","cancelled"],
            default: "processing"
        }
    },
    {timestamps: true}
)

const Orders = new mongoose.model('Orders',orderList,'orderData');
module.exports = Orders;
