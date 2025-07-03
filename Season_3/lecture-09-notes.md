# Lecture - 9 : Building Real Time Live Chat Feature
---




## 📁 `models/chat.js`

```js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const chatSchema = new mongoose.Schema({
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    ],
    messages: [messageSchema],
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = { Chat };
```

---

## 📁 `routes/chatRouter.js`

```js
const express = require("express");
const { Chat } = require("../models/chat");
const { userAuth } = require("../middlewares/auth");

const chatRouter = express.Router();

// Fetch chat history or create if not exist
chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
    const { targetUserId } = req.params;
    const userId = req.user._id;

    try {
        let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
        }).populate({
            path: "messages.senderId",
            select: "firstName lastName",
        });

        if (!chat) {
            chat = new Chat({
                participants: [userId, targetUserId],
                messages: [],
            });
            await chat.save();
        }

        res.json(chat);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Server error while fetching chat." });
    }
});

module.exports = chatRouter;
```

---

## 📁 `utils/socket.js`

```js
const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");

const getSecretRoomId = (userId, targetUserId) => {
    return crypto
        .createHash("sha256")
        .update([userId, targetUserId].sort().join("_"))
        .digest("hex");
};

const initializeSocket = (server) => {
    const io = socket(server, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id);

        socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
            const roomId = getSecretRoomId(userId, targetUserId);
            console.log(`${firstName} joined room: ${roomId}`);
            socket.join(roomId);
        });

        socket.on("sendMessage", async ({ firstName, userId, targetUserId, text }) => {
            try {
                const roomId = getSecretRoomId(userId, targetUserId);
                console.log(`${firstName} sent message: ${text}`);

                let chat = await Chat.findOne({
                    participants: { $all: [userId, targetUserId] },
                });

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
                console.error("Error in sendMessage:", error);
            }
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected:", socket.id);
        });
    });
};

module.exports = initializeSocket;
```

---

## 📁 `frontend/src/pages/Chat.jsx`

```jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { createSocketConnection } from "../utils/socket_client";

const Chat = () => {
    const { targetUserId } = useParams();
    const user = useSelector((store) => store.user);
    const userId = user?._id;
    const connections = useSelector((store) => store.connections);
    const targetUser = connections.find((u) => u._id === targetUserId);
    const targetUserPhotoUrl = targetUser?.photoUrl;
    const targetUserFirstName = targetUser?.firstName || targetUserId;

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    useEffect(() => {
        const fetchChatMessages = async () => {
            try {
                const res = await axios.get(
                    `${BASE_URL}/chat/${targetUserId}`,
                    { withCredentials: true }
                );
                const chatMessages = res?.data?.messages.map((msg) => ({
                    firstName: msg?.senderId?.firstName,
                    lastName: msg?.senderId?.lastName,
                    text: msg?.text,
                    time: msg?.createdAt,
                    sender: msg?.senderId?._id === userId ? "me" : "them",
                }));
                setMessages(chatMessages);
            } catch (err) {
                console.error(err);
            }
        };

        fetchChatMessages();

        const socket = createSocketConnection();
        socket.emit("joinChat", { firstName: user.firstName, userId, targetUserId });

        socket.on("messageReceived", ({ firstName, text, userId: senderId }) => {
            console.log(`${firstName}: ${text}`);
            setMessages((prev) => [
                ...prev,
                { text, sender: senderId === userId ? "me" : "them", firstName },
            ]);
        });

        return () => {
            socket.disconnect();
        };
    }, [targetUserId, userId, user.firstName]);

    const sendMessage = () => {
        if (newMessage.trim() === "") return;
        const socket = createSocketConnection();
        socket.emit("sendMessage", {
            firstName: user.firstName,
            userId,
            targetUserId,
            text: newMessage,
        });
        setNewMessage("");
    };

    return (
        <div className="w-full max-w-[60vw] rounded-xl border border-gray-600 mx-auto my-20 h-[79vh] flex flex-col bg-base-200 shadow-md">
            <h1 className="text-2xl font-semibold border-b border-gray-600 text-center p-4 bg-base-300 rounded-t-xl">
                Chat with {targetUserFirstName}
            </h1>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                                              "https://img.daisyui.com/images/profile/demo/anakeen@192.webp"
                                            : targetUserPhotoUrl ||
                                              "https://img.daisyui.com/images/profile/demo/kenobee@192.webp"
                                    }
                                />
                            </div>
                        </div>
                        <div className="chat-header">
                            {msg.sender === "me" ? "You" : msg.firstName}
                            <time className="text-xs opacity-50 ml-1">•</time>
                        </div>
                        <div className="chat-bubble">{msg.text}</div>
                        <div className="chat-footer opacity-50">Delivered</div>
                    </div>
                ))}
            </div>
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
```

---

## 📁 `utils/socket_client.js`

```js
import io from "socket.io-client";
import { BASE_URL } from "./constants";

export const createSocketConnection = () => {
    return io(BASE_URL, { withCredentials: true });
};
```

---

## 🪐 **What this achieves:**

✅ **Fully persistent chat system** with:

* Real-time messaging (Socket.IO).
* Persistent chat storage (MongoDB via Mongoose).
* Automatic fetching of old messages on page load.
* Clean, scalable structure.

✅ **Secure room IDs** with SHA-256 hashing.

✅ Modular, clean architecture aligning with **production-quality chat systems** for your **DevTinder project**.


---

## 🪐 **1️⃣ Why persistent chat storage is needed**

Your current **Socket.IO chat system:**
✅ Supports real-time messaging between users.
❌ Does not show past messages when users revisit the chat.

**By persisting chat messages:**

* Users can view previous conversations seamlessly.
* Enables continuity and context in chats.
* Aligns with **production-level app behavior**.

---

## 🪐 **2️⃣ Schema Design**

### **a) `messageSchema` (subdocument):**

Defines:

* `senderId` (User reference)
* `text` (message content)
* Uses `timestamps` for `createdAt`, `updatedAt`.

**Purpose:** Represents each individual message.

---

### **b) `chatSchema`:**

Defines:

* `participants` (array of User references, max 2 for 1:1 chat)
* `messages` (array of `messageSchema`)

**Purpose:** Represents **one chat session** between two users with all message history.

---

### **c) Mongoose Model:**

```js
const Chat = mongoose.model('Chat', chatSchema);
module.exports = { Chat };
```

Creates and exports the `Chat` model for use in your routes and socket handlers.

---

## 🪐 **3️⃣ Storing messages during send**

### **Location: `socket.on("sendMessage")` in `socket.js`:**

**Workflow:**
✅ **Receive message data** (`firstName`, `userId`, `targetUserId`, `text`).
✅ **Calculate `roomId` securely** using `getSecretRoomId()`.
✅ **Find if a `Chat` document already exists** between these two users:

```js
let chat = await Chat.findOne({
    participants: { $all: [userId, targetUserId] }
});
```

✅ **If not found**, create a new `Chat` document:

```js
chat = new Chat({
    participants: [userId, targetUserId],
    messages: [],
});
```

✅ **Push the new message into the `messages` array:**

```js
chat.messages.push({
    senderId: userId,
    text,
});
```

✅ **Save the chat:**

```js
await chat.save();
```

✅ **Emit the new message to the room so the frontend updates in real-time:**

```js
io.to(roomId).emit("messageReceived", {
    firstName,
    userId,
    targetUserId,
    text,
});
```

---

## 🪐 **4️⃣ API to fetch chat history on page load**

### **Location: `chatRouter.js`**

**Route:**

```js
GET /chat/:targetUserId
```

**Middleware:**

* Uses `userAuth` for authentication.

**Workflow:**
✅ Extract `targetUserId` and `req.user._id`.
✅ Find the existing chat using:

```js
let chat = await Chat.findOne({
    participants: { $all: [userId, targetUserId] }
})
.populate({
    path: "messages.senderId",
    select: "firstName lastName"
});
```

✅ **If no chat found, create a new empty one and save.**
✅ Respond with the `chat` document as JSON.

---

## 🪐 **5️⃣ Connecting router in backend**

In `app.js`:

```js
const chatRouter = require("./routes/chatRouter");
app.use("/", chatRouter);
```

✅ Makes the `GET /chat/:targetUserId` route available.

---

## 🪐 **6️⃣ Fetching chat history on the frontend**

### **Location: `Chat.jsx`**

**Workflow:**
✅ Define:

```js
const fetchChatMessages = async () => {
    try {
        const chat = await axios.get(BASE_URL + "/chat/" + targetUserId, {
            withCredentials: true,
        });
```

✅ Logs for debugging:

```js
console.log(chat.data.messages, ": chat.data.messages");
```

✅ Map over `chat.data.messages` to transform them into your frontend display format:

```js
const chatMessages = chat?.data?.messages.map((msg) => ({
    firstName: msg?.senderId?.firstName,
    lastName: msg?.senderId?.lastName,
    text: msg?.text,
    time: msg?.createdAt,
    sender: msg?.senderId?._id === userId ? "me" : "them",
}));
```

✅ Update `messages` state:

```js
setMessages(chatMessages);
```

✅ Call `fetchChatMessages()` inside `useEffect` to load on component mount.

---

## 🪐 **7️⃣ How this enables persistent chat display**

🔹 **On chat open:**

* Calls `fetchChatMessages()`, fetching **all previous messages** between the logged-in user and the target user from MongoDB.
* Maps and sets `messages` state, making them **visually appear immediately** in the chat UI.

🔹 **On new message send:**

* Socket emits the message and **immediately updates the UI in real-time**.
* The message is **also saved to MongoDB** under the appropriate chat document.

🔹 **Next visit:**

* User sees all historical messages seamlessly, providing **context continuity**.

---

## 🪐 **✅ Summary Table**

| Step                                    | What it does                     | Why it matters                           |
| --------------------------------------- | -------------------------------- | ---------------------------------------- |
| Define `messageSchema` and `chatSchema` | Structure chat & message storage | Enables organized, scalable data storage |
| Save message in `sendMessage` handler   | Stores each message in DB        | Enables persistence                      |
| Create `GET /chat/:targetUserId` API    | Fetches past messages            | Loads chat history                       |
| Connect API in `app.js`                 | Makes route live                 | Enables frontend access                  |
| Fetch on `Chat.jsx` load                | Gets and maps messages           | Displays past messages                   |
| Real-time emit + DB store               | Updates frontend immediately     | Combines real-time with persistence      |


---

## ✅ Why your authentication check is necessary

### Problem

Without checks:

* Any logged-in user can emit `sendMessage` to any `targetUserId`.
* They can message non-friends or random `_id`s, leading to:

  * Spam
  * Privacy breaches
  * Security vulnerabilities.

### Solution you applied:

```js
const areFriends = await ConnectionRequest.findOne({
  $or: [
    { fromUserId: userId, toUserId: targetUserId, status: "accepted" },
    { fromUserId: targetUserId, toUserId: userId, status: "accepted" }
  ]
});

if (!areFriends) {
  console.log(`User ${userId} attempted to message ${targetUserId} without friendship.`);
  io.to(socket.id).emit("error", { message: "You can only message users who are your friends." });
  return;
}
```

This ensures:
✅ Users can **only message accepted friends**.
✅ Prevents **unwanted or unauthorized messaging**.
✅ Applied both in **socket layer** and **chatRouter** for **API route protection**.

---

## ✅ Additional enhancements you can add

1️⃣ **Green online indicator for friends**:

* Use `socket.on("connection")` to add user to an online users map.
* Emit `userOnline` and `userOffline` events to friends when they come online/offline.
* Display a green dot next to friends in the UI.

2️⃣ **Message fetch limiting (pagination / infinite scroll)**:

* Instead of fetching all chat messages at once, fetch:

  * `latest 20 messages` on load.
  * Older messages on scroll (`skip`, `limit` with `.sort({ createdAt: -1 })`).
* Benefits:

  * Lower initial load.
  * Faster chat opening even with long histories.
  * Scalable to large user bases.

---

## ✅ Why this **socket connection code will not work in production**

### Current:

```js
export const createSocketConnection = () => {
    return io(BASE_URL);
};
```

This:

* Works **locally** (`BASE_URL` like `http://localhost:7777`).
* Fails in **production** where:

  * Frontend is hosted on `https://tinderdev.life`.
  * Backend is on the **same domain** but behind `/api` (Vercel, Netlify, or Nginx proxy).
  * WebSocket path **defaults to `/socket.io`**, but your API is under `/api`.

---

## ✅ Correct production solution:

```js
export const createSocketConnection = () => {
    if (location.hostname === "localhost") {
        return io(BASE_URL);
    } else {
        return io("/", { path: "/api/socket.io" });
    }
};
```

**Explanation:**
✅ In **development**, continue connecting to your local backend.
✅ In **production**:

* `"/"` automatically points to your production domain (`https://tinderdev.life`).
* `{ path: "/api/socket.io" }` tells Socket.IO to connect using the correct WebSocket endpoint behind your reverse proxy/API route.

---

## ✅ Project ideas for applying advanced Socket.IO skills

1️⃣ **Tic Tac Toe Multiplayer:**

* Real-time moves update for both players.
* Spectator mode.
* Room code joining.

2️⃣ **Chess Multiplayer:**

* Move validation on the server.
* Spectator games with chat.
* Time-limited games.

3️⃣ **Type Racer Game:**

* Multiplayer typing race rooms.
* Real-time progress bars.
* Display WPM and errors live.

These projects will:
✅ Strengthen your Socket.IO, MongoDB, and React skills.
✅ Build portfolio-worthy, real-time applications.
✅ Practice **room handling, real-time state sync, and server-side validation**.

---

