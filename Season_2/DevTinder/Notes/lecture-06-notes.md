# 📘 Lecture 6 Notes - Database, Schema & Models | Mongoose


# 🧠 MongoDB Connection with Mongoose — Key Notes

## ✅ Why Connect to the Database Before Starting the Server?

- When building backend applications, many routes depend on the database for reading or writing data.
- If the database isn't connected before starting the server, incoming requests might fail, leading to unexpected errors.
- Hence, always establish a successful DB connection **first**, and then start the server.

---

## 📦 How We Connect to MongoDB

- We use the `mongoose` library to handle the connection.
- A connection URI (usually from MongoDB Atlas) is used to securely connect to the cloud database.
- The connection logic is wrapped in an async function (`connectDB`) to handle success and failure gracefully.
- We also check `mongoose.connection.readyState` to avoid unnecessary reconnections.  
  - `readyState === 1` means already connected.

  ## 📦 Setup

We use `mongoose` to connect our Node.js application to MongoDB. Below is the structure of our MongoDB connection code:

```js
// config/database.js
const mongoose = require('mongoose');

const mongoURI = "mongodb+srv://<username>:<password>@cluster.mongodb.net/devTinder";

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        console.log('Already connected to the database');
        return;
    }

    try {
        await mongoose.connect(mongoURI); 
        console.log("Database connection established");
    } catch (err) {
        console.error("Database connection failed:", err);
        throw err;
    }
};

module.exports = { connectDB };
```

---

## 🛠️ Server Initialization Flow (Best Practice)

1. First, call the `connectDB()` function to attempt a database connection.
2. If the connection is successful (`.then()`), only then call `app.listen()` to start the server.
3. If it fails (`.catch()`), log the error and avoid starting the server.

This sequence ensures that the server runs **only when** the database is available, keeping the app stable.

---

## 🧩 Folder Structure Suggestion

- Keep the database logic in a separate file like `config/database.js`.
- This keeps your code organized and modular.


---

## 🔄 Tips

- Store sensitive information (like your MongoDB URI) in a `.env` file and access it using `process.env` to protect your credentials — especially in production environments.
- Always connect to the DB before calling `app.listen`.
- Use async/await with proper error handling for stability.
- Keep connection logic modular and clean.
- Protect your credentials using environment variables.

---

# 🧠 Understanding Mongoose Schema and Model (Simple Explanation)

## 🔹 What is a Schema?

- A **Schema** is like a blueprint or structure of a document in MongoDB.
- It defines **what fields** your data will have, and **what rules** they should follow (like type, required, default value, etc).
- Think of it like a **form** you design: it tells Mongoose what a valid document looks like.

### 🧾 Example Schema:

```js
const userSchema = new mongoose.Schema({
  name: String,
  age: Number,
});
```

Here:

* Every `user` must have a `name` (as a string) and `age` (as a number).

---

## 🔹 What is a Model?

* A **Model** is like the **interface** to interact with the actual MongoDB collection.
* It is created using the schema and allows you to perform operations like:

  * `create()`, `find()`, `findById()`, `update()`, `delete()`, etc.
* A model maps to a **collection** in the MongoDB database.

### 🛠️ Creating a Model:

```js
const User = mongoose.model("User", userSchema);
```

* `"User"` will become the **collection name** in MongoDB (automatically pluralized to `users`).
* `User` is now your model — you can use it to work with user documents.

---

## 🌱 Example Usage

```js
const newUser = new User({ name: "Ankit", age: 25 });
newUser.save(); // Saves to the database
```

OR directly:

```js
User.create({ name: "Ankit", age: 25 });
```

---

## 📌 Summary

| Term       | Meaning                                             |
| ---------- | --------------------------------------------------- |
| Schema     | Defines the structure and rules of your documents   |
| Model      | The object that lets you interact with the database |
| Document   | A single record in MongoDB (like a row in SQL)      |
| Collection | A group of similar documents (like a table in SQL)  |

---

## ✅ Real-World Analogy

* **Schema** → Blueprint of a building
* **Model** → Construction tools based on that blueprint
* **Document** → A single built house
* **Collection** → A housing society (group of houses)


---


# 🧠 Understanding User Creation with `user.save()`, `async/await`, and `try-catch`

## 🔹 Code Summary: `app.post("/signup")`

In this route, we are creating a new user using data defined in `userObj` and saving it to the database using Mongoose.

```js
const user = new User(userObj); // create instance of User model
await user.save();              // save to database
```

```js
app.post("/signup",async (req,res)=>{
  const userObj ={
    firstName: "Einar",
    lastName: "washington",
    email: "einar@washington.com",
    password: "123"
  }
  // creating a new instance of the model User and passing the userObj as an argument
  const user = new User(userObj)
  try{
    await user.save()

    res.send("user created successfully")
  }
  catch(err){
    res.status(400).send("user creation failed"+err.message)
  }


})
```

---

## 🛠️ What does `user.save()` do?

* `user.save()` is a **Mongoose method** that saves the user document to the **MongoDB database**.
* It takes the values from `userObj`, applies all **validations** defined in the schema, and then stores it as a **document** in the `users` collection.
* If validation fails (e.g., weak password, invalid email), `save()` will **throw an error**.

---

## 🔄 Why `async` and `await`?

* `user.save()` is an **asynchronous operation** (because it interacts with an external database).
* Using `await` ensures the code **waits** until the save operation completes before moving to the next line.
* Marking the route handler as `async` allows us to use `await` inside it.

### ✅ Without `await`, the server might:

* Send a response **before** the user is saved.
* Miss catching errors correctly.
* Cause race conditions or unexpected behavior.

---

## 🧯 Why do we need `try-catch`?

* Since `await user.save()` may **fail** (due to validation errors or database issues), we must wrap it in a `try-catch` block.
* If an error is thrown:

  * The `catch` block handles it gracefully.
  * We can send an appropriate **error response** instead of crashing the server.

---

## 📤 Why response is sent inside `try-catch`?

* A response (`res.send()` or `res.status().send()`) should be sent **only after** the database operation finishes.
* If `save()` fails, we send an error message inside `catch`.
* If `save()` succeeds, we send a success message in the `try` block.
* This ensures the client always gets the correct result of their request.

---

## 📌 Summary Table

| Concept       | Why It’s Used                                           |
| ------------- | ------------------------------------------------------- |
| `user.save()` | Saves user data to MongoDB                              |
| `async`       | Enables use of `await` inside the function              |
| `await`       | Waits for `save()` to complete before continuing        |
| `try-catch`   | Handles any error during the save operation             |
| `res.send()`  | Sends response only after confirming success or failure |

---



