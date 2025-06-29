# 📘 Lecture 18 Notes – DevTinder Frontend

###  `/user/connections` & `request/review/accepted/<requestID>`  page + API integration

---

## 🚀 What we did

✅ **Implemented `/connections` route** to display **all connected users**.
✅ Used **Redux Toolkit (`connectionSlice`)** to **store connections globally**.
✅ Created **`ConnectionCard` component** for clean UI of each connection.
✅ Fetch connections from **backend `/user/connections` API** with cookies.

---

## 1️⃣ Created `connectionSlice.js`

```js
import { createSlice } from "@reduxjs/toolkit";

const connectionSlice = createSlice({
    name: "connection",
    initialState: null,
    reducers: {
        addConnections: (state, action) => action.payload,
        removeConnections: () => null,
    },
});

export const { addConnections, removeConnections } = connectionSlice.actions;
export default connectionSlice.reducer;
```

✅ **Purpose:**

* Manage **connections data** globally using Redux Toolkit.
* `addConnections` saves fetched connections.
* `removeConnections` clears them on logout if needed.

---

## 2️⃣ Added it in `appStore.js`

```js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from "./userSlice";
import feedReducer from "./feedSlice";
import connectionReducer from "./connectionSlice";

const appStore = configureStore({
    reducer: {
        user: userReducer,
        feed: feedReducer,
        connections: connectionReducer,
    },
});

export default appStore;
```

✅ This **registers the `connections` slice in Redux store**.

---

## 3️⃣ `/connections` Route in `App.jsx`

```jsx
<Route path="/connections" element={<Connections />} />
```

✅ Enables visiting **`http://localhost:5173/connections`** to view the page.

---

## 4️⃣ `Connections.jsx`

```js
import React, { useEffect } from 'react'
import { BASE_URL } from '../utils/constants'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { addConnections } from '../utils/connectionSlice'
import UserCard from './UserCard'
import ConnectionCard from './ConnectionCard'

const Connections = () => {

    const dispatch = useDispatch()
    const connections = useSelector((store)=>store.connections)

    const fetchConnections = async ()=>{
        try{
            const res = await axios.get(
                BASE_URL+"/user/connections",
                {withCredentials:true}
            )
            console.log(res?.data?.data)
            dispatch(addConnections(res?.data?.data))
        }
        catch(err){
            //handle error case
        console.error(err)
        }
    }
    useEffect(()=>{
        fetchConnections()
    },[])

    if(!connections) return

    if(connections.length === 0) return <h1 className='text-3xl font-bold select-none text-center my-10'>No connections found</h1>
  return (
    <div className='text-center my-10'>
      <h1 className='text-3xl font-bold'>Connections</h1>

    <div className='flex flex-wrap  my-14 gap-10 justify-center items-center'>

    {connections.map((connection)=>{
        const {firstName,lastName,photoUrl,age,gender,about,_id} = connection
        return (
        <div key={_id} className='flex w-[1200px] items-center justify-center' > 
            {/* <img alt='profile-photo' src={connection?.photoUrl} className='w-16 h-16 rounded-full mx-auto my-5' />
            <p className='text-xl font-bold text-center'>{connection?.firstName}</p>
            */}
            <ConnectionCard   user={{firstName,lastName,photoUrl,age,gender,about}} />
          
           
         </div>
      )}
      )}

    </div>
   
    </div>
  )
}

export default Connections

```

### Purpose:

* Fetch user's connections from backend.
* Store them in Redux.
* Display using `ConnectionCard` in a **responsive, clean UI**.

### Key Points:

✅ **Fetching connections** with:

```js
const res = await axios.get(
    BASE_URL + "/user/connections",
    { withCredentials: true }
);
dispatch(addConnections(res?.data?.data));
```

✅ Uses:

* `useDispatch` to dispatch to Redux.
* `useSelector` to access `connections` from Redux.
* `useEffect` to fetch on first load.

✅ Handles:

* If **no connections**, shows `"No connections found"`.
* Otherwise, maps and displays **each connection using `ConnectionCard`**.

---

## 5️⃣ `ConnectionCard.jsx`

Displays each connection with:

* **Photo**
* **Name**
* **Age & Gender**
* **About (limited lines for clean UI)**

```jsx
const ConnectionCard = ({ user }) => {
    const { firstName, lastName, photoUrl, age, gender, about } = user;
    return (
      <div className="card bg-base-200 rounded-lg shadow-lg w-full max-w-8xl h-[12rem] overflow-hidden flex-shrink-0">
        <div className="flex h-full w-full ">
          <div className="w-1/6 h-full overflow-hidden flex-shrink-0">
            <img src={photoUrl} alt={`${firstName} ${lastName}`} className="w-full h-full object-cover" />
          </div>
          <div className="card-body ml-8 w-2/3 p-4 text-start flex flex-col">
            <h2 className="card-title text-xl">{`${firstName} ${lastName}`}</h2>
            <p className="text-sm text-gray-300 mb-2">
              {age && gender && `Age: ${age} • Gender: ${gender}`}
            </p>
            <p className="text-gray-200 line-clamp-4 flex-grow">
              {about}
            </p>
          </div>
        </div>
      </div>
    );
};
```

✅ Uses **Tailwind & DaisyUI** for consistent UI.

✅ Ensures **responsive, clean, and consistent card display** for each connection.

---

## 🧠 Why this structure is good?

✅ **Separation of concerns:**

* `Connections.jsx` handles data fetching + structure.
* `ConnectionCard.jsx` handles single card design.

✅ **Redux stores connections globally**, so they can be accessed in other parts of the app if needed.

✅ API call is made **only once on mount using `useEffect`**.

✅ **Cookie authentication** handled with `{ withCredentials: true }`.

✅ Clear **loading, empty state, and data display logic** for robustness.

---

## 🚩 Key Learnings:

✅ Use **Redux Toolkit slices** for **clean global state management**.
✅ Use **`useSelector`** to fetch state and **`useDispatch`** to update state.
✅ Use **Axios + withCredentials + CORS** to handle backend secure connections.
✅ Split **UI into reusable components** (`ConnectionCard`).
✅ Handle **empty states gracefully** for a professional UX.


---

## 🚀 Creating Connection Requests Page

✅ Created a **`/requests` page (`Requests.jsx`)** to show **all received connection requests** using:

* **Redux Toolkit** (`requestSlice`).
* **Axios** for API fetching (`/user/requests/received`).
* **Reusable card structure** with Accept/Reject buttons for future actions.

---

## 1️⃣ `requestSlice.js`

```js
import { createSlice } from "@reduxjs/toolkit";

const requestSlice = createSlice({
    name: "requests",
    initialState: null,
    reducers: {
        addRequests: (state, action) => action.payload,
    },
});

export const { addRequests } = requestSlice.actions;
export default requestSlice.reducer;
```

✅ **Purpose:**

* Stores the **array of received connection requests globally**.
* Easy to **fetch and update** from anywhere in the app.

---

## 2️⃣ Add to `appStore.js`

```js
import requestReducer from "./requestSlice";

const appStore = configureStore({
    reducer: {
        user: userReducer,
        feed: feedReducer,
        connections: connectionReducer,
        requests: requestReducer,
    },
});
```

✅ Registers `requests` slice globally so you can use `useSelector` to access it and `useDispatch` to modify it.

---

## 3️⃣ Add `/requests` route

```jsx
<Route path="/requests" element={<Requests />} />
```

✅ Now you can **visit `http://localhost:5173/requests`** to see the page.

---

## 4️⃣ `Requests.jsx`


### Purpose:

* Fetches received requests from **`/user/requests/received`** API.
* Uses **Redux to store and manage requests**.
* Displays each request in a **card layout with Accept/Reject buttons** (to implement actions later).

---

### Key Parts:

✅ **Fetching requests on load:**

```js
const fetchRequests = async () => {
    try {
        const res = await axios.get(
            BASE_URL + "/user/requests/received",
            { withCredentials: true }
        );
        dispatch(addRequests(res.data.data));
    } catch (err) {
        console.error(err);
    }
};

useEffect(() => {
    fetchRequests();
}, [dispatch]);
```

✅ Uses:

* `useDispatch()` to update Redux store with fetched requests.
* `useSelector()` to get requests from Redux.
* `useEffect()` to fetch data only on initial load.

---

✅ **Conditional Rendering:**

* If `requests` is `null` ➔ return nothing.
* If requests length is `0` ➔ show **`"No Requests Found"`**.
* Else ➔ render request cards.

---


## ✍️ Why this structure is good:

✅ **Data fetching + state management cleanly separated.**
✅ **Reusable scalable pattern**:

* Add more API integrations easily.
* Add Accept/Reject functionalities using Redux later.
  ✅ Uses **global Redux state** for consistency and avoiding prop drilling.
  ✅ **Cookie-based auth handled with `withCredentials: true`.**


---

## 🧠 Key Learnings Recap

✅ **Redux Toolkit** helps manage global data (`requests`).
✅ **Axios** with `withCredentials` ensures secure cookie-based authentication.
✅ Using **clean, scalable, and consistent patterns** ensures professional project structure for DevTinder.
✅ Clear **loading, error, and empty state handling** are crucial for a production-ready frontend.


---

## 🚀 What we did

✅ Implemented **Accept/Reject (review) functionality** for connection requests on the `/requests` page.

✅ After accepting/rejecting:

* API call is made to **`/request/review/:status/:_id`**.
* On success, the request is removed from the **Redux store**.
* UI **immediately updates** without needing to re-fetch all requests.

---

## 1️⃣ `reviewRequests` function

```js
const reviewRequests = async (status, _id) => {
  try {
    const res = await axios.post(
      BASE_URL + "/request/review/" + status + "/" + _id,
      {},
      { withCredentials: true }
    );

    dispatch(removeRequests(_id)); // remove request from Redux store
  } catch (err) {
    console.error(err);
  }
};
```

✅ This function:

* Calls the **backend API** to accept/reject a request.
* On success ➔ removes the reviewed request from the store, ensuring **instant UI update**.

---

## 2️⃣ Added to Buttons

```jsx
<button
  className='btn btn-primary p-6'
  onClick={() => reviewRequests("rejected", request._id)}
>
  Reject
</button>
<button
  className='btn btn-secondary p-6'
  onClick={() => reviewRequests("accepted", request._id)}
>
  Accept
</button>
```

✅ **Purpose:**

* `reviewRequests("rejected", request._id)` ➔ Rejects the request.
* `reviewRequests("accepted", request._id)` ➔ Accepts the request.
* Uses `_id` to identify which request to review.

---

## 3️⃣ Updated `requestSlice.js`

```js
import { createSlice } from "@reduxjs/toolkit";

const requestSlice = createSlice({
  name: "requests",
  initialState: null,
  reducers: {
    addRequests: (state, action) => action.payload,
    removeRequests: (state, action) => {
      const newArray = state.filter((r) => r._id !== action.payload);
      return newArray;
    },
  },
});

export const { addRequests, removeRequests } = requestSlice.actions;
export default requestSlice.reducer;
```

✅ **Changes made:**

* Added `removeRequests` reducer:

  * Takes `action.payload` (request `_id` to remove).
  * Filters out the request with that `_id` from the state.
  * Returns a **new filtered array**, updating Redux store.

---

## ✍️ Why this approach is good

✅ **Instant UI updates** without refetching:

* After accepting/rejecting, requests are removed from UI immediately, enhancing UX.

✅ **Optimized performance:**

* No unnecessary API calls.
* Avoids reloading entire data from the server.

✅ **Clean separation of concerns:**

* API handling ➔ `reviewRequests`.
* State management ➔ Redux slice (`removeRequests`).
* UI ➔ React components using `useSelector` and `useDispatch`.

✅ **Scalable pattern:**

* Can reuse for other removal-based features across DevTinder (connections, feed, etc.).

---

## Code of  `Request.jsx
```js
import axios from 'axios'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addRequests, removeRequests } from '../utils/requestSlice'
import { BASE_URL } from '../utils/constants'

const Requests = () => {
  const dispatch = useDispatch()
  const requests = useSelector(store => store.requests)

  const reviewRequests = async (status,_id) =>{
    try {
        const res = await axios.post(
          BASE_URL + "/request/review/"+status+"/"+_id,
          {},
          { withCredentials: true }
        )
        // dispatch(addRequests(res.data.data))
        dispatch(removeRequests(_id))
      
    } catch (err) {
        console.error(err)
    }
  }

  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        BASE_URL + "/user/requests/received",
        { withCredentials: true }
      )
      dispatch(addRequests(res.data.data))
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  if (!requests) return null
  if (requests.length === 0) {
    return <h1 className='text-3xl font-bold select-none text-center my-10'>No Requests found</h1>
  }

  return (
    <div className='text-center my-10'>
      <h1 className='text-3xl font-bold'>Connection Requests</h1>
      <div className='flex flex-wrap my-14 gap-10 justify-center items-center'>
        {requests.map(request => {
          const { _id, firstName, lastName, photoUrl, age, gender, about } = request.fromUserId
          return (
            <div key={_id} className='flex w-[1200px] items-center justify-center'>
              
              {/* ——— Inlined RequestCard JSX ——— */}
              <div className="card bg-base-200 rounded-lg shadow-lg w-full max-w-8xl h-[12rem] overflow-hidden flex-shrink-0">
                <div className="flex h-full w-full">
                  <div className="w-1/6 h-full overflow-hidden flex-shrink-0">
                    <img
                      src={photoUrl}
                      alt={`${firstName} ${lastName}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="card-body ml-8 w-2/3 p-4 text-start flex flex-col">
                    <h2 className="card-title text-xl">{`${firstName} ${lastName}`}</h2>
                    <p className="text-sm text-gray-300 mb-2">
                      {age && gender && `Age: ${age} • Gender: ${gender}`}
                    </p>
                    <p className="text-gray-200 line-clamp-4 flex-grow">
                      {about}
                    </p>
                  </div>
              
                  <div className='my-5 mx-6 flex gap-8 justify-end'>
                    <button className='btn btn-primary p-6 '  onClick={() => reviewRequests("rejected", request._id)} > Reject </button>
                    <button className='btn btn-secondary p-6 ' onClick={() => reviewRequests("accepted", request._id)}> Accept </button>
                 

                  </div>
                </div>
              </div>
              {/* ———————————————————————————— */}
              
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Requests
```