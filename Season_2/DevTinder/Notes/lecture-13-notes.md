# 📘 Lecture 13 Notes – ref,Populate & Thought Process of writing APIs




---
```
POST /request/review/:status/:requestId
```

This API allows a **logged-in user to accept or reject** a connection request **they received**.


```js
// ✅ API to accept or reject a connection request
requestRouter.post("/request/review/:status/:requestId",
  userAuth, // 🔒 Middleware to make sure only logged-in users can access this
  async (req, res) => {
    try {
      // 📦 Getting the currently logged-in user from the request (added by userAuth middleware)
      const loggedInUser = req.user;

      // 🧱 Destructure status (accept/reject) and requestId from the request URL params
      const { status, requestId } = req.params;

      // ✅ Step 1: Validate if status is either 'accepted' or 'rejected'
      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res
          .status(400)
          .json({ message: "Status is not allowed" });
      }

      // ✅ Step 2: Check if the connection request exists in DB
      // - It must be:
      //   → addressed *to* the current user
      //   → and must originally have the status "interested"
      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });

      // ❌ If such request is not found, then it's invalid
      if (!connectionRequest) {
        return res
          .status(404)
          .json({ message: "Connection Request not found" });
      }

      // ✅ Step 3: Update the status (either 'accepted' or 'rejected')
      connectionRequest.status = status;

      // 💾 Save the updated connection request to DB
      const data = await connectionRequest.save();

      // 📤 Send back success response
      res.json({
        message: "Connection Request " + status,
        data,
      });
    } catch (err) {
      // 🔥 Catch any errors during DB operations
      res.status(400).send("ERROR : " + err.message);
    }
  }
);
```

---

### 🧠 **Logic Summary:**

1. **🔐 Secure Route** using `userAuth` → only logged-in users can use this.
2. **✔ Status must be** `"accepted"` or `"rejected"`.
3. **🔍 Finds the request**:
   → Must match `requestId`,
   → Must be `toUserId = loggedInUser`,
   → Must originally have `"interested"` status.
4. **📝 Updates the status** to the reviewed status.
5. **✅ Saves** the change and sends back the result.

---




### 🔒 **Why These Validations Are Important**

| Validation                      | Purpose                                                        |
| ------------------------------- | -------------------------------------------------------------- |
| `status` check                  | Only allow valid review actions                                |
| `toUserId === loggedInUser._id` | Prevent other users from modifying unrelated requests          |
| `status: "interested"`          | Ensure only active/unhandled requests can be reviewed          |
| `findOne({ ... })`              | Single DB call with multiple conditions — efficient and secure |

---




## 🔁 GET vs POST – Thought Process

### 🟢 **POST API**

**Purpose:**
Used when a user wants to **send data** to the server to be **stored in the database**.
👉 Example: Signing up, creating a post, sending a request.

**🔒 Security Concerns:**

* 🧨 Can be attacked by **sending random or malicious data**.
* ❗ If you don’t validate inputs, that bad data might be saved into your database.

**✅ Best Practices:**

* Always **validate and sanitize** input data before calling `.save()`.
* Use **schema-level validation** and custom checks in your controller.
* Never trust the data coming from frontend or third-party clients.

---

### 🔵 **GET API**

**Purpose:**
Used when a user wants to **fetch data** from the database.
👉 Example: Viewing profile, fetching requests, loading feed.

**🔒 Security Concerns:**

* 🧨 Can leak **unauthorized or sensitive data** if access control is missing.
* ❗ Attacker might try to get info of **other users** by guessing IDs or modifying URLs.

**✅ Best Practices:**

* Always **check if the user is authorized** before giving any data.
* Only return the **required fields**, never expose passwords, tokens, or sensitive data.
* Add **pagination** if large amounts of data are being returned.

---

## 🧠 Summary Table

| Type     | Used For                  | Risk                               | Solution                               |
| -------- | ------------------------- | ---------------------------------- | -------------------------------------- |
| **POST** | Sending data to server    | Bad data sent and saved to DB      | Validate & sanitize before `.save()`   |
| **GET**  | Fetching data from server | Leaking data to unauthorized users | Use auth checks & limit exposed fields |

---

## ✍️ Key Reminders:

* "Never trust user input" – always **validate** it!
* "Least privilege" – only **return data that’s needed**.
* Think like an attacker – secure your GETs and POSTs accordingly.

Here are the **📘 Notes on Using `ref` and `.populate()` in Mongoose** with clear explanation based on your `/user/requests/received` API:

---
# 📘  `ref` and `populate()` in Mongoose (Connection Request Example)

## 📌 Goal

We want to fetch **connection requests received** by a logged-in user **along with profile info** (name, photo, etc.) of the users who sent those requests.

---

## 🧠 Problem Without `.populate()`

Initially, this code:

```js
const connectionRequests = await ConnectionRequest.find({
  toUserId: loggedInUser._id,
  status: "interested"
})
```

returns a list of requests with only the `fromUserId` (just the ObjectId):

```json
"fromUserId": "685cf03aede5ece75d3fe49b"
```

To get the sender’s full profile, one naive (bad) way is:

* Loop through all `fromUserId`
* Do a `User.findById(fromUserId)` for each → 🔴 inefficient (N+1 queries)
* Increases DB load and response time

---

## ✅ Optimal Way: Using `ref` + `.populate()`

### 🔗 Step 1: Create a Reference Between Models

In `connectionRequestSchema` (inside `models/connectionRequest.js`):

```js
fromUserId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User", // 👉 tells MongoDB this field points to User collection
  required: true
}
```

This sets up a **virtual link** between `ConnectionRequest` and `User` collection.

---

### 🔍 Step 2: Use `.populate()` to Auto-Fetch User Data

```js
const connectionRequests = await ConnectionRequest.find({
  toUserId: loggedInUser._id,
  status: "interested"
})
.populate("fromUserId", "firstName lastName photoUrl age gender about skills")
```

> This auto-fetches user data from `User` collection for each `fromUserId`.

---

### 🛠️ You Can Write `.populate()` in Two Ways

```js
// Space-separated string of fields
.populate("fromUserId", "firstName lastName")

// OR array of field names
.populate("fromUserId", ["firstName", "lastName"])
```

---

## ✅ Final Response Output Looks Like:

```json
{
  "_id": "reqId",
  "fromUserId": {
    "_id": "userId",
    "firstName": "Mark",
    "lastName": "Zuckerberg",
    "photoUrl": "https://photome.com",
    "skills": ["reactjs"]
  },
  "status": "interested"
}
```

Now, instead of just an ID, you get full user info **in a single query** 🚀

---

## ⚡ Benefits of `ref` + `.populate()`

| Feature       | Benefit                                                |
| ------------- | ------------------------------------------------------ |
| `ref`         | Links collections like foreign keys                    |
| `.populate()` | Auto fetch related documents                           |
| Efficiency    | Only **1 query** to fetch both request and sender info |
| Cleaner code  | No need to manually join or loop                       |
| Scalable      | Works even if 1000s of users sent requests             |

---

## </> Code for `/user/requests/recieved` Route: 

```js
// /user/requests/received = get all the pending connection reuqest for the loggedInUser
userRouter.get(
    "/user/requests/received",
    userAuth,
    async (req,res) =>{
        try {
            const loggedInUser = req.user
            const connectionRequests = await ConnectionRequest.find({
                toUserId: loggedInUser._id,
                status: "interested"
            }).populate("fromUserId","firstName lastName photoUrl age gender about skills",) // we can also write like a string where the fields name are separated by space
            // }).populate("fromUserId",["firstName","lastName"],) // we can write like a array consisting of strings 

            res.json({
                message:"Data fetched Successfully",
                data: connectionRequests
            })
      
        } catch (error) {
            res.status(400).send("ERROR : ",+error.message)
        }
    }
)
```


---

## 📘 API: `/user/connections`

### 📍 Purpose:

We want to **fetch the list of users who are connected (accepted connection requests)** with the logged-in user — like a friend list.

---

### ✅ API Method:

```http
GET /user/connections
```

---

## 💡 How Connection Requests Work

In our system, a **connection** is established **when a request is accepted**.
So, in the `connection_requests` collection, a connected user can be either:

* The **sender** (`fromUserId`)
* Or the **receiver** (`toUserId`)
---



### 🔑 Requirements:

* User must be authenticated → `userAuth` middleware.
* Only fetch users where the connection status is `"accepted"`.

---

## 🔍 Query Logic

```js
const connectionRequests = await ConnectionRequest.find({
  $or: [
    { toUserId: loggedInUser._id, status: "accepted" },
    { fromUserId: loggedInUser._id, status: "accepted" }
  ]
})
.populate("fromUserId", USER_SAFE_DATA)
.populate("toUserId", USER_SAFE_DATA)
```


> ✅ `$or` is used here to get all accepted connections where the user was either the sender or the receiver.

---
### ✨ What is `USER_SAFE_DATA`?

This is a constant (probably like this):

```js
const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";
```

It ensures you're only sending non-sensitive public profile fields to the client.


---

### 🧠 Problem we Faced:

When fetching **connection requests with status `"accepted"`**, the logged-in user could either be:

* The **sender** (`fromUserId`)
* Or the **receiver** (`toUserId`)

You want to **only return the other person** in the connection — not the logged-in user.

```json
[
  {
    fromUserId: { _id: "User1", name: "Alice" },
    toUserId: { _id: "LoggedInUser", name: "You" },
    status: "accepted"
  },
  {
    fromUserId: { _id: "LoggedInUser", name: "You" },
    toUserId: { _id: "User2", name: "Bob" },
    status: "accepted"
  }
]
```

### ❌ Problem:

If we directly return this list, both `fromUserId` and `toUserId` will be present. But we only want the **other person** (not the logged-in user).

---

### ✅ Code Fix:

```js
const data = connectionRequests.map((row) => {
  // If the logged-in user sent the request,
  // show the receiver (toUserId)
  if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
    return row.toUserId;
  }
  // Else, return the sender (fromUserId)
  return row.fromUserId;
});
```

## 🧾 Final Response

```json
{
  "message": "Data fetched Successfully",
  "data": [
    {
      "_id": "User1",
      "name": "Alice"
    },
    {
      "_id": "User2",
      "name": "Bob"
    }
  ]
}
```

Now the logged-in user sees **only their connected friends**, not themselves in the response. ✅

### ❗ Without this logic:

You would return both users in the connection object — including the logged-in user — which is **not useful** for showing a clean list of **connections (other users)**.







---

## 🔍 Summary of Learnings:

| Concept                              | Explanation                                        |
| ------------------------------------ | -------------------------------------------------- |
| 🔁 `fromUserId` and `toUserId` logic | Needed to show only the *other* user in connection |
| 🔎 `.populate()`                     | Fetched user details from User collection          |
| 🛡️ `USER_SAFE_DATA`                 | Prevented leakage of sensitive info                |
| 🚀 `map()` filtering logic           | Ensured accurate user list from both directions    |

---

Let me know if you'd like a visual diagram of the connection flow too!


## </> Code for `/user/connections` Route: 

```js
// /user/connections  - > it fetches the list of users who has accepted the connection request from the loggedInUser
const express = require("express");
const { userAuth } = require("../middlewares/auth.js");
const ConnectionRequest = require("../models/connectionRequest.js");

// Fields you want to safely return from the user document
const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";

const userRouter = express.Router();

/**
 * GET /user/connections
 * Fetches all users who have an accepted connection with the logged-in user.
 */
userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    // Step 1: Find all accepted connection requests where the logged-in user
    // is either the sender or the receiver.
    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    // Step 2: Extract only the "other" user's data from each connection
    const data = connectionRequests.map((row) => {
      // If the logged-in user SENT the request, return the receiver
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      // If the logged-in user RECEIVED the request, return the sender
      return row.fromUserId;
    });

    // Step 3: Send the clean list of connections
    res.json({ message: "Data fetched Successfully", data: data });
  } catch (error) {
    res.status(400).send("ERROR: " + error.message);
  }
});

module.exports = userRouter;


```




