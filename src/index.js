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
const {cookiejwtAuth} =require('../middleware/cookieJwtAuth.js');
const nodmailer = require('nodemailer');
const { error } = require('console');
require('dotenv').config();
const userVerification = require('./userVerification.js');
const { resourceLimits } = require('worker_threads');
const uuid4  = require('uuid');
const { getMaxListeners } = require('events');
const router = express.Router();
const { ObjectId} = mongoose.Types;
const otpCollection = require('./otp.js');
const crypto = require('crypto');
const passwordReset =require('./passwordReset.js');
const userRouter = require('../clientRequest/orders.js')

const app= express();
app.use(express.json());
app.use(express.urlencoded({expected:false}));
app.set('views',path.join(__dirname,'../views'));
app.set('view engine','hbs');
app.use(express.static('public')); //static files
app.use(cookieParser());
app.use('/api/user',userRouter);

app.get('/',(req,res)=>{
   res.render('login');
});

app.get('/signup',(req,res)=>{
    res.render('signup', {title:'signup'});
});

app.get('/submitOtp',(req,res)=>{
    res.render('otp')
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
const verificationMail=({_id,email})=>{
    const currentUrl = 'http://localhost:5000/'
    const uniqueString = uuid4.v4()

    const mailOption={
        from: process.env.USER_SECRET,
        to: "moses1model@gmail.com",
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
                return 'verification mail sent'
            })
            .catch((error)=>{
                throw new error('verification mail failed to send')
            })

        })

    })
    .catch((error)=>{
        throw new error('failed to hash')
        console.log('failed to hash')
    });  
};

//sign up api
app.post('/signup',async(req,res)=>{
    const{ email, password }= req.body;

    try{
        //save the data in our database
    const existingData = await collection.findOne({email});
    if(existingData){
        return res.send('username already exist');
    }
    else{
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password,saltRounds);

        const user = new collection({email,password: hashedPassword});
        await user.save();
        
        //jwt Auth
        const token = jwt.sign({ //payload
            email: user.email,
            _id:user._id,
            role: user.role
        },
        process.env.MY_SECRET,{expiresIn:'7d'});
        res.cookie('token',token,{
        httpsOnly:true,
        //maxAge:1000,
        //secure:true,
        //signed:true
});      
        //send verification  mail
        try {
            const mailResult = await verificationMail(user); // Call verificationMail
            return res.status(201).json({
                message: 'Signup successful',
                mailStatus: mailResult, // Result from verificationMail
                user: {
                    email: user.email,
                    _id: user._id,
                    role: user.role,
                },
                token,
            });
        } catch (mailErr) {
            return res.status(500).json({
                message: 'Signup succeeded, but failed to send verification mail',
                error: mailErr.message,
            });
        }

     }
    }
    catch(err){
       return res.status(500).send('server error');
    }
});  
    //login endpoint
app.post('/login', async(req,res)=>{
    const {email,password} = req.body;
    try{
        //check if username exist
        const user = await collection.findOne({email})
        if(!user){
           return res.status(404).send('username does not exist');
        }
        //check if password matches
        const isPasswordMatch = await bcrypt.compare(password,user.password)
        if(!isPasswordMatch){
           return res.status(401).send('password mismatch')
        }
        //if (!data[0].verified)

        if(!user.verified){
           try{
            otpVerificationMail(user);
              return res.status(200).send('otp sent')
           }
           catch(err){
            return res.status(500).send('otp not sent')
           }
        }
        else{
             //jwt auth..
             const token = jwt.sign({
                email: user.email,
                _id:user._id,
                role: user.role
            },
            process.env.MY_SECRET,{expiresIn:'7d'});
            res.cookie('token',token,{
            httpsOnly:true,
            //maxAge:1000,
            //secure:true,
            //signed:true
    });     
            console.log('login succesful token generated')
            return res.json({
                user:{
                    email: user.email,
                    _id:user._id,
                    role: user.role
                },
                token
            })
          // return res.render('home');
        }
    }
    catch(error){
        console.error('login error:',error);
        return res.status(500).send('an error occurred during login')
    }

});

  //verify token
app.get('/protected route',cookiejwtAuth, (req,res)=>{
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
                console.log('Expired UserVerificationOTp record deleted');

                return res.send('Expired userOTp and verification records deleted');
            } catch (err) {
                console.error('Error deleting expired records:', err);
                return res.status(500).send('Error deleting expired records');
            }
        } else {
            try {
                const match = await bcrypt.compare(uniqueString, hashedUniqueString);

                if (match) {
                    try {
                        await collection.updateOne({ _id: userObjectId },{$set:{ verified: true }}); // Use userObjectId (and convert _id if needed)
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

 //2-factor Auth with otp
const otpVerificationMail=({_id,email})=>{
    //function to crytpographically generate otp
    function generateOTP(length){
        const digits ='012345';
        let otp= '';
        for(let i=0; i<length; i++){
            const randomIndex = crypto.randomBytes(1)[0]%digits.length;
            otp+=digits[randomIndex];
        }
        return otp;
    }
    const otp = generateOTP(6)
    //convert otp to a string to enable hashing with bcrypt..
    const stringifiedOtp = String(otp);
     const mailOption={
        from:process.env.USER_SECRET,
        to: 'moses1model@gmail.com',
        subject: 'verify your otp',
        html: `<p>your OTP'${otp}'</p>`
      }
      //hash otp and update in otpCollection;
      const saltRounds =10;
      bcrypt
      .hash(stringifiedOtp,saltRounds)
      .then((hashedOtp)=>{
        //update otpCollection record
        const userOtp = new otpCollection({
            userId: _id,
            otp: hashedOtp,
            createdAt: Date.now(),
            expiresAt: Date.now()+ 21600000
        })
        userOtp
        .save()
        .then(()=>{
            transporter.sendMail(mailOption)
            .then(()=>{
                return 'otp sent'      
            })
            .catch((err)=>{
                throw new error ('failed to send otp')
            })

        })
        .catch((err)=>{
           throw error('failed to save user otp')
        })
      })
      .catch((err)=>{
        throw error('otp failed to hash')
        
      })
    };
//verify my OTP
router.post('/verify/:userId/:otp',async(req,res)=>{
    let{userId, otp} = req.body;
    try{
        //convert userID to objectId
        const result = await otpCollection.findOne({userId});

        if (!result) {
            console.log('Cannot find verification record');
            return res.status(404).send('OtpVerification credentials does not exist');
        }

        const {expiresAt, otp:hashedOtp}= result;

         if(expiresAt<Date.now()){
            //otp record expired
            try{
                await otpCollection.deleteOne({userId})
                console.log('error, otp expired')
                return res.status(401).send("otp record expired")
            }
            catch(err){
                console.log('error deleting expired otp')
                return res.status(401).send("error deleting expired otp")
            }
         }
         else{
            //otp record exist
            const match = await bcrypt.compare(otp,hashedOtp);
            if(match){
                try{
                    
                    await collection.updateOne({_id:new ObjectId(userId)},{$set:{ verified: true }});
                    console.log('verified')

                    await otpCollection.deleteOne({userId})
                       console.log("userId deleted")
                           return res.status(200).json({
                            status: "passed",
                            message:"otp verified successfully, login"
                           });
                }
                catch(err){
                    console.log("userId deleted")
                           return res.status(401).json({
                            status: "failed",
                            message:"oops....otp verification failed, error"
                           });
                }
            }
            else{
                console.log("error matching hashed otp")
                return res.status(401).send("error matching hashed otp");

            }
         }
    }
    catch(err){
        console.log('otp record not found')
        return  res.status(401).send("otp record not found");
    }
});

//password reset.

router.post('/requestPasswordReset', async(req,res)=>{
      let{email,redirectUrl} = req.body;
      //try and catch error handler unnecessary..
   try
      {
      const result = await collection.findOne({email:req.body.email})
        if(!result){
        console.log('email does not exist')
       return  res.status(401).send("email does not exist");
      }
      else{
          return await sendResetEmail(result, redirectUrl,res);

      }}

    catch(err){
         return res.status(500).send("error. reset mail not sent, try again")}
      
 });

 const sendResetEmail=({_id,email},res)=>{
    const uniqueString = uuid4.v4();
    const currentUrl = 'http://localhost:5000/'

    const mailOption = {
        from: process.env.USER_SECRET,
        to: "moses1model@gmail.com",
        subject:"reset password",
        html:`<p>click below to verify your email and login</p>
              <a href="${currentUrl}resetPassword/${_id}/${uniqueString}">here</a>`
    }
    //hashUniqueString
        const saltRounds= 10;
        bcrypt.hash(uniqueString, saltRounds)
        .then((hashedUniqueString)=>{
            const newPasswordReset= new passwordReset({
                userId:_id,
                uniqueString:hashedUniqueString,
                createdAt: Date.now(),
                expiredAt: Date.now() + 21600000
            })

            newPasswordReset
            .save()
            .then(()=>{
                transporter.sendMail(mailOption);
                console.log("password reset mail sent, check your email")
                return res.status(200).json({
                    status: "passed",
                    message:"password reset mail sent, check your email"
                })
            })
            .catch((error)=>{
                console.log("password reset mail failed to send",error);
                   return res.status(500).json({
                    status: "failed",
                    message:"password reset mail failed to send",
                    error: error.message ||"unexpected error"
                });
            });

        })
        .catch(()=>{
            console.log('passwordReset UniqueString failed to hash')
            return res.status(500).send('passwordReset Unique string failed to hash');
        })
 }

 router.post('/resetPassword',async(req,res)=>{
    let{userId,password} = req.body;
       //find record in database
            //await collection.updateOne({_id:userId}, $set{password});

 })

const port = 5000;
app.listen(port,()=>{
    console.log('server is running at port 5000')
});

    //0auth with passport
    //two-factor auth
    //Mail verification
    //Reset password ,OTP
    //authorization(RBAC architecture)

    //Microservices(CRUD, Event messsaging, queue jobs, ORMs,Phantom Reads,payment  gateway)
    //Distributed systems
    //Cloud services
    //api for order Req
    //web socket..
    //product management
    //order tracker
    //payment gateway
    //Deploying my application..
