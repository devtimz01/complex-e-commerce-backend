//upload image..cloudinary, streamfier...
const router = express.Router();
const { cookiejwtAuth ,admin} = require('../middleware/cookieJwtAuth');
const storage = multer.memoryStorage();
const upload = multer({storage});

//cloudinary{}

//@route Post/api/upload
//@desc- upload static files wth cloudinary
//@access private(admin)
router.post('/',upload.single("image"),async(req,res)=>{
    try{
        if(!req.file){
            return res.status(404).send('file not found')
        }
        const streamUpload=(fileBuffer)=>{
            return new promise((resolve,reject)=>{
                const stream =cloudinary.uploader.upload_stream((result,err)=>{
                    if(result){
                        resolve(result);
                    }
                    else{
                        reject;
                    }
                })
                //convert fileBuffer to stream
                streamfier.createReadStream(fileBuffer).pipe(stream);
            })
        }

        const result = await streamUpload(req.file.buffer);
        return res.json({
            img_url:result.secure_url
        });
    }
    catch(err){
        return res.status(500).send("server err");
    }
})

module.exports = router;
