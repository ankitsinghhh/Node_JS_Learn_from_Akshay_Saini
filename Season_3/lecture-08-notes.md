# Lecture - 8 : WebSockets And Socket.io
---

## 🚀 What are WebSockets?

✅ **Definition:**
WebSockets provide **low-latency, bidirectional, event-based** communication between client and server over a **single persistent TCP connection**.

✅ **Main Features:**

* **Low Latency:** Instant data exchange without HTTP request overhead.
* **Bidirectional:** Server ↔ Client communication in real-time.
* **Event-Based:** You can listen to and emit events easily.

✅ **Use Cases:**

* Chat applications (like DevTinder chat).
* Live notifications.
* Collaborative editing (Google Docs).
* Real-time dashboards.

---

## 🚀 What is Socket.io?

✅ A **library** that simplifies using WebSockets in Node.js and browser apps.

✅ **Features:**

* Fallbacks to polling if WebSocket is unavailable.
* Automatic reconnection on disconnect.
* Event-based emit/listen API (`socket.emit`, `socket.on`).
* Broadcast to all or specific clients.
* Room support for managing different chat groups.

✅ It is used extensively for **real-time applications** due to ease of use, stability, and battle-tested implementation.

---

## ✅ Step-by-Step Code Implementation

### 1️⃣ Create a Chat Button

**In `ProfileCard` or similar:**

```jsx
{/* Chat Button with Chat Icon */}
<div className="flex items-center justify-end pr-6">
  <Link to={"/chat/" + _id}>
    <button className="btn btn-primary flex items-center gap-2">
      <ChatBubbleLeftEllipsisIcon className="h-5 w-5" />
      CHAT
    </button>
  </Link>
</div>
```

---

### 2️⃣ Add Chat Route in `App.jsx`

```jsx
<Route path="/chat/:targetUserId" element={<Chat />} />
```

---

### 3️⃣ Create `Chat.jsx` (UI + Local Dummy Messages)

```jsx
import React, { useState } from "react";
import { useParams } from "react-router-dom";

const Chat = () => {
  const { targetUserId } = useParams();
  const [messages, setMessages] = useState([
    { text: "Hello, how are you?", sender: "them" },
    { text: "I'm good, thanks! How about you?", sender: "me" },
    { text: "Doing great, working on a project.", sender: "them" },
  ]);
  const [input, setInput] = useState("");

  console.log(targetUserId);

  const handleSend = () => {
    if (input.trim() === "") return;
    setMessages([...messages, { text: input, sender: "me" }]);
    setInput("");
  };

  return (
    <div className="w-full max-w-[60vw] rounded-xl border border-gray-600 mx-auto my-20 h-[79vh] flex flex-col bg-base-200 shadow-md">
      {/* Header */}
      <h1 className="text-2xl font-semibold border-b border-gray-600 text-center p-4 bg-base-300 rounded-t-xl">
        Chat with {targetUserId}
      </h1>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`chat ${msg.sender === "me" ? "chat-end" : "chat-start"}`}>
            <div className="chat-image avatar">
              <div className="w-10 rounded-full">
                <img
                  alt="user avatar"
                  src={
                    msg.sender === "me"
                      ? "https://img.daisyui.com/images/profile/demo/anakeen@192.webp"
                      : "https://img.daisyui.com/images/profile/demo/kenobee@192.webp"
                  }
                />
              </div>
            </div>
            <div className="chat-header">
              {msg.sender === "me" ? "You" : targetUserId}
              <time className="text-xs opacity-50 ml-1">12:45</time>
            </div>
            <div className="chat-bubble">{msg.text}</div>
            <div className="chat-footer opacity-50">Delivered</div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex p-4 items-center border-t border-gray-600 bg-base-300 rounded-b-xl">
        <input
          className="input input-bordered w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition duration-200"
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />
        <button
          className="btn btn-primary ml-3 px-5 transition duration-200 hover:scale-105"
          onClick={handleSend}
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

## ✅ What This Sets Up:

✅ UI for **real-time chat** with a clean, modern look.
✅ Works for **testing layouts and understanding flow**.
✅ Helps you **prepare frontend structure before Socket.io integration**.

---
# 🚀 Socket.io Setup in Code to Begin Using it
---

## 🛠️ Backend Setup (Express + Socket.io)

### 1️⃣ Install:

```bash
npm install socket.io
```

---

### 2️⃣ Create HTTP Server:

In `app.js`:

```js
const http = require('http');
const server = http.createServer(app);
```

**Why?**
Socket.io needs the **raw HTTP server** instead of `app.listen` to attach WebSocket capabilities.

---

### 3️⃣ Initialize Socket.io:

**Directly in `app.js`:**

```js
const socket = require("socket.io");
const io = socket(server, {
  cors: {
    origin: "http://localhost:5173", // your frontend URL
    credentials: true,
  },
});

io.on("connection", (socket) => {
  // Handle events
});
```

---

### 4️⃣ Clean Code Using `utils/socket.js`:

✅ To keep `app.js` clean:

* Create `utils/socket.js`:

```js
const socket = require("socket.io");

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("joinChat", ({ userId, targetUserId }) => {
      console.log(`User ${userId} joined chat with ${targetUserId}`);
      // Logic to join rooms, load history, etc.
    });

    socket.on("sendMessage", ({ userId, targetUserId, message }) => {
      console.log(`Message from ${userId} to ${targetUserId}: ${message}`);
      // Logic to emit to specific user or room
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

module.exports = initializeSocket;
```

---

### 5️⃣ Use in `app.js`:

Replace:

```js
app.listen(PORT, ...)
```

with:

```js
const server = http.createServer(app);
initializeSocket(server);
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
```

---

## 🛠️ Frontend Setup (`socket.io-client`)

### 1️⃣ Install:

```bash
npm install socket.io-client
```

---

### 2️⃣ Create `utils/socket_client.js`:

```js
import io from "socket.io-client";
import { BASE_URL } from "./constants";

export const createSocketConnection = () => {
  return io(BASE_URL); // connects to your backend server
};
```

---

## 💬 Integrate in `Chat.jsx`:

### 1️⃣ Import and Connect:

```js
import { createSocketConnection } from "../utils/socket_client";
import { useSelector } from "react-redux";
import { useEffect } from "react";

const user = useSelector((store) => store.user);
const userId = user?._id;

useEffect(() => {
  const socket = createSocketConnection();

  // Join the chat room with your userId and targetUserId
  socket.emit("joinChat", { userId, targetUserId });

  // You can now listen for incoming messages or emit messages
}, []);
```

---

## ⚡ What this achieves:

✅ Enables **real-time chat functionality** for DevTinder.
✅ No page refresh needed to get new messages.
✅ Backend can **emit messages/events**, which the frontend will receive immediately.
✅ Uses **rooms/targetUserId to handle private chats** efficiently.

---

## 🪐 Key Points Recap

✅ **WebSockets** enable **low-latency, bidirectional, event-based communication**.
✅ **Socket.io** simplifies WebSocket management, reconnects automatically, and provides fallback for older browsers.
✅ **HTTP server is required** for Socket.io attachment in Node.js.
✅ **Separate socket logic into `utils/socket.js` for clean architecture**.
✅ On the **frontend**, `socket.io-client` connects seamlessly, enabling real-time updates.
✅ **Foundation laid for your DevTinder real-time chat** (next step: sending & receiving live messages).

---
