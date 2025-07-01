# Lecture -5 : Scheduling Cron Jobs
---
---

## 🚩 What are **cron jobs** used for in Node.js?

**Cron jobs** are **time-based task schedulers** to automate repetitive tasks like:
✅ Sending daily summary emails.
✅ Cleaning up expired sessions or tokens.
✅ Generating daily reports.
✅ Sending scheduled notifications.
✅ Backing up databases periodically.
✅ Syncing data with external services daily/hourly.
✅ Running health checks.

---

## 🚩 How to use cron jobs in Node.js?

You use the **`node-cron`** package to schedule and run these tasks.

### 1️⃣ Install:

```bash
npm i node-cron
```

---

### 2️⃣ Basic example:

```js
const cron = require('node-cron');

cron.schedule('* * * * * *', () => {
  console.log("Hello World, " + new Date());
});
```

✅ Here:

```
# ┌────────────── second (optional)
# │ ┌──────────── minute
# │ │ ┌────────── hour
# │ │ │ ┌──────── day of month
# │ │ │ │ ┌────── month
# │ │ │ │ │ ┌──── day of week
# │ │ │ │ │ │
# *  *  *  *  *  *
```

* `* * * * * *` means **every second**.
* The **first `*` (second) is optional**.

Use [https://crontab.guru](https://crontab.guru) to **visualize and test your cron patterns** easily.

---

## 🚩 Example Project: Sending **daily emails at 8:00 AM**

### Goal:

> **Send an email at 8:00 AM daily to users who received a new connection request the previous day.**

---

## 🚩 Dependencies:

✅ `node-cron` for scheduling.
✅ `date-fns` for **date calculations**.

```bash
npm i node-cron date-fns
```

---

## 🚩 File: `src/utils/cronjob.js`

```js
const cron = require("node-cron");
const ConnectionRequestModel = require("../models/connectionRequest");
const { subDays, startOfDay, endOfDay } = require("date-fns");
const sendEmail = require("./sendEmail");

cron.schedule("0 8 * * *", async () => {
  // Runs every day at 8:00 AM
  try {
    const yesterday = subDays(new Date(), 1);
    const yesterdayStart = startOfDay(yesterday);
    const yesterdayEnd = endOfDay(yesterday);

    const pendingRequests = await ConnectionRequestModel.find({
      status: "interested",
      createdAt: {
        $gte: yesterdayStart,
        $lte: yesterdayEnd,
      },
    }).populate("fromUserId toUserId");

    const listOfEmails = [
      ...new Set(pendingRequests.map((request) => request.toUserId.email)),
    ];

    for (const email of listOfEmails) {
      try {
        const res = await sendEmail.run(
          "New Request Pending",
          "There are pending friend requests, please login to DevTinder to accept or reject."
        );
        console.log(res);
      } catch (error) {
        console.log(error);
      }
    }
  } catch (err) {
    console.log(err);
  }
});
```

---

## 🚩 Explanation:

✅ **`cron.schedule("0 8 * * *", callback)`**

* This runs **every day at 8:00 AM**.

✅ We use:

* `subDays(new Date(), 1)` → gets **yesterday's date**.
* `startOfDay` and `endOfDay` → get **00:00:00 and 23:59:59** of yesterday for MongoDB queries.

✅ We query:

```js
await ConnectionRequestModel.find({
  status: "interested",
  createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd }
}).populate("fromUserId toUserId");
```

to **find requests created yesterday**.

✅ We get **unique emails** using:

```js
[...new Set(pendingRequests.map(request => request.toUserId.email))]
```

✅ For each user email:

* We **send an email** reminding them of pending requests.

✅ We log the **response** to ensure emails were sent successfully.

---

## 🚩 Benefits of this structure:

✅ Fully automated, no manual triggers.
✅ Uses efficient querying and date handling (`date-fns`).
✅ Modular, clean, reusable inside your backend project.
✅ Keeps your users **engaged** with **daily reminders**.

---

## 🚩 Best Practices

✅ Always log failures to debug issues (`pm2 logs`).
✅ Run cron jobs inside `utils/cronjob.js`, imported once in `app.js`:

```js
require('./utils/cronjob');
```

✅ For **production**, monitor using `pm2` to ensure your scheduler always runs:

```bash
pm2 start src/app.js --name "devtinder-prod"
```

✅ Combine with `.env` for secure credential management if using email or other APIs.

---
# Homework:
---

## 🚩 Why this method may **not scale well** for large applications

While using **`node-cron` with direct email sending** is fine for:
✅ Small-scale apps
✅ Learning projects
✅ Admin-only or low-user workflows

⚠️ **In large applications with many users**, **sending emails directly inside the cron job can block your Node.js event loop** while:

* Fetching large user data
* Sending thousands of emails synchronously
* Handling slow email API responses

➡️ This will **block your server** and degrade API response times for users during execution.

---

## 🚩 Solution for large-scale applications: **Job Queues**

✅ Use **job queues** for offloading heavy operations like mass emailing, SMS sending, and background tasks.

Two popular npm packages:
1️⃣ [`bee-queue`](https://www.npmjs.com/package/bee-queue) (older, lightweight, Redis-backed).
2️⃣ [`bull`](https://www.npmjs.com/package/bull) (newer, more powerful, Redis-backed).

---

## 🚩 Why use `bee-queue` or `bull`?

✅ **Non-blocking**: Jobs are processed in separate worker processes.
✅ **Retry mechanisms**: Failed jobs can auto-retry.
✅ **Rate limiting**: Control how many emails are sent per second/minute.
✅ **Concurrency**: Handle multiple jobs in parallel.
✅ **Persistence**: Jobs survive process restarts (since Redis stores them).
✅ **Monitoring dashboards**: Visualize and manage jobs easily.

---

## 🚩 Typical architecture for **email scheduling in production**:

✅ Your **cron job** pushes **email tasks** to the **queue (bull/bee-queue)** instead of sending emails directly.
✅ **Worker processes** consume the queue and send emails in the background.
✅ Main server APIs remain **fast and responsive**.

---

## 🚩 Example flow:

✅ `node-cron` runs daily at 8 AM.
✅ Fetches eligible users.
✅ Pushes `{to, subject, body}` tasks to **Bull/bee-queue**.
✅ Workers handle sending emails via SES, logging results, retrying failures if needed.

---
