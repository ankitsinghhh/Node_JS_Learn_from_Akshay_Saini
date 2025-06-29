# 📘 Lecture 3 Notes

In this lecture, we learned the basics of creating an Express server and handling requests using middleware and specific routes.

---

## Core Concepts

### **1. Middleware**

- Functions that intercept and process HTTP requests
- Executed sequentially in the order they're defined
- Can modify request/response objects or end the request cycle
- Examples: Logging, authentication, data parsing

### **2. Route Handling**

- `app.METHOD(path, handler)` structure (GET, POST, PUT, DELETE)
- Path-specific request processing
- Can chain multiple handlers for a single route

### **3. Application Methods**

- `app.use()` - Mounts middleware (for all routes or specific paths)
- `app.listen()` - Binds server to a port

## ✅ Code Example

```js
// Importing the Express framework
const express = require("express");

// Creating an instance/object of an Express application
const app = express();

// =============================
// Middleware to handle all incoming HTTP requests
// =============================
// This will run for every request made to the server.
// Example (commented out):
// app.use((req, res) => {
//   // Sending a simple response to the client
//   res.send("Hello from DevTinder Server!");
// });

// =============================
// Request handler with a specific path (/test)
// =============================
app.use("/test", (req, res) => {
  res.send("Hello from DevTinder Server {/test} route!");
});

// =============================
// Another request handler with a specific path (/hello)
// =============================
app.use("/hello", (req, res) => {
  res.send("This is a hello route");
});

// =============================
// Start the server and listen on port 3000
// =============================
// app.listen() binds and listens to port 3000 on your machine
// The callback function runs once, confirming that the server has started
// Visit http://localhost:3000 to access the server
app.listen(3000, () => {
  console.log("✅ Server is running on port 3000 🚀");
});
```
