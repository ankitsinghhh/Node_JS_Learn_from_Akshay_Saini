# 📘 Lecture 7 Notes - Diving into the APIs



# 🧠 JavaScript Object vs JSON (JavaScript Object Notation)

## 🔹 What is a JavaScript Object?

- A **JavaScript Object** is a data structure used in JavaScript to store data in key-value pairs.
- It can hold functions, variables, and complex data types.
- It is used directly within JavaScript code.

### ✅ Example:

```js
{
  firstName: "Mahendra Singh",
  lastName: "Dhoni",
  email: "ms@dhoni.com",
  password: "Strong#123"
}
```

### 📌 Key Features:

* Keys don’t need to be in quotes (unless they contain special characters).
* Values can be strings, numbers, booleans, arrays, objects, or functions.
* Used internally in JavaScript programs.

---

## 🔹 What is JSON (JavaScript Object Notation)?

* **JSON** is a data format used to represent structured data.
* It is often used for **data exchange** between a server and a client (e.g., in APIs).
* It is a **string-based format** that looks like a JavaScript object but follows stricter rules.

### ✅ Example:

```json
{
  "firstName": "Akshay",
  "lastName": "Kumar",
  "email": "akshaykumar@gmail.com",
  "password": "12345678",
  "age": 30,
  "gender": "Male"
}
```

### 📌 Key Rules:

* **Keys must always be in double quotes** `" "`.
* **Only valid data types**: string, number, object, array, boolean, null.
* **No functions or comments** allowed.
* Used widely in **APIs**, **config files**, and **data storage**.

---

## 🔍 Key Differences

| Feature            | JavaScript Object                         | JSON                                      |
| ------------------ | ----------------------------------------- | ----------------------------------------- |
| Used in            | JavaScript programs                       | Data exchange (APIs, storage)             |
| Key format         | Unquoted or in quotes                     | Must be in double quotes                  |
| Data types allowed | Any JavaScript type (including functions) | Limited types (no functions, no comments) |
| Comments           | Allowed                                   | Not allowed                               |
| Usage example      | `let obj = { key: "value" }`              | Sent via APIs or stored in `.json` files  |

---

## 🧪 Conversion Between Object and JSON

* Convert JavaScript Object → JSON:

  ```js
  JSON.stringify(object)
  ```

* Convert JSON → JavaScript Object:

  ```js
  JSON.parse(jsonString)
  ```

---



# 📤 Sending JSON Data via Postman (POST Request)

## ✅ When to Use

- You send JSON data when testing API routes like `/signup` or `/login` that accept user input (name, email, password, etc.).


## 🛠️ Steps in Postman


| Step | Action                           |
| ---- | -------------------------------- |
| 1    | Choose POST method               |
| 2    | Enter your route URL             |
| 3    | Select Body → raw → JSON         |
| 4    | Paste your JSON data             |
| 5    | Click Send and view the response |

---


# 📤 Sending JSON Data from Postman to Express API

## ✅ Dynamic Data Handling with `req.body`

To send user data like name, email, password, etc., to your backend API, we use **POST requests** from tools like **Postman**. The backend needs to **read this data from the request body** using `req.body`.

---

## 🧱 What is `express.json()` Middleware?

```js
app.use(express.json())
```

* This middleware tells Express to **automatically parse incoming JSON data** from the request body.
* Without it, `req.body` will be `undefined` when you send JSON data.
* It must be added **before** any route that uses `req.body`.

---

## 🧪 Sample Use Case

### 🔻 Postman Request (Body → raw → JSON):

```json
{
  "firstName": "Akshay",
  "lastName": "Kumar",
  "email": "akshaykumar@gmail.com",
  "password": "12345678",
  "age": 30,
  "gender": "male"
}
```

### 🔻 Server Code:

```js
app.use(express.json()); // middleware to parse JSON

app.post("/signup", async (req, res) => {
  const userObj = req.body; // dynamic data from client
  console.log("Request Body:", userObj);
  
  // Logic to save user in DB using userObj
});
```

---

## 🧩 Summary

| Concept             | Purpose                                    |
| ------------------- | ------------------------------------------ |
| `express.json()`    | Middleware to parse JSON data in requests  |
| `req.body`          | Holds the parsed data sent from the client |
| Postman JSON Format | Used to simulate client-side API calls     |
| `POST /signup`      | API route to handle user registration      |

---

## 🛡️ Common Mistake

❌ If you forget to use `app.use(express.json())`, your `req.body` will be `undefined`, even if valid JSON is sent from Postman.

---


# 🔎 Understanding `.find()` in Mongoose with API Examples

## 🧠 What is `.find()`?

- `.find()` is a **Mongoose method** used to search for documents in a MongoDB collection.
- It returns an **array** of matching documents, even if only one or none are found.

---

## 📌 Example 1: Find a Single User by Email

```js
app.get("/user", async (req, res) => {
  const userEmail = req.body.email;

  try {
    const user = await User.find({ email: userEmail });

    if (!user || user.length === 0) {
      res.status(404).send("User not found");
    } else {
      res.send(user);
    }
  } catch (error) {
    res.status(404).send("Something went wrong while fetching data");
  }
});
```

### ✅ Explanation:

* `User.find({ email: userEmail })` searches the collection for users with the matching email.
* It returns an **array**, so even if only one user is found, you get an array with one object.
* Always check if the array is **empty** (`user.length === 0`) before sending the response.

---

## 📌 Example 2: Get All Users

```js
app.get("/getAllUsers", async (req, res) => {
  try {
    const users = await User.find({});

    if (users.length === 0) {
      res.status(404).send("No user found");
    } else {
      res.send(users);
    }
  } catch (err) {
    res.status(400).send("Something went wrong while fetching data");
  }
});
```

### ✅ Explanation:

* `User.find({})` with an empty filter returns **all users** in the collection.
* Again, it's important to check if the array is empty before sending a successful response.

---

## 🛑 Why Is Checking the Result Important?

| Reason                      | Explanation                                                                                   |
| --------------------------- | --------------------------------------------------------------------------------------------- |
| Prevents sending empty data | If `.find()` returns an empty array, we can show a proper message instead of sending nothing. |
| Improves user experience    | The client gets clear feedback like “User not found” instead of a confusing empty response.   |
| Helps in debugging          | Knowing whether the query returned results or not helps during development and testing.       |

---

## ✅ Summary

| Feature          | Notes                                                        |
| ---------------- | ------------------------------------------------------------ |
| `.find({})`      | Returns all users as an array                                |
| `.find({email})` | Returns array of users matching the email                    |
| Result type      | Always returns an array                                      |
| Check needed     | Always check `.length === 0` to confirm if data was found    |
| Good practice    | Respond with 404 and a friendly message if no match is found |

---




## 📝 Difference Between `PATCH` and `PUT`

| Aspect       | `PUT`                                   | `PATCH`                                |
| ------------ | --------------------------------------- | -------------------------------------- |
| Purpose      | Replace the **entire** resource         | Update **specific fields** only        |
| Use Case     | Used when updating the **whole object** | Used when updating **partial data**    |
| Idempotent   | ✅ Yes                                   | ✅ Yes (if correctly implemented)       |
| Request Body | Requires all fields                     | Requires only the fields to be updated |
| Example Body | `{name, age, email}` (full object)      | `{email}` (just one field)             |

---

## 🧠 Explanation of a PATCH API for Updating User

* `PATCH` is suitable when only a few user details need to be updated.
* Data is typically passed in the request body, including a `userId` and updated fields.
* It's best practice to remove `userId` from the update data before applying changes.

```js
const { userId, ...updateData } = req.body;
```

---

## ⚙️ Options in `findByIdAndUpdate(id, data, options)`

| Option                | Description                                                                 |
| --------------------- | --------------------------------------------------------------------------- |
| `new: true`           | Returns the **updated** document after the update                           |
| `new: false`          | Returns the **original** document before the update (default)               |
| `runValidators: true` | Ensures schema validation is applied to updated fields                      |
| `upsert: true`        | Creates a new document if none exists with the given ID                     |
| `timestamps: true`    | Automatically updates `createdAt` and `updatedAt` fields (if schema allows) |

---

## ✅  PATCH API Example

```js
app.patch("/user", async (req, res) => {
  const { userId, ...updateData } = req.body;

  try {
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true //coz while updating validators are not applied by default , hence needs to be set to true 
    });

    if (!user) {
      return res.status(400).send("User not found");
    }

    res.send(`User -> ${user.firstName} updated successfully\nUpdated user: ${JSON.stringify(user)}`);
  } catch (err) {
    res.status(400).send("Failed to update user");
  }
});
```














