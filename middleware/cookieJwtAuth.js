const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();

//verify token

 exports.cookieJwtAuth=(req,res,next)=>{
    
    const token = req.cookies.token;
    try{
        const user = jwt.verify(token,process.env.MY_SECRET)
        req.user= user;
        next();
    }
    catch(err){
        res.clearcookie('token')
        return res.redirect('/');
    }
};