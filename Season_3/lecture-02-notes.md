# Lecture -2 : Nginx and Backend Node App Deployment

---

## 🚀 Deploying Backend on AWS EC2

### 1️⃣ **Navigate to your backend project**

```bash
cd DevTinder-fullstack-Porject
cd DevTinder-Backend
```

---

### 2️⃣ **Install dependencies**

```bash
npm install
```

✅ This creates the **`node_modules`** folder, installing all required packages.

---

### 3️⃣ **Start your backend server**

```bash
npm start
```

or

```bash
npm run start
```

✅ Both run your `node ./src/app.js`, starting your backend API on **port `7777`**.

---

### 4️⃣ **Enable MongoDB access for your EC2**

If your app cannot connect to the database:

* Go to **MongoDB Atlas → Network Access → Add IP Address**.
* Add your **EC2 Public IP** to the allowlist.

✅ This allows your EC2 instance to connect to your MongoDB cluster.

---

### 5️⃣ **Enable port `7777` on your AWS EC2 instance**

By default, AWS blocks all ports except `22` (SSH) and `80` (HTTP). To allow API access:

1. Go to **EC2 Dashboard**.
2. Click your **Instance ID**.
3. Go to **Security → Security Groups → Click your security group**.
4. Click **Edit inbound rules → Add rule**:

   * **Type:** Custom TCP
   * **Port Range:** `7777`
   * **Source:** `0.0.0.0/0`
5. Click **Save rule**.

✅ Now, your API will be publicly accessible at:

```
http://<ec2-public-ip>:7777/feed
```

(example: `http://13.51.204.145:7777/feed`)

---

### 6️⃣ **Issue with keeping the server alive**

If you run:

```bash
npm start
```

and close your terminal or disconnect SSH,
**the server stops** since it is tied to the terminal session.

---

### 7️⃣ **Using PM2 for 24/7 backend server running**

**What is PM2?**
✅ PM2 is a **production process manager for Node.js** that:

* Keeps your app running 24/7.
* Restarts your app on crashes.
* Allows log monitoring.

---

#### **Install PM2 globally**

```bash
npm install pm2 -g
```

`-g` means global installation, so you can use `pm2` anywhere.

---

#### **Run your app using PM2**

```bash
pm2 start npm -- start
```

✅ This will:

* Run your `npm start` under PM2.
* Keep your backend running **in the background**, even if your SSH disconnects.

---

### 8️⃣ **PM2 helpful commands**

✅ **View running processes:**

```bash
pm2 list
```

✅ **View logs to debug if your app is failing to start:**

```bash
pm2 logs
```

✅ **Clear logs:**

```bash
pm2 flush npm
```

(replace `npm` with the process name shown in `pm2 list` if different)

✅ **Restart your app:**

```bash
pm2 restart npm
```

✅ **Stop your app:**

```bash
pm2 stop npm
```

✅ **Delete your app from PM2:**

```bash
pm2 delete npm
```

✅ **Save current PM2 processes to restart automatically on reboot:**

```bash
pm2 save
```

✅ **Enable PM2 startup on machine boot:**

```bash
pm2 startup
```

Then follow the printed instructions to complete the setup.

---

## ✅ Summary:

* **Install dependencies:** `npm install`
* **Run locally:** `npm start` (for testing)
* **Enable MongoDB access.**
* **Open port `7777` on AWS EC2.**
* **Install PM2:** `npm install pm2 -g`
* **Run app using PM2:** `pm2 start npm -- start`
* **Monitor with `pm2 logs` and manage via `pm2` commands.**


---

## 🚀 Giving a custom name to your PM2 process

By default, when you run:

```bash
pm2 start npm -- start
```

the process name becomes **`npm`**.

To **rename it to something meaningful (e.g., `devtinder-backend`)**:

### Steps:

1️⃣ Check running processes:

```bash
pm2 list
```

🪐 You will see:

```
│ id │ name │ ... │ status │
│ 0  │ npm  │ ... │ online │
```

2️⃣ Stop the process:

```bash
pm2 stop npm
```

3️⃣ Delete the process:

```bash
pm2 delete npm
```

4️⃣ Start it again with a **custom name**:

```bash
pm2 start npm --name "devtinder-backend" -- start
```

✅ Now your process will show in `pm2 list` as:

```
│ id │ name               │ ... │ status │
│ 0  │ devtinder-backend  │ ... │ online │
```

---

### 🩶 Why do we do this?

✅ **PM2 runs `npm start` in the background as a managed process**:

* Keeps the backend running **forever** even if your terminal disconnects.
* Restarts automatically if it crashes.
* Allows easy monitoring (`pm2 logs`), restarting, stopping, and organizing multiple services by **clear names**.

> **✅ Behind the scenes, it is still running `npm start` under the hood, but PM2 is managing it for reliability, monitoring, and easy management.**

---

## 🌐 Why the frontend will still not work?

Your **frontend calls `http://localhost:7777`** for APIs, but:

* On **AWS**, your **frontend runs at `http://13.51.204.145` (port 80)**.
* Your **backend runs at `http://13.51.204.145:7777`**.

These **are treated as different origins**, leading to **CORS issues**, and using `localhost` will fail because the browser is not on the EC2 server.

---

## 🛡️ Solution: Using **Nginx Reverse Proxy**

### Goal:

Map:

```
devtinder.com/api → devtinder.com:7777
```

so your frontend can make requests to `/api`, and Nginx will **forward them internally** to your backend.

---

### Steps:

### 1️⃣ Edit the Nginx config:

```bash
sudo nano /etc/nginx/sites-available/default
```

### 2️⃣ Add the **reverse proxy block**:

Inside your `server { ... }`, add:

```nginx
location /api/ {
    proxy_pass http://localhost:7777/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

✅ This tells Nginx:

* If any request comes to `/api`, forward it to `localhost:7777`.

---

### 3️⃣ Restart Nginx:

```bash
sudo systemctl restart nginx
```

---

## 🛠️ Update the frontend `BASE_URL`

Previously:

```js
export const BASE_URL = "http://localhost:7777";
```

Change it to:

```js
export const BASE_URL = "/api";
```

✅ Now:

* The frontend will automatically use `http://13.51.204.145/api`.
* Nginx will forward this to the backend on `port 7777`.

---

## 🔄 Redeploy the frontend build

1️⃣ Push changes to GitHub:

```bash
git add .
git commit -m "Updated BASE_URL for production"
git push
```

2️⃣ On your EC2 instance:

```bash
git pull
```

3️⃣ Build the frontend:

```bash
npm run build
```

4️⃣ Copy build to Nginx serving folder:

```bash
sudo scp -r dist/* /var/www/html
```

---

## 🎉 Deployment complete

Now:
✅ **Your frontend at `http://13.51.204.145` will work seamlessly with your backend using `/api` routes.**

✅ You can **access it from anywhere**, and it is **production-ready** on AWS.

---

## 🚩 Summary:

✅ **Backend:**

* Managed by **PM2 with custom names**.
* Running 24/7.

✅ **Frontend:**

* Built and deployed under Nginx.
* Calls APIs via `/api`, proxied internally to backend port `7777`.

✅ **Nginx:**

* Handles **serving static frontend files.**
* Manages **reverse proxy for backend APIs.**

✅ **Deployed full-stack app live on AWS EC2.**

---

