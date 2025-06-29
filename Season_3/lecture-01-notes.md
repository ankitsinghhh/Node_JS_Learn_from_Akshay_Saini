# Lecture -1 : Launching an AWS instance and Deploying Frontend
---

## ✅ 1️⃣ Prerequisites

✅ **AWS Account Created** (card verification done).
✅ **AWS Console Login:** [https://console.aws.amazon.com](https://console.aws.amazon.com).

---

## ✅ 2️⃣ Navigate to EC2 Dashboard

1. From the **AWS Console Home**, search for **“EC2”** in the search bar.
2. Click on **EC2** to enter the **EC2 Dashboard**.
3. You will see **running instances, limits, key pairs, security groups, etc.**

---

## ✅ 3️⃣ Launch a New EC2 Instance

1️⃣ Click on **“Launch Instance”**.

---

### Fill in the following:

### 🖥️ **Name and Tags**

* Give your instance a **name** (e.g., `DevTinder-FullStack`).

---

### 🖥️ **Application and OS Images (Amazon Machine Image)**

* By default, **Amazon Linux 2023 AMI** is selected.
* You should choose **Ubuntu Server 22.04 LTS** .

---

### 🖥️ **Instance Type**

* Default: `t2.micro` (eligible for free tier: 1 vCPU, 1 GB RAM).

---

### 🖥️ **Key Pair (login)**

* Create a **new key pair** (`.pem`) if you do not have one:

  * Name: `devtinder-secret-ankit` 
  * Type: RSA
  * File format: `.pem`
* **Download and save the `.pem` file securely** (you will use it to SSH into your instance).

---


## ✅ 4️⃣ Launch the Instance

✅ Review your configuration and click **“Launch Instance”**.
✅ You will see **“Your instances are launching”**.

---

## ✅ 5️⃣ View and Access Your Instance

1️⃣ Click **“View Instances”** to see your running instance.
2️⃣ Note the **Public IPv4 address** (e.g., `3.110.45.XX`).



---

### ✅  **Connect to the EC2 Instance**

* First, you **opened your terminal on your laptop**.

* You navigated to the folder where your **`.pem` key** is stored:

  ```bash
  cd Downloads
  ```

* You secured the key file (AWS requires the private key to be readable only by you):

  ```bash
  chmod 400 devTinder-secret-ankit.pem
  ```

* You SSH’d into your EC2 instance using its **Public DNS**:

  ```bash
  ssh -i "devTinder-secret-ankit.pem" ubuntu@ec2-13-51-204-145.eu-north-1.compute.amazonaws.com
  ```

* Now your prompt changes to:

  ```
  ubuntu@ip-172-31-35-9:~$
  ```

  This means you’re **inside your cloud server** — your local terminal is now controlling that remote machine.

---

### ✅ 2️⃣ **Set Up Node.js Using NVM**

AWS EC2 Ubuntu does **not** come with Node.js installed by default, so you need to:
1️⃣ Install **NVM** (Node Version Manager)
2️⃣ Use **NVM** to install your **required Node version** (the same as your laptop so dev = prod).

---

**Commands you ran:**

1️⃣ Install **NVM**:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```

2️⃣ Load NVM **into the current terminal session**:

```bash
\. "$HOME/.nvm/nvm.sh"
```

3️⃣ Install **Node v18.19.1** (same as your laptop for consistency):

```bash
nvm install 18.19.1
```

---

✅ Now you have:

* `node` and `npm` installed in the EC2 instance.
* The same version as your local dev machine, so your app behaves the same way.

---


📌 **Quick tip**: After `nvm install`, check Node:

```bash
node -v
npm -v
```

✅ They should match what you expect!

---

## ✅ **Now Clone your GitHub project into your AWS EC2 instance**

---

### **What does `git clone` do?**

* The `git clone <repo_url>` command **downloads your entire project** from GitHub into your EC2 server so you can run it there.


---

### **Command I ran:**

```bash
git clone https://github.com/ankitsinghhh/DevTinder-fullstack-Porject.git
```

✅ This:

* Connects to your GitHub repository.
* Creates a folder named `DevTinder-fullstack-Porject` in your current directory (`~` in this case).
* Downloads your **backend and frontend project files** to the server.


---

## 🚀 Deploying Frontend on AWS EC2 using Nginx

### 1️⃣ **Create a production build**

* Navigate to your frontend project:

  ```bash
  cd DevTinder-Frontend
  ```
* Install dependencies:

  ```bash
  npm install
  ```
* Create the production build:

  ```bash
  npm run build
  ```
* This will generate a **`dist/`** folder containing the **optimized production-ready files** of your frontend React/Vite app.

---

### 2️⃣ **What is Nginx and why are we using it?**

✅ **Nginx** is a **high-performance web server** used for:

* Serving **static files** (HTML, CSS, JS) quickly.
* Acting as a **reverse proxy** for backend servers.
* Handling **load balancing**.
* Improving **performance and security** for web applications.

Here, **we are using Nginx to serve our frontend build files publicly over the internet**.

---

### 3️⃣ **Install Nginx on your EC2 instance**

```bash
sudo apt update
sudo apt install nginx
```

✅ This installs Nginx and prepares your EC2 instance to serve your app.

---

### 4️⃣ **Start and enable Nginx**

```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

* `start` → starts the Nginx server immediately.
* `enable` → ensures Nginx starts automatically on instance reboot.

---

### 5️⃣ **Copy build files to the Nginx root folder**

```bash
sudo cp -r dist/* /var/www/html
```

#### Explanation:

* `sudo` → get **root permissions** to write to `/var/www/html`.
* `cp` → copy command.
* `-r` → recursively copy folders/files.
* `dist/*` → copy **all files inside the `dist` folder**.
* `/var/www/html` → default Nginx serving directory.

✅ Now, Nginx will serve your frontend when accessed via your **EC2 public IP**.

---

### 6️⃣ **Enable port 80 in AWS Security Group**

AWS blocks all ports by default. We need to **allow HTTP traffic**:

1. Go to **AWS EC2 Dashboard**.
2. Click your **Instance ID**.
3. Go to **Security → Security Groups → Click your Security Group**.
4. Click **Edit inbound rules → Add rule**.
5. Set:

   * **Type:** HTTP
   * **Port Range:** 80
   * **Source:** 0.0.0.0/0 (allow access from anywhere)
6. Click **Save rule**.

✅ Now, your frontend is publicly accessible at:

```
http://<your-ec2-public-ip> 
```
it was 
```
http://13.51.204.145
```
but at present the site will not work as frontend is only deployed and all APIs will be failing
---

### ✅ Summary:

* `npm install` → install dependencies.
* `npm run build` → create optimized frontend build.
* Install Nginx → serve your frontend.
* Copy build files to `/var/www/html`.
* Open **port 80** in AWS.
* Your frontend app is now **live**.

---

