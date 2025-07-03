import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { createSocketConnection } from "../utils/socket_client";
import { useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import axios from "axios";

const Chat = () => {
  const { targetUserId } = useParams();
//   const [messages, setMessages] = useState([
//     { text: "Hello, how are you?", sender: "them" },
//     { text: "I'm good, thanks! How about you?", sender: "me" },
//     { text: "Doing great, working on a project.", sender: "them" },
//   ]);

const containerRef = useRef(null);


  const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
  const[newMessage,setNewMessage] = useState("")
  
  const user = useSelector(store=>store.user)
  const userId = user?._id
  const connections = useSelector(store => store.connections);
    
  const targetUser = Array.isArray(connections)
  ? connections.find(user => user._id === targetUserId)
  : null;

  const targetUserPhotoUrl = targetUser?.photoUrl;
const targetUserFirstName = targetUser?.firstName || targetUserId;



//   console.log(targetUserId);

  const sendMessage = () => {
    if (newMessage.trim() === "") return;
    // setMessages([...messages, { text: input, sender: "me" }]);
    const socket = createSocketConnection()
    socket.emit("sendMessage", {
      firstName:user.firstName,
      userId,
      targetUserId,
      text: newMessage,
    });
    // setMessages(prevMessages => [
    //     ...prevMessages,
    //     { text: newMessage, sender: "me" }
    // ]);
    setNewMessage("");
  };

  const fetchChatMessages = async () =>{
    try{
        const chat = await axios.get(BASE_URL+"/chat/"+targetUserId,{withCredentials:true})
        console.log(chat.data.messages,": chat.data.msg")
        console.log(chat?.data?.messages[0]?.senderId?._id," : sender id ")
        console.log("this is the user id ",user?._id)
        const chatMessages = chat?.data?.messages.map((msg) => {
            
            return {
              firstName: msg?.senderId?.firstName,
              lastName: msg?.senderId?.lastName,
              text: msg?.text,
              time: msg?.createdAt,
              sender: msg?.senderId?._id === userId ? "me" : "them",
            };
          });
          
        setMessages(chatMessages)

    }catch(err){
        console.error(err)
    }
  }
  useEffect(
    ()=>{
        if (!userId) return; 
        console.log("this is inside the hook",userId)
        fetchChatMessages()
    },[userId]
  )

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
  
    // Check if user is near bottom (within 100px)
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 500;
  
    if (isNearBottom) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);
  




  useEffect(()=>{
    if(!userId) return;
    // connect to server 
    const socket = createSocketConnection()
    // as soon as the page/component loads , the socket connection is made and joinChat event is emitted
    socket.emit("joinChat",{firstName:user.firstName,userId ,targetUserId})

    socket.on("messageReceived", ({ firstName, text, userId: senderId }) => {
        console.log(`${firstName}: ${text}`);
        setMessages(prevMessages => [
            ...prevMessages,
            { text, sender: senderId === userId ? "me" : "them", firstName,time: new Date().toISOString(), }
        ]);
    });

    //cleanup - as soon as the component unmounts , the socket connection is disconnected
    // so that the server knows that the user is no longer connected to the chat
    // this is to prevent memory leaks and ensure that the server has the latest information about the users connected to the chat  
    return () => {
            socket.disconnect(); //disconnect on component unmount
        };
    }
  ,[userId,targetUserId])

  return (
    <div className="w-full max-w-[60vw] rounded-xl border border-gray-600 mx-auto my-20 h-[79vh] flex flex-col bg-base-200 shadow-md">
      {/* Header */}
      <h1 className="text-2xl font-semibold border-b border-gray-600 text-center p-4 bg-base-300 rounded-t-xl">
        Chat  {targetUser ? ("with "+targetUserFirstName) : " "}
      </h1>

      {/* Messages area */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat ${
              msg.sender === "me" ? "chat-end" : "chat-start"
            }`}
          >
            <div className="chat-image avatar">
              <div className="w-10 rounded-full">
                <img
                  alt="user avatar"
                  src={
                    msg.sender === "me"
                      ? user.photoUrl ||
                        "https://www.nuflowerfoods.com/wp-content/uploads/2024/09/person-dummy-Copy.jpg"
                      : targetUserPhotoUrl ||
                        "https://www.nuflowerfoods.com/wp-content/uploads/2024/09/person-dummy-Copy.jpg"
                  }
                />
              </div>
            </div>
            <div className="chat-header">
              {msg.sender === "me" ? "You" : targetUserFirstName}

              <time className="text-xs opacity-50 ml-1">{msg.time
    ? new Date(msg.time).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : ""}</time>
            </div>
            <div className="chat-bubble">{msg.text}</div>
            <div className="chat-footer opacity-50">Delivered</div>
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="flex p-4 items-center border-t border-gray-600 bg-base-300 rounded-b-xl">
        <input
          className="input input-bordered w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition duration-200"
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />
        <button
          className="btn btn-primary ml-3 px-5 transition duration-200 hover:scale-105"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
