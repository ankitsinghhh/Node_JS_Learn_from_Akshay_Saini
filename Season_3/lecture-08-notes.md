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

# ⚡ 1️⃣ Join Chat on Component Load

### **Frontend (`Chat.jsx`):**

```js
useEffect(() => {
    const socket = createSocketConnection();

    socket.emit("joinChat", { userId, targetUserId });

    return () => {
        socket.disconnect(); // Disconnect on unmount
    };
}, []);
```

### **Explanation:**

✅ As soon as the **component loads**,
✅ A **socket connection is established** to the server,
✅ It **emits a `joinChat` event** with `{ userId, targetUserId }`.
✅ **Cleanup:** On component unmount, `socket.disconnect()`:

* Frees memory,
* Informs the server the user has left,
* Prevents stale connections.

---

### **Backend (`socket.js`):**

```js
socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
    const roomId = [userId, targetUserId].sort().join("_");
    console.log(firstName + " joined room: ", roomId);
    socket.join(roomId);
});
```

✅ The **backend receives `joinChat`**, extracts `userId` and `targetUserId`,
✅ **Creates a `roomId`** using:

```js
const roomId = [userId, targetUserId].sort().join("_");
```

* **`.sort()` ensures consistent roomId**:

  * If A chats with B → roomId = `A_B`.
  * If B chats with A → roomId = `A_B`.
* This guarantees **both users join the *same room* regardless of who initiates**.

✅ The server **adds the socket to the room using `socket.join(roomId)`**.

---

## ⚡ 2️⃣ Sending a Message

### **Frontend (`Chat.jsx`):**

```js
const sendMessage = () => {
    if (newMessage.trim() === "") return;

    const socket = createSocketConnection();

    socket.emit("sendMessage", {
        firstName: user.firstName,
        userId,
        targetUserId,
        text: newMessage,
    });

    setNewMessage(""); // Clear input after sending
};
```

✅ When the user types and clicks **Send**:

* The `sendMessage` function checks if the message is non-empty.
* Creates/uses the socket connection.
* Emits a `sendMessage` event to the backend with:

  * `firstName`, `userId` (sender info),
  * `targetUserId` (receiver),
  * `text` (the actual message).

✅ Clears the input box for clean UX.

---

### **Backend (`socket.js`):**

```js
socket.on("sendMessage", ({ firstName, userId, targetUserId, text }) => {
    const roomId = [userId, targetUserId].sort().join("_");
    console.log(firstName + " sent message: ", text);

    io.to(roomId).emit("messageReceived", {
        firstName,
        userId,
        targetUserId,
        text,
    });
});
```

✅ The server listens for the `sendMessage` event.
✅ Constructs the **same `roomId`** using `.sort().join("_")` to ensure consistency.
✅ Logs the sent message for debugging.
✅ Uses:

```js
io.to(roomId).emit("messageReceived", {...})
```

to **emit the message to *all clients in the room*** (i.e., both sender and receiver).

---

## 🚀 How the Message Sending Works Together

1️⃣ **User A sends a message to User B**:

* Frontend emits `sendMessage` to the server with message details.

2️⃣ **Server receives `sendMessage`**, constructs `roomId`, and:

* Emits `messageReceived` to **all clients in that room** (both A and B).

3️⃣ **Frontend clients listen for `messageReceived`**:

* Display the received message in the chat instantly.

✅ This achieves **low-latency, real-time, bidirectional messaging** between two users efficiently.

---

## 🪐 Summary Table:

| Step                     | Frontend Action                              | Backend Action                                                 |
| ------------------------ | -------------------------------------------- | -------------------------------------------------------------- |
| On component load        | Connect & emit `joinChat`                    | Receive `joinChat`, create room, `socket.join(roomId)`         |
| Sending message          | Emit `sendMessage` with message details      | Receive `sendMessage`, `io.to(roomId).emit("messageReceived")` |
| Receiving message (next) | Listen for `messageReceived`, update chat UI |                                                                |
| Cleanup                  | `socket.disconnect()` on unmount             | Removes socket from room, frees memory                         |

---



# 🪐 **1️⃣ Message Area in `Chat.jsx`**

```jsx
<div className="flex-1 overflow-y-auto p-4 space-y-4">
  {messages.map((msg, index) => (
    <div
      key={index}
      className={`chat ${msg.sender === "me" ? "chat-end" : "chat-start"}`}
    >
      <div className="chat-image avatar">
        <div className="w-10 rounded-full">
          <img
            alt="user avatar"
            src={
              msg.sender === "me"
                ? user.photoUrl || "https://img.daisyui.com/images/profile/demo/anakeen@192.webp"
                : targetUserPhotoUrl || "https://img.daisyui.com/images/profile/demo/kenobee@192.webp"
            }
          />
        </div>
      </div>
      <div className="chat-header">
        {msg.sender === "me" ? "You" : targetUserFirstName}
        <time className="text-xs opacity-50 ml-1">12:45</time>
      </div>
      <div className="chat-bubble">{msg.text}</div>
      <div className="chat-footer opacity-50">Delivered</div>
    </div>
  ))}
</div>
```

### **What this does:**

✅ **Loops over `messages` array** to display each message as a bubble.
✅ Aligns bubbles:

* `chat-end` (right) if sent by "me",
* `chat-start` (left) if sent by "them".

✅ Displays:

* Avatar (your photo or target user’s photo).
* Name ("You" for sender, target user’s first name for receiver).
* Message text in a styled bubble.
* "Delivered" footer for consistency.

✅ **Provides a visually clear, modern chat UI.**

---

## 🪐 **2️⃣ Determining User Details for Avatars and Names**

```js
const connections = useSelector(store => store.connections);

const targetUser = connections.find(user => user._id === targetUserId);
const targetUserPhotoUrl = targetUser?.photoUrl;
const targetUserFirstName = targetUser?.firstName || targetUserId;
```

✅ Retrieves `connections` from Redux store.
✅ Finds the target user’s details using `targetUserId`.
✅ Extracts:

* `targetUserPhotoUrl` for displaying the receiver’s avatar.
* `targetUserFirstName` for displaying their name in the chat bubble.

---

## 🪐 **3️⃣ Receiving and Appending Messages**

```js
socket.on("messageReceived", ({ firstName, text, userId: senderId }) => {
  console.log(`${firstName}: ${text}`);
  setMessages(prevMessages => [
    ...prevMessages,
    { text, sender: senderId === userId ? "me" : "them", firstName }
  ]);
});
```

### **What happens here:**

✅ **Listens for `messageReceived` event** from the server.
✅ Extracts:

* `firstName` of sender,
* `text` (message),
* `senderId` (`userId` of sender).

✅ Logs the message for debugging:

```
firstName: text
```

✅ **Updates the `messages` state using `setMessages`**:

* Keeps all previous messages (`...prevMessages`).
* Appends the new message:

  ```js
  { 
    text, 
    sender: senderId === userId ? "me" : "them", 
    firstName 
  }
  ```
* **Determines if the message was sent by "me" or "them" based on `senderId`.**

---

## 🚀 **How All This Enables Message Display in the Chat Area:**

✅ When a **message is received**:
1️⃣ The **backend emits `messageReceived`** to all clients in the chat room.
2️⃣ The **frontend `socket.on("messageReceived")` handler triggers**, appending the message to the `messages` state.
3️⃣ **React re-renders the chat UI** automatically due to state change.
4️⃣ The **message appears visually in the message area** with:

* Correct alignment (left/right),
* Avatar,
* Name ("You" or target user’s name),
* Message text,
* "Delivered" status.

✅ This **real-time visual update flow** is what makes your **DevTinder chat appear live and interactive**.

---

### ✅ **Summary:**

| Step                               | Action                                              | Result                           |
| ---------------------------------- | --------------------------------------------------- | -------------------------------- |
| 1️⃣ Emit/receive `messageReceived` | Socket listens for incoming messages                | Message data captured            |
| 2️⃣ Update `messages` state        | Using `setMessages`                                 | Triggers React re-render         |
| 3️⃣ Render message bubbles         | Maps over `messages`                                | Displays new messages in UI live |
| 4️⃣ User context                   | Determines sender/receiver for alignment and labels | Visually clear who sent what     |

---



# 🛡️ 1️⃣ Why securing `roomId` is needed

**Current implementation:**

```js
const roomId = [userId, targetUserId].sort().join("_");
```

✅ Easy to implement.
❌ Predictable, making **roomId guessable**, allowing:

* Unauthorized users to join rooms.
* Message interception or spam injection.

---

## 🛡️ 2️⃣ Applying `crypto` hashing for secure room ID

### New utility:

```js
const crypto = require("crypto");

const getSecretRoomId = (userId, targetUserId) => {
    return crypto
      .createHash("sha256")
      .update([userId, targetUserId].sort().join("_"))
      .digest("hex");
};
```

### Why?

✅ Uses **SHA-256 hashing**, making the roomId:

* Irreversible.
* Unique to these two users.
* Impossible to guess without knowing both userIds.

---

## 🛡️ 3️⃣ Updating Socket.IO handlers

### **Before:**

```js
const roomId = [userId, targetUserId].sort().join("_");
```

### **After:**

```js
const roomId = getSecretRoomId(userId, targetUserId);
```

**In both:**

* `socket.on("joinChat")` to join securely.
* `socket.on("sendMessage")` to emit securely.

---

## 🛡️ 4️⃣ How Socket.IO itself supports security: Using `auth`

Socket.IO provides **built-in authentication mechanisms**:

### ✅ **Client-side:**

```js
import { io } from "socket.io-client";

const socket = io({
  auth: {
    token: "abcd" // JWT or session token
  }
});

// or dynamically:
const socket = io({
  auth: (cb) => {
    cb({ token: localStorage.getItem("token") });
  }
});
```

---

### ✅ **Server-side:**

```js
io.on("connection", (socket) => {
  console.log(socket.handshake.auth); // { token: "abcd" }

  const token = socket.handshake.auth.token;
  // Verify token, fetch user, handle authorization, etc.
});
```

---

### ✅ **Re-authentication upon `connect_error`:**

If connection is denied due to invalid credentials:

```js
socket.on("connect_error", (err) => {
  if (err.message === "invalid credentials") {
    socket.auth.token = "newValidToken";
    socket.connect();
  }
});
```

Or forcibly:

```js
socket.auth.token = "newValidToken";
socket.disconnect().connect();
```

---

## 🛡️ 5️⃣ Using **retries** for delivery guarantee

**Introduced in v4.6.0:**

Ensures the client will retry sending events if no acknowledgment is received.

### Usage:

```js
const socket = io({
  retries: 3,          // will retry 3 times
  ackTimeout: 10000    // wait 10 seconds for ack before retry
});

// Send with implicit ack:
socket.emit("my-event");

// Or explicit ack:
socket.emit("my-event", (err, val) => {
  if (err) console.error(err);
  else console.log(val);
});

// Or custom timeout:
socket.timeout(5000).emit("my-event", (err, val) => {
  if (err) console.error(err);
  else console.log(val);
});
```

**⚠️ Note:**
Your server handler must **acknowledge** the event for retries to function correctly:

```js
io.on("connection", (socket) => {
  socket.on("my-event", (cb) => {
    cb("received successfully");
  });
});
```

Otherwise, the client will keep retrying unnecessarily.

---

## ✅ **Summary Table**

| Aspect                      | What It Does                                        | Why It Matters                                     |
| --------------------------- | --------------------------------------------------- | -------------------------------------------------- |
| `crypto` hashing for roomId | Creates a hashed, irreversible room identifier      | Prevents guessing and unauthorized room access     |
| Socket.IO `auth`            | Pass JWT/session token during connection            | Enables user-level authentication & authorization  |
| Retry mechanism             | Retries message delivery if not acknowledged        | Ensures reliability of message delivery            |
| Secure join and send        | Uses consistent secure roomId on both join and send | Guarantees messages go to the correct private room |

---

