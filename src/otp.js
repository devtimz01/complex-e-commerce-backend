const mongoose = require('mongoose');
require('dotenv').config();

const connect = mongoose.connect(process.env.DATABASE);

connect.then(()=>{
    console.log('otp database connected')
})
.catch(()=>{
    console.log('otp database not connected')
})

const userOtpSchema = new mongoose.Schema({
    userId:{
        type: String,
        //ref: 'otpdata'
    },
    otp:{
        type: String,
        required: true
    },
    verified:{
        type : Boolean,
        default: false
    },
    createdAt: Date,
    expiresAt:Date
})

const otpCollection = new mongoose.model('otpCollection',userOtpSchema,'otpdata');

module.exports = otpCollection;