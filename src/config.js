const mongoose = require('mongoose');
require('dotenv').config();

const connect= mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    //poolSize: 10,
});


connect.then(()=>{
    console.log('database connected');
})
.catch(()=>{
    console.log('database not connected');
})
//schema
const loginSchema = new mongoose.Schema(
    {    
       /* username:*/
       email:{
            type:String,
            required: true,
            //unique: true,
             match: /^[a-zA-Z0-9._%+-]+@gmail\.com$/ //this regex checks for a basic email format
             
        },
        password:{
            type:String,
            required:true
        },
        verified:{
            type: Boolean,
            default:false
        },
        role: {
            type: String,
            enum: ['admin', 'customer'],
            default : 'customer'
        }
    }
)
  const collection = new mongoose.model('collection',loginSchema,'mails');
 
  module.exports = collection;
  