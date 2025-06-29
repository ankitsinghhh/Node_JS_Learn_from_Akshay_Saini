# 📘 Lecture 5 Notes - Middleware and Error Handlers

## Introduction to Middleware

### What is Middleware?
- Functions that have access to:
  - Request object (`req`)
  - Response object (`res`)
  - Next middleware function (`next`)
- Execute any code
- Make changes to request/response objects
- End the request-response cycle
- Call the next middleware in the stack

### Basic Middleware Structure
```js
app.use((req, res, next) => {
  // Middleware logic here
  next(); // Call next() to pass control to next middleware
});
```

---

# 📘 Route Handlers and the `next` Function

## 🔧 Route Handler Syntax

### 📎 Basic Structure

```js
app.use("/routename", handler1, handler2, ..., handlerN);
```

### ✅ Equivalent Forms

1. **Single `app.use()` with multiple handlers**:
```js
app.use("/route", handler1, handler2, handler3)
```

2. **Separate route declarations**:
   - Handlers execute in the order they're defined
   - Whether in single `app.use()` or separate declarations
   - Example:
```js
app.get("/user", (req, res, next) => {
  console.log("Handler 1");
  next();
});
app.get("/user", (req, res) => {
  res.send("Handler 2");
});
```

3. **Array Form**:
```js
app.use("/route", [handler1, handler2, handler3])
```

4. **Mixed Form**:
```js
app.use("/route", handler1, [handler2, handler3], handler4)
```

---
### Key Characteristics

- **Execution Flow**:
  - Handlers execute in the order they're defined
  - Whether in single `app.use()` or separate declarations
  - Example:
```js
app.get("/user", (req, res, next) => {
  console.log("Handler 1");
  next();
});
app.get("/user", (req, res) => {
  res.send("Handler 2"); 
});
```

- **Response Requirement**:
  - At least one handler must send a response
  - Otherwise the request will hang and timeout

### The `next` Function

#### Purpose
- Passes control to the next handler
- Works across both single and multiple route declarations

#### Usage Examples
1. **In single route declaration**:
```js
app.use("/api", 
  (req, res, next) => {
    console.log("Middleware");
    next();
  },
  (req, res) => {
    res.send("Response");
  }
);
```

2. **Across multiple declarations**:
```js
app.get("/product", (req, res, next) => {
  console.log("Product logger");
  next();
});
app.get("/product", (req, res) => {
  res.send("Product data");
});
```

### Important Notes

1. **Response Handling**:
   - Only one response can be sent per request
   - Calling `res.send()` multiple times causes errors

2. **Error Cases**:
   - Forgetting to call `next()` will hang the request
   - Not sending any response will timeout

3. **Best Practices**:
   - Use `next()` for middleware that shouldn't respond  
   - End the chain with a response-sending handler
   - Keep handler logic focused (single responsibility)

### Common Patterns

#### Shared Middleware
```js
// Shared for all /admin routes
app.use("/admin", adminLogger);

app.get("/admin/users", usersHandler);
app.get("/admin/stats", statsHandler);
```

#### Conditional Processing  
```js
app.get("/api", 
  (req, res, next) => {
    if (req.query.debug) {
      console.log("Debug mode");
    }
    next();
  },
  apiHandler
);
```

> **Key Point**: The order of handler registration matters more than how they're grouped!

## Why Route Handlers Exist

Route handlers exist **because of middleware** - functions that sit "in the middle" between the request and response. This creates a powerful pipeline for processing requests.

## How the Middleware Chain Works

### Request Processing Flow
1. **Request Received**  
   - Express creates `req` and `res` objects
   - Begins traversing the middleware stack

2. **Route Matching**  
   ```plaintext
   GET /user → Checks ALL app.METHOD() handlers in order:
   1. app.use("/", middleware1)
   2. app.get("/user", handler1)
   3. app.use("/user", middleware2)
   4. app.get("/user", handler2)
   ```

3. **Execution Rules**:
   - Runs **every matching middleware/handler** in sequence
   - **Stops** when a response is sent (`res.send()`)
   - Continues if `next()` is called

### Key Characteristics
```js
app.get("/user", 
  (req, res, next) => { // ← Middleware #1
    console.log("Auth check");
    next(); // Continue to next handler
  },
  (req, res) => { // ← Final Handler
    res.send("User data"); // Stops execution
  }
);

app.use("/user", (req, res) => {
  // Never reached because previous handler sent response
});
```

## Visualizing the Flow

### Example Scenario
```js
// 1. Runs first (matches all routes)
app.use((req, res, next) => {
  console.log("Request started");
  next();
});

// 2. Runs if path starts with /api
app.use("/api", (req, res, next) => {
  console.log("API request");
  next();
});

// 3. Final handler for GET /api/users
app.get("/api/users", (req, res) => {
  res.send("User list"); // ← Stops here
});

// 4. Would run if no response was sent
app.use("/api", (req, res) => {
  console.log("This won't execute");
});
```

### Flowchart -text based
1. [Start] Request Received
2. {Decision} Does path match current route?
   - Yes → Execute middleware/handler
     - {Decision} Does it call next()?
       - Yes → Move to next middleware
       - No → Send response and end
   - No → Check next route definition
3. [End] Request processing complete

## Critical Behaviors

1. **First Response Wins**  
   The first handler that calls `res.send()` ends the chain

2. **Order Matters**  
   Middleware executes in registration order

3. **404 Handling**  
   If no handler sends a response, Express returns 404

4. **Error Handling**  
   Pass errors to `next(err)` to skip to error handlers

> **Golden Rule**: Middleware transforms requests, route handlers complete them.


## Why Middleware is Essential

Instead of repeating authorization checks in every route handler:
```js
// ❌ Without middleware - repetitive code
app.get("/admin/data", (req, res) => {
  if(isAdminAuthorized) {
    res.send("Data")
  } else {
    res.status(401).send("Unauthorized")
  }
})
```

Middleware solves this by centralizing the logic:
```js
// ✅ With middleware - clean and DRY
app.use("/admin", adminAuth) // Auth check happens once
app.get("/admin/data", (req, res) => {
  res.send("Data") // Only executes if authorized
})
```

## Implementation Methods

### 1. Direct Middleware
```js
app.use("/admin", (req, res, next) => {
  const token = "xyz"
  if(token !== "xyz") {
    return res.status(401).send("Unauthorized")
  }
  next() // Continue if authorized
})
```

### 2. Modular Middleware (Recommended)
**File:** `middlewares/auth.js`
```js
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

const userAuth =  (req,res,next)=>{
    console.log("user Auth is gettting checked")

    //Logic of checking if request is authorised
   const token = "abc"
   const isUserAuthorized = token === "abc"

   if(!isUserAuthorized){
       res.status(401).send("Unauthorized User Access")
   }
   else{
       console.log("User Authorized")
       next()
   }

}

module.exports = {
    adminAuth,
    userAuth,
 
};
```

**Main Application:**
```js
const { adminAuth } = require('./middlewares/auth')

app.use("/admin", adminAuth) // Applies to all admin routes
app.get("/admin/users", usersHandler) // Automatically protected
```

## Key Advantages
1. **Eliminates Code Duplication** - Auth logic written once
2. **Consistent Security** - Uniform protection for all routes
3. **Cleaner Routes** - Handlers focus on core functionality
4. **Easy Maintenance** - Update auth logic in one place

> **Best Practice**: Always place middleware before route handlers and after required parsers (`express.json()` etc.)



### Best Practices

- Use `next()` for middleware that shouldn't respond.
- End the chain with a response-sending handler.
- Keep handler logic focused (single responsibility).
- 🔐 **Avoid applying `userAuth` globally** — for routes like `/login`, skip auth:

```js
// ✅ Correct usage
app.post("/login", (req, res) => {
  res.send("login route called");
});

// 🔐 Apply userAuth only where needed
app.get("/user/getAllData", userAuth, (req, res) => {
  res.send("user is authorized | All data sent");
});
```


# 🧠 Error Handling in ExpressJS

## ✅ Route-Specific Error Handling (Using `try...catch`)

We handle known or expected errors (like database failures, bad input, etc.) **inside** route handlers using a `try-catch` block.

```js
app.get("/getUserData", (req, res) => {
  try {
    // Logic to fetch data from the database
    throw new Error("jsdjsljdljldffdjlsdjffds"); // Simulating an error

    // If no error occurs
    res.send("User data fetched successfully");
  } catch (err) {
    // Handle the error internally and send a proper response
    res.status(500).send("Error handling internally");
  }
});
```

### 🔍 Why use `try-catch`?

* Useful when you expect errors at specific points (like DB calls or external API fetches).
* Keeps route-specific logic and error messaging clean and controlled.
* Prevents server from crashing due to unhandled exceptions.

---

## 🌐 Global Error Handling Middleware

This is a **centralized handler** to catch errors not handled by individual routes.

```js
// Error handling for all routes where error is unhandled by them internally
app.use("/", (err, req, res, next) => {
  if (err) {
    // This handles any unhandled error thrown from route logic
    res.status(500).send("Something went wrong");
  }
});
```

### ⚠️ Important Notes:

* This middleware must have **four parameters**: `(err, req, res, next)`
* Must be placed **after** all routes and other middleware.
* Helps catch unexpected issues (e.g., programming bugs, missing `await`, etc.)

---

## 💡 Best Practices for Error Handling in Express

* ✅ Always use `try-catch` for logic that may fail (DB calls, API calls, file operations).
* ✅ Use centralized error middleware to catch and log unhandled errors.
* ✅ Add logs (`console.error(err)`) in the middleware to debug more easily.
* ✅ Avoid sending raw error messages to clients; instead, send user-friendly messages.
* ✅ Optionally use custom error classes or third-party libraries like `express-async-handler`.

---

## 🧪 Example Error Scenarios

| Scenario          | Handling Method                                  |
| ----------------- | ------------------------------------------------ |
| DB call fails     | `try-catch` inside route                         |
| JSON parse error  | Handled automatically or via global middleware   |
| Unknown exception | Caught by global error handler                   |
| 404 Not Found     | Add a catch-all route at the end to return a 404 |

```js
// 404 Handler
app.use((req, res) => {
  res.status(404).send("Route not found");
});
```



