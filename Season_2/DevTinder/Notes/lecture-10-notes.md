# 📘 Lecture 10 Notes - Authenticatoin , JWT & Cookies

---


## 🔐 JWT Authentication with Cookies – Complete Flow & Concepts



## 🧾 What is JWT (JSON Web Token)?

- **JWT** is a compact, URL-safe token used for **secure data exchange**.
- It is **signed by the server** and can be **verified later** to ensure authenticity.
- Commonly used for **authentication** (logging users in).

---

## 🧠 Why Use JWT?

- Once the user logs in, we don’t want to keep validating credentials on every request.
- So we generate a **JWT** after login and give it to the client.
- Client sends this token on future requests — this is called **stateless authentication**.

---

## 🍪 Why Use Cookies?

- The **JWT needs to be stored** securely on the client-side.
- We store it in the **browser cookie**, which:
  - Gets stored **automatically** by the browser.
  - Gets sent **automatically** with every request to the server.

---


## 🔄 Complete Login Flow

### 1. User Tries to Log In
- Client (frontend) sends a **POST** request to `/login` with `email` and `password`.

### 2. Server Verifies Credentials
- If email and password are valid, the server:
  - **Creates a JWT token**
  - **Wraps it inside a cookie**
  - **Sends it back to the frontend**

```js
res.cookie("token", jwtToken, { httpOnly: true, maxAge: 3600000 }); // 1 hour
res.send("Login Successful");
```

---

### 3. Browser Stores the Cookie

* Browser automatically stores the cookie received in the response.
* The cookie is now **tied to the session** for that browser.

---

### 4. Subsequent API Requests

* When the user makes another request (e.g., `/profile`, `/dashboard`):

  * The **cookie is automatically sent** to the server with the request.
  * Server **extracts and verifies** the JWT inside the cookie.

```js
const token = req.cookies.token;
const payload = jwt.verify(token, secretKey);
```

* If token is valid → user is authenticated → fetch profile and respond.
* If token is missing or expired → send unauthorized response.

---

## ⌛ Token & Cookie Expiry

* **JWTs are time-limited** — we can set an expiry time (e.g., 1 hour).
* **Cookies also support expiry** via `maxAge` or `expires` option.
* When either expires:

  * The token is invalid
  * The user must **log in again**

---

## 🔐 Why This is Secure

| Security Feature  | Explanation                                                      |
| ----------------- | ---------------------------------------------------------------- |
| `httpOnly` Cookie | Prevents JavaScript from reading cookie (XSS protection)         |
| JWT Signature     | Ensures token is not tampered with                               |
| Expiry Time       | Limits duration of session/token misuse                          |
| Cookie Auto-Send  | Automatically attached by browser with each request (convenient) |

---

## 🧠 Summary Flow Diagram

1. 🧑 Frontend sends login request →
2. ✅ Server validates credentials →
3. 🔐 Server creates JWT →
4. 🍪 JWT is sent as a cookie →
5. 🌐 Browser stores the cookie →
6. 📤 Cookie sent on every request →
7. ✅ Server validates JWT from cookie →
8. 🔁 Authenticated route accessed

---


# 👤 JWT-Based Authenticated Route: `/profile`

---

## ✅ Goal

Allow only logged-in users to access their profile using a **JWT token stored in a cookie**.

---

## 🔑 Step-by-Step Breakdown

---

### 1. 🪙 Creating & Storing JWT in Cookie (in `/login` route)

```js
const token = await jwt.sign({ _id: user._id }, "Dev@Tinder&798");
res.cookie("token", token);
res.send("Login Successful");
```

#### ✅ Explanation:

* `jwt.sign()` creates a token using the user's `_id`.
* `"Dev@Tinder&798"` is the **secret key** to sign the token (keep it safe).
* `res.cookie()` stores the token in a **browser cookie** named `"token"`.

---

### 2. 🔍 Accessing Protected Route `/profile`

```js
app.get("/profile", async (req, res) => {
  try {
    const cookies = req.cookies;
    const { token } = cookies;

    if (!token) {
      return res.send("Unauthorized | Token is not available");
    }

    // ✅ Step 1: Verify token
    const decodedMessage = await jwt.verify(token, "Dev@Tinder&798");
    const { _id } = decodedMessage;

    // ✅ Step 2: Find user using decoded ID
    const user = await User.findById(_id);

    if (!user) {
      return res.send("User does not exist");
    }

    res.send(user);
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});
```

---

### 🔍 Code Explanation

| Line                        | What It Does                                                        |
| --------------------------- | ------------------------------------------------------------------- |
| `req.cookies`               | Gets all cookies from the request (need middleware `cookie-parser`) |
| `{ token } = cookies`       | Extracts the token from the cookie                                  |
| `jwt.verify(token, secret)` | Validates the token and decodes the payload                         |
| `decodedMessage._id`        | Gives the user's ID from the token payload                          |
| `User.findById(_id)`        | Fetches the user from the database                                  |
| `res.send(user)`            | Sends back the user profile                                         |

---

## 🧩 Middleware Required

You must use the `cookie-parser` middleware to access `req.cookies`:

```js
const cookieParser = require("cookie-parser");
app.use(cookieParser());
```

Without this, `req.cookies` will be **undefined**.

---

## ⚠️ Edge Cases Handled

| Case              | Response                             |                           |
| ----------------- | ------------------------------------ | ------------------------- |
| Token not present | \`"Unauthorized                      | Token is not available"\` |
| Token is invalid  | Returns an error from `jwt.verify()` |                           |
| User ID not found | `"User does not exist"`              |                           |
| All good          | Returns user data                    |                           |

---

## ✅ Summary Flow

1. User logs in → server creates JWT → stores it in a cookie.
2. For `/profile` route:

   * Browser sends the cookie automatically.
   * Server verifies the token.
   * If valid, user info is sent.
   * If invalid/missing, error is returned.

---




# 🔐 Creating JWT Authentication Middleware – `userAuth`

---

## ✅ Purpose

We want to **centralize JWT validation** and **user lookup** logic so that:
- The `/profile` route (and others) can remain clean and focused.
- Token validation happens **before** the route logic executes.
- Authenticated user data is **attached to `req.user`** for easy access.

---

## 📄 Middleware: `userAuth`

```js
const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      throw new Error("Token is not present");
    }

    // ✅ Verify token and extract payload
    const decodedObj = await jwt.verify(token, "Dev@Tinder&798");

    // ✅ Find user by ID from token
    const user = await User.findById(decodedObj._id);

    if (!user) {
      throw new Error("User not found");
    }

    // ✅ Attach user to request object
    req.user = user;

    // ✅ Continue to next middleware/handler
    next();
  } catch (err) {
    res.status(401).send("ERROR: " + err.message);
  }
};
```

---

### 🔍 What Each Part Does

| Code                | Purpose                                                     |
| ------------------- | ----------------------------------------------------------- |
| `req.cookies.token` | Reads token from browser cookies (requires `cookie-parser`) |
| `jwt.verify()`      | Decodes and validates the JWT using the secret              |
| `User.findById()`   | Fetches user from DB using ID in the token                  |
| `req.user = user`   | Attaches user info to request for downstream use            |
| `next()`            | Passes control to the actual route handler                  |
| `res.status(401)`   | Handles unauthenticated/invalid token errors                |

---

## 🧪 Protected Routes

### ✅ 1. `/profile` Route

```js
app.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;  // Already validated and fetched in middleware
    res.send(user);
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});
```

### ✅ 2. `/sendConnectionRequest` Route

```js
app.post("/sendConnectionRequest", userAuth, async (req, res) => {
  const user = req.user;
  res.send(user.firstName + " is sending connection request");
});
```

#### 🛡️ Why It's Secure:

* By applying `userAuth`, only **logged-in users** with valid tokens can access this API.
* Unauthorized or tokenless requests will be rejected automatically.

---


### ✅ Why This is Better

| Benefit           | Explanation                                                      |
| ----------------- | ---------------------------------------------------------------- |
| Clean route logic | No duplication of token verification code                        |
| Reusable          | Use `userAuth` middleware in any route that needs authentication |
| Efficient         | Avoids hitting the DB twice by storing `req.user`                |
| Scalable          | Easily extendable for roles/permissions later                    |

---

## 🧠 Final Learnings

* Middleware is used to **pre-process requests** before they hit the route logic.
* **`req.user`** pattern is commonly used to attach authenticated user details.
* Keeping token logic separate makes the app **more secure, modular, and maintainable**.

---


# ⏳ Setting Expiry for JWT Token and Cookie

---

## 🔐 Why Set Expiry?

- For **security reasons**, we don’t want users to stay logged in forever.
- Both the **JWT token** and the **cookie that stores it** should have an expiration.
- This limits how long a stolen token can be misused.

---

## ✅ 1. Setting Expiry Time for JWT Token

```js
const token = await jwt.sign({ _id: user._id }, "Dev@Tinder&798", { expiresIn: "1d" });
```

### 🔍 Explanation:

* `jwt.sign()` creates a signed token.
* `{ expiresIn: "1d" }` means the token is **valid for 1 day (24 hours)**.
* Other formats supported:

  * `"2h"` → 2 hours
  * `"15m"` → 15 minutes
  * `"7d"` → 7 days
  * `60 * 60` → 1 hour (in seconds)

> ⚠️ Once expired, the token becomes **invalid** and can't be verified by `jwt.verify()`.

---

## ✅ 2. Setting Expiry Time for Cookie

```js
res.cookie("token", token, {
  expires: new Date(Date.now() + 8 * 3600000)  // 8 hours from now
});
```

### 🔍 Explanation:

* `res.cookie()` is used to send the token in a **cookie**.
* `expires` sets a specific **expiration date/time**.
* `Date.now()` returns current timestamp in ms.
* `8 * 3600000` = 8 hours in milliseconds.

> After this time, the browser automatically **removes the cookie**.

---

## 🔐 Recommended: Combine Both

Always set **both** JWT and cookie expiry:

```js
const token = jwt.sign({ _id: user._id }, "Dev@Tinder&798", { expiresIn: "1d" });

res.cookie("token", token, {
  httpOnly: true,
  expires: new Date(Date.now() + 8 * 3600000),
});
```

* JWT expiry handles **server-side** validation.
* Cookie expiry handles **client-side** storage.
* Even if the cookie is manually stored longer, the JWT inside will still **expire and fail** to verify.

---

## 🧠 Summary

| Type             | Purpose                                  | Set Using                       |
| ---------------- | ---------------------------------------- | ------------------------------- |
| JWT Token Expiry | Prevents token reuse after X time        | `expiresIn` inside `jwt.sign()` |
| Cookie Expiry    | Deletes cookie from browser after X time | `expires` in `res.cookie()`     |

---




# 🧠 Learning Mongoose Schema Methods – `userSchema.methods`

---

## 💡 What Are Schema Methods?

- **Schema methods** are custom functions that you can define on a Mongoose schema.
- These methods are available on **every document (instance)** of that model.
- They're used to keep your logic organized, reusable, and close to the data.

---

## ✅ Why Use Them?

- You move logic **out of route handlers** and keep it **inside the model**.
- This makes code more **modular, readable, and reusable**.
- Keeps business logic **close to the data** it operates on.

---

## 🚫 Why Not Use Arrow Functions?

```js
userSchema.methods.getJWT = async function () { ... }
```

* ✅ We use a **regular function** because `this` refers to the current **document instance** (e.g., the logged-in user).
* ❌ Arrow functions don't bind `this`, so `this._id` would be `undefined`.

---

## 🔐 1. Creating a JWT Token – `.getJWT()`

```js
userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign(
    { _id: user._id },
    "Dev@Tinder&798",
    { expiresIn: "1d" }
  );
  return token;
};
```

### ✅ Usage (in `/login` route):

```js
const token = await user.getJWT();
```

#### 🧠 Learning:

> We have **offloaded token creation** logic to the schema method to keep the login route clean.

---

## 🔒 2. Validating Password – `.validatePassword()`

```js
userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const passwordHash = user.password;
  
  const isPasswordValid = await bcrypt.compare(passwordInputByUser, passwordHash);
  return isPasswordValid;
};
```

### ✅ Usage (in `/login` route):

```js
const isPasswordValid = await user.validatePassword(password);
```

#### 🧠 Learning:

> We’ve **moved the password comparison** logic into the schema method. This makes the login route much simpler and avoids repeating logic elsewhere.

---

## 🧪 Summary Table

| Method               | Purpose                                | Example Use                            |
| -------------------- | -------------------------------------- | -------------------------------------- |
| `getJWT()`           | Generates JWT token for a user         | `user.getJWT()`                        |
| `validatePassword()` | Compares user input password with hash | `user.validatePassword(inputPassword)` |

---

## ✅ Benefits of Schema Methods

* 🎯 Keeps model-related logic in one place
* 🧼 Improves code cleanliness and readability
* 🔁 Reusable across multiple routes
* 👨‍🔧 Easier to maintain and debug

---



