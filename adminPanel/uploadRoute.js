//upload image..cloudinary, streamfier...
const express= require('express');
const router = express.Router();
const { cookiejwtAuth ,admin} = require('../middleware/cookieJwtAuth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2
const streamifier= require('streamifier');
require('dotenv').config();

//CLOUDINARY SETUP
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_API_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
});
//MULTER SETUP
const storage = multer.memoryStorage();
const upload = multer({storage});

//@route Post/api/upload
//@desc- upload static files wth cloudinary
//@access private(admin)
router.post('/',upload.single("image"),cookiejwtAuth, async(req,res)=>{
    try{
        if(!req.file){
            return res.status(404).send('file not found')
        }
        const streamUpload=(fileBuffer)=>{
            return new Promise((resolve,reject)=>{
                const stream =cloudinary.uploader.upload_stream((result,err)=>{
                    if(result){
                        resolve(result);
                    }
                    else{
                        reject;
                    }
                })
                //convert fileBuffer to stream
                streamifier.createReadStream(fileBuffer).pipe(stream);
            })
        }
        const result = await streamUpload(req.file.buffer);
        return res.status(201).json({
            img_url:result.secure_url
        });
    }
    catch(err){
        console.log(err);
        return res.status(500).send("server err");
    }
})

module.exports = router;
