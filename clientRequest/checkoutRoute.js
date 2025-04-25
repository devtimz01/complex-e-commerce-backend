const checkout = reqiure('../model/checkoutSchema');
const { isObjectIdOrHexString } = require('mongoose');
const {cookiejwtAuth,admin} = require('../middleware/cookieJwtAuth');
const Cart = require('../model/cartSchema');
const router = express.Router();

//route /api/checkout
//@desc checkout..verify if deliveryDetails have been checked
//@access public

router.get('/',cookiejwtAuth,async(req,res)=>{
    const{userId, deliveryDetails}=req.body

    const itemCheck= await checkout.findById({userId});
    //verify if details are checked
    if(deliveryDetails){
        itemCheck.deliveryDetails.isChecked?true:false
    }
    
});


//finalize order....
//isPaidisFinalized?
//convert checkoutList to an orderList


