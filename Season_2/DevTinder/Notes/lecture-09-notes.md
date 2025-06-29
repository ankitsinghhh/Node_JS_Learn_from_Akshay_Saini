# 📘 Lecture 9 Notes - Encryting Passwords

## ✅ Validating Signup Data Using Utility Function

## 📌 What You’re Building

In **signup API** , first validating user input before saving to the database. To keep the code modular and clean, we've:

1. Created a `validateSignupData()` function inside a utility file.
2. Called that function inside your `/signup` API route before saving the user.

---

## 🧠 Why Validate Input Data?

- Prevents **bad or harmful data** from reaching your database.
- Helps give **immediate feedback** to the user (e.g., “Email is not valid”).
- Provides an **extra layer of protection** beyond schema-level validation.
- Makes your code more **secure and user-friendly**.

---

## 🗂️ Folder Structure

```

project/
├── models/
│   └── user.js
├── routes/
├── utils/
│   └── validation.js ✅
├── app.js
```

---

## 📄 `validation.js` in `utils/`

```js
const validator = require('validator');

const validateSignupData = (req) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName) {
    throw new Error("Name is not valid");
  } else if (!validator.isEmail(email)) {
    throw new Error("Email is not valid");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Please enter a Strong Password");
  }
};

module.exports = {
  validateSignupData,
};
```

### 🔍 Explanation of Each Check:

| Check                                   | Purpose                                                                                          |
|-----------------------------------------|--------------------------------------------------------------------------------------------------|
| `!firstName  !lastName`               | Ensures user has entered both first and last names                                               |
| `validator.isEmail(email)`              | Verifies that the provided email follows a valid email format                                    |
| `validator.isStrongPassword(password)`  | Requires a strong password (min 8 chars, at least one lowercase, uppercase, number, and symbol)  |


* If any of these conditions fail, it **throws an error** — caught later in the route handler.

---

## 🚀 The `/signup` Route

```js
//SignUp API 
app.post("/signup",async (req,res)=>{
  try{
     // while someone signs up , first validation of data should be there 
    validateSignupData(req)
  //Then Encrypting the Password
  //first task is to pass dynamic data to the API using postman
    const userObj = req.body
  // creating a new instance of the model User and passing the userObj as an argument
    const user = new User(userObj)
    await user.save()

    res.send("user created successfully")
  }
  catch(err){
    res.status(400).send("user creation failed"+err.message)
  }
})
```

### ✅ Flow Summary:

1. Call `validateSignupData()` to validate fields.
2. If valid, create a user object.
3. Try to save it to the database.
4. If saving fails (e.g., email already exists), catch the error and respond.

---

## 🌟 Benefits of This Approach

| Benefit             | Why It Matters                                                        |
| ------------------- | --------------------------------------------------------------------- |
| Clean Code          | Reduces clutter in your route handlers                                |
| Reusable            | You can reuse `validateSignupData` in other routes like `/updateUser` |
| Centralized Control | All validation logic is in one place, easy to update or expand        |
| Scalable            | You can later add role-based validation, phone number, etc. easily    |

---

Here are your new learnings written in **notes format in Markdown (`.md`)**:

---


# ✅ Password Encryption Using bcrypt

- **Install bcrypt**:
  ```bash
  npm i bcrypt
  ```

* **Why?**
  Storing raw passwords is insecure. Hashing protects user credentials.

* **How to use**:

  ```js
  const passwordHash = await bcrypt.hash(password, 10);
  ```

* **Note**:
  `bcrypt.hash()` is asynchronous → use `await`.

---

## ✅  Good Practice: Create User Object Explicitly

* ❌ **Avoid this (bad practice)**:

  ```js
  const userObj = req.body;
  const user = new User(userObj);
  ```

* ✅ **Prefer this (good practice)**:

  ```js
  const user = new User({
    firstName,
    lastName,
    email,
    password: passwordHash
  });
  ```

* **Why?**

  * Better control over the fields.
  * Prevents unintended fields from being passed.
  * Improves security and clarity.

---

## ✅ Summary of Signup Flow

1. **Validate** the request body.
2. **Hash** the password using `bcrypt.hash()`.
3. **Create** a new user instance with selected fields only.
4. **Save** the user to the database using `await user.save()`.
5. **Send** a response on successful creation.

---

# 🔐 Login API – Step-by-Step Explanation

---

### ✅ 1. Extracting Email and Password

```js
const { email, password } = req.body;
```

* This extracts `email` and `password` from the incoming request.
* These fields are typically sent from Postman or frontend via a POST request body.

---

### ✅ 2. Validating the Email Format

```js
validateLoginData(req);
```

* This calls a utility function to check if the provided email is in the correct format.
* Prevents invalid email formats from going further into the system.

> 🔍 `validateLoginData` function:

```js
const validateLoginData = (req) => {
  const { email } = req.body;
  if (!validator.isEmail(email)) {
    throw new Error("Email is not valid");
  }
};
```

---

### ✅ 3. Checking If User Exists

```js
const user = await User.findOne({ email });
if (!user) {
  throw new Error("Invalid Credentials");
}
```

* Searches the database for a user with the given email.
* If no user is found, throws a **generic error** (good for security).
* ✅ Avoids telling attacker whether the user exists or not.

---

### ✅ 4. Verifying Password Using `bcrypt`

```js
const isPasswordValid = await bcrypt.compare(password, user.password);
```

* Compares the raw password (from user input) with the **hashed password** stored in the DB.
* `bcrypt.compare()` is asynchronous and returns `true` if they match.

---

### ✅ 5. Handling Password Match Result

```js
if (isPasswordValid) {
  res.send("Login Successful");
} else {
  throw new Error("Invalid Credentials");
}
```

* If passwords match, login is successful.
* Else, return a generic error again (don't say "wrong password" — just say "invalid credentials").

---

### ✅ 6. Catching and Sending Errors

```js
catch(err) {
  res.status(400).send("ERROR: " + err.message);
}
```

* Captures all errors from validation, DB lookup, and password check.
* Responds with the appropriate error message.

---

## 🧠 Final Learning Highlights

| Concept                   | Explanation                                                   |
| ------------------------- | ------------------------------------------------------------- |
| Secure validation         | Validate data **before** processing                           |
| Clean error handling      | Use `try-catch` for async code                                |
| No sensitive info leakage | Return only **generic messages** like `"Invalid Credentials"` |
| Utility functions         | Move reusable logic (like email check) to a separate file     |

Let me know if you'd like to add login session/token logic next!

```
```

