const mongoose = require('mongoose');


const connectDb = async()=>{
    try {
      const connection = await mongoose.connect(process.env.MONGO_URI)
      if(connection){
        // const newP = await bcrypt.hash(password,4)
        console.log('database connected ' );      
    }    
    } catch (error) {
      console.log(error.message);
    }
}

// export default connectDb
module.exports = {connectDb}




