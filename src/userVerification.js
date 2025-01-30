const mongoose = require('mongoose');
const connect= mongoose.connect('mongodb+srv://moses1model:knHAaE7cwIluJA7t@cluster0.jhxjl.mongodb.net/mail')

connect.then(()=>{
    console.log('userVerification database on')
})
.catch(()=>{
    console.log('error')
})

const userVerificationSchema = new mongoose.Schema(
    {
        userId: String,
        uniqueString: String,
        createdAt: Date,
        expiresAt: Date
     }
);

const userVerification = new mongoose.model('userVerification', userVerificationSchema,'userVerification1')
module.exports = userVerification;
