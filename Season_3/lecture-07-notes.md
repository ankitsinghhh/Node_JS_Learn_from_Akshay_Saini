# Lecture -7 : Payment Gateway Integration ft. Razorpay

---

## 🚩 What is Razorpay?
- Documentation links : 
```
https://razorpay.com/docs/payments/server-integration/nodejs/integration-steps/#integrate-with-razorpay-payment-gateway
```

```
https://github.com/razorpay/razorpay-node/blob/master/documents/order.md
```

* **Razorpay** is an **Indian payment gateway** allowing **secure payments using cards, UPI, net banking, wallets, etc.**.
* Provides **REST APIs and SDKs** for integration in **Node.js, React, Flutter, etc.**.
* Handles **payment creation, payment verification, refunds, and webhooks**.

---

## 🚩 Typical **payment flow using Razorpay**:

### 1️⃣ **User clicks "Pay Now" on frontend.**

* Triggers **API call to your backend** (`/createOrder`) to **create a payment order**.

---

### 2️⃣ **Backend (`/createOrder`) calls Razorpay API**

* Uses **`RAZORPAY_KEY_ID` and `RAZORPAY_SECRET_KEY`** (from your Razorpay account).
* Creates an **order on Razorpay** with:

  * amount
  * currency
  * receipt ID
* Razorpay returns:

  * `order_id` (public, used on frontend)
  * `amount`
  * other order details

---

### 3️⃣ **Frontend receives `order_id`**

* Calls **Razorpay Checkout** (dialog) with:

  * `order_id`
  * user details
  * `RAZORPAY_KEY_ID` (public key)
* User **completes payment** (UPI/card, etc.).

---

### 4️⃣ **Payment Verification**

* **Razorpay sends a webhook to your backend** notifying payment status **(recommended)**.
* OR, frontend sends payment details to your backend (`/verifyPayment`), and backend verifies using:

  * `razorpay_order_id`
  * `razorpay_payment_id`
  * `razorpay_signature`
* Backend:

  * Verifies payment signature.
  * Updates DB:

    * Mark user as `premium: true`.
    * Store payment transaction.

---

### 5️⃣ **Frontend confirms payment**

* After payment completion, frontend polls/calls backend to confirm if payment is verified.
* Shows success/failure UI accordingly.

---

## 🚩 Steps to get started on **Razorpay**

✅ **1. Sign Up:**

* Go to [razorpay.com](https://razorpay.com/).
* Create an account and complete **KYC** (takes 4-5 days for live mode).

✅ **2. Get API Keys:**

* Dashboard → Settings → API Keys.
* Copy `RAZORPAY_KEY_ID` (public) and `RAZORPAY_SECRET_KEY` (keep private, store in `.env`).

✅ **3. Enable Webhooks (optional but recommended):**

* Dashboard → Webhooks.
* Add your webhook URL (e.g., `https://devtinder.in/webhook/razorpay`).
* Select events like `payment.captured`.

✅ **4. Install Razorpay SDK in backend:**

```bash
npm install razorpay
```

✅ **5. Use `.env` for keys securely:**

```env
RAZORPAY_KEY_ID=rzp_test_123abc456xyz
RAZORPAY_SECRET_KEY=abcd1234xyz5678
```

✅ **6. Create routes:**

* `POST /createOrder` to create a Razorpay order.
* `POST /verifyPayment` to verify payment after success.
* Optionally, `POST /webhook/razorpay` to handle webhook notifications.

---

## 🚩 Summary

✅ **First Step (Backend): Create Order**

* Call Razorpay API to create an order, get `order_id`.

✅ **Second Step (Frontend): Open Razorpay Checkout**

* Use `order_id` to trigger payment.

✅ **Third Step (Verification):**

* **Webhook-based verification recommended**.
* Or manually verify using signature in `/verifyPayment`.

✅ **Fourth Step: Update DB**

* Mark user as premium, store transaction data.

✅ **Fifth Step: Frontend Confirms**

* User sees payment success UI.

---

## 🚩 Why this flow?

✅ **Security**: Sensitive keys and payment verification logic remain on backend.
✅ **Reliability**: Webhooks handle payment confirmation robustly.
✅ **Scalability**: Works for subscriptions, one-time payments, and large user bases efficiently.


---

## ✅ What we are implementing:

**Using Razorpay for automated online payments:**

1️⃣ **User clicks “Pay Now” on frontend** →
2️⃣ Frontend hits `/payment/create` on backend to create an **order** with Razorpay.
3️⃣ Razorpay returns `order_id`, `amount`, etc. → sent back to **frontend**.
4️⃣ Frontend opens **Razorpay Checkout**, user completes payment.
5️⃣ Razorpay **calls webhook** to notify backend OR frontend calls `/verifyPayment` to confirm payment.
6️⃣ Backend verifies signature → marks payment as successful → upgrades user to **Premium**.

---

## 1️⃣ `utils/razorpay.js`

```js
const Razorpay = require('razorpay');

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = instance;
```

✅ **Purpose:** Creates a **reusable Razorpay instance** with your keys safely loaded from `.env`.

---

## 2️⃣ `routes/razorpayRouter.js`

```js
const express = require("express");
const razorpayRouter = express.Router();
const razorpayInstance = require("../utils/razorpay");
const { userAuth } = require("../middlewares/auth");

razorpayRouter.post("/payment/create", userAuth, async (req, res) => {
  try {
    const { amount, membershipType } = req.body;

    // Creating an order
    const order = await razorpayInstance.orders.create({
      amount: amount * 100, // Razorpay uses paise
      currency: "INR",
      receipt: "receipt#" + Date.now(),
      notes: {
        userId: req.user._id.toString(),
        membershipType,
      },
    });

    console.log("✅ Razorpay order created:", order);

    // You can save order.id in DB with user reference for tracking.

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = razorpayRouter;
```

✅ **What it does:**

* Requires **`amount`** and **`membershipType`** from frontend.
* Creates an **order** using Razorpay SDK.
* Returns **order details (`id`, `amount`, etc.)** to the frontend.

---

## Example API response:

```json
{
  "id": "order_Qo6Z1kh6I4qYvC",
  "entity": "order",
  "amount": 50000,
  "amount_paid": 0,
  "amount_due": 50000,
  "currency": "INR",
  "receipt": "receipt#1",
  "status": "created",
  "attempts": 0,
  "notes": {
    "userId": "6612a...",
    "membershipType": "silver"
  },
  "created_at": 1751438774
}
```

✅ You will use **`order.id`** on the frontend with Razorpay Checkout to process payment.

---

## 3️⃣ Environment Setup

**Add to your `.env`:**

```env
RAZORPAY_KEY_ID="rzp_test_XXXXXXXXXXXXXXXXXX"
RAZORPAY_KEY_SECRET="your_razorpay_secret_here"
```

✅ **Never hardcode these in your code.**

---

## 4️⃣ Add router in `app.js`

```js
const razorpayRouter = require("./routes/razorpayRouter");
app.use("/api", razorpayRouter);
```

---
Here is the **expanded structured note**, adding your **Razorpay dashboard check step** clearly:

---


### ✅ **Important Dashboard Step**

🪐 **Check the created order in Razorpay:**

* Go to [Razorpay Dashboard](https://dashboard.razorpay.com/).
* On the **left sidebar**, click on **“Transactions.”**
* Under **“Orders”**, you will see:

  * A new **Order ID** matching what your API returned.
  * The **amount**, **status (“created”)**, **notes**, etc.

✅ This **confirms your backend is successfully creating orders with Razorpay**.

---

# ✅ **Storing Razorpay Orders in MongoDB + Frontend Integration**

---

## 1️⃣ **What we are doing**

🔹 After **creating an order on Razorpay**, we store:

* `userId`, `orderId`, `status`, `amount`, `currency`, `receipt`, `notes`
  in **MongoDB** for **transaction tracking, validation, and audit trail**.

🔹 We then **send this saved payment document back to the frontend** to:

* Use its `orderId` for Razorpay Checkout popup,
* Track payment and verification later,
* Display to the user if needed.

---

## 2️⃣ **MongoDB Payment Schema: `models/payment.js`**

```js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    paymentId: {
      type: String,
    },
    orderId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    receipt: {
      type: String,
      required: true,
    },
    notes: {
      firstName: String,
      lastName: String,
      membershipType: String,
      email: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
```

---

## 3️⃣ **Backend Route: `routes/razorpayRouter.js`**

```js
const express = require("express");
const razorpayRouter = express.Router();
const razorpayInstance = require("../utils/razorpay");
const Payment = require("../models/payment");
const { userAuth } = require("../middlewares/auth");

// Define membership amounts
const membershipAmount = {
  Silver: 799,
  Gold: 1599,
};

razorpayRouter.post("/payment/create", userAuth, async (req, res) => {
  try {
    const { membershipType } = req.body;
    const { firstName, lastName, email } = req.user;

    const order = await razorpayInstance.orders.create({
      amount: membershipAmount[membershipType] * 100, // INR in paisa
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        firstName,
        lastName,
        email,
        membershipType,
      },
    });

    const payment = new Payment({
      userId: req.user._id,
      orderId: order.id,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes,
    });

    const savedPayment = await payment.save();

    res.json({ ...savedPayment.toJSON() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
});

module.exports = razorpayRouter;
```

---

## 4️⃣ **Frontend: Calling `/payment/create`**

Modify `handleBuyClick` to:

```js
const handleBuyClick = async (type) => {
  try {
    const res = await axios.post(
      BASE_URL + "/payments/create",
      { membershipType: type },
      { withCredentials: true }
    );

    console.log(res.data); // Contains saved payment details

    // Next: Use `res.data.orderId` to open Razorpay checkout
  } catch (error) {
    console.error("ERROR:", error);
    alert("Payment initiation failed. Please try again.");
  }
};
```

---

## 5️⃣ **Flow Recap**

✅ **User clicks “Buy Silver/Gold.”**
✅ Frontend calls `/payments/create` with membership type.
✅ Backend:

* Creates Razorpay order using secret key.
* Stores returned order data in MongoDB.
* Returns saved payment data to frontend.
  ✅ Frontend:
* Receives `orderId`, `amount`, etc.
* Uses these to **initiate Razorpay Checkout popup** (in next step).

✅ You can **check created orders on Razorpay Dashboard → Transactions → Orders**.

---

## 🛡️ **Why store the order in DB?**

✅ Track all payment intents even if user does not complete payment.
✅ Helps in reconciling payments manually if needed.
✅ Enables associating each payment attempt with `userId` for premium activation later.
✅ Allows **safe verification of payments using Razorpay webhook or manual polling**.

---

Here is a **clean, structured note** explaining your **next steps of opening Razorpay payment gateway**, **with context, flow, and clear reasoning**:

---

## ✅ **Next Step: Opening Razorpay Payment Gateway for DevTinder Premium**

---

### **1️⃣ Why we do this**

After:

* **Creating an order on Razorpay** (and storing it in MongoDB),
* We now need to **collect actual payment from the user.**

Razorpay provides a **secure payment popup (Checkout)** that:
✅ Takes payment from the user
✅ Handles card/UPI/netbanking
✅ Automatically attaches payment to your `orderId`
✅ Returns success/failure, which you can later **verify and mark user premium.**

---

### **2️⃣ Add Razorpay Checkout Script**

Add to `index.html` in **DevTinder-Frontend** root:

```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

✅ This exposes the **`window.Razorpay` object globally**.
✅ Required for using Razorpay checkout in your React component.

---

### **3️⃣ Frontend Component: `PremiumRazorpay`**

#### Full structured example:

```jsx
import React from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";

const PremiumRazorpay = () => {
  const handleBuyClick = async (type) => {
    try {
      const res = await axios.post(
        BASE_URL + "/payments/create",
        { membershipType: type },
        { withCredentials: true }
      );

      console.log(res.data);

      const { amount, currency, notes, orderId } = res.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // store in .env and use here
        amount: amount,
        currency: currency,
        name: "DevTinder",
        description: "Connect with Developers",
        order_id: orderId, // The order ID from backend
        prefill: {
          name: `${notes.firstName} ${notes.lastName}`,
          email: notes.email,
        },
        theme: {
          color: "#F37254",
        },
        handler: (response) => {
          console.log("Payment Success", response);
          // Later: call verify API to confirm payment
          // response.razorpay_payment_id, response.razorpay_order_id, response.razorpay_signature
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("ERROR:", error);
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center">
      <button
        onClick={() => handleBuyClick("Silver")}
        className="bg-blue-500 px-4 py-2 rounded text-white"
      >
        Buy Silver (₹799)
      </button>
      <button
        onClick={() => handleBuyClick("Gold")}
        className="bg-yellow-500 px-4 py-2 rounded text-white"
      >
        Buy Gold (₹1599)
      </button>
    </div>
  );
};

export default PremiumRazorpay;
```

---

### **4️⃣ Explanation of important points**

✅ **Razorpay Checkout Script:** Required for `window.Razorpay`.
✅ **Order ID:** Crucial to link payment with your created Razorpay order for tracking and validation.
✅ **Options Object:**

* `key`: Your public `RAZORPAY_KEY_ID` (safe to use in frontend).
* `amount`: Amount in **paise** (`₹799` = `79900`).
* `currency`: INR.
* `name`, `description`: Shown on the payment popup.
* `order_id`: **Ensures payment is linked to the backend order.**
* `prefill`: Pre-fills user info for better UX.
* `theme.color`: Customize brand color.
* `handler`: Callback triggered on **successful payment** with:

  * `razorpay_payment_id`
  * `razorpay_order_id`
  * `razorpay_signature`

✅ **`rzp.open()`** launches the **Razorpay payment dialog**.

---

### **5️⃣ Testing your flow**

Since this is **test mode**:

* Click “Pay with Razorpay.”
* Razorpay will open test payment methods.
* Complete payment (choose success/failure).
* After success, `handler` logs payment response.
* Check:

  * Your **MongoDB payments collection**.
  * **Razorpay Dashboard → Transactions → Orders**.

✅ This confirms your payment collection pipeline is working.


---

# ✅ Why Webhooks in Razorpay?

* After **payment success**, Razorpay needs a way to **inform your backend** reliably.
* Instead of relying on frontend or polling, **webhooks send server-to-server notifications** when:

  * Payment is **captured** (successful).
  * Payment is **failed**.
* This ensures **accurate status updates** for premium upgrades, even if the frontend closes/crashes.

---

## ✅ Setting up Webhook in Razorpay Dashboard

1️⃣ Go to your **Razorpay Dashboard** →
2️⃣ Navigate to **Account & Settings** →
3️⃣ Click **Webhooks** under *Website and App Settings* →
4️⃣ Click **Add New Webhook** →
5️⃣ Enter:

* **Webhook URL**:

  ```
  https://tinderdev.life/api/payment/webhook
  ```
* **Secret**: Any secure string you choose (e.g., `DEV_TINDER_WEBHOOK_SECRET`).
* Enable **payment.captured** and **payment.failed** events.
  6️⃣ Click **Create Webhook**.

---

## ✅ The Webhook Route: Explanation

```js
razorpayRouter.post("/payment/webhook", async (req, res) => {
  console.log("webhook called");

  const webhookSignature = req.get("X-Razorpay-Signature");

  const isWebhookValid = await validateWebhookSignature(
    JSON.stringify(req.body),
    webhookSignature,
    process.env.RAZORPAY_WEBHOOK_SECRET
  );

  if (!isWebhookValid) {
    return res.status(400).json({ msg: "Invalid webhook signature" });
  }

  const paymentDetails = req.body.payload.payment.entity;

  const payment = await Payment.findOne({ orderId: paymentDetails.order_id });
  payment.status = paymentDetails.status;
  await payment.save();

  if (paymentDetails.status === "captured") {
    const user = await User.findOne({ _id: payment.userId });
    user.isPremium = true;
    user.membershipType = payment.notes.membershipType;
    await user.save();
  }

  return res.status(200).json({ msg: "Webhook received successfully" });
});
```

### 🚀 **Line-by-Line Explanation**

✅ **`razorpayRouter.post("/payment/webhook", ...`**
Sets up your webhook receiver route.

✅ **`webhookSignature = req.get("X-Razorpay-Signature");`**
Razorpay sends a signature in headers to verify authenticity.

✅ **`validateWebhookSignature(payload, signature, secret)`**
Validates that **webhook was genuinely sent by Razorpay** using HMAC SHA256 with your webhook secret.

✅ If **invalid**, we:

```js
return res.status(400).json({ msg: "Invalid webhook signature" });
```

to **reject forged requests**.

✅ **Extract payment details:**

```js
const paymentDetails = req.body.payload.payment.entity;
```

Contains:

* `status` (e.g., captured, failed)
* `order_id`
* `payment_id`, etc.

✅ **Find payment entry in MongoDB:**

```js
const payment = await Payment.findOne({ orderId: paymentDetails.order_id });
```

✅ Update its `status` to Razorpay’s status:

```js
payment.status = paymentDetails.status;
await payment.save();
```

✅ **If payment was successful (`captured`):**

* Mark user as premium:

```js
const user = await User.findOne({ _id: payment.userId });
user.isPremium = true;
user.membershipType = payment.notes.membershipType;
await user.save();
```

✅ Finally, return `200`:

```js
return res.status(200).json({ msg: "Webhook received successfully" });
```

Razorpay **requires a `200` response to consider webhook delivered**; otherwise, it will **retry repeatedly**.

---

## ✅ **Important Points**

✅ **This webhook automatically upgrades users after successful payment**, fully automating your premium flow.

✅ **No frontend dependency**:

* Even if the user closes the payment window, the backend updates their premium status reliably.

✅ **Webhook Signature validation is critical** for security against forged requests.

✅ **Store your `RAZORPAY_WEBHOOK_SECRET` safely in `.env` and Gitignore it.**

---

## ⚠️ Can we test this locally?

❌ **No. Webhooks require a public, HTTPS-accessible URL.**
✅ You **can only test on production (live or test mode) or using tools like:**

* [ngrok](https://ngrok.com/) to tunnel local port to public HTTPS URL temporarily for testing.


---

# ✅ `/premium/verify` endpoint and its dependenices

🔹 **Goal**:

* Show **Premium badge** for **premium users** in the navbar.
* **Hide "Premium" upgrade option** for premium users.
* Reflect **verified payment** dynamically in the frontend after webhook updates the backend.

---

## ✅ 1️⃣ Tracking Premium Status in React

You have:

```js
const [isPremium, setIsPremium] = useState(false);

const verifyPremiumUser = async () => {
  try {
    const res = await axios.get(
      BASE_URL + "/premium/verify",
      { withCredentials: true }
    );
    if (res.data.isPremium) {
      setIsPremium(true);
    }
  } catch (error) {
    console.error(error);
  }
};

useEffect(() => {
  if (user) verifyPremiumUser();
  else setIsPremium(false);
}, [user]);
```

### Explanation:

✅ **`isPremium` State**
Tracks if the **logged-in user has premium** status.

✅ **`verifyPremiumUser` Function**

* Makes a `GET` request to:

  ```
  BASE_URL + "/premium/verify"
  ```
* **Server returns `{isPremium: true/false}`.**
* If premium, `setIsPremium(true)` updates your UI automatically.

✅ **`useEffect` Hook**

* Calls `verifyPremiumUser` whenever `user` changes (on login/logout or session refresh).
* Resets premium status to false if user logs out.

---

## ✅ 2️⃣ Backend: `/premium/verify` Endpoint

Your backend should have a **simple endpoint**:

```js
premiumRouter.get("/verify", userAuth, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ isPremium: user.isPremium || false });
});
```

✅ Authenticates the user.
✅ Returns `{ isPremium: true }` or `{ isPremium: false }`.

---

## ✅ 3️⃣ Updating Navbar Based on Premium Status

In `Navbar.jsx`:

### ⭐ Show **Premium Badge** if premium:

```jsx
{isPremium && (
  <SolidBadge
    className={`h-6 w-6 my-auto text-yellow-400`}
    aria-label={`premium badge`}
  />
)}
```

✅ Displays a **yellow premium badge** in your navbar when the user is premium.

---

### ⭐ Hide "Premium" upgrade option if premium:

```jsx
{
  !isPremium && (
    <li>
      <Link to="/premium">Premium</Link>
    </li>
  )
}
```

✅ If **user is not premium**, the **"Premium" link is visible** to allow upgrades.

✅ If **user becomes premium**, the link **disappears automatically**.

---

## ✅ 4️⃣ Workflow Recap (End-to-End)

1️⃣ **User clicks "Buy Premium"** → Initiates payment → Razorpay payment flow.
2️⃣ **Webhook on success** marks the user as premium in the database.
3️⃣ User refreshes or reopens the app → `verifyPremiumUser()` runs automatically.
4️⃣ `isPremium` updates to `true`.
5️⃣ Navbar:

* Hides "Premium" upgrade option.
* Shows the premium badge.
  6️⃣ User now has **premium experience seamlessly.**

---

## ✅ Advantages ofthis approach

✅ Fully **dynamic** – updates on payment success automatically.
✅ **Decoupled from frontend state** (even if user closes payment window).
✅ Clean **user experience** with visual badge and removed upgrade option.
✅ Scalable and reliable with webhook-backed verification.

---




---
---
---
---
---
---
---
---
---
---
---
---
---
---
---
---
---
---
---
---

# 🚩 if  **you can not  use Razorpay** for now?

> **Valid reasons could be :**

* Razorpay **requires KYC approval**, which **takes 4–5 days**.
* We **do not have access to PAN/Aadhar and necessary business documents** currently, hence **cannot complete KYC**.
* **Razorpay cannot be used in production without KYC.**

---


## 🚩 Alternative: **Manual UPI Payment Verification**

Since we **cannot use Razorpay now**, we add:
✅ **UPI payment feature**:

* User **scans a QR or pays via UPI ID manually**.
* User **clicks "I have paid"** after payment.
* We **verify payment manually**, then **mark user as premium** (`Silver`/`Gold`) in the database.

---

## 🚩 How our **DevTinder Premium Payment System** works:

### 🛠️ 1️⃣ User Initiates Payment:

* On **frontend (`premium.jsx`)**:

  * User selects a **plan (Silver / Gold)**.
  * Modal opens showing:

    * UPI QR Code for manual payment.
    * UPI ID with **copy feature**.
    * Amount based on plan (`₹799` Silver / `₹1599` Gold).
  * User pays using any UPI app.
  * Clicks **“I have paid”**.

---

### 🛠️ 2️⃣ Save Payment Request:

* On clicking "I have paid":

  * Frontend sends a `POST` request:

    ```
    POST /premiumRequest
    Body: { plan: "Silver" or "Gold" }
    ```
  * This request:

    * Creates a **pending premium request** in **MongoDB**.
    * Stores:

      * `userId`
      * `plan`
      * `amount`
      * `status: pending`
      * `createdAt`
  * User gets a message:

    > ✅ "Payment marked! We will verify and enable your premium shortly."

---

### 🛠️ 3️⃣ Admin Verification:

* Admin logs in and:

  * Calls:

    ```
    GET /pendingPremiumRequests/:adminPass
    ```

    to fetch **pending premium requests**.
  * After checking bank/UPI, admin calls:

    ```
    PATCH /approvePremiumRequest/:adminPass/:id
    ```

    to mark payment as:

    * `status: approved`
    * `approvedAt: Date`

✅ Optionally, admin can:

* Update the **User model** to:

  * `user.premium = true`
  * `user.plan = Silver / Gold`

---

## 🚩 Technical Details:

### ✅ **MongoDB Schema: `models/premiumRequest.js`**

Stores:

* `userId`: reference to user
* `plan`: `Silver` or `Gold`
* `amount`: 799 / 1599
* `status`: `pending` / `approved`
* `createdAt`, `approvedAt`

---

### ✅ **API Routes: `premiumRequestRouter.js`**

* `POST /premiumRequest`:

  * Accessible by users.
  * Creates a premium request.
* `GET /pendingPremiumRequests/:adminPass`:

  * For admin to **view pending requests**.
* `PATCH /approvePremiumRequest/:adminPass/:id`:

  * For admin to **approve payments manually**.
* Uses `adminAuth` middleware to secure admin routes using `ADMIN_SECRET` in `.env`.

---

### ✅ **Frontend: `premium.jsx`**

* **UPI Modal**:

  * QR Code and UPI ID for payment.
  * “I have paid” button triggers POST API call.
* Uses **clean, user-friendly UI** with Tailwind aesthetics.
* Handles **copy UPI ID to clipboard** for user convenience.

---

## 🚩 Advantages of this approach:

✅ **No dependency on Razorpay KYC.**
✅ **You can test and ship premium features immediately.**
✅ **Works well for small-scale or student projects.**
✅ **Easy to transition to Razorpay later.**

---

## 🚩 Limitations:

⚠️ Manual approval is required, **not scalable for large user bases.**
⚠️ Relies on trust, as users can mark as paid without paying.

---

## 🚩 For **scalability in the future**:

✅ Use Razorpay / Stripe for **automated payment and verification**.
✅ Use **webhooks** to handle verification automatically.
✅ Use **queues (BeeQueue / Bull) for large-scale notifications** after payment verification.

---


## 1️⃣ `models/premiumRequest.js`

```js
const mongoose = require('mongoose');

const premiumRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    enum: ['Silver', 'Gold'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: {
    type: Date
  }
});

module.exports = mongoose.model('PremiumRequest', premiumRequestSchema);
```

---

## 2️⃣ `middlewares/auth.js` (add `adminAuth`)

```js
const jwt = require("jsonwebtoken");

// User authentication middleware
const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) return res.status(401).json({ success: false, message: "Please login first" });

    const decodedObj = await jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedObj; // or fetch user if needed
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// Admin authentication middleware
const adminAuth = (req, res, next) => {
  const { adminPass } = req.params;
  if (!adminPass || adminPass !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ success: false, message: "Invalid admin password" });
  }
  next();
};

module.exports = { userAuth, adminAuth };
```

---

## 3️⃣ `routes/premiumRequestRouter.js`

```js
const express = require('express');
const router = express.Router();
const PremiumRequest = require('../models/premiumRequest');
const { adminAuth, userAuth } = require('../middlewares/auth');

// User initiates premium request after UPI payment
router.post('/premiumRequest', userAuth, async (req, res) => {
  try {
    const { plan } = req.body;
    const amount = plan === 'Silver' ? 799 : 1599;

    const newRequest = await PremiumRequest.create({
      userId: req.user._id,
      plan,
      amount
    });

    res.json({
      success: true,
      message: '✅ Premium request saved. We will verify and enable your premium shortly.',
      requestId: newRequest._id
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin approves premium manually
router.patch('/approvePremiumRequest/:adminPass/:id', adminAuth, async (req, res) => {
  try {
    const request = await PremiumRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    request.status = 'approved';
    request.approvedAt = new Date();
    await request.save();

    // Optionally, mark user as premium here by updating user model.

    res.json({
      success: true,
      message: '✅ Premium request approved.',
      request
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin fetches pending requests for review
router.get('/pendingPremiumRequests/:adminPass', adminAuth, async (req, res) => {
  try {
    const pendingRequests = await PremiumRequest.find({ status: 'pending' })
      .populate('userId', 'email name');
    res.json({ success: true, pendingRequests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
```

---

## 4️⃣ **Frontend: `Premium.jsx`**

```jsx
import axios from "axios";
import React, { useState } from "react";
import { BASE_URL } from "../utils/constants";

const Premium = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleBuyClick = (plan) => {
    setSelectedPlan(plan);
    setShowModal(true);
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText("7983476567@ibl");
    alert("✅ UPI ID copied to clipboard!");
  };

  const handleMarkAsPaid = async () => {
    setShowModal(false);
    try {
      const response = await axios.post(
        BASE_URL + "/premiumRequest",
        { plan: selectedPlan },
        { withCredentials: true }
      );

      if (response.data.success) {
        alert(response.data.message);
      } else {
        alert("❌ Error: " + response.data.message);
      }
    } catch (error) {
      console.error(error);
      alert("❌ Error: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-200">
        Choose Your Premium Plan
      </h1>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 max-w-4xl w-full">

        {/* Silver Plan */}
        <div className="bg-white shadow-2xl rounded-2xl p-6 flex flex-col justify-between items-center hover:scale-105 transition-transform duration-300 h-[480px] w-80">
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Silver Plan</h2>
            <ul className="text-gray-600 mb-4 text-left list-disc list-inside">
              <li>See who liked your profile</li>
              <li>Daily 10 profile boosts</li>
              <li>Advanced filters</li>
              <li>Premium communities</li>
            </ul>
            <p className="text-3xl font-bold text-gray-800 mb-4">₹799 / month</p>
          </div>
          <button
            onClick={() => handleBuyClick("Silver")}
            className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Buy Silver
          </button>
        </div>

        {/* Gold Plan */}
        <div className="bg-yellow-50 shadow-2xl rounded-2xl p-6 flex flex-col justify-between items-center border border-yellow-300 hover:scale-105 transition-transform duration-300 h-[480px] w-80">
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-yellow-700">Gold Plan</h2>
            <ul className="text-yellow-800 mb-4 text-left list-disc list-inside">
              <li>All Silver features</li>
              <li>Unlimited profile boosts</li>
              <li>Priority in search results</li>
              <li>Gold Verified badge</li>
              <li>Exclusive hackathon groups</li>
            </ul>
            <p className="text-3xl font-bold text-yellow-900 mb-4">₹1599 / month</p>
          </div>
          <button
            onClick={() => handleBuyClick("Gold")}
            className="bg-yellow-400 text-yellow-900 px-5 py-2 rounded-lg hover:bg-yellow-500 transition"
          >
            Buy Gold
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-80 text-center relative shadow-2xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-3 text-gray-400 hover:text-white transition"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold mb-4 text-white">Pay via UPI</h2>
            <img
              src="./src/assets/qrcode.png"
              alt="UPI QR"
              className="w-40 h-40 mx-auto mb-4 rounded-lg border border-gray-700"
            />
            <p className="text-gray-300 mb-2">Scan QR or pay to:</p>
            <div className="flex items-center justify-center bg-gray-800 rounded px-2 py-1 mb-4">
              <input
                type="text"
                value="7983476567@ibl"
                readOnly
                className="bg-transparent text-gray-100 text-center flex-1 outline-none"
              />
              <button
                onClick={handleCopyUPI}
                className="text-blue-400 hover:text-blue-500 ml-2"
                title="Copy UPI ID"
              >
                📋
              </button>
            </div>
            <p className="mb-4 text-white">
              Amount: {selectedPlan === "Silver" ? "₹799" : "₹1599"}
            </p>
            <button
              onClick={handleMarkAsPaid}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full"
            >
              I have paid
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Premium;
```

---

## 5️⃣ Additional setup:

✅ Add:

```env
ADMIN_SECRET="yourAdminPasswordHere"
```

to `.env` securely.
✅ Add `premiumRequestRouter` to your `app.js`:

```js
const premiumRequestRouter = require('./routes/premiumRequestRouter');
app.use("/api", premiumRequestRouter);
```

✅ **Push QR code** to:

```
src/assets/qrcode.png
```

for display in your modal.

---

## ✅ Flow Recap:

1️⃣ User pays via UPI manually and clicks **“I have paid.”**
2️⃣ Backend saves a **pending request** with plan and user.
3️⃣ Admin manually verifies UPI payment in bank app and approves using:

```
PATCH /approvePremiumRequest/:adminPass/:id
```

4️⃣ User becomes **Premium** (`Silver` or `Gold`).

---


