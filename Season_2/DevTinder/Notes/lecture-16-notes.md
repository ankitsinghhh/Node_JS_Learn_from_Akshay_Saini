
# 📘 Lecture 16 Notes – DevTinder Frontend

###  `/login` page + API integration , Cors issue , Redux Toolkit

---

## ✅ 1️⃣ Creating the **Login Page (Frontend)**

### 🩹 Form Structure (daisyUI)

Using **daisyUI components**:

```jsx
<fieldset className="fieldset">
  <div className="form-group">
    <label htmlFor="email" className="fieldset-legend">Email ID</label>
    <input
      type="text"
      id="email"
      value={emailId}
      onChange={(e) => setEmailId(e.target.value)}
      className="input"
      placeholder="Enter your Email ID"
    />
  </div>

  <div className="form-group mt-4">
    <label htmlFor="password" className="fieldset-legend">Password</label>
    <input
      type="password"
      id="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="input"
      placeholder="Enter a Strong password"
    />
  </div>
</fieldset>
```

---

## ✅ 2️⃣ Managing State with `useState`

```js
const [emailId, setEmailId] = useState("");
const [password, setPassword] = useState("");
```

* Binds input fields to React state using:

  * `value={emailId}` and `onChange={...}`
  * `value={password}` and `onChange={...}`
* Keeps **user input synced with state**.

---

## ✅ 3️⃣ API Integration using Axios

Instead of `fetch`, we use **Axios** for simpler syntax and automatic JSON handling.

### Install:

```bash
npm i axios
```

---

### Handle Login:

```js
const handleLogin = async () => {
  try {
    const res = await axios.post("http://localhost:7777/login", {
      emailId,
      password,
    });
    console.log(res);
  } catch (err) {
    console.error(err);
  }
};
```

Attach to **button**:

```jsx
<button
  className="btn btn-primary self-center my-4 px-34"
  onClick={handleLogin}
>
  Login
</button>
```

---

## ❌ Encountering **CORS Error**

When clicking **Login**, you get:

```
Access to XMLHttpRequest has been blocked by CORS policy
```

---

### Why does this happen?

* **CORS (Cross-Origin Resource Sharing)** is enforced by browsers to protect users.
* It blocks requests if:

  * **Frontend origin ≠ Backend origin (including PORT differences).**

Here:

* Frontend: `localhost:5173`
* Backend: `localhost:7777`
* Same domain (`localhost`) BUT different **ports**, so **different origins**.

---

## ✅ 4️⃣ Solving CORS using the `cors` package

### Install in backend:

```bash
npm i cors
```

### Use as middleware in `app.js`:

```js
const cors = require('cors');
app.use(cors());
```

This allows your **React frontend to call your Express backend without CORS errors** during development.

---

## 🚀 Summary Table

| Step         | Action                                                   |
| ------------ | -------------------------------------------------------- |
| ✅ Form       | Created using daisyUI with `useState` for state handling |
| ✅ Axios      | Used for API calls (`npm i axios`)                       |
| ✅ CORS issue | Due to frontend & backend running on different ports     |
| ✅ Solution   | Use `cors` middleware in backend                         |




✅ **We can now build, connect, and debug your login page effectively.**
✅ **Axios** simplifies API requests.
✅ **CORS middleware** is necessary for cross-port local development.


---





## 🍪 Why cookies were **not being stored in the browser?**

✅ By **default**, **Axios does not store cookies** in the browser if:

* The **connection is HTTP (not HTTPS)**.
* Requests are **cross-origin (frontend and backend on different ports/domains).**

---

## 🚨 Local Development Issue

* **Frontend:** `http://localhost:5173`
* **Backend:** `http://localhost:7777`

Since **origins are different**, the browser **blocks cookies by default for security**.

✅ This **will not be an issue in production** when:

* Both frontend and backend are on the **same domain** (e.g., `https://devtinder.com`).

---

## ✅ Solution: Whitelist your frontend domain

In your **backend (`app.js`)**, configure **CORS properly**:

```js
app.use(
  cors({
    origin: "http://localhost:5173", // Frontend URL
    credentials: true,               // Allow cookies to be sent with requests
  })
);
```

✅ This **tells the browser to allow cookies** for requests coming from your React frontend during **local development**.

---

## ✅ Update Axios request to include `withCredentials`

In your `handleLogin` function, modify the `axios.post` call:

```js
const res = await axios.post(
  "http://localhost:7777/login",
  { email, password },
  { withCredentials: true } // <- This line is crucial
);
```

✅ This **instructs Axios to send and store cookies** during cross-origin requests.

---

## 🚀 Now:

✅ **Cookies (containing JWT tokens, session data, etc.) will be stored in your browser during local development.**

✅ This enables **authentication state** to persist across your DevTinder app for logged-in users during development.


---

## 🛠️ What is **Redux Store**?

* **Redux** is a **state management library** for React.
* It helps manage **global states** (user data, authentication, theme) **in one place**.
* The **Redux Store** is like a **central database for your frontend** that:

  * Stores your app's global state.
  * Allows **any component** to access/update this state easily.

---

## ✅ Benefits of using Redux Store

1️⃣ **Centralized State Management**

* No need to pass props deeply across many components.
* All global data (user info, JWT token, theme) lives in **one place**.

2️⃣ **Consistency**

* Same data available across different pages and components reliably.

3️⃣ **Debugging is easier**

* You can track how state changes over time.
* DevTools allow time-travel debugging.

4️⃣ **Predictability**

* State updates happen through **actions + reducers** in a clear, predictable flow.

5️⃣ **Scalable for large apps**

* As your app grows (DevTinder with notifications, feeds, chats), Redux helps keep your state organized.

---

## 📁 Where to create it?

You have created:

```
utils/appStore.js
```

✅ This file will:

* Initialize your **Redux Store** using `configureStore` from Redux Toolkit.
* Import and add your **reducers (slices)** for user, theme, etc.

---

## ✅ What is Redux Toolkit?

* `@reduxjs/toolkit` simplifies Redux setup:

  * No need for manual store configuration.
  * Provides `createSlice` for easy reducer + action creation.
  * Reduces boilerplate code.

---

## 🛠️ What you will do next:

✅ In `appStore.js`:

* Import `configureStore` from `@reduxjs/toolkit`.
* Add your reducers.
* Export your configured store.

✅ In `main.jsx`:

* Wrap your `<App />` inside `<Provider store={appStore}>` to give **Redux access to your entire app.**

✅ Then you can:

* Use `useSelector()` to read data from the store.
* Use `useDispatch()` to update global states easily.

---



## 📘 Redux Toolkit & React Redux Integration in DevTinder

---

### 1️⃣ Installing:

```bash
npm install @reduxjs/toolkit react-redux
```

✅ This installs:

* **Redux Toolkit** (`@reduxjs/toolkit`) to simplify Redux usage.
* **React Redux** (`react-redux`) to connect Redux with your React app.

---

### 2️⃣ Setting up the **Redux Store**

✅ You created:

```js
// utils/appStore.js
import { configureStore } from '@reduxjs/toolkit'
import userReducer from "./userSlice"

const appStore = configureStore({
     reducer: {
          user: userReducer,
     }
})

export default appStore
```

#### **Explanation:**

✅ `configureStore` automatically sets up:

* The Redux store.
* Redux DevTools for debugging.
* Middleware.

✅ The `reducer` object defines **global state slices**; here:

* `user` slice managed by `userReducer` for handling user authentication data.

---

### 3️⃣ Wrapping your App with `<Provider>`

✅ In `App.jsx`:

```js
import { Provider } from "react-redux"
import appStore from "./utils/appStore"

<Provider store={appStore}>
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Body />}>
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  </BrowserRouter>
</Provider>
```

✅ **Why?**

* The `<Provider>` component **injects the Redux store into your React app**.
* Now **any component can read/write global state using Redux hooks** (`useSelector`, `useDispatch`).

---

### 4️⃣ Creating a **Redux Slice** for User

✅ In `userSlice.js`:

```js
import { createSlice } from "@reduxjs/toolkit"; 

const userSlice = createSlice({
    name: 'user',
    initialState: null,
    reducers: {
        addUser: (state, action) => {
            return action.payload
        },
        removeUser: () => {
            return null
        }
    }
})

export const { addUser, removeUser } = userSlice.actions
export default userSlice.reducer
```

---

### **Explanation:**

✅ **What is `createSlice`?**

* A helper function that:

  * Creates actions automatically.
  * Creates reducers automatically.
  * Simplifies Redux boilerplate.

✅ **Slice Details:**

* **name:** `"user"` - used internally.
* **initialState:** `null` (no user is logged in initially).
* **reducers:**

  * `addUser`: Stores user data into the Redux store when the user logs in.
  * `removeUser`: Sets user state back to `null` on logout.

✅ Export:

* `addUser` and `removeUser` actions for dispatching in your app.
* The reducer as default to integrate into `appStore`.

---

### ✅ Why is this useful for DevTinder?

1️⃣ You will **store user data globally after login** using `addUser`.
2️⃣ Any component (Navbar, Profile, Feed) can access user info directly using `useSelector`.
3️⃣ On logout, you will clear user data using `removeUser`.
4️⃣ Makes your app **organized, scalable, and clean** as it grows.

---

Here are **clean, beginner-friendly notes** for your **DevTinder Redux + Login flow with `useDispatch`, `useNavigate`, and conditional Navbar updates**:

---

## 📘 DevTinder: Using `useDispatch`, `useNavigate`, and Conditional Rendering in Navbar

---

### 1️⃣ Using `useDispatch` to Update Redux Store

✅ You imported:

```js
import { useDispatch } from "react-redux"
```

✅ In your `Login` component:

```js
const dispatch = useDispatch()
```

✅ **Why?**

* `useDispatch` gives access to **dispatch actions to Redux store**.
* You used it to **store user data globally after login**.

---

### 2️⃣ Handling Login API & Storing User Globally

```js
const handleLogin = async () => {
    try {
        const res = await axios.post(
            "http://localhost:7777/login",
            { email, password },
            { withCredentials: true }
        );

        console.log(res.data.data);
        dispatch(addUser(res.data.data)); // store user globally
        return navigate('/'); // redirect to home after login
    } catch (err) {
        console.error(err);
    }
};
```

✅ **Flow Explanation:**
1️⃣ User enters `email` & `password`.
2️⃣ Calls `/login` API with `axios` and `{ withCredentials: true }` to handle cookies.
3️⃣ On **success:**

* `dispatch(addUser(res.data.data))` stores user globally.
* `navigate('/')` redirects to the home page.
  4️⃣ On **failure:**
* Prints error in console.

---

### 3️⃣ Using `useNavigate` for Redirecting

✅ You imported:

```js
import { useNavigate } from "react-router-dom"
```

✅ Then:

```js
const navigate = useNavigate();
```

✅ **Why?**
After successful login, you need to **redirect the user to the home page (`/`) automatically.**
This improves user experience by showing the feed immediately post-login.

---

### 4️⃣ Conditional Rendering in Navbar

✅ You used `useSelector` to access user:

```js
const user = useSelector((state) => state.user);
```

✅ Then in `Navbar.jsx`, you conditionally displayed:

```jsx
{user && (
  <p className="text-sm">Welcome, {user.firstName}</p>
)}
```

✅ **Why?**

* When **user is logged in (exists in Redux store)**, show:

  * Welcome message.
  * Profile-related options.
* When **user is not logged in**, hide these elements.

✅ This makes your app **dynamic and user-aware**.

---

## ✅ Summary of What You’ve Learned

✅ **Redux (`useDispatch`)**: To store logged-in user globally.
✅ **React Router (`useNavigate`)**: To redirect users post-login.
✅ **Conditional Rendering**: To display user-specific content only when logged in.
✅ **Cookies + `{ withCredentials: true }`**: Ensures session data is handled correctly during login.

---

### 🚀 Why is this important for DevTinder?

✅ **Global User State** enables:

* Showing user-specific content in Navbar, Profile, Feed, etc.
* Handling conditional routes like protected routes in the future.

✅ **Seamless Navigation** after login enhances user experience.

✅ You now have a **clean, scalable architecture** for authentication and dynamic UI handling in your DevTinder frontend.




---

## 📘 DevTinder: Using `utils/constants.js` for `BASE_URL`

---

### 1️⃣ Why create `utils/constants.js`?

✅ It **stores common constants** used across your frontend project in **one place**.
✅ Helps **avoid hardcoding URLs everywhere**, making it easy to:

* Switch from local to production URLs.
* Maintain consistency.
* Change only in one file when needed.

---

### 2️⃣ Example: Creating `constants.js`

📄 `utils/constants.js`:

```js
export const BASE_URL = "http://localhost:7777";
```

✅ This `BASE_URL` will now be imported wherever you make API calls.

---

### 3️⃣ Using `BASE_URL` in your `handleLogin`

Instead of:

```js
const res = await axios.post(
    "http://localhost:7777/login",
    { email, password },
    { withCredentials: true }
);
```

You now use:

```js
import { BASE_URL } from "./utils/constants";

const res = await axios.post(
    BASE_URL + "/login",
    { email, password },
    { withCredentials: true }
);
```

✅ **Benefits:**

* Cleaner, readable code.
* Easier environment switching (`localhost` → production API).
* Centralized management of your API URL.

---

### ✅ Summary Recap with Updated Flow

✅ Created `utils/constants.js`:

* Stores `BASE_URL` for cleaner, maintainable API calls.

✅ Updated `handleLogin`:

* Uses `axios.post(BASE_URL + "/login", {...})`.

✅ Combined with previous learnings:

* **Redux + useDispatch** to store user globally.
* **useNavigate** for redirect after login.
* **Conditional Navbar** rendering.
* **Cookies handled with `withCredentials: true`.**


---

## 📘 DevTinder: Organizing React Components

---

### 1️⃣ Why create a `components` folder?

✅ Keeps your project **clean and organized**.
✅ Groups **reusable React components** in one place.
✅ Makes navigation easier in **large projects**.

---

### 2️⃣ Create `src/components` folder

Inside it, place:

* `Body.jsx`
* `Feed.jsx`
* `Footer.jsx`
* `Login.jsx`
* `Navbar.jsx`
* `Profile.jsx`

Your folder structure:

```
src/
│
├── components/
│   ├── Body.jsx
│   ├── Feed.jsx
│   ├── Footer.jsx
│   ├── Login.jsx
│   ├── Navbar.jsx
│   └── Profile.jsx
│
├── utils/
│   ├── appStore.js
│   ├── constants.js
│   └── userSlice.js
│
├── App.jsx
└── main.jsx
```

---

### 3️⃣ Benefits of using the `components` folder

✅ **Better readability:** All UI building blocks in one place.
✅ **Reusable components:** Easy to find and import.
✅ **Scalable architecture:** Keeps structure clean as the app grows.
✅ **Team-friendly:** Makes collaboration smoother in real-world projects.

---

### 4️⃣ Consistency with `utils/constants.js`

✅ Alongside your organized `components`:

* `utils/constants.js` holds your `BASE_URL` for **clean API calls**.
* Use `axios.post(BASE_URL + "/login")` pattern across components.

---

## ✅ Recap

✅ **Created `components` folder** for structured React architecture.
✅ Placed:

* `Body`, `Feed`, `Footer`, `Login`, `Navbar`, `Profile` inside `components`.

✅ Paired with:

* `utils/constants.js` for **clean API management**.
* **Redux store** setup for **global user state**.
