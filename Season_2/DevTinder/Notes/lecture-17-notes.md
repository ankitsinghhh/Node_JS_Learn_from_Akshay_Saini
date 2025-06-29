
# 📘 Lecture 17 Notes – DevTinder Frontend

###  `/logout` & `/profile/edit` & `/feed` page + API integration



## 📘 Refining `fetchUser`, Auth Redirects, and Learnings

---

### 🚩 1️⃣ **Why redirect on error in `fetchUser`?**

✅ If `fetchUser` fails:

* Likely the **user is not logged in** (e.g., missing or expired cookie).
* Backend returns **`401 Unauthorized`**.

✅ Hence:

```js
catch(err){
    navigate("/login");
}
```

✅ Automatically **redirects unauthenticated users to `/login`**.

---

### 🚩 2️⃣ Refining with status check

To avoid redirecting on unrelated errors:

```js
catch(err){
    if(err.response.status === 401){
        navigate("/login");
    }
    console.error(err);
}
```

✅ Now **only redirects when user is unauthorized** (`401`).

---

### 🚩 3️⃣ **Issue: `fetchUser` called even after login**

* After logging in, navigating to `/` again triggers `fetchUser` call.
* Unnecessary extra API call.

✅ **Solution: Check Redux before calling API**

```js
const userData = useSelector((store) => store.user);
if(userData) return; // User already in store, skip API call
```

✅ Now:

* If user data is already in Redux:

  * Skip calling `/profile/view`.
  * Prevents **unnecessary API requests**.

---

### 🚩 4️⃣ Fixing Profile Button Navigation

✅ Using React Router's `Link` ensures:

* **Client-side routing** without page refresh.
* Smooth navigation to `/profile`.

```jsx
<Link to="/profile" className="justify-between">
   Profile
   <span className="badge">New</span>
</Link>
```

---

### 🚩 5️⃣ Learning: React `StrictMode` behavior

* In `main.jsx`, `StrictMode` causes:

  * **Components and effects to run twice in development** (to catch bugs, React behavior).
  * **Runs only once in production**.
* If you temporarily comment out:

```js
// <StrictMode>
    <App />
// </StrictMode>,
```

✅ API calls will run **only once in development** (like production).

⚠️ **Note**: Keep `StrictMode` during development for safe coding practices, remove only if needed for debugging repetitive API issues.

---

## ✅ Summary:

✅ **`fetchUser`**:

* Redirects unauthenticated users to `/login`.
* Uses Redux store to skip unnecessary API calls after login.

✅ **Navigation**:

* Use `Link` for profile button for SPA navigation.

✅ **StrictMode**:

* Calls effects twice in dev, once in prod.
* Safe to comment for debugging API call repetitions.

✅ These refinements:

* **Make your DevTinder frontend efficient, secure, and seamless.**

---

Here are **clean, structured notes** for your **Logout feature, login error handling, and learnings**:

---

## 📘 Logout Functionality & Login Error Handling

---

### 🚩 1️⃣ **Implementing Logout**

✅ **Where?**
Added in **`Navbar.jsx`**:

```jsx
<li>
  <a onClick={handleLogout}>Logout</a>
</li>
```

---

✅ **Logic:**

```js
const user = useSelector((store) => store.user);
const dispatch = useDispatch();
const navigate = useNavigate();

const handleLogout = async () => {
    try {
        const res = await axios.post(
            BASE_URL + "/logout",
            {},
            { withCredentials: true }
        );
        dispatch(removeUser()); // clear user from Redux store
        navigate("/login");     // redirect to login page
    } catch (err) {
        console.error(err);
    }
};
```

---

✅ **What happens on logout:**
1️⃣ Makes **POST request to `/logout` API** to clear cookie from server.
2️⃣ **Dispatches `removeUser()`** to clear user data from Redux store.
3️⃣ **Redirects to `/login`** so user can log in again.
4️⃣ Ensures:

* Session is cleared on both **server & client**.
* User cannot access protected pages after logout.

---

### 🚩 2️⃣ **Login Error Display**

✅ Added **error state in `Login.jsx`:**

```js
const [error, setError] = useState("");
```

✅ In `handleLogin`, on failure:

```js
catch (err) {
    setError(err?.response?.data || "Something went wrong");
    console.error(err);
}
```

* Uses **optional chaining** to safely fetch server error message.
* Fallback to **"Something went wrong"** if no server error.

✅ Displays error on UI:

```jsx
<p className="text-red-500">{error}</p>
```

✅ Now:

* If **incorrect credentials** or server error:

  * Displays clear error to user.
  * Enhances user experience during failed login attempts.

---

### 🚩 3️⃣ **Key Benefits Learned**

✅ **Logout:**

* Safely clears session from **both backend & frontend**.
* Ensures user cannot access data after logout.
* Provides seamless redirect to login.

✅ **Error Handling in Login:**

* Displays **clear error messages** to users.
* Helps user understand if credentials are incorrect or if there is a server issue.
* Improves debugging during development.

✅ These practices:

* Enhance **security** and **user experience** in your DevTinder frontend.

---

## ✅ Summary:

✅ **Logout feature** clears session & redirects user.
✅ **Error messages** shown clearly on login failures.
✅ **Redux used** to manage login state effectively.
✅ **Smooth user experience** aligned with professional apps.

---


# 📘 Logout Functionality & Login Error Handling

---

### 🚩 1️⃣ **Implementing Logout**

✅ **Where?**
Added in **`Navbar.jsx`**:

```jsx
<li>
  <a onClick={handleLogout}>Logout</a>
</li>
```

---

✅ **Logic:**

```js
const user = useSelector((store) => store.user);
const dispatch = useDispatch();
const navigate = useNavigate();

const handleLogout = async () => {
    try {
        const res = await axios.post(
            BASE_URL + "/logout",
            {},
            { withCredentials: true }
        );
        dispatch(removeUser()); // clear user from Redux store
        navigate("/login");     // redirect to login page
    } catch (err) {
        console.error(err);
    }
};
```

---

✅ **What happens on logout:**
1️⃣ Makes **POST request to `/logout` API** to clear cookie from server.
2️⃣ **Dispatches `removeUser()`** to clear user data from Redux store.
3️⃣ **Redirects to `/login`** so user can log in again.
4️⃣ Ensures:

* Session is cleared on both **server & client**.
* User cannot access protected pages after logout.

---

### 🚩 2️⃣ **Login Error Display**

✅ Added **error state in `Login.jsx`:**

```js
const [error, setError] = useState("");
```

✅ In `handleLogin`, on failure:

```js
catch (err) {
    setError(err?.response?.data || "Something went wrong");
    console.error(err);
}
```

* Uses **optional chaining** to safely fetch server error message.
* Fallback to **"Something went wrong"** if no server error.

✅ Displays error on UI:

```jsx
<p className="text-red-500">{error}</p>
```

✅ Now:

* If **incorrect credentials** or server error:

  * Displays clear error to user.
  * Enhances user experience during failed login attempts.

---

### 🚩 3️⃣ **Key Benefits Learned**

✅ **Logout:**

* Safely clears session from **both backend & frontend**.
* Ensures user cannot access data after logout.
* Provides seamless redirect to login.

✅ **Error Handling in Login:**

* Displays **clear error messages** to users.
* Helps user understand if credentials are incorrect or if there is a server issue.
* Improves debugging during development.

✅ These practices:

* Enhance **security** and **user experience** in your DevTinder frontend.


---

# 📘 Building `UserCard.jsx` and `Feed.jsx` for DevTinder

---

## ✅ 1️⃣ What are we building?

* **`UserCard.jsx`**
  A reusable card component to display **user profile details** on the feed with **Ignore** and **Send Request** buttons.

* **`Feed.jsx`**
  Fetches user data from the backend `/feed` API and **renders UserCard dynamically**.

---

## ✅ 2️⃣ `UserCard.jsx` – Building the User Card

```jsx
const UserCard = ({ user }) => {
    const { firstName, lastName, photoUrl, age, gender, about } = user;
    console.log(user, "inside the userCARD component");

    return (
        <div className="card bg-base-200 w-96 shadow-sm">
            <figure>
                <img src={photoUrl} alt="User Photo" />
            </figure>
            <div className="card-body">
                <h2 className="card-title">{firstName + " " + lastName}</h2>
                <p>{age && gender && `Age: ${age} Gender: ${gender}`}</p>
                <p>{about}</p>
                <div className="card-actions justify-center my-4 gap-6">
                    <button className="btn btn-primary">Ignore</button>
                    <button className="btn btn-secondary">Send Request</button>
                </div>
            </div>
        </div>
    );
};
```

### ✅ Purpose:

* Displays **user details** cleanly.
* Uses `daisyUI` for styling.
* Takes a `user` object as props and destructures values for **clarity**.
* Includes **action buttons** for future API integration (ignore/send request).

---

## ✅ 3️⃣ `Feed.jsx` – Fetching and displaying the feed

```jsx
import axios from 'axios';
import React, { useEffect } from 'react';
import { BASE_URL } from '../utils/constants';
import { useDispatch, useSelector } from 'react-redux';
import { addFeed } from '../utils/feedSlice';
import UserCard from './UserCard';

const Feed = () => {
    const dispatch = useDispatch();
    const feed = useSelector((store) => store.feed);
    console.log(feed);

    const getFeed = async () => {
        if (feed) return; // prevents duplicate API calls
        try {
            const res = await axios.get(`${BASE_URL}/feed`, {
                withCredentials: true, // sends cookies for authentication
            });
            console.log(res);
            dispatch(addFeed(res.data.data)); // save feed data in redux store
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        getFeed();
    }, []);

    return (
        feed && (
            <div className="flex justify-center my-10 mb-30">
                <UserCard user={feed[8]} /> {/* currently displays 9th user for testing */}
            </div>
        )
    );
};
```

---

### ✅ Purpose:

* **Fetches feed data from the backend** using Axios.
* Uses:

  * `useDispatch` to **dispatch actions to Redux**.
  * `useSelector` to **access feed state from Redux**.
* Saves API response to Redux using `addFeed`.
* Uses:

  ```js
  { withCredentials: true }
  ```

  to send cookies for **authentication**.
* Displays a **UserCard** using fetched data.

---

## ✅ 4️⃣ Why `withCredentials: true`?

Cookies holding JWT tokens for authentication are **HTTP-only** and need `withCredentials: true` in Axios to:
✅ Include cookies in the request.
✅ Allow backend to authenticate the request.

---

## ✅ 5️⃣ Why `feed[8]` currently?

* This is a **temporary placeholder** to test rendering a single user card.
* Later, you will replace it with:

  ```jsx
  feed.map(user => <UserCard user={user} key={user._id} />)
  ```

  to render **all user cards dynamically**.

---

## ✅ 6️⃣ Why Redux for Feed State?

✅ Prevents **refetching data on every re-render**.
✅ Centralized data management for feed across the app.
✅ Easy to manage global user feed data for advanced features like filtering, pagination, and shimmer UI.

---

## ✅ Summary Table

| Feature                   | Why                                          |
| ------------------------- | -------------------------------------------- |
| `UserCard`                | Reusable, clean UI for user display          |
| Axios + `withCredentials` | Secure API calls with authentication         |
| Redux (`addFeed`)         | Efficient global state management            |
| `daisyUI`                 | Easy, aesthetic styling                      |
| `feed[8]`                 | Testing single card before dynamic rendering |
| `useEffect`               | Fetches feed on mount only                   |

---






## 📘  Edit Profile Feature in DevTinder


---

```jsx
// components/EditProfile.jsx

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../utils/constants';
import { addUser } from '../utils/userSlice';
import UserCard from './UserCard';

const EditProfile = ({ user }) => {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [photoUrl, setPhotoUrl] = useState(user.photoUrl);
  const [age, setAge] = useState(user.age);
  const [gender, setGender] = useState(user.gender);
  const [about, setAbout] = useState(user.about);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const saveProfile = async () => {
    try {
      const res = await axios.patch(
        BASE_URL + "/profile/edit",
        {
          firstName,
          lastName,
          photoUrl,
          age,
          gender,
          about
        },
        { withCredentials: true }
      );

      dispatch(addUser(res?.data?.data));
      setShowSuccess(true);
      // Optionally navigate to profile page after save
      // navigate('/profile');
    } catch (err) {
      setError(err?.response?.data || "Something went wrong");
      console.error(err);
    }
  };

  // Hide success alert after 3 seconds
  useEffect(() => {
    if (showSuccess) {
      const id = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(id);
    }
  }, [showSuccess]);

  return (
    <div className="flex flex-col md:flex-row justify-center items-start gap-6 my-10 px-4">
      
      {/* Edit Profile Form */}
      <div className="card bg-base-200 shadow-md p-6 w-full md:w-[400px] h-full flex flex-col justify-between">
        <div>
          <h2 className="text-center text-2xl font-semibold text-primary mb-4">Edit Profile</h2>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="label">First Name</label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
              />
            </div>

            <div>
              <label className="label">Last Name</label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name"
              />
            </div>

            <div>
              <label className="label">Photo URL</label>
              <input
                type="url"
                className="input input-bordered w-full"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="Enter your photo URL"
              />
            </div>

            <div>
              <label className="label">Age</label>
              <input
                type="number"
                className="input input-bordered w-full"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Enter your age"
              />
            </div>

            <div>
              <label className="label">Gender</label>
              <select
                className="select select-bordered w-full"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="label">About</label>
              <textarea
                className="textarea textarea-bordered w-full"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Tell us about yourself"
              ></textarea>
            </div>
          </div>

          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>

        <div className="flex justify-center mt-4">
          <button
            className="btn btn-primary w-full"
            onClick={saveProfile}
          >
            Save Profile
          </button>
        </div>
      </div>

      {/* Live UserCard Preview */}
      <div className="w-full md:w-[400px]">
        <UserCard user={{ firstName, lastName, photoUrl, age, gender, about }} />
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div
          role="alert"
          className="alert alert-success fixed top-20 right-4 z-10 max-w-xs px-3 py-2 text-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Your profile has been updated!</span>
        </div>
      )}
    </div>
  );
};

export default EditProfile;
```

---


### 🚩 **1️⃣ Purpose:**

✅ Allows the **user to edit and update their profile** (name, photo, age, gender, about).
✅ Updates are immediately reflected in the **Redux store** and in the **UserCard preview** live.
✅ Displays **success and error messages** for smooth user experience.

---

### 🚩 **2️⃣ Features Implemented**

✅ **🖊️ Editable Fields:**

* First Name, Last Name
* Photo URL
* Age
* Gender (dropdown)
* About (bio)

✅ **✅ Live Preview:**
Uses the **`UserCard` component** to show **live preview** of the card with current input values.

✅ **🚩 Uses Redux:**

* On successful update, **dispatches `addUser` to update Redux store.**
* Keeps the entire app in sync without page reload.

✅ **🎯 API Integration:**
Uses **PATCH request to `/profile/edit` API** with:

```json
{
 "firstName": "...",
 "lastName": "...",
 "photoUrl": "...",
 "age": "...",
 "gender": "...",
 "about": "..."
}
```

with `{ withCredentials: true }` to send cookies.

✅ **✅ Success Message:**
Displays a **success toast** (`alert-success`) for 3 seconds after saving.

✅ **❌ Error Handling:**
Displays clear **error message if update fails**.

---

### 🚩 **3️⃣ Key Code Snippets**

✅ **Local State Management:**

```js
const [firstName, setFirstName] = useState(user.firstName);
...
const [error, setError] = useState("");
const [showSuccess, setShowSuccess] = useState(false);
```

✅ **Save Profile Logic:**

```js
const saveProfile = async () => {
    try {
        const res = await axios.patch(BASE_URL + "/profile/edit", {
            firstName, lastName, photoUrl, age, gender, about
        }, { withCredentials: true });

        dispatch(addUser(res?.data?.data)); // update redux
        setShowSuccess(true);
    } catch (err) {
        setError(err?.response?.data || "Something went wrong");
        console.error(err);
    }
};
```

✅ **Auto-hide Success Message:**

```js
useEffect(() => {
    if (showSuccess) {
        const id = setTimeout(() => setShowSuccess(false), 3000);
        return () => clearTimeout(id);
    }
}, [showSuccess]);
```

✅ **UI Composition:**

* Card with form fields and Save button.
* Live **`UserCard`** preview beside the form.
* Success and error messages for clarity.

---

### 🚩 **4️⃣ Key Benefits of This Structure**

✅ **Real-time UX:** User sees changes live before saving.
✅ **Redux Integration:** Keeps user data consistent across app after edit.
✅ **Error & Success Feedback:** Clean user flow, avoids confusion.
✅ **API Secure with Cookies:** Authenticates requests properly during update.
✅ **Reusable & Clean Code:** Uses **controlled components and consistent state management**.

---

### ✅ Summary:

✅ **EditProfile component allows seamless editing, updating, and live preview of user profile in DevTinder frontend.**
✅ Uses **Redux for state management** and **Axios for API calls**.
✅ Shows **toast success notification** and clear error messages.
✅ Supports a **professional, modern UI workflow**.

---

