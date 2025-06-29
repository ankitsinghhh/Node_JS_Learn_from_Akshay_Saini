# 📘 Lecture 11 Notes – Diving into the APIs and Express Router

---

## 🧩 Overview

To build the core functionality of the **DevTinder Project**, we need to implement several **API endpoints** that cover:

- **Authentication**
- **Profile Management**
- **Connection Requests**
- **User Feed**
- **Connection Handling**

---

### 🔐 Authentication APIs

| Method | Endpoint     | Purpose                    |
|--------|--------------|----------------------------|
| POST   | `/signup`    | Register a new user        |
| POST   | `/login`     | Log in an existing user    |
| POST   | `/logout`    | Log out the current user   |

---

### 👤 Profile APIs

| Method | Endpoint           | Purpose                         |
|--------|--------------------|---------------------------------|
| GET    | `/profile/view`    | View logged-in user's profile   |
| PATCH  | `/profile/edit`    | Edit logged-in user's profile   |
| PATCH  | `/profile/password`| Change/reset user password      |

---

### 🤝 Connection Request APIs

| Method | Endpoint                                     | Purpose                                     |
|--------|----------------------------------------------|---------------------------------------------|
| POST   | `/request/send/interested/:userId`           | Send an interest request (right swipe)      |
| POST   | `/request/send/ignore/:userId`               | Ignore a profile (left swipe)               |
| POST   | `/request/review/accepted/:requestId`        | Accept a received request                   |
| POST   | `/request/review/rejected/:requestId`        | Reject a received request                   |

---

### 🔄 Connections & Requests APIs

| Method | Endpoint               | Purpose                            |
|--------|------------------------|------------------------------------|
| GET    | `/connections`         | Fetch all accepted connections     |
| GET    | `/requests/received`   | View all incoming requests         |

---

### 🧭 Feed API

| Method | Endpoint   | Purpose                                                  |
|--------|------------|----------------------------------------------------------|
| GET    | `/feed`    | Fetch a list of other users (a defined number at once)  |

> This endpoint returns **multiple user profiles at once**, not one by one like Tinder.

---

### 📝 Status Mapping

| Action         | Status     |
|----------------|------------|
| Right Swipe    | `interested` |
| Left Swipe     | `ignore`     |
| Request Accepted | `accepted` |
| Request Rejected | `rejected` |

---

### 🔑 Learnings So Far

- Plan your API structure before coding.
- Group routes by feature (auth, profile, requests, connections).
- Use route parameters (e.g. `:userId`, `:requestId`) for dynamic actions.
- Keep statuses **standardized and consistent**.

---

# 📦 Structuring APIs with Express Routers – Best Practices

---

## ✅ Why Use Express Routers?

- Keeps your **main `app.js` clean** and focused.
- Groups **related APIs** logically.
- Makes code **scalable** and **easy to maintain**.
- Enables separation of concerns (auth, profile, requests, users, etc.).

---

## 📁 Recommended Folder & File Structure

```

src/
├── app.js
├── routes/
│   ├── authRouter.js
│   ├── profileRouter.js
│   ├── connectionRequestRouter.js
│   └── userRouter.js

```

---

## 🛠️ 1. `authRouter`

Handles **authentication** logic:

| Method | Route    | Description        |
|--------|----------|--------------------|
| POST   | /signup  | Register user      |
| POST   | /login   | Login user         |
| POST   | /logout  | Logout user        |

📄 File: `routes/authRouter.js`

---

## 👤 2. `profileRouter`

Handles **profile-related** actions:

| Method | Route             | Description              |
|--------|-------------------|--------------------------|
| GET    | /profile/view     | View profile             |
| PATCH  | /profile/edit     | Edit profile             |
| PATCH  | /profile/password | Reset or change password |

📄 File: `routes/profileRouter.js`

---

## 🔗 3. `connectionRequestRouter`

Handles **sending and reviewing** connection requests:

| Method | Route                                         | Description             |
|--------|-----------------------------------------------|-------------------------|
| POST   | /request/send/interested/:userId             | Send interest           |
| POST   | /request/send/ignore/:userId                 | Ignore profile          |
| POST   | /request/review/accepted/:requestId          | Accept connection       |
| POST   | /request/review/rejected/:requestId          | Reject connection       |

📄 File: `routes/connectionRequestRouter.js`

---

## 🙋 4. `userRouter`

Handles **user-specific data retrieval**:

| Method | Route                     | Description                    |
|--------|---------------------------|--------------------------------|
| GET    | /user/connections         | Get all connections            |
| GET    | /user/requests/received   | Get incoming requests          |
| GET    | /user/feed                | Get list of profiles to swipe  |

📄 File: `routes/userRouter.js`

---

## 🗺️ Swipe Status Mapping

| Action         | Status     |
|----------------|------------|
| Right Swipe    | `interested` |
| Left Swipe     | `ignore`     |
| Request Accepted | `accepted` |
| Request Rejected | `rejected` |

---

## 📌 Final Step: Mount Routers in `app.js`

```js
const express = require('express');
const app = express();
const authRouter = require('./routes/authRouter');
const profileRouter = require('./routes/profileRouter');
const connectionRequestRouter = require('./routes/connectionRequestRouter');
const userRouter = require('./routes/userRouter');

app.use(express.json());
app.use("/auth", authRouter);
app.use("/profile", profileRouter);
app.use("/request", connectionRequestRouter);
app.use("/user", userRouter);

app.listen(7777, () => {
  console.log("✅ Server running on port 7777");
});
```

> Example: `POST /auth/signup`, `PATCH /profile/edit`, `GET /user/feed`

---

✅ **Best Practice Summary**:

* Group APIs by functionality.
* Import and mount routers in `app.js`.
* Keep each route file focused and small.
* Maintain consistent naming and structure.




---


# 🚀 Express Router Architecture – DevTinder Project

---

## 📁 Folder Structure

Organize your project like this:


src/
├── app.js                  # Main application file
├── routes/
│   ├── authRouter.js       # Handles signup, login, logout
│   ├── profileRouter.js    # Handles profile view/edit/password
│   └── requestRouter.js    # Handles connection requests
├── models/
│   └── user.js
├── middlewares/
│   └── auth.js
├── utils/
│   └── validation.js


---

## 🔁 Structure of a Route File (Example: `authRouter.js`)

```js
const express = require('express');
const authRouter = express.Router();

// All route handlers go here
authRouter.post("/signup", ...);
authRouter.post("/login", ...);

// Export the router to use in app.js
module.exports = authRouter;
```

### 🔍 Explanation

* `express.Router()` creates a **mini express app**.
* Instead of `app.get()` or `app.post()`, we use `authRouter.get()` or `authRouter.post()` inside this file.
* Finally, the router is exported using `module.exports`.

---

## 📥 Importing and Using Routers in `app.js`

```js
const authRouter = require("./routes/authRouter");
const profileRouter = require("./routes/profileRouter");
const requestRouter = require("./routes/requestRouter");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
```

### 💡 Why `app.use("/")`?

Using `app.use("/", <router>)` registers all the routes **from that router file** relative to the root path. So, if `authRouter` has a `POST /login`, then it becomes available at `POST /login`.

---

## 🧠 Key Learnings

### ✅ How Express matches routes with routers:

* When a request comes in (e.g., `/login`), Express checks each registered router **in order**.
* First, it checks `authRouter`, finds `/login` there, and executes it.
* If the request is `/profile`, it doesn’t find it in `authRouter`, so it moves on to `profileRouter`.
* Finally, `/profile` is matched inside `profileRouter` and handled.

✅ **Router order matters** in Express.

---

## 🧠 Best Practice Summary

| Practice                              | Benefit                            |
| ------------------------------------- | ---------------------------------- |
| Grouping routes by feature            | Clean code & better maintenance    |
| Using `express.Router()`              | Separates concerns, like mini-apps |
| Mounting routers with `app.use()`     | Keeps `app.js` short and focused   |
| Middleware like `userAuth` in routers | Makes routes secure and DRY        |

---

## 🛠️ Sample Router Behaviors

| Router          | Endpoint                      | Description                      |
| --------------- | ----------------------------- | -------------------------------- |
| `authRouter`    | `POST /login`                 | Logs in user                     |
| `profileRouter` | `GET /profile`                | Fetches logged-in user's profile |
| `requestRouter` | `POST /sendConnectionRequest` | Sends a connection request       |

---

## 🔗 What to Remember:

✅ **Routers behave like middleware**
✅ **Order of `app.use()` matters**
✅ Use comments to **explain flow** for better readability
✅ Make sure each router file is **focused on one responsibility**

---




## 🔐 Logout API – Cookie Expiry 

```js
authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()), // expires immediately
  });
  res.send("Logged out Successfully");
});
```

---

### 📘 **Why `res.cookie("token", null)` is used?**

* `res.cookie()` sets a cookie in the browser.
* When logging out, we want to **remove the JWT token** stored in the cookie.
* Setting the **value to `null`** and the **expiry to the current time** (`Date.now()`) tells the browser:

  > “This cookie has expired immediately, remove it.”

---

### 🧠 Key Points:

| Code Part                       | Meaning                                                               |
| ------------------------------- | --------------------------------------------------------------------- |
| `token`                         | Name of the cookie (holding the JWT)                                  |
| `null`                          | Clears the cookie's value (makes it empty)                            |
| `expires: new Date(Date.now())` | Sets cookie to expire **right now**, forcing the browser to remove it |

---

✅ **No need for authentication** in logout, because:

* We’re not fetching any protected data.
* We are simply clearing the token from the browser side.


---


# ✏️ API: PATCH `/profile/edit` — Update Logged-in User Profile

---

## 🔐 Route Protection

- This route is **protected** by `userAuth` middleware.
- Only **authenticated users** can update their own profile.

---



## 🧪 Validation Function: `validateEditProfileData(req)`

Defined in `/utils/validation.js`:

```js
const allowedEditFields = [ "firstName", "lastName", "email", "gender", "age", "skills", "about", "photoUrl" ];
const isEditAllowed = Object.keys(req.body).every(field => allowedEditFields.includes(field));
```
---
## 🛠 Purpose
To allow users to edit specific fields of their profile like:

First name
Last name
Email
Gender
Age
Skills
About
Photo URL

### ✅ Why it's important:

* Prevents malicious users from editing sensitive fields like `password`, `_id`, or `role`.
* Keeps the update operation safe and controlled.

---

## Code Example : 
```js
//function to udpate the profile of the logged in user
profileRouter.patch("/profile/edit",userAuth,async (req,res)=>{
    try{
        if(!validateEditProfileData(req)){
            throw new Error("Invalid Edit request")
        }
        const loggedInUser = req.user
        //you can do explicity for all of them like this but use loop 
        // loggedInUser.firstName = req.body?.firstName;
        Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]))
        await loggedInUser.save()
        //apart from this below method , you can also use res.json()
        // res.send(loggedInUser.firstName + " your profile updated successfully")
        // giving resposne using res.json() -> much better way to send the response
        res.json({
            "message": `${loggedInUser.firstName} , your profile updated successfully`,
            data : loggedInUser
        })
    }
    catch(err){
        res.status(400).send("ERROR : " + err.message)
    }

})
```

## 🔄 Profile Update Logic

```js
Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));
```

* Dynamically updates the fields sent in the request.
* **No need to manually check each field one-by-one**.
* This approach is flexible but still safe due to **prior validation**.

---

## ✅ Saving the Changes

```js
await loggedInUser.save();
```

* Mongoose `save()` commits the updates to the database.
* Triggers schema-level validations again.

---

## 📦 Response

```js
res.json({
  message: `${loggedInUser.firstName}, your profile updated successfully`,
  data: loggedInUser
});
```

* Uses `res.json()` for a clean, structured response.
* Includes both a success message and the updated user data.

---

## 🔁 Error Handling

* If validation fails or update goes wrong, the API responds with:

  ```js
  res.status(400).send("ERROR : " + err.message)
  ```

---

## 🧠 Key Learnings

| Concept                        | Why It's Important                                          |
| ------------------------------ | ----------------------------------------------------------- |
| Middleware (`userAuth`)        | Protects the route – only logged-in users can edit profiles |
| `validateEditProfileData()`    | Prevents unauthorized/sensitive updates                     |
| `Object.keys().forEach()`      | Dynamic and cleaner way to apply field updates              |
| `res.json()` over `res.send()` | Sends well-formatted structured responses                   |
| Re-using `req.user`            | Avoids redundant DB queries, keeps code efficient           |

---

#  📘 HOMEWORK : 
---


# 🔐 PATCH `/profile/password` — Update Password (Logged-in User)

---

## ✅ Purpose:
Allows a **logged-in user** to update their password without needing to re-enter the old one (because identity is already verified via token).

---

## 🔐 Route Protection:
- The route is protected by `userAuth` middleware.
- Ensures only authenticated users can change their password.

---



## code example:
```js
profileRouter.patch("/profile/password",userAuth, async (req,res)=>{

    try{
        const newPassword = req.body?.password
      
        loggedInUser = req.user
     
        newPasswordHash = await bcrypt.hash(newPassword,10)
 
        loggedInUser.password = newPasswordHash
        
        loggedInUser.save()

        res.send("Password update Successfully")

    }
    catch(err){
        res.status(400).send("ERROR : "+err.message)
    }
})
```
## 🔄 Request Flow:
1. **New Password Input**  
   Password is received from `req.body.password`.

2. **Get Current User**  
   The logged-in user is available via `req.user` (set by `userAuth` middleware).

3. **Hash the New Password**  
   Uses `bcrypt.hash()` to securely encrypt the new password before saving:
   ```js
   const newPasswordHash = await bcrypt.hash(newPassword, 10);
    ```

4. **Update the Password Field**
   Sets the user's password to the new hashed value:

   ```js
   loggedInUser.password = newPasswordHash;
   ```

5. **Save the Updated User**
   Commits the change to the database:

   ```js
   await loggedInUser.save();
   ```

6. **Respond with Success**
   Returns a success message:

   ```js
   res.send("Password updated successfully");
   ```

---

## ⚠️ Error Handling:

If anything goes wrong (e.g., no password provided, DB error), it returns:

```js
res.status(400).send("ERROR : " + err.message);
```

---

## 🧠 Key Learnings:

| Step                     | Why It's Important                                                      |
| ------------------------ | ----------------------------------------------------------------------- |
| Protected by `userAuth`  | Ensures only logged-in users can access this route                      |
| No old password required | Safe because the user is already verified via token                     |
| Bcrypt hashing           | Passwords must always be stored securely in hashed form                 |
| `await user.save()`      | Saves updated password into DB with validation support                  |
| Clean code structure     | Follows best practice of extracting, processing, saving, and responding |

---

## 🚀 Enhancement Ideas:

* Add `validator.isStrongPassword(newPassword)` before saving to enforce strong password rules.
* Optionally, send a confirmation response with masked user info.

---

Let me know if you also want to implement the version where the user provides the **current password for confirmation** before updating!

```
```
