const mongoose = require('mongoose');
require('dotenv').config();

const connect =mongoose.connect(process.env.DATABASE);

connect.then(()=>{
    console.log("passwordReset Database connected")
})
.catch(()=>{
    console.log("error, passwordReset Database not connected")
    
})
const passwordResetSchema = new mongoose.Schema({
    userId: String,
    uniqueString : String,
    createdAt: Date,
    expiredAt: Date
})

const passwordReset =new mongoose.model('passwordReset', passwordResetSchema,'passwordSchema')

module.exports= passwordReset;
