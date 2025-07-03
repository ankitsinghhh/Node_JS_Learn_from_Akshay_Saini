const express = require('express')
const {adminAuth,userAuth} = require('../middlewares/auth.js')
const ConnectionRequest = require("../models/connectionRequest.js")
const User = require('../models/user.js')
const { connect } = require('mongoose')

//for sending email feature using aws SES 
const sendEmail = require("../utils/sendEmail")

const requestRouter = express.Router()

// API to send connection request to the intended user with a status - ignored or interested - > /request/send/:status/:toUserId
requestRouter.post(
"/request/send/:status/:toUserId", 
  userAuth,
  async  (req,res)=>{
  
    try{
      const fromUserId = req.user._id
      const toUserId = req.params.toUserId
      const status = req.params.status

      //checking that this api only works ignored / interested that is left swipe or right swipe
      //if the status is ignored or interested then only we can send the request
      const allowedStatus = ["ignored","interested"]
      if(!allowedStatus.includes(status)){
        return res.
          status(400).
          json({ message: "Invalid Status Type : "+status,})
      }



      //checking if tUserId exists already in the db or not 
      const toUserIdExists = await User.findById(toUserId)
      if(!toUserIdExists){
        return res
        .status(400)
        .json({message:"User not Found"})
      }

      //checking if theere is an existing connection request
      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or:[
          { fromUserId: fromUserId, toUserId: toUserId},
          { fromUserId: toUserId, toUserId: fromUserId},
           ]
      })
      if(existingConnectionRequest){
        return res
        .status(400)
        .json({message:"Connection Request Already Exists"})
      }




      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      })

      const data = await connectionRequest.save()

      // const emailRes = await sendEmail.run(
      //   "A new Connection Request from "+req.user.firstName,
      //   req.user.firstName + "'s status for " + toUserIdExists.firstName + " is now "+status
      // )
      // console.log(emailRes)

     res.json({
      message : req.user.firstName + "'s status for " + toUserIdExists.firstName + " is now "+status,
      data,
     })

    }
    catch(err){
      res.status(400).send("ERROR : "+ err.message)
    }

})

//API to accept or reject a connection request - > /request/review/:status/:requestId
requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req,res)=>{
    try{
      const loggedInUser = req.user
      // const status = req.params.status
      // const requestId = req.params.requestId
      //instead of using above, we can direct extract usign destructuring
      const {status,requestId} = req.params
      //validate the status 
      const allowedStatus = ["accepted","rejected"]
      if(!allowedStatus.includes(status)){
         return res
         .status(400)
         .json({message: "status is not allowed"})
      }

      //now we will check if requestId is present in db or not 
      const connectionRequest = await ConnectionRequest.findOne({
        _id:requestId,
        toUserId:loggedInUser._id,
        status:"interested"
      })
      console.log(connectionRequest)
      if(!connectionRequest){
        return res
        .status(404)
        .json({message: "Connection Request not found"})
      }

      connectionRequest.status = status

      const data = await connectionRequest.save()

      res.json({
        message:"Connection Request "+status,
        data,
      })
    }
    catch(err){
      res.status(400).send("ERROR : "+ err.message)
    }
})



module.exports = requestRouter