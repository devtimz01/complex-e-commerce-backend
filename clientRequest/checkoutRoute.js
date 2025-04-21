const checkout = reqiure('../model/checkoutSchema');
const {cookiejwtAuth,admin} = require('../middleware/cookieJwtAuth');
const router = express.Router();

//route /api/checkout
//@desc checkout..verify if deliveryDetails have been checked
//@access public

router.get('/',cookiejwtAuth,async(req,res)=>{
    

})

//finalize order....
//convert checkoutList to an orderList


