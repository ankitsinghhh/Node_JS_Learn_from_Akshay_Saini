# 📘 Lecture 12 Notes – Logical DB query and command indexes


---

# 🤝 Connection Request Feature — Notes

## ✅ What We Are Building:
A **connection request system** where one user can express interest (right swipe) or ignore (left swipe) another user.

---

## 🧠 Why NOT Store Connection Requests in `User` Schema?

Storing in `User` schema would create:
1. **Scalability issues** — each user could have hundreds of connection requests.
2. **Complex updates** — editing nested arrays for every action (accept, reject, etc.).
3. **Redundant data** — storing both sent and received lists creates duplication.
4. **Difficult validations** — checking for existing requests or circular logic (A → B and B → A).
5. **Schema pollution** — User schema becomes bloated with connection logic.

🔹 **Solution**: Keep connection requests in a separate model/collection called `ConnectionRequest`.

---

## 🏗️ `ConnectionRequest` Schema (`models/connectionRequest.js`)

```js
const mongoose = require('mongoose')

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["ignore", "interested", "accepted", "rejected"],
        message: `{VALUE} is not a valid status`,
      },
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
)

const ConnectionRequest = mongoose.model("ConnectionRequest", connectionRequestSchema)
module.exports = ConnectionRequest

```

* `fromUserId` → The user who sent the request
* `toUserId` → The user receiving the request
* `status` → Represents the intent (`ignore`, `interested`, etc.)

---

## 🧪 Schema-Level Validation (Pre-save Hook)

```js
connectionRequestSchema.pre("save", function () {
  const connectionRequest = this;
  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    throw new Error("Cannot send connection request to yourself");
  }
  next();
});
```

### 🔍 Why:

* Prevent users from sending a connection request to themselves.
* This **runs automatically before `.save()`** is called — works like a **middleware** inside schema.

⚠️ Use **regular functions**, not arrow functions — `this` won’t work with arrow functions in Mongoose hooks. 
⚠️ Because this inside an arrow function doesn't point to the document — it refers to the lexical scope. Regular function expressions are necessary to access the current document (this).

---

## 📬 API: POST `/request/send/:status/:toUserId`

### ✅ Purpose:

Allows a logged-in user to send a connection request (only `ignore` or `interested`) to another user.

### 🧠 Logic Breakdown:

| Validation Step                                 | Why It's Needed                                                             |
| ----------------------------------------------- | --------------------------------------------------------------------------- |
| `status` must be "interested" or "ignored"      | Prevents users from directly sending `accepted` or `rejected` values        |
| Check if `toUserId` exists in the DB            | Ensures the user you're connecting to is a valid, existing user             |
| Check if connection already exists (in any way) | Avoid duplicate requests (A → B or B → A already exists)                    |
| Ensure `fromUserId !== toUserId`                | Users should not be able to send requests to themselves (handled in schema) |

---

### 🔧 Code Summary:

```js
requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
  try {
    const fromUserId = req.user._id
    const toUserId = req.params.toUserId
    const status = req.params.status

    // ✅ 1. Validate status
    const allowedStatus = ["interested", "ignored"]
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: `Invalid Status Type: ${status}` })
    }

    // ✅ 2. Check if toUserId exists
    const toUserExists = await User.findById(toUserId)
    if (!toUserExists) {
      return res.status(400).json({ message: "User not found" })
    }

    // ✅ 3. Prevent duplicate requests (both directions)
    const alreadyExists = await ConnectionRequest.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    })

    if (alreadyExists) {
      return res.status(400).json({ message: "Connection Request Already Exists" })
    }

    // ✅ 4. Create new request
    const connectionRequest = new ConnectionRequest({
      fromUserId,
      toUserId,
      status,
    })

    const data = await connectionRequest.save()

    res.json({
       message : req.user.firstName + "'s status for " + toUserIdExists.firstName + " is now "+status,
      data,
    })
  } catch (err) {
    res.status(400).send("ERROR: " + err.message)
  }
})
```

---

## 💡 Learnings Recap:

| Concept                            | Learning                                               |
| ---------------------------------- | ------------------------------------------------------ |
| `status` validation                | Prevents direct `accepted/rejected` insertion          |
| Check if target user exists        | Prevents random or fake user ID abuse                  |
| Bidirectional check for duplicates | Prevents creating mirror requests (A ↔ B)              |
| `.pre("save")` schema middleware   | Used for internal validation logic before saving to DB |
| Custom model separation            | Keeps business logic modular and easier to scale       |

## 🔁 Advantages of This Design

* ✔️ Cleanly separates concerns (`users` vs `requests`)
* ✔️ Keeps each model focused on a single responsibility
* ✔️ Simplifies querying, filtering, and updating connection requests
* ✔️ Makes data easier to validate and maintain
* ✔️ Scalable even with millions of requests



---

# 📘 **Understanding Indexing in MongoDB (Mongoose)**

---

## 🔍 **What is Indexing?**

**Indexing** is like a roadmap in the database that **makes searching fast**.

> Just like a book’s index helps you jump to a topic instantly instead of reading every page, **database indexes help you quickly locate documents** based on specific fields.

---

## 🚀 **Why is Indexing Needed?**

* Without indexes, **MongoDB must scan every document** in a collection to find matches.
* This is **fine for small datasets**, but **painfully slow for large-scale applications**.

✅ Indexing is **crucial when scaling your app** or dealing with **frequent read queries**.

---

## 📌 **Example: Email Index in User Schema**

```js
email: { 
  type: String, 
  required: true, 
  unique: true,        // 🚀 Automatically creates an index!
  lowercase: true,
  trim: true,
  validate(value) {
    if (!validator.isEmail(value)) {
      throw new Error("Invalid Email")
    }
  }
}
```

### 🔑 Why index email?

* **Used in `/login` API** to fetch user by email.
* Without an index, MongoDB must check **every document one by one**.
* With an index, MongoDB performs a **quick lookup**, improving speed drastically.

---

## 🧱 **What is a Compound Index?**

> A **compound index** is an index on **multiple fields**. It improves queries that filter using **more than one field**.

### ✅ Example in `ConnectionRequest` Model

```js
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 })
```

### 📌 Why?

In the `/request/send/:status/:toUserId` API, we **check for existing requests** like this:

```js
await ConnectionRequest.findOne({
  $or: [
    { fromUserId, toUserId },
    { fromUserId: toUserId, toUserId: fromUserId }
  ]
})
```

---

## 💡 **What's `$or` doing here?**

* The `$or` operator is used to **match documents where *either* condition is true**.
* In our case:

  * First condition: `fromUserId` sent to `toUserId`
  * Second condition: the reverse — `toUserId` sent to `fromUserId`

This ensures we **detect both forward and reverse** connection requests (e.g., A → B or B → A), **preventing duplicates**.

### 🔍 Why we still need the compound index?

Even when using `$or`, MongoDB can **still utilize compound indexes**, especially if **both fields are involved** in each condition — improving performance.

---

## 👤 **Other Useful Indexes in User Schema**

```js
userSchema.index({ firstName: 1, lastName: 1 }) // to speed up full-name searches
userSchema.index({ gender: 1 }) // for filtering by gender
```

---

## ⚠️ **Why Not Add Too Many Indexes?**

### ❌ Indexes Have Costs:

| Problem                  | Explanation                                                   |
| ------------------------ | ------------------------------------------------------------- |
| ❌ Slower Writes          | Every time you insert/update, **indexes must also update**.   |
| ❌ More Disk Space        | Indexes are **stored separately**, and take additional space. |
| ❌ Complex Index Strategy | Too many indexes can confuse MongoDB query planner.           |

> 🧠 **Only add indexes on fields that are used often in filtering, sorting, or lookups.**

---

## 🧪 Summary

| Feature        | Purpose                                                             |
| -------------- | ------------------------------------------------------------------- |
| `index: true`  | Manually creates an index on a single field                         |
| `unique: true` | Creates a unique index (also acts as validation)                    |
| Compound Index | Speeds up queries involving **multiple fields**                     |
| Use Case       | Email (login), fromUserId + toUserId (connection)                   |
| `$or`          | Matches if **either condition is true**, useful for reverse lookups |
| Drawback       | Slows down writes, uses disk space                                  |

---
