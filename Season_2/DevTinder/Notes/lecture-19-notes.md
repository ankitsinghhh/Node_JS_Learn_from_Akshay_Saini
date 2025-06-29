# 📘 Lecture 19 Notes – DevTinder Frontend

###  `request/send/interested/<userID>` & `/signup`  page + API integration


---

## 🚀 Goals

✅ Added **send connection request** functionality on the **Feed page**:

* Users can **Send Request** or **Ignore** potential connections.
* After action, the user **is removed from the feed immediately** using Redux.
* Displays **“No New Users Found”** when the feed is empty.

---

## 1️⃣ `handleSendRequest` function

```js
const handleSendRequest = async (status, userId) => {
  try {
    const res = await axios.post(
      BASE_URL + "/request/send/" + status + "/" + userId,
      {},
      { withCredentials: true }
    );
    dispatch(removeUserFromFeed(userId)); // remove from feed after sending request
  } catch (error) {
    console.error(error);
  }
};
```

✅ **Explanation:**

* Calls **`/request/send/interested/:userId`** or **`/request/send/ignored/:userId`** based on button click.
* On success:

  * Dispatches `removeUserFromFeed(userId)` to remove that user from the Redux store immediately.
  * UI updates **without reloading the entire feed**.

---

## 2️⃣ Button integration

```jsx
<p>{about}</p>
<div className="card-actions justify-center my-4 gap-6">
  <button
    className="btn btn-primary"
    onClick={() => handleSendRequest("ignored", _id)}
  >
    Ignore
  </button>
  <button
    className="btn btn-secondary"
    onClick={() => handleSendRequest("interested", _id)}
  >
    Send Request
  </button>
</div>
```

✅ **Purpose:**

* “Ignore” ➔ Removes user without sending a connection request.
* “Send Request” ➔ Sends request and removes the user from the feed.

---

## 3️⃣ Redux slice (`feedSlice.js`)

You likely have:

```js
const feedSlice = createSlice({
  name: "feed",
  initialState: null,
  reducers: {
    addFeed: (state, action) => action.payload,
    removeUserFromFeed: (state, action) => {
      const updatedFeed = state.filter(user => user._id !== action.payload);
      return updatedFeed;
    }
  }
});

export const { addFeed, removeUserFromFeed } = feedSlice.actions;
export default feedSlice.reducer;
```

✅ **Explanation:**

* `removeUserFromFeed(userId)` filters out the user with the given `_id` from the feed array.
* Ensures **clean Redux state updates** for instant UI changes.

---

## 4️⃣ Handling empty feed:

```js
if (!feed) return;

if (feed.length <= 0) return (
  <div className="flex justify-center my-10 mb-30">
    <h1 className="text-2xl font-bold">No New Users Found</h1>
  </div>
);
```

✅ This ensures:

* If feed data is not yet loaded ➔ nothing renders.
* If feed is loaded but empty ➔ user sees “No New Users Found” message.
* Prevents **blank or broken UI** during empty states.

---

## 🧠 Key Learnings

✅ Sending connection requests is handled cleanly using:

* **Axios for API call.**
* **Redux Toolkit for instant store updates.**
* **Feed cleanup on action without refetching.**

✅ Users removed instantly from the UI ➔ **better user experience.**

✅ Handling **empty feed state** prevents confusion and maintains a **polished app feel**.

✅ You are **practicing real-world scalable frontend patterns** used in professional React + Redux apps.

---

## 🚩 Next improvements I can add:

✅ Show **loading states** on buttons while API call is in progress.
✅ Show **toast notifications** on success or error.
✅ Disable buttons while the request is being processed to prevent duplicate clicks.
✅ Add **pagination or infinite scroll** to the feed for scalability.


---

## 🚀 Goal

✅ Allow **sign-up and login using the same `/signup` api**.
✅ On **successful sign-up:**

* Automatically **login the user**.
* Redirect to `/profile` for profile update.
  ✅ Ensure **cookies and JWT tokens are created during sign-up** so the user is considered logged in immediately.

---

## 1️⃣ Modifications in **Frontend `Login.jsx`**

### ✅ What we modified:

* Added:

  ```jsx
  const [firstName, setFirstName] = useState("Aarav");
  const [lastName, setLastName] = useState("Sharma");
  const [isLoginForm, setIsLoginForm] = useState(false);
  ```

* Conditionally rendered **First Name & Last Name fields** only when in **Sign-Up mode** (`!isLoginForm`).

* Created `handleSignUp`:

  ```js
  const handleSignUp = async () => {
    try {
      const res = await axios.post(
        BASE_URL + "/signup",
        { firstName, lastName, email, password },
        { withCredentials: true }
      );
      dispatch(addUser(res?.data?.data));
      return navigate("/profile");
    } catch (error) {
      setError(error?.response?.data || "something went wrong");
      console.error(error);
    }
  };
  ```

* Button calls:

  ```jsx
  onClick={isLoginForm ? handleLogin : handleSignUp}
  ```

* Toggle:

  ```jsx
  onClick={() => setIsLoginForm(!isLoginForm)}
  ```

✅ **Result:**

* A **single clean page** handles **both login and sign-up**.
* User is **automatically logged in** and navigated to `/profile` after sign-up.

---

## 2️⃣ Why user was not auto-logged in before?

Previously:

* Your **backend `/signup` API**:

  * Was **saving user** in DB.
  * Did **not generate JWT token or send cookies back to the client**.
* Frontend had no user data or cookies ➔ User not recognized as logged in.

---

## 3️⃣ Corrected **Backend `/signup` API**

### Updated `/signup` route:

```js
authRouter.post("/signup", async (req, res) => {
  try {
    validateSignupData(req); // validate signup fields

    const { firstName, lastName, email, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
    });

    const savedUser = await user.save();

    const token = await savedUser.getJWT();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000), // 8 hours
      httpOnly: true, // secure your cookie
    });

    res.json({ message: "User created successfully", data: savedUser });
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});
```

✅ **What we did:**

* **Hashed the password** before saving.
* **Generated JWT using `getJWT()`** on the user model.
* **Set JWT as a cookie** (`res.cookie`) so the client automatically has a session.
* Returned the `savedUser` back in the response.

✅ **Result:**

* On **successful signup, cookies are automatically set**.
* User is **recognized as logged in immediately** on frontend refresh or protected route access.

---

## 🧠 Key Learnings

✅ Cookies are essential for **session persistence** across page refreshes.
✅ JWT tokens allow **stateless authentication** and, when set as cookies, enable **automatic login handling**.
✅ Using `isLoginForm`, you **reuse your login page for signup cleanly** without duplicating UI.
✅ Always **hash passwords securely with bcrypt** before storing in DB.

---




