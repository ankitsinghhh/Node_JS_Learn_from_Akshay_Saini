const express = require("express");
const { Chat } = require("../models/chat");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest.js")

const chatRouter = express.Router();

chatRouter.get("/chat/:targetUserId",
    userAuth,
   async (req,res)=>{
        const {targetUserId} = req.params
        const userId =req.user._id;

        const areFriends = await ConnectionRequest.findOne({
            $or: [
              { fromUserId: userId, toUserId: targetUserId, status: "accepted" },
              { fromUserId: targetUserId, toUserId: userId, status: "accepted" }
            ]
          });
          
          if (!areFriends) {
            console.log(`User ${userId} attempted to message ${targetUserId} without friendship.`);
            // Optionally inform the user they cannot send the message
      
            res.json({message:"you can only send messages to your Connection that is friends"}); // Stop further execution
            return
          }

        try {
            let chat =await Chat.findOne({
              participants: { $all: [userId, targetUserId] },
            }).populate({
                path:"messages.senderId",
                select:"firstName lastName"
            });

            if(!chat){
                chat = new Chat({
                    participants: [userId, targetUserId],
                    messages:[],
                })
            }
            await chat.save()

            res.json(chat)

        } catch (error) {
            console.error(error)
        }

    }
)

module.exports = chatRouter;