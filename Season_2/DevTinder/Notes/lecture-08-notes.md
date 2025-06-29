# 📘 Lecture 8 Notes - Data Sanitization and Schema Validations

## Code Example:
```js
const mongoose = require('mongoose');
const validator = require('validator')

const userSchema = new mongoose.Schema(
    {
        firstName: { 
            type: String,
            required: true,
            minLength:4,
            maxLength:50,
            trim:true
            },
        lastName: { 
            type: String, 
            required: true ,
            trim:true
        },
        email: { 
            type: String, 
            required: true, 
            unique: true,
            lowercase: true,
            trim:true,
            validate(value){
                if(!validator.isEmail(value)){
                    throw new Error("invalid Email address: " + value)
                }
            }
        },
        password: { 
            type: String,
            required: true ,
            trim:true,
            validate(value){
                if(!validator.isStrongPassword(value)){
                    throw new Error("Enter Strong password "+ value + `
                       suggestions for strong password => { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1}`)
                }
            }
            },
        age: {
            type: Number,
            min:18,
            max:99
            },
        gender: { 
            type: String,
            validate(value){ //by default validate method is only called when new object is created ( wont run while patching by default)
                if(!["male","female","others"].includes(value)){
                    throw new Error("Gender Data is not valid")
                }
            }
        },
        photoUrl:{
            type:String,
            default:"https://avatars.githubusercontent.com/u/40992581?v=4",
            validate(value){
                if(!validator.isURL(value)){
                    throw new Error("Invalid photo URL address: " + value)
                }
            }

        },
        about:{
            type:String,
            default:"Write your about here..."
        },
        skills:{
            type:[String],
        }
    },
    {timestamps:true}
);

// creating mongoose model 
const User = mongoose.model("User", userSchema);

module.exports = User;  // Export the model properly
```

---

## 🧾 Schema: `User`

### 🔹 `firstName`

* **Type**: `String`
* **Validations**:

  * `required: true` → Must be provided.
  * `minLength: 4` → Minimum 4 characters.
  * `maxLength: 50` → Maximum 50 characters.
  * `trim: true` → Removes leading/trailing spaces.

---

### 🔹 `lastName`

* **Type**: `String`
* **Validations**:

  * `required: true` → Must be present.
  * `trim: true` → Removes extra whitespace.

---

### 🔹 `email`

* **Type**: `String`
* **Validations**:

  * `required: true` → Email is mandatory.
  * `unique: true` → No duplicate emails allowed.
  * `lowercase: true` → Converts email to lowercase before saving.
  * `trim: true` → Removes leading/trailing spaces.
  * `validate(value)`:

    * Uses `validator.isEmail()` to check if it's a valid email format.
    * Throws a custom error if invalid.

---

### 🔹 `password`

* **Type**: `String`
* **Validations**:

  * `required: true` → Must be provided.
  * `trim: true` → Removes extra spaces.
  * `validate(value)`:

    * Uses `validator.isStrongPassword()` to ensure a secure password.
    * If not strong, throws an error with suggestions.
    * **Strong password** suggestion includes:

      * `minLength: 8`
      * `minLowercase: 1`
      * `minUppercase: 1`
      * `minNumbers: 1`
      * `minSymbols: 1`

---

### 🔹 `age`

* **Type**: `Number`
* **Validations**:

  * `min: 18` → Minimum age allowed is 18.
  * `max: 99` → Maximum age allowed is 99.

---

### 🔹 `gender`

* **Type**: `String`
* **Validations**:

  * `validate(value)`:

    * Checks if the value is one of: `"male"`, `"female"`, or `"others"`.
    * Throws an error for any other value.
  * ❗Note: Custom validator here only runs on **create**, not update (`PATCH`) unless `runValidators: true` is explicitly passed.

---

### 🔹 `photoUrl`

* **Type**: `String`
* **Default**: GitHub avatar URL.
* **Validations**:

  * `validate(value)`:

    * Uses `validator.isURL()` to check if it's a valid URL.
    * Throws an error for invalid URLs.

---

### 🔹 `about`

* **Type**: `String`
* **Default**: `"Write your about here..."`

---

### 🔹 `skills`

* **Type**: `[String]` (Array of strings)
* **No validations** applied

---

### 🛠 Additional Schema Options

* `{ timestamps: true }`:

  * Automatically adds `createdAt` and `updatedAt` fields to each document.

---




# 🔄 Updating User Data Safely using `.findByIdAndUpdate()` + API-Level Validations

## 📌 Why Validations at the API Level?

- **Never trust user input**: Malicious users or accidental requests can corrupt your data.
- Validations ensure that only the **intended fields** get updated, and only with **valid values**.
- Even though Mongoose has schema-level validation, **API-level validation adds an extra layer of protection.**

---

## 🔐 Allowed Fields Validation

```js
const ALLOWED_UPDATES = ["photoUrl", "gender", "age", "skills"];
const isUpdateAllowed = Object.keys(data).every((k) => ALLOWED_UPDATES.includes(k));
```

* This ensures the user can update **only these fields**.
* If the request contains any other field (like `email`, `password`, etc.), it will throw an error.
* This protects sensitive or restricted fields from being updated accidentally or maliciously.

---

## ⚠️ Length Check for Skills Array

```js
if (data?.skills?.length > 10) {
  throw new Error("skills array can have max 10 elements");
}
```

* Prevents the user from passing too many values in `skills`.
* This avoids spam or unnecessary data bloat in your database.

---

## ❓ What is `data?.skills?.length`?

This uses **optional chaining** (`?.`) to safely access nested properties.

| Syntax                 | Meaning                                                           |
| ---------------------- | ----------------------------------------------------------------- |
| `data?.skills?.length` | Safely gets `length` only if `data` and `skills` both exist       |
| Without `?.`           | May throw error like `Cannot read property 'length' of undefined` |

### ✅ Benefits of Optional Chaining:

* Prevents your code from **crashing** when a field is `undefined` or `null`.
* Helps handle **partial data updates** gracefully.

Example:

```js
const data = {}; // No skills property
console.log(data.skills.length); // ❌ Error
console.log(data?.skills?.length); // ✅ undefined
```

---

## ⚙️ Using `findByIdAndUpdate()` Properly

```js
const user = await User.findByIdAndUpdate(userId, data, {
  new: true,
  runValidators: true,
});
```

* `new: true`: returns the **updated** document instead of the old one.
* `runValidators: true`: enforces Mongoose schema validations (like max/min values).

---

## 🧩 Summary

| Feature                  | Purpose                                               |
| ------------------------ | ----------------------------------------------------- |
| `ALLOWED_UPDATES` array  | Restricts which fields can be updated                 |
| `.every()` check         | Ensures only allowed fields are present               |
| `skills.length` limit    | Prevents large/unwanted data                          |
| Optional chaining (`?.`) | Avoids runtime errors when accessing undefined fields |
| `runValidators: true`    | Enforces schema rules during updates                  |
| `new: true`              | Returns updated data in the response                  |

---


# ✅ Using `validator` in Mongoose Schema for Input Validation

## 📦 What is `validator`?

- `validator` is an npm library used to validate and sanitize strings.
- It provides many ready-to-use functions like `isEmail()`, `isURL()`, `isStrongPassword()`, etc.
- Helps enforce strict validation rules **at the schema level**.

---

## 🔍 Schema Validations You Used

### 1. 📧 Validating Email

```js
validate(value) {
  if (!validator.isEmail(value)) {
    throw new Error("Invalid Email address: " + value);
  }
}
```

* Ensures the value follows a valid **email format** like `user@example.com`.

---

### 2. 🌐 Validating Photo URL

```js
validate(value) {
  if (!validator.isURL(value)) {
    throw new Error("Invalid photo URL address: " + value);
  }
}
```

* Confirms that the provided string is a valid **URL** (starts with `http`, has domain, etc).
* Useful when accepting profile pictures or social links.

---

### 3. 🔐 Validating Strong Password

```js
validate(value) {
  if (!validator.isStrongPassword(value)) {
    throw new Error("Enter Strong password " + value + `
      suggestions => minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1`);
  }
}
```

* Makes sure passwords are **not weak**.
* Default settings require:

  * At least **8 characters**
  * **1 lowercase**, **1 uppercase**, **1 number**, **1 special symbol**

---

## 📚 What Else Can `validator` Do?

Here are some other commonly used validation methods:

| Method                             | Description                            |
| ---------------------------------- | -------------------------------------- |
| `isEmail(value)`                   | Checks if the string is a valid email  |
| `isURL(value)`                     | Validates if it’s a proper web URL     |
| `isMobilePhone(value, 'en-IN')`    | Validates Indian mobile numbers        |
| `isNumeric(value)`                 | Checks if string contains only numbers |
| `isAlpha(value)`                   | Checks if string contains only letters |
| `isAlphanumeric(value)`            | Letters + numbers only                 |
| `isLength(value, {min, max})`      | Checks length constraints              |
| `isLowercase(value)`               | All lowercase?                         |
| `isUppercase(value)`               | All uppercase?                         |
| `isStrongPassword(value, options)` | Advanced password checks               |
| `isEmpty(value)`                   | Checks for empty string                |
| `isJSON(value)`                    | Validates if the string is valid JSON  |
| `isAscii(value)`                   | Only ASCII chars                       |

---

## 🧩 Example: Validating a Mobile Number (India)

```js
phoneNumber: {
  type: String,
  validate(value) {
    if (!validator.isMobilePhone(value, 'en-IN')) {
      throw new Error("Invalid Indian phone number: " + value);
    }
  }
}
```

---

## 🧠 Summary

* Use `validator` to keep your data **clean**, **secure**, and **meaningful**.
* It helps catch bad inputs **before saving to the database**.
* Can validate everything from emails to phone numbers, URLs, passwords, etc.

Let me know if you want to add custom error messages or explore sanitization next!

```
```

