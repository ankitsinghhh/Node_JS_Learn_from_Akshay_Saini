# 📘 Lecture 14 Notes – /user/feed api and Pagination 


---

## 📘 `/feed` API – Get Other Users' Profiles

### ✅ Purpose:

To fetch a list of user profiles (cards) that the **logged-in user has not interacted with** yet.

---

### 🤔 What Should Be Hidden from the Feed?

The **logged-in user should NOT see**:

1. **Their own profile**
2. Users who are already their **connections**
3. Users to whom they have already **sent a request**
4. Users from whom they have **received a request**
5. Users they have **ignored**

In short, **all users involved in any connection request (sent or received)**, regardless of status, should be excluded.

---

### 🧠 Approach:

#### 1. **Fetch all relevant connection requests:**

```js
const connectionRequests = await ConnectionRequest.find({
  $or: [
    { fromUserId: loggedInUser._id },
    { toUserId: loggedInUser._id }
  ]
}).select("fromUserId toUserId");
```

* This gets all requests where the user is either the **sender** or **receiver**.
* We only select the `fromUserId` and `toUserId` for efficiency.

---

#### 2. **Build a Set of user IDs to hide:**

```js
const hideUsersFromFeed = new Set();
connectionRequests.forEach((req) => {
  hideUsersFromFeed.add(req.fromUserId.toString());
  hideUsersFromFeed.add(req.toUserId.toString());
});
```

* We use a `Set` to automatically ensure uniqueness (no duplicates).
* We add both sender and receiver IDs from all found requests.
* This will cover all ignored, requested, accepted, or rejected users.

---

#### 3. **Query users NOT in that set:**

```js
const users = await User.find({
  $and: [
    { _id: { $nin: Array.from(hideUsersFromFeed) } }, // Not in the Set
    { _id: { $ne: loggedInUser._id } }                // Not self
  ]
}).select(USER_SAFE_DATA);
```

* `$nin`: exclude all users in the hide list.
* `$ne`: also exclude the logged-in user explicitly.
* `USER_SAFE_DATA`: a pre-defined list of safe fields to return (e.g., firstName, lastName, photo, etc.)

---

### ⚡ Result:

You get a clean list of **new potential users** (cards) to show in the feed, with no duplicates, no seen users, and no risk of showing the user themselves.

---

### 🧩 Why Use `Set`?

* Guarantees uniqueness.
* Prevents redundant IDs.
* Lightweight and efficient for filtering.

---

### ✅ Summary:

* 🔒 Hide all previous interactions (any request type).
* 🚫 Exclude self from results.
* ✅ Only return new, unconnected users for meaningful connections.



## ✅ **Code for `/feed` Route so far:**

```js
userRouter.get(
  "/feed",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;

      // Get all connection requests involving the logged-in user
      const connectionRequests = await ConnectionRequest.find({
        $or: [
          { fromUserId: loggedInUser._id },
          { toUserId: loggedInUser._id }
        ]
      }).select("fromUserId toUserId");

      // Use a Set to store all users to hide from the feed
      const hideUsersFromFeed = new Set();
      connectionRequests.forEach((req) => {
        hideUsersFromFeed.add(req.fromUserId.toString());
        hideUsersFromFeed.add(req.toUserId.toString());
      });

      // Query users not in the Set and not the logged-in user
      const users = await User.find({
        $and: [
          { _id: { $nin: Array.from(hideUsersFromFeed) } },
          { _id: { $ne: loggedInUser._id } }
        ]
      }).select(USER_SAFE_DATA);

      res.json({
        message: "Feed fetched successfully",
        data: users
      });
    } catch (error) {
      res.status(400).json({ message: "ERROR: " + error.message });
    }
  }
);
```

---

## 🧠 **MongoDB Query Operators in Feed API**

### 1. 🔍 `$nin` → **"Not in"**

* **Purpose:**
  Exclude documents whose field value is **in a given array**.

* **Used for:**
  Hiding users who are in `hideUsersFromFeed`.

* **Syntax:**

  ```js
  { _id: { $nin: [id1, id2, id3] } }
  ```

* **Meaning:**
  “Find users whose `_id` is **not in** the list `[id1, id2, id3]`.”

---

### 2. 🔍 `$ne` → **"Not equal"**

* **Purpose:**
  Exclude documents where a field matches a **specific value**.

* **Used for:**
  Hiding the logged-in user's own profile.

* **Syntax:**

  ```js
  { _id: { $ne: loggedInUser._id } }
  ```

* **Meaning:**
  “Find users whose `_id` is **not equal** to the logged-in user's ID.”

---

### ✅ In the Feed API:

```js
const users = await User.find({
  $and: [
    { _id: { $nin: Array.from(hideUsersFromFeed) } }, // hide interacted users
    { _id: { $ne: loggedInUser._id } }                // hide self
  ]
});
```

---

### 📌 Summary:

| Operator | Meaning            | Use Case                   |
| -------- | ------------------ | -------------------------- |
| `$nin`   | Not in array       | Exclude users from Set     |
| `$ne`    | Not equal to value | Exclude the logged-in user |



---

## 🧩 **Pagination - Why?**

* To **avoid loading all users at once**, which:

  * Improves **performance**
  * Reduces **bandwidth**
  * Gives **infinite scroll / page-wise display** in frontend.

---

## 🛠️ **How Pagination Works**

**API Call Examples:**

| URL                     | Skip | Limit | Records Fetched |
| ----------------------- | ---- | ----- | --------------- |
| `/feed?page=1&limit=10` | 0    | 10    | 1–10            |
| `/feed?page=2&limit=10` | 10   | 10    | 11–20           |
| `/feed?page=3&limit=10` | 20   | 10    | 21–30           |

**Formula:**

```js
skip = (page - 1) * limit
```

---

## 🛠️ MongoDB Methods Used

* `.skip(n)`: Skips `n` documents from the beginning.
* `.limit(m)`: Limits the result to `m` documents.

---

## 🔍 **Updated `/feed` API Flow:**

✅ **1️ Extract pagination query params:**

```js
const page = parseInt(req.query.page) || 1;
let limit = parseInt(req.query.limit) || 10;
limit = limit > 50 ? 50 : limit; // hard limit for safety
const skip = (page - 1) * limit;
```



✅ **3️ Fetch users:**

```js
const users = await User.find({
  $and: [
    { _id: { $nin: Array.from(hideUsersFromFeed) } },
    { _id: { $ne: loggedInUser._id } }
  ]
})
.select(USER_SAFE_DATA)
.skip(skip)
.limit(limit);
```

✅ **4️⃣ Return paginated users to the frontend for display.**

---

## ⚡ **Key Learnings:**

✅ Pagination:

* Prevents loading too much data at once.
* Enhances user experience with page-wise loading or infinite scroll.

✅ `skip()` and `limit()`:

* Used in MongoDB for server-side pagination.
* Paired with frontend `page` and `limit` to control results.

✅ Hard cap on limit:

* Avoids overload from malicious/accidental high `limit` values.
* Here, capped at `limit = 50`.

---

## ✅ Summary:

> **Pagination in `/feed` ensures:**

* Efficient user discovery.
* Faster API response.
* A scalable structure for production applications.

---

## ✅ **Final Code for `/feed` Route:**
```js
// GET /feed - returns paginated users that loggedInUser can see
userRouter.get(
    "/feed",
    userAuth,
    async (req, res) => {
        try {
            const loggedInUser = req.user;

            // Extract pagination parameters from query
            const page = parseInt(req.query.page) || 1;
            let limit = parseInt(req.query.limit) || 10;
            limit = limit > 50 ? 50 : limit; // Hard cap
            const skip = (page - 1) * limit;

            // Fetch all connection requests sent or received by loggedInUser
            const connectionRequests = await ConnectionRequest.find({
                $or: [
                    { fromUserId: loggedInUser._id },
                    { toUserId: loggedInUser._id }
                ]
            }).select("fromUserId toUserId");

            // Build a Set of userIds to hide from feed
            const hideUsersFromFeed = new Set();
            connectionRequests.forEach((req) => {
                hideUsersFromFeed.add(req.fromUserId.toString());
                hideUsersFromFeed.add(req.toUserId.toString());
            });

            // Fetch users excluding:
            // 1️⃣ Users involved in any connection request with loggedInUser
            // 2️⃣ The loggedInUser themselves
            const users = await User.find({
                $and: [
                    { _id: { $nin: Array.from(hideUsersFromFeed) } },
                    { _id: { $ne: loggedInUser._id } }
                ]
            })
                .select(USER_SAFE_DATA) // fetch only safe fields
                .skip(skip)             // pagination skip
                .limit(limit);          // pagination limit

            res.json({
                message: "Feed fetched successfully",
                data: users
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
);

```





