const productRequestCollection =require('../clientRequest/requestSchema')
const user = require('../src/config')
const products = require('./productsData')
const mongoose =require ('mongoose');
require('dotenv').config();

mongoose.connect(process.env.DATABASE,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    poolSize: 10,
});

const seedData=async()=>{
    try{
        await productRequestCollection.deleteMany();
        await user.deleteMany();
        await cart.deleteMany()
        //admin info
        const defaultUser = await user.create({
            email: 'admin@gmail.com',
            password: '1234',
            role: 'admin'
        })
        const defaultId = defaultUser._id;
        const data = products.map((productRequestCollection)=>{
            return{...productRequestCollection, user:defaultId};
        });

        await productRequestCollection.insertMany(data);
        process.exit(0);
    }
    catch(err){
        console.log(err);
        process.exit(1);
    }
}
seedData();

