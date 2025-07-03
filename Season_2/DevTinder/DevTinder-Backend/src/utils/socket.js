const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");
const ConnectionRequest = require("../models/connectionRequest.js")


const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");
};

const initializeSocket = (server) => {
  console.log("initializing socket");
  //initalizing the socket.io
  const socket = require("socket.io");
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173", // this is the frontend url
      credentials: true, // this is to allow the cookies to be sent to the frontend
    },
  });

  //accepting the connection from the client and sending the response to the client
  io.on("connection", (socket) => {
    //Handle events

    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      //now we need to create a room over here , whenever there is a socket connection , we need to make separate room , HERE WE are creating for two people
      // const roomId = [userId,targetUserId].sort().join("_")
      const roomId = getSecretRoomId(userId, targetUserId);
      console.log(firstName + " joined room : ", roomId);
      socket.join(roomId);
    });

    socket.on(
        "sendMessage",
        async ({ firstName, userId, targetUserId, text }) => {
          try {
            const roomId = getSecretRoomId(userId, targetUserId);
            console.log(firstName + " sent message : ", text);

            const areFriends = await ConnectionRequest.findOne({
                $or: [
                  { fromUserId: userId, toUserId: targetUserId, status: "accepted" },
                  { fromUserId: targetUserId, toUserId: userId, status: "accepted" }
                ]
              });
              
              if (!areFriends) {
                console.log(`User ${userId} attempted to message ${targetUserId} without friendship.`);
                // Optionally inform the user they cannot send the message
                io.to(socket.id).emit("error", { message: "You can only message users who are your friends." });
                return; // Stop further execution
              }
      
            let chat = await Chat.findOne({
              participants: { $all: [userId, targetUserId] },
            });
      
            console.log(chat, ": after the db call");
      
            if (!chat) {
              chat = new Chat({
                participants: [userId, targetUserId],
                messages: [],
              });
            }
      
            chat.messages.push({
              senderId: userId,
              text,
            });
      
            await chat.save();
      
            io.to(roomId).emit("messageReceived", {
              firstName,
              userId,
              targetUserId,
              text,
            });
      
          } catch (error) {
            console.error(error);
          }
        }
      );
      

    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;
