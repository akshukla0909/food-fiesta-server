const User = require('../models/userSchema.js');
const bcrypt = require('bcrypt');
const jwt =  require('jsonwebtoken');

// basics of jwt
// ek token hai jo ki client server ke bich communicate krta hai 
// create or generate token
// verify token

// signup route
const signup = async (req,res)=>{
    console.log(req.body);

    const {password, email,name} = req.body;

    try {
        let user = await User.findOne({email})
        
        if(user){
           return res.status(400).json({success : false, message : 'account exist'})
        }

        const securePassword = await bcrypt.hash(password, 10)

        user = await User.create({
            name,
            email,
            password : securePassword
        })
        await user.save()

        return res.status(201).json({success : true, message : "signup succesfull" })
    } catch (error) {

        return res.status(500).json({success : false, message : error.message})
    }
}

// login route
const login = async(req,res)=>{
    const {email,password} = req.body;
    try {
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({success : false , message : "kuch to gadbad hai "})
        }
        const isMatch = await bcrypt.compare(password, user.password)

      if(!isMatch){
        return res.status(400).json({success : false , message : "email ya password glt hai"})
      }

    //   jwt.sign will generate token
     const token = jwt.sign({id : user._id },
         process.env.JWT_SECRET, { expiresIn : "1h" 
        })

    res.cookie('token', token, {
      httpOnly : true,
      sameSite  : "none",
      secure : true
    }).status(200).json({success : true, message : "login successfull"})

    } catch (error) {
      return res.status(500).json({success : false , message : error.message})
    }
}

// logout route
const logout = async (req,res)=>{
    try {
    res.clearCookie('token').status(200).json({success : true, message : 'logout successfull'})
        
    } catch (error) {
      return res.status(500).json({status : false , message : error.message})
    }
 }

//  get user route
const getUser = async (req,res)=>{
   const reqId = req.id;
   try {
    const user =await User.findById(reqId).select("-password")
    if(!user){
       return res.status(400).json({success : false, message : "user not found"})
    }
    res.status(200).json({success : true , user, message : "user found"})
   } catch (error) {
    return res.status(500).json({success: false , message : error.message})
   }
}

// reset password route
const resetPassword = async (req,res)=>{
    const {email} = req.body;

    try {
    const generateOtp = Math.floor(Math.random()*10000)
        
    let user = User.findOne({email})
    if(!user){
        return res.status(400).json({success : false, message : "please signup"})
    }
    var transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "ec758b89c21628",
          pass: "1ac8b64123f399"
        }
      });

      const info = await transporter.sendMail({
        from: 'akash.shukla0887@gmail.com', // sender address
        to: email, // list of receivers
        subject: "New otp has been generated", // Subject line
        text: "Hello world?", // plain text body
        html: `<h3>Your generated otp <i>${generateOtp}<i/> </h3>`, // html body
      });

      if(info.messageId){
            await user.findOneAndUpdate({email}, { 
                $set : {
                    otp : generateOtp
                }
            })
      }
      return res.status(400).json({success : true, message : "otp has been sent"})
    } catch (error) {
       return res.status(500).json({success : false , message : "wrong something while reseting password"})
    }
}

// verify otp route
const verifyOtp = async(req,res)=>{
   const {otp, newPassword} = req.body

   try {
    const securePassword =  await bcrypt.hash(newPassword, 10)
    let user = await User.findOneAndUpdate({otp}, {
        $set : {
            password : securePassword,
            otp : 0
        }
    })
    if(!user){
        return res.status(400).json({success : false, message : "invalid user"})
    }
    return res.status(200).json({success : true, message : "password updated"})
   } catch (error) {
       return res.status(500).json({success : false , message : "wrong something while reseting password"})
   }
}

module.exports = {
    signup,
    login,
    logout,
    getUser,
    resetPassword,
    verifyOtp
}