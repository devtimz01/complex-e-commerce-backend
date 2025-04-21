const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.DATABASE);

const cartOrder = new mongoose.Schema({
    
})

const checkoutPage = new mongoose.Schema({
    item: [cartOrder],
    deliveryDate


})

const checkout = new mongoose.model('checkout',checkoutPage,'checkoutData');
module.exports = checkout;