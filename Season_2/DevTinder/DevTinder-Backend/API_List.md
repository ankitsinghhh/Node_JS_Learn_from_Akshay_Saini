# 🚀 DevTinder API Endpoints Overview

To build the core functionality of the **DevTinder Project**, we need to implement several **API endpoints** that cover:

- **Authentication**
- **Profile Management**
- **Connection Requests**
- **User Feed**
- **Connection Handling**

---

### 🔐 Authentication APIs

| Method | Endpoint     | Purpose                    |
|--------|--------------|----------------------------|
| POST   | `/signup`    | Register a new user        |
| POST   | `/login`     | Log in an existing user    |
| POST   | `/logout`    | Log out the current user   |

---

### 👤 Profile APIs

| Method | Endpoint            | Purpose                          |
|--------|---------------------|----------------------------------|
| GET    | `/profile/view`     | View logged-in user's profile    |
| PATCH  | `/profile/edit`     | Edit logged-in user's profile    |
| PATCH  | `/profile/password` | Change/reset user password       |

---




### 🤝 Connection Request APIs

| Method | Endpoint                                | Purpose                                                                 |
|--------|------------------------------------------|-------------------------------------------------------------------------|
| POST   | `/request/send/:status/:toUserId`        | Send a request with status `"interested"` or `"ignore"`                |
| POST   | `/request/review/:status/:requestId`     | Review a received request by updating its status to `"accepted"` or `"rejected"` |

---

> ✅ Instead of having separate endpoints like:  
- `/request/send/interested/:userId`  
- `/request/send/ignore/:userId`  
- `/request/review/accepted/:requestId`  
- `/request/review/rejected/:requestId`  

✅ We now use two **unified, cleaner routes**:  

#### ✅ Sending Request:
```bash
/request/send/:status/:toUserId
```

Where `:status` can be:

* `"interested"` ✅ Right Swipe
* `"ignore"` ❌ Left Swipe

#### ✅ Reviewing Request:

```bash
/request/review/:status/:requestId
```

Where `:status` can be:

* `"accepted"` ✅ Connection Made
* `"rejected"` ❌ Connection Denied

---

This approach reduces code duplication and ensures consistent request handling logic.

```
```

---

### 🔄 Connections & Requests APIs

| Method | Endpoint               | Purpose                            |
|--------|------------------------|------------------------------------|
| GET    | `/user/connections`    | Fetch all accepted connections     |
| GET    | `/user/requests/received` | View all incoming requests       |

---

### 🧭 Feed API

| Method | Endpoint       | Purpose                                                  |
|--------|----------------|----------------------------------------------------------|
| GET    | `/user/feed`   | Fetch a list of other users (a defined number at once)  |

> 📌 This endpoint returns **multiple user profiles at once**, not one-by-one like a swipe app.

---
