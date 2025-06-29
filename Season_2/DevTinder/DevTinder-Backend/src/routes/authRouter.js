const express = require('express')
const {validateSignupData, validateLoginData} = require('../utils/validation.js')
const bcrypt = require('bcrypt')
const User = require('../models/user.js');


const authRouter = express.Router()

//authRouter is same app , just that here we are using the authRouter, everything that works with app will work with authRouter too 

//SignUp API 
authRouter.post("/signup",async (req,res)=>{

    try{
       // while someone signs up , first validation of data should be there 
      validateSignupData(req)
  
    //Then Encrypting the Password
    // ! install bcrypt using npm i bcrypt
  
    const {firstName, lastName, email,password} = req.body
    const passwordHash = await bcrypt.hash(password,10)
    console.log(passwordHash + " -> this is the hashed password ")
  
    //first task is to pass dynamic data to the API using postman
    // this is not a good way to create userObj
      // const userObj = req.body
      // const user = new User(userObj)
      //instead do this -> you should mention all the fields explicitly
      const user = new User({
        firstName, 
        lastName,
        email,
        password:passwordHash,
      })
  
      // await user.save()
      const savedUser = await user.save()
      const token = await savedUser.getJWT()
  
      //add the token to cookie and send the response back to the server 
      res.cookie("token",token,{
        expires: new Date(Date.now() + 8*3600000) // cookie will epxire in 8 hours 
      })
  
      // res.send("user created successfully")
      res.json({message:"User created successfully",data:savedUser})
    }
    catch(err){
      res.status(400).send("ERROR : "+err.message)
    }
  
  
  })

// the below one accepts every field -> to signup new users fully -> personal purpose
// authRouter.post('/signup', async (req, res) => {
//   try {
//       // 1️⃣ Validate input
//       validateSignupData(req);

//       // 2️⃣ Extract fields explicitly
//       const {
//           firstName,
//           lastName,
//           email,
//           password,
//           photoUrl,
//           about,
//           skills,
//           age,
//           gender
//       } = req.body;

//       // 3️⃣ Hash the password
//       const passwordHash = await bcrypt.hash(password, 10);
//       console.log(passwordHash + " -> hashed password");

//       // 4️⃣ Create the user explicitly with all fields
//       const user = new User({
//           firstName,
//           lastName,
//           email,
//           password: passwordHash,
//           photoUrl,
//           about,
//           skills,
//           age,
//           gender
//       });

//       // 5️⃣ Save to DB
//       await user.save();

//       res.send("User created successfully");
//   } catch (err) {
//       console.error(err);
//       res.status(400).send("ERROR: " + err.message);
//   }
// });

//API to login
authRouter.post("/login",async ( req,res)=>{
    try{
        //extracting the email and password from the request body
        const { email, password} = req.body
        //Validating if Email entered is valid or not 
        validateLoginData(req)
        //check if user is present in db or not 
        const user = await User.findOne({email:email})
        //now interpreting the response , if user not present , then throw error
        if(!user){
          throw new Error("Invalid Credentails")
        }
        //checking if the password is valid or not using bcrypt.compare
        const isPasswordValid = await user.validatePassword(password)
        if(isPasswordValid){
  
          // //create a JWT token
          // const token = await jwt.sign({_id:user._id}, "Dev@Tinder&798",{expiresIn: "1d"})
          // console.log(token)
          // ? now that we have offloaded the above work to the userSchema methods, we can directly use .getJWT
          const token = await user.getJWT()
  
          //add the token to cookie and send the response back to the server 
          res.cookie("token",token,{
            expires: new Date(Date.now() + 8*3600000) // cookie will epxire in 8 hours 
          })
  
          res.json({message:"Login Successfull",data:user})
        }else{
          throw new Error("Password is not correct")
        }
  
  
    }
    catch(err){
      res.status(400).send("ERROR : " + err.message)
    }
  })

//Logout API 
authRouter.post("/logout",async (req,res)=>{
    res.cookie("token",null, {
        expires: new Date(Date.now()),
    })
    res.send("Logged out Successfully")
})


module.exports = authRouter;