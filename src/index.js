//basic & jwt auth
const express= require('express');
const hbs = require('hbs');
const path = require('path');
const bcrypt= require('bcrypt');
const mongoose= require('mongoose');
const { title } = require('process');
const collection = require('./config.js');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const {cookieJwtAuth} =require('../middleware/cookieJwtAuth.js');
const nodmailer = require('nodemailer');
const { error } = require('console');
require('dotenv').config();
const userVerification = require('./userVerification.js');
const { resourceLimits } = require('worker_threads');
const uuid4  = require('uuid');
const expressRouter = require('express-router');
const { getMaxListeners } = require('events');
const router = express.Router();
const { ObjectId} = mongoose.Types;

const app= express();
app.use(express.json());
app.use(express.urlencoded({expected:false}));
app.set('views',path.join(__dirname,'../views'));
app.set('view engine','hbs');
app.use(express.static('public')); //static files
app.use(cookieParser());

app.get('/',(req,res)=>{
   res.render('login');
});

app.get('/signup',(req,res)=>{
    res.render('signup', {title:'signup'});
});

//create transporter
let transporter = nodmailer.createTransport({
    service: 'gmail',
    auth:{
         user: process.env.USER_SECRET,
         pass: process.env.PASS_SECRET,
    }
 });
 transporter.verify((error,success)=>{
    if(error){
        console.log(error)
    }
    else{
        console.log('transporter is active');
        console.log(success);
    }
 });
//send verification mail
const verificationMail=({_id,email},res)=>{
    const currentUrl = 'http://localhost:5000/'
    const uniqueString = uuid4.v4()

    const mailOption={
        from: process.env.USER_SECRET,
        to: 'moses1model@gmail.com',
        subject: 'verify your email',
        html:`<p>click below to verify your email and login</p>
              <a href="${currentUrl}user/verify/${_id}/${uniqueString}">here</a>`
    };
    
    //hash uniqueString
    const saltRounds = 10;
    bcrypt.hash(uniqueString, saltRounds)
    .then((hashedUniqueString)=>{
        //update userVerification record
        const newVerification = new userVerification({
            userId: _id,
            uniqueString: hashedUniqueString,
            createdAt:Date.now(),
            expiresAt: Date.now() + 21600000
        })

        newVerification
        .save()
        .then(()=>{
            transporter.sendMail(mailOption)
            .then(()=>{
                return res.json({
                    status:'PASSED',
                    message:'verification email sent'
                })
                console.log(success)
            })
            .catch((error)=>{
               return res.send('failed to send verification email');
                console.log(error)
            })

        })
        .catch((error)=>{
            console.log('new verification failed')
        })
    })
    .catch((error)=>{
        console.log('failed to hash')
    });  
};

//sign up api
app.post('/signup',async(req,res)=>{
    const data ={

         email:req.body.email,
         password:req.body.password,
         verified: false
    }
    //save the data in our database
    const existingData = await collection.findOne({email:data.email});
    if(existingData){
        res.send('username already exist');
    }
    else{
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password,saltRounds);
        data.password = hashedPassword;

        const userData = await collection.insertMany(data);
        console.log(userData);
        
        verificationMail(userData[0],res);
     }
});  

    //login endpoint
app.post('/login', async(req,res)=>{
    try{
        //check if username matches
        const check = await collection.findOne({email:req.body.email})
        if(!check){
           return res.send('username does not exist');
        }
        //check if password matches
        const isPasswordMatch = await bcrypt.compare(req.body.password,check.password)
        if(!isPasswordMatch){
           return res.send('wrong password')
        }
        //if (!data[0].verified)
        else{
           console.log('users credentials match')
        }

        if(!check.verified){
           console.log('email not verified')
           return res.send('email not verified')
    
        }
        else{
             //jwt auth..
      const data ={
        email:check.email,
        _id:check._id,
        verified:check.verified
    };

    const token = jwt.sign(user,process.env.MY_SECRET,{expiresIn:'3s'});
    res.cookie('token',token,{
        httpsOnly:true,
        //maxAge:1000,
        //secure:true,
        //signed:true
    });
           return res.render('home');
        }
    }
    catch(error){
        console.error('login error:',error);
        return res.status(500).send('an error occurred during login')
    }

});

  //verify token
    app.get('/protected route',cookieJwtAuth, (req,res)=>{
   return res.status(200).send('succesful');
});

//verify the Verfication link sent to mail
//create a /user route
 app.use('/user', router)

/* router.get('/verify/:userId/:uniqueString',(req,res)=>{
    let {userId, uniqueString} = req.params;
    //verify userVerification record
    userVerification
    .findOne({userId})
    .then((result)=>{
        if(result.length>0){
            //userVerification record exist
            const {expiresAt} = result[0];
            const hashedUniqueString = result[0].uniqueString

            if(expiresAt<Date.now()){
                userVerification
                .deleteOne({userId})
                .then(()=>{
                    return res.send('expired UserVerification record deleted')
                    console.log('expires user deleted')               
                })
                .catch(()=>{
                    console.log('expired Verificationrecord not deleted')
                })
                //delete expired user record
                collection
                .deleteOne({_id:userId})
                .then(()=>{
                    return res.send('expired User record deleted')
                    console.log('expired User record deleted')

                })
                .catch(()=>{
                    console.log('expired user record not deleted')
                })

            }
            else{ 
                //user verification exist
                bcrypt
                .compare(hashedUniqueString, uniqueString)
                .then((result)=>{
                    if(result){
                        //update state
                        collection.
                        updateOne({_id:userId}, {verified:true})
                        .then(()=>{
                            userVerification
                            .deleteOne({userId})
                            .then(()=>{
                                return res.json({
                                    status : 'passsed',
                                    message: 'email verified successfully, proceed to login'
                                })
                                console.log('email successfully verified')
                            })
                            .catch(()=>{
                               return res.json({
                                 status: 'failed',
                                 message: 'email verification failed'
                               });
                                console.log('email Verification failed')
                            })
                        })
                        .catch(()=>{
                           return res.send('failed to update verified state')
                        })
                    }
                    else{
                        return res.send('error in updating verified state')
                    }
                })
                .catch(()=>{
                   return res.send('string match error')
                })
            }
        }
        else{
           console.log('cannot find verification record')
           return res.send('verification record does not exist')
            
        }
    })
    .catch(()=>{
       console.log('cannot find userId from userVErification record')
       return res.send('cannot find userId from userVErification record')
       
    })      
 });*/

 router.get('/verify/:userId/:uniqueString', async (req, res) => {
    let { userId, uniqueString } = req.params;

    try {
        const userObjectId = new ObjectId(userId); // Convert userId to ObjectId

        const result = await userVerification.findOne({ userId: userObjectId }); // Use userObjectId

        if (!result) {
            console.log('Cannot find verification record');
            return res.status(404).send('Verification record does not exist');
        }

        const { expiresAt, uniqueString: hashedUniqueString } = result;

        if (expiresAt < Date.now()) {
            try {
                await userVerification.deleteOne({ userId: userObjectId }); // Use userObjectId
                console.log('Expired UserVerification record deleted');

                await collection.deleteOne({ _id: userObjectId }); // Use userObjectId (and convert _id if needed)
                console.log('Expired User record deleted');

                return res.send('Expired user and verification records deleted');
            } catch (err) {
                console.error('Error deleting expired records:', err);
                return res.status(500).send('Error deleting expired records');
            }
        } else {
            try {
                const match = await bcrypt.compare(uniqueString, hashedUniqueString);

                if (match) {
                    try {
                        await collection.updateOne({ _id: userObjectId }, { verified: true }); // Use userObjectId (and convert _id if needed)
                        console.log('User verified successfully');

                        await userVerification.deleteOne({ userId: userObjectId }); // Use userObjectId
                        console.log('UserVerification record deleted');

                        return res.json({
                            status: 'passed',
                            message: 'Email verified successfully, proceed to login'
                        });
                    } catch (err) {
                        console.error('Error updating user or deleting verification:', err);
                        return res.status(500).json({
                            status: 'failed',
                            message: 'Email verification failed'
                        });
                    }
                } else {
                    console.log('String mismatch');
                    return res.status(400).send('Invalid verification link');
                }
            } catch (err) {
                console.error('Error comparing strings:', err);
                return res.status(500).send('Error verifying email');
            }
        }
    } catch (err) {
        console.error('Error finding verification record:', err);
        return res.status(500).send('Error verifying email');
    }
});
 //passwordReset

 //2-factor Auth with otp...

const port = 5000;
app.listen(port,()=>{
    console.log('server is running at port 5000')
});

    //0auth with passport
    //two-factor auth
    //Mail verification
    //Reset password 

    //api for order Req
    //web socket..
    //product management
    //order tracker
    //payment gateway
    //Deploying my application..
