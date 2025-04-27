//get all products
const router = express.Router();
const products = require('../clientRequest/requestSchema');
const { cookiejwtAuth ,admin} = require('../middleware/cookieJwtAuth');

//@route /api/getProduct
//@desc get all products
//@acccess public
router.get('/',cookiejwtAuth,admin, async(req,res)=>{
    try{
        const allProducts = await products.find();
        //or products posted by Admin specific user products.find({user:req.user._id})
        if(!allProducts){
            return res.status(404).send('products not found')
        }
        else{
            return res.status(200).json({allProducts});
        }
    }
    catch(err){
        return res.status(500).send('server err');
    }

})

module.exports = router;

