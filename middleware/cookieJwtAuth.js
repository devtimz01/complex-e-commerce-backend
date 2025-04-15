const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const user = require('../src/config');
const collection = require('../src/config');

//verify token
const cookiejwtAuth=async(req,res,next)=>{
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        try{
            //verify token
        token = req.headers.authorization.split(" ")[1]
        const decoded= jwt.verify(token,process.env.MY_SECRET)
        req.user =await user.findById(decoded._id)
        next();       
        }
        catch(err){
            return res.status(401).send('token not verified or expired')
        }
    }
    else{
        return res.status(401).send('token not found')
    }
}

const admin = (req,res,next)=>{
    try{
        if(req.user && req.user.role=='admin'){
            return next();        
        }
        else{
           return res.status(403).send('access denied, admin only')
        }
    }
    catch(err){
        console.log(err)
        return res.status(403).send('access denied, admin only')
    }
}

module.exports = {cookiejwtAuth,admin};


