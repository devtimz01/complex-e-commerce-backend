const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();

//verify token

 exports.cookieJwtAuth=(req,res,next)=>{
    const token = req.cookies.token;
    if(!token){
        console.log('token not found')
        return res.status(401).send('unauthorized.no token provided')
    }
    try{
        const data = jwt.verify(token,process.env.MY_SECRET)
        req.data= data;
        next();
    }
    catch(err){
        res.clearcookie('token')
        return res.redirect('/');
    }
};