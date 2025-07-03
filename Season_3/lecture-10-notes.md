# Lecture - 10 : Updating Nginx config

---



## 🚩 Problem

When using **React SPA (Single Page Application)** with **React Router**:

* Navigating via links (`<Link to="/chat/abc" />`) works fine.
* **But refreshing (`F5`) or directly visiting `/chat/abc` shows:**

```
404 Not Found
nginx/1.18.0 (Ubuntu)
```

**Why?**

* NGINX tries to find `/chat/abc` as a physical file or folder.
* Since it does not exist on the server, it throws a **404**.

---

## ✅ Solution

We need to tell **NGINX:**

> “If the file/folder does not exist, serve `index.html` instead, allowing React Router to handle routing.”

---

## ✅ Steps

### 1️⃣ Open your NGINX config

```bash
sudo nano /etc/nginx/sites-available/default
```

---

### 2️⃣ Edit your configuration:

Find:

```nginx
location / {
    try_files $uri $uri/ =404;
}
```

Replace it with:

```nginx
location / {
    try_files $uri /index.html;
}
```

---

### Explanation:

* `try_files $uri /index.html;` means:

  * Check if the requested `$uri` exists.
  * If not, serve `/index.html` (handled by React Router).
  * This preserves client-side routing without 404 errors on refresh.

---

### 3️⃣ Restart NGINX to apply changes:

```bash
sudo systemctl restart nginx
```

---

## ✅ Result

✅ Now, refreshing any React SPA route (`/chat/abc`, `/connection`, `/request`) will **not throw a 404**.
✅ `index.html` will be served, React Router will interpret the route, and your page will load correctly.

---

## ✅ Summary (one-liner memory hook):

> **React Router SPA + NGINX refresh 404 fix:** Use `try_files $uri /index.html;` under `location /` to handle client-side routing gracefully.

---

