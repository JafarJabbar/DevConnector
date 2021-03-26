const config = require('config');
const mongoose = require('mongoose');
const db = config.get('mongoURI');

const connectDB = async ()=>{
    try{
        await mongoose.connect(db,{
            useNewUrlParser:true,
            useUnifiedTopology:true,
            useCreateIndex:true,
            useFindAndModify:false
        });
        console.log("MongoDB successfully connected.");
    }catch(err){
        console.log(err.message);
        process.exit(1);
    }
}

module.exports = connectDB;