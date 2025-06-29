# 📘 Lecture 15 Notes – DevTinder Frontend


---

## ⚡ Installing Vite with React

### 1️⃣ Create the project:

```bash
npm create vite@latest devtinder-ui -- --template react
```

* `npm create vite@latest` → creates a new project using Vite.
* `devtinder-ui` → your project folder name.
* `--template react` → uses React template.

---

### 2️⃣ Install dependencies:

```bash
cd DevTinder-Frontend
npm install
```

---

### 3️⃣ Run the dev server:

```bash
npm run dev
```

* Runs the project locally.
* Default URL: `http://localhost:5173`.

---

## 📂 Vite + React Folder Structure

When you open the project, you will see:

```
devtinder-ui/
│
├── public/           # Static files (favicon, images, etc.)
│
├── src/              # All your React source code
│   ├── App.css       # App styling (we will delete for fresh design)
│   ├── App.jsx       # Main App component (all UI will be built here)
│   ├── index.css     # Global CSS
│   └── main.jsx      # 🚀 Entry point of the app
│
├── index.html        # HTML template for React to inject into
│
├── package.json      # Project dependencies & scripts
│
└── vite.config.js    # Vite configuration
```

---

## 🚀 Understanding `main.jsx` (entry point)

* This file **starts your React app**.
* It **wraps the `<App />` component inside `<React.StrictMode>`** and mounts it to the DOM.
* It imports `index.css` for global styles.

Example:

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## 🏗️ What we will do next:

✅ Delete `App.css` to remove default styles since we will build a **clean, fresh UI** for DevTinder.

✅ Build **clean component structure inside `App.jsx`** step-by-step.

---

## 💡 Why Vite over CRA?

* ⚡ **Faster builds & dev server refresh.**
* 🛠️ Simpler and modern configuration.
* 🚀 Better DX for React projects.

---


In **latest versions**, you **should** enable DaisyUI using:

```css
@plugin "daisyui";
```

in your `index.css` (or `tailwind.css`).

---

### ✅ Clean Explanation:

🛠 **For Tailwind CSS v4.1+ + DaisyUI v5+:**

1️⃣ **Install DaisyUI:**

```bash
npm install -D daisyui@latest
```

2️⃣ **In your `index.css`:**

```css
@import "tailwindcss";
@plugin "daisyui";
```

✅ This **automatically activates DaisyUI** without modifying `tailwind.config.js`.

---

### Why did this change?

* DaisyUI v5+ uses the **new Tailwind plugin pipeline** to simplify activation.
* It reduces clutter in `tailwind.config.js`, allowing **plugin activation directly in CSS**.

---

### To confirm DaisyUI is working:

Add in `App.jsx`:

```jsx
function App() {
  return (
    <div className="flex justify-center items-center h-screen">
      <button className="btn btn-primary">DaisyUI Button</button>
    </div>
  );
}
```

Run:

```bash
npm run dev
```

✅ You should see a **styled button**, confirming DaisyUI is active.

---

## 🚀 Summary:

✅ For **Tailwind v4.1+ + DaisyUI v5+**:
✅ Install with `npm i -D daisyui`.
✅ Add `@plugin "daisyui";` in your `index.css`.
✅ Use DaisyUI components directly.

---



## 🚀 DevTinder UI – Navbar Component + React Router Setup

### ✅ What we did:

1️⃣ **Created `Navbar.jsx`** as a **separate reusable component**.
2️⃣ **Imported and used it in `App.jsx`.**
3️⃣ **Installed React Router for routing between pages.**

---

### 📂 File Structure:

```
src/
  ├── components/
  │     └── Navbar.jsx
  ├── App.jsx
  ├── main.jsx
  └── index.css
```

---

## ✅ Navbar Component (`Navbar.jsx`)

**Purpose:**
Provides a **clean, reusable top navigation bar** for DevTinder.

### Key Points:

* Uses **DaisyUI’s `navbar` component** for consistent, elegant styling.
* Contains:

  * App Title (`DevTinder`).
  * Profile image with dropdown:

    * Profile
    * Settings
    * Logout
* Uses **responsive design with Tailwind + DaisyUI**.

---

### 🛠 Code:

```jsx
import React from 'react';

const Navbar = () => {
  return (
    <div className="navbar bg-base-300 shadow-sm">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl">DevTinder</a>
      </div>
      <div className="flex gap-2">
        <div className="dropdown dropdown-end mx-5">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full">
              <img
                alt="Tailwind CSS Navbar component"
                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
              />
            </div>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
          >
            <li>
              <a className="justify-between">
                Profile
                <span className="badge">New</span>
              </a>
            </li>
            <li><a>Settings</a></li>
            <li><a>Logout</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
```

---

### ✅ Using the Navbar in `App.jsx`

```jsx
import React from 'react';
import Navbar from './components/Navbar';

function App() {
  return (
    <>
      <Navbar />
      {/* Other routes and content will go here */}
    </>
  );
}

export default App;
```

---

## 🛠 Installing React Router

We installed:

```bash
npm install react-router-dom
```

**Purpose:**

* To enable **routing between pages like Home, Feed, Profile, Login, etc.**
* Allows **SPA (Single Page Application) navigation** without page reloads.

---

## 📌 Summary:

✅ Created a **clean, reusable Navbar** with DaisyUI.
✅ Integrated it into `App.jsx` for a consistent top navigation.
✅ Installed `react-router-dom` to **enable page routing** for the frontend.

---

## 🚀 Learning React Router

### ✅ Basic Example:

```jsx
<BrowserRouter basename="/">
  <Routes>
    <Route path="/" element={<h1>Home Page</h1>} />
    <Route path="/login" element={<h1>Login Page</h1>} />
    <Route path="/test" element={<h1>Test Page</h1>} />
  </Routes>
</BrowserRouter>
```

### Explanation:

* **`<BrowserRouter>`** wraps your entire app to enable routing.
* **`<Routes>`** holds all route definitions.
* **`<Route>`** maps:

  * `path="/"` to **Home Page**.
  * `path="/login"` to **Login Page**.
  * `path="/test"` to **Test Page**.

---

## ✅ DevTinder Route Planning

### 🌱 Pages & Routes:

| Route          | Component/Page |
| -------------- | -------------- |
| `/`            | Feed           |
| `/login`       | Login          |
| `/connections` | Connections    |
| `/profile`     | Profile        |


---

## 🚀 Nested Routes in React Router

✅ **What you learned:**

### 1️⃣ Self-closing `<Route>`:

```jsx
<Route path="/" element={<Body />} />
```

is **the same as**:

```jsx
<Route path="/" element={<Body />}></Route>
```

✅ Both define a **route for `/`** rendering the **`<Body />` component**.



---

### 2️⃣ Using Nested Routes:

You can create **child routes inside a parent route**:

```jsx
<Route path="/" element={<Body />}>
    <Route path="/login" element={<Login />} />
    <Route path="/profile" element={<Profile />} />
</Route>
```

✅ Here:

* Navigating to `/` will load the `Body` component.
* Navigating to `/login` will **still load `Body` as the parent**, and **additionally load `Login` inside it**.
* Similarly, `/profile` will **load `Profile` inside `Body`.**

---

### 3️⃣ Why components are not rendered directly?

✅ Child components like `Login` or `Profile` **need a placeholder inside the parent (`Body`) to appear on screen**.

✅ This placeholder is:

```jsx
<Outlet />
```

inside the `Body` component.

---

### 4️⃣ How does `<Outlet />` work practically?

✅ **`<Outlet />` automatically renders the child component matching the current URL.**

For example:

* If you visit `/login`, React Router:

  * Loads the parent `Body`.
  * Inserts the `Login` component **at the position of `<Outlet />` inside `Body`.**

* If you visit `/profile`, it:

  * Loads `Body`.
  * Inserts `Profile` inside `<Outlet />` in `Body`.

✅ In short:

> **The child component (`Login`, `Profile`, etc.) will be delivered and displayed inside `<Outlet />` according to the route fired by the user.**

---



## 🪐 `Body.jsx` structure with `<Outlet />`

```jsx
import React from 'react';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';

const Body = () => {
  return (
    <div>
      <Navbar />
      <Outlet /> {/* children routes render here */}
    </div>
  );
};

export default Body;
```

✅ Now, when you visit `/login`, it:

* Loads `Body` (which shows `Navbar`).
* Renders `Login` inside the `<Outlet />`.

✅ Similarly, `/profile` will:

* Load `Body`.
* Render `Profile` inside the `<Outlet />`.

---

## ✅ Summary:

✅ **Nested routes allow child routes inside a parent route (`<Body />`).**
✅ **`<Outlet />` is required in the parent to render child components.**
✅ Keeps **`Navbar` persistent** while only the inner page changes on different routes.



---

## 🚀 Footer Component Integration in DevTinder

### ✅ Why a Footer?

* Shows **persistent branding** and **links** across all pages.
* **Fixed to bottom** so it is always visible regardless of page content.
* Built using **DaisyUI’s footer component** for consistent styling.

---

### ✅ Key Points in Your `Footer.jsx`:

* **Uses `fixed bottom-0`** to stick to the bottom of the viewport.
* Uses `footer`, `bg-base-200`, `text-neutral-content`, and `p-4` for consistent theming.
* Contains:

  * An **SVG logo**.
  * Dynamic year using:

    ```jsx
    {new Date().getFullYear()}
    ```
  * Social media icon links (as placeholders).

---

### ✅ Integration in `Body.jsx`:

* You **import and add `<Footer />` below the `<Outlet />`** so:

  * `Navbar` is at the top.
  * `Outlet` renders page-specific content in the middle.
  * `Footer` stays at the bottom on **all pages** automatically.

---

### ✅ Updated `Body.jsx`:

```jsx
import React from 'react';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';
import Footer from './Footer';

const Body = () => {
  return (
    <div>
      <Navbar />
      <Outlet />
      <Footer /> {/* Always visible at bottom */}
    </div>
  );
};

export default Body;
```

---


