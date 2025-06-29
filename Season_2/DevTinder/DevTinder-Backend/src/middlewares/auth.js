const jwt = require('jsonwebtoken')
const User = require('../models/user')

const adminAuth =  (req,res,next)=>{
    console.log("Admin Auth is getting checked")
    //Logic of checking if request is authorised
   const token = "xyz"
   const isAdminAuthorized = token === "xyz"

   if(!isAdminAuthorized){
       res.status(401).send("Unauthorized Admin Access ")
   }
   else{
       console.log("Admin Authorized")
       next()
   }

}

const userAuth = async (req,res,next)=>{

    try{
        //read the token 
        const {token} = req.cookies
        //checking if token is present or not 
        if(!token){
            return res.status(401).send("Please Login")
        }
        //validate the token
        const decodedObj = await jwt.verify(token,"Dev@Tinder&798")
        //get id from decodedObj
        const _id = decodedObj._id
        //find the user
        const user = await User.findById(_id)
        if(!user){
            throw new Error("User not found")
        }

        //attaching the user that we found into the req
        req.user = user
        next()
    }
    catch(err){
        res.status(401).send("ERROR : " + err.message)
    }

}

module.exports = {
    adminAuth,
    userAuth,
 
};