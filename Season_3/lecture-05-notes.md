# Lecture - 5   : Keeping our Credentials safe using dotenv files
---



## 🚩 What is a `.env` file?

✅ A **`.env` file** stores **environment variables** (like database passwords, API keys, and secrets) **outside your code**.

✅ This keeps **credentials safe**:

* They **do not get hardcoded in your codebase**.
* They can be **easily changed without modifying code**.
* You **do not push `.env` to GitHub** to avoid public exposure.

---

## 🚩 Where to create `.env`?

✅ Create **a file named `.env`** in your **`DevTinder-Backend` root folder**:

```
DevTinder-Backend/
  ├── src/
  ├── package.json
  ├── .env      <-- create here
```

---

## 🚩 Example `.env` file

Replace sensitive data with **dummy values** so they cannot be misused:

```env
# SECRET KEYS
PORT=7777
DB_CONNECTION_SECRET="mongodb+srv://user:randomPassword@cluster0.mongodb.net/devTinder"
JWT_SECRET="SomeSuperSecretJWTKey@123"
AWS_SES_SECRET_KEY="AbCdEfGhIjKlMnOpQrStUvWxYz1234567890"
AWS_ACCESS_KEY="AKIAEXAMPLEKEY123456"
```

---

## 🚩 How to use `.env` in your project

### 1️⃣ Install `dotenv` package

Run:

```bash
npm install dotenv
```

---

### 2️⃣ Import and configure in `app.js`

```js
const express = require('express');
require('dotenv').config(); // <-- load .env variables into process.env

const app = express();
```

---

### 3️⃣ Using environment variables

✅ **In `app.js`:**

```js
app.listen(process.env.PORT, () => {
  console.log(`✅ Server is running on port ${process.env.PORT} 🚀`);
});
```

✅ **In `database.js`:**

```js
const mongoURI = process.env.DB_CONNECTION_SECRET;
```

✅ **In `auth.js`:**

```js
const decodedObj = await jwt.verify(token, process.env.JWT_SECRET);
```

---

## 🚩 Securing `.env`

✅ Add `.env` to your `.gitignore`:

```
node_modules
.env
```

so **it is never pushed to GitHub**.

---

## 🚩 Using `.env` on your AWS server

1️⃣ **SSH into your AWS instance:**

```bash
ssh -i "devTinder-secret-ankit.pem" ubuntu@ec2-13-51-204-145.eu-north-1.compute.amazonaws.com
```

2️⃣ Navigate:

```bash
cd DevTinder-fullstack-Project/DevTinder-Backend
```

3️⃣ Create `.env` using nano:

```bash
sudo nano .env
```

Paste your **local `.env` variables** here, then:

* `Ctrl + X` (exit),
* `Y` (yes),
* `Enter` (save).

4️⃣ Restart your backend using PM2:

```bash
pm2 restart 0
```

---

## 🚩 Making `BASE_URL` dynamic in frontend

✅ Use:

```js
export const BASE_URL = location.hostname === "localhost" ? "http://localhost:7777" : "/api";
```

so it **automatically switches** between development and production.

---

## 🚩 Why is this method safe?

✅ Keeps **credentials private**.
✅ Allows **different secrets for dev, staging, and production**.
✅ Prevents **accidental exposure of keys on GitHub**.
✅ Makes **credentials easily changeable** without touching your code.

---

## 🚩 Summary

✅ You now know:
✅ What `.env` is and why it is important.
✅ Where to create and how to use it in Node projects.
✅ How to keep it safe by ignoring in Git.
✅ How to deploy it on your AWS server securely.

---

If you wish, I can also prepare:
✅ A **pre-made `.env.example`** for your repo to share structure without secrets.
✅ **A one-command environment variable loader for multiple environments (dev, prod)**.

Let me know if you would like these for your **DevTinder workflow**!

---



## ✅ One-command environment variable loader for multiple environments (dev, prod)

---

## 🚩 Why do we need multiple environment configurations?

In real projects, we often have:

* **`development`**: Local laptop, local MongoDB, test AWS keys.
* **`production`**: Deployed on AWS EC2, live MongoDB, live AWS keys.

Using **separate `.env` files for each environment**:

* Keeps secrets organized.
* Prevents accidental use of production secrets in development.
* Allows seamless switching with **one command**.

---

## 🚩 How are they structured?

### 1️⃣ Create multiple `.env` files:

✅ **`.env.development`**

```env
PORT=7777
DB_CONNECTION_SECRET="mongodb+srv://devUser:devPass@cluster0.mongodb.net/devTinder"
JWT_SECRET="DevJWTSecretKey"
AWS_SES_SECRET_KEY="DevAWSSecretKey"
AWS_ACCESS_KEY="DevAWSAccessKey"
```

✅ **`.env.production`**

```env
PORT=7777
DB_CONNECTION_SECRET="mongodb+srv://prodUser:prodPass@cluster0.mongodb.net/devTinder"
JWT_SECRET="ProdJWTSecretKey"
AWS_SES_SECRET_KEY="ProdAWSSecretKey"
AWS_ACCESS_KEY="ProdAWSAccessKey"
```

✅ (Do not push these to GitHub, add `*.env.*` to `.gitignore`)

---

## 🚩 How to load them automatically with **one command**?

### **Method 1: Using `dotenv-cli`**

1️⃣ Install:

```bash
npm install dotenv-cli --save-dev
```

---

2️⃣ In `package.json`, under `scripts`, add:

```json
"scripts": {
  "dev": "dotenv -e .env.development -- node src/app.js",
  "start": "dotenv -e .env.production -- node src/app.js"
}
```

✅ Now:

* Run **development** with:

  ```bash
  npm run dev
  ```
* Run **production** locally with:

  ```bash
  npm start
  ```

---

### **Method 2: Using `cross-env` with `NODE_ENV`**

1️⃣ Install:

```bash
npm install cross-env --save-dev
```

---

2️⃣ Structure your `package.json`:

```json
"scripts": {
  "dev": "cross-env NODE_ENV=development node src/app.js",
  "start": "cross-env NODE_ENV=production node src/app.js"
}
```

---

3️⃣ Update your `app.js`:

```js
require('dotenv').config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
});
```

✅ Now:

* `npm run dev` will load `.env.development`.
* `npm start` will load `.env.production`.

---

## 🚩 Using in AWS EC2 with PM2

When using **PM2**, you can specify environment variables cleanly:

### 1️⃣ Start in development:

```bash
pm2 start src/app.js --name "devtinder-dev" --env development
```

### 2️⃣ Start in production:

```bash
pm2 start src/app.js --name "devtinder-prod" --env production
```

---

In your `app.js`, add:

```js
require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`
});
```

✅ This will automatically:

* Load `.env.development` if `NODE_ENV=development`.
* Load `.env.production` if `NODE_ENV=production`.

---

## 🚩 Advantages of this approach:

✅ **Clean separation of secrets** between dev, prod, staging, testing.
✅ **One-command environment switching** without manually editing files.
✅ Prevents mistakes like pushing dev credentials to production.
✅ Keeps **team workflows clean** and CI/CD pipelines organized.

---

## 🚩 Optional: `.env.example` for team sharing

Create a **`.env.example`**:

```env
PORT=
DB_CONNECTION_SECRET=
JWT_SECRET=
AWS_SES_SECRET_KEY=
AWS_ACCESS_KEY=
```

✅ Push this to GitHub so your team knows what variables are needed, **without revealing secrets**.

---

## 🚩 Summary

✅ Create separate `.env.development`, `.env.production`.
✅ Use `dotenv-cli` or `cross-env` to load them with **one command**.
✅ Combine with PM2 for smooth AWS deployments.
✅ Keeps your workflow **clean, scalable, and secure**.

---

