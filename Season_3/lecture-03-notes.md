# Lecture - 3  : Adding a Custom Domain Name 

---

## 🌎 What is a **Domain Name?**

✅ A **domain name** (e.g., `devtinder.in`) is your website’s **human-readable address** on the internet, replacing your server’s IP (`13.51.204.145`) with something memorable.

---

## 🛡️ What is **DNS (Domain Name System)?**

✅ DNS is like the **phonebook of the internet**:

* It **maps your domain name (`devtinder.in`) to your server’s IP address (`13.51.204.145`)**.
* When someone types `devtinder.in`, DNS translates it so the browser knows which server to fetch data from.

---

## 🛰️ What are **Nameservers?**

✅ Nameservers tell the internet **which DNS service is managing your domain**.

* Example:

  * Godaddy’s default nameservers manage DNS if you do not change them.
  * If you use **Cloudflare**, you replace Godaddy’s nameservers with Cloudflare’s nameservers.
  * **Once changed, Cloudflare fully manages your DNS.**

---

## 🌩️ Why use **Cloudflare** instead of direct Godaddy DNS?

✅ **Cloudflare Advantages:**
✅ **Free CDN** (faster global delivery).
✅ **DDoS Protection** (prevents many types of attacks).
✅ **Free SSL certificates** for HTTPS.
✅ **Caching for speed improvements**.
✅ **Easy DNS management with instant propagation** compared to Godaddy’s slow propagation.
✅ **Security and analytics tools.**

---

## 🛒 **Step 1: Purchase your domain**

* Go to **Godaddy**.
* Search for `devtinder.in` or any desired domain.
* Purchase and complete payment.

---

## 🛡️ **Step 2: Move DNS management to Cloudflare**

1️⃣ Go to [Cloudflare](https://cloudflare.com) and **create an account**.
2️⃣ Click **Add a site** → enter `devtinder.in`.
3️⃣ **Cloudflare scans current DNS records** (ignore minor errors).
4️⃣ Select **Free Plan** → Continue.
5️⃣ **Cloudflare will show you 2 nameservers (e.g., `burt.ns.cloudflare.com`, `mary.ns.cloudflare.com`).**
6️⃣ Go to **Godaddy > My Products > DNS > Nameservers**:

* Click **Change Nameservers**.
* Choose **“I’ll use my own nameservers.”**
* Paste both Cloudflare nameservers.
* Save.
  7️⃣ Back on **Cloudflare**, click **Check Nameservers**.

---

## 🕒 **Wait \~30 minutes to 1 hour** for nameservers to propagate.

✅ Once done:

* **Cloudflare now fully manages your domain’s DNS.**
* Godaddy is only your **registrar** (ownership), not DNS manager.

---

## ⚡ **Step 3: Point your domain to your server’s IP**

1️⃣ On **Cloudflare dashboard > DNS**:

* You will see A records (like `@` and `www`).
* Delete unnecessary records.
* Edit the existing **A record**:

  * **Name:** `@` (means `devtinder.in`).
  * **IPv4 address:** your AWS EC2 IP (`13.51.204.145`).
  * Proxy status: **ON** (orange cloud, for Cloudflare protection and caching).
* Save.

✅ This will map `devtinder.in` → `13.51.204.145`.

---

## 🚀 **Step 4: Verify**

* Open your browser.
* Enter:

```
http://devtinder.in
```

✅ Your site will now be live under your **own domain globally**.

---

## 🎉 What you achieved:

✅ Purchased a professional **domain name**.
✅ Integrated **Cloudflare** for security, speed, and HTTPS readiness.
✅ Mapped **your domain to your AWS EC2 server** using **DNS A records**.
✅ Now `devtinder.in` is your **production-ready site**, accessible from anywhere on the internet.

---

now we will do : 

✅ **1️⃣ Flexible SSL** ( taught in course )
✅ **2️⃣ Full SSL (recommended for production)** ( homework given)

---

## 🚩 Why enable SSL?

✅ SSL (**Secure Sockets Layer**) encrypts data between the **user’s browser** and your **server**.
✅ It ensures:

* Data privacy and security.
* Protection from MITM (Man-in-the-middle) attacks.
* Shows 🔒 lock icon and `https://` in the URL bar.
* Boosts SEO and trust.

---

## ✅ 1️⃣ Enabling **Flexible SSL on Cloudflare**

🔹 **What is Flexible SSL?**

* The connection between the **user and Cloudflare** is encrypted (`https`), but the **connection from Cloudflare to your server (AWS EC2)** remains **HTTP (`port 80`)**.
* Easier and fast to set up, **but not fully secure end-to-end**.

🔹 **Steps you performed:**

1️⃣ Go to **Cloudflare Dashboard → SSL/TLS → Overview**
2️⃣ Select **Flexible** under SSL/TLS encryption mode:

* Encrypts from user → Cloudflare only.
* Allows instant HTTPS without server certificate.
  3️⃣ **Save.**

4️⃣ Go to **SSL/TLS → Edge Certificates**

* Enable **Automatic HTTPS Rewrites** to automatically convert `http://` links to `https://` on your pages if possible.

✅ Now your site:

```
https://devtinder.in
```

is accessible over HTTPS **using Flexible SSL**.

---

## ⚠️ Drawback of Flexible SSL

* Data from **Cloudflare → your server is still unencrypted**.
* If you are handling **sensitive user data**, **payments, or authentication**, you should **enable Full SSL** for end-to-end encryption.

---

## ✅ 2️⃣ Enabling **Full SSL (Recommended)**

🔹 **What is Full SSL?**

* The connection between:

  * User → Cloudflare → **ENCRYPTED (HTTPS)**
  * Cloudflare → Your server → **ENCRYPTED (HTTPS)**
* Requires **SSL certificates installed on your server**.

---

## 🚀 How to enable Full SSL on your AWS EC2:

### **Step 1: Install SSL certificates on your EC2 server**

We will use **Certbot + Let’s Encrypt (free SSL certificates)**.

**Run these on your EC2 instance:**

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

---

### **Step 2: Configure Nginx for SSL**

Run:

```bash
sudo certbot --nginx -d devtinder.in -d www.devtinder.in
```

* Certbot will automatically:

  * Verify your domain.
  * Obtain certificates.
  * Update your Nginx configuration to support HTTPS.
  * Set up automatic HTTP → HTTPS redirection.

---

### **Step 3: Test certificate renewal**

Let’s Encrypt certificates are valid for **90 days**; you should automate renewal:

```bash
sudo certbot renew --dry-run
```

If successful, your renewal is automated via `cron`.

---

### **Step 4: Switch Cloudflare to Full SSL**

Go to:

* **Cloudflare Dashboard → SSL/TLS → Overview**
* Select:

  * `Full` (SSL certificate present, no strict validation) OR
  * `Full (Strict)` (recommended; validates the certificate authenticity).

---

### ✅ Done! Now:

✅ Your **site will use HTTPS end-to-end** with encryption:

```
Browser 🔒 → Cloudflare 🔒 → Your EC2 server 🔒
```

✅ Fully secure, **production-ready HTTPS deployment**.

---

## 🛡️ Summary:

✅ **Flexible SSL:** Quick HTTPS using Cloudflare; no server certificates; partial security.
✅ **Full SSL:** Full HTTPS using Let’s Encrypt; certificates installed on your server; end-to-end encryption; recommended for production.

