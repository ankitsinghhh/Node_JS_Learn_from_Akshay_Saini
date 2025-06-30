
# Lecture - 4  : Sending Emails

---

## 🚩 What is Amazon SES?

* **SES = Simple Email Service** by AWS.
* Allows **sending transactional, notification, or marketing emails** reliably at scale.
* Integrates easily with Node.js/Express backend for:

  * Welcome emails
  * OTP/password reset
  * Notifications to users

---

## ✅ Step 1: Log in and select **Mumbai region**

* Go to [AWS Console](https://console.aws.amazon.com/).
* Select **Asia Pacific (Mumbai)** region (to avoid latency and regulatory issues).

---

## ✅ Step 2: Create an IAM User for SES

1️⃣ Go to **IAM** from AWS services.
2️⃣ On **Dashboard → Users → Add Users**:

* Username: `ses-user`
* Next.

3️⃣ Under **Permissions → Attach Policies Directly**:

* Search: `AmazonSESFullAccess`.
* Select and click **Next**.

4️⃣ Click **Create User**.
✅ IAM user with SES permissions created.

---

## ✅ Step 3: Go to **Amazon SES Dashboard**

1️⃣ Search `SES` in AWS Console.
2️⃣ Click **Amazon Simple Email Service**.
3️⃣ On the SES dashboard, if prompted, click **View Get Setup page**.

---

## ✅ Step 4: Verify Domain Name on SES

You must **verify your domain to send emails** using SES.

1️⃣ Click **Create Identity**.
2️⃣ Under **Identity Type**, select **Domain**.
3️⃣ Enter your domain: `devtinder.in`.
4️⃣ DKIM settings:

* **Easy DKIM** (recommended).
* Key length: `RSA_2048_BIT`.
* Keep **Publish DNS records to Route 53** checked (skip if using Cloudflare).
* Enable DKIM signatures.

5️⃣ Click **Create Identity**.

---

## ✅ Step 5: Configure DNS Records on Cloudflare

SES will prompt you to **verify your domain** by adding **three CNAME records**.

1️⃣ Copy the **three CNAME records** shown under **Publish DNS Records** in SES.
2️⃣ Go to **Cloudflare Dashboard → DNS → devtinder.in**.
3️⃣ Add the **three CNAME records** one by one:

* Name, Target, TTL as provided by AWS SES.
* Turn **Proxy off** (must show as ☁️ gray, not orange).
* Save.

4️⃣ AWS SES will automatically verify the domain once DNS propagation completes (**may take 5-30 minutes**).

---

## ✅ Status:

* Once verified, your **domain status will show "Verified"** in SES.
* DKIM status will also show as **Successful**.

---

## 🚩 What next? (Using SES in your backend)

Once domain verification completes:
✅ You can **generate SMTP credentials** or use **AWS SDK (via IAM user)** to:

* Send welcome emails.
* Send OTPs/password reset emails.
* Notify users on DevTinder for matches/messages.

---

## 🚩 Why use Amazon SES?

✅ Reliable email delivery with high deliverability rates.
✅ Cheaper than services like SendGrid/Mailgun.
✅ Easy integration with Node.js using:

* **AWS SDK (`@aws-sdk/client-ses`)**
* **Nodemailer with SMTP using SES**

---

## ⚡ If you wish next:

I can prepare:
✅ A **Node.js SES email sending function** for your backend.
✅ Setup for **SMTP credentials generation**.
✅ SES sandbox removal instructions (to send emails to any address).

---

## 📌 Recap:

✅ Signed in and selected Mumbai region.
✅ Created IAM user with SES permissions.
✅ Added domain for SES verification.
✅ Configured DNS on Cloudflare.
✅ Domain now ready for sending secure emails via Amazon SES.



---

## 🚩 Step Recap: Moving SES from Sandbox to Production

✅ After **domain verification** on SES:
1️⃣ Go to **Get Started page**.
2️⃣ Click **Request Production Access**.

* Choose **Transactional**.
* Provide your website URL (e.g., `https://devtinder.in`).
* Submit the request (AWS typically approves within hours).

**Why?** SES in **sandbox mode** allows sending emails only to verified addresses. Moving to **production** lets you send emails to any user.

---

## 🚩 Step: Create IAM Access Keys for SES

1️⃣ Go to **IAM → Users → ses-user → Security Credentials**.
2️⃣ Create **Access Keys**:

* Click **Create access key**.
* Choose **Other**.
* Skip tags.
* Click **Create**.
* Copy `AWS_ACCESS_KEY` and `AWS_SES_SECRET_KEY`.

✅ Add these to your backend `.env`:

```
AWS_ACCESS_KEY=your_key_here
AWS_SES_SECRET_KEY=your_secret_key_here
```

---

## 🚩 Step: Install SES SDK

In your DevTinder Backend:

```bash
npm install @aws-sdk/client-ses
```

---

## 🚩 Step: SES Integration in Code

### 1️⃣ Create `sesClient.js` inside `utils/`

```js
const { SESClient } = require("@aws-sdk/client-ses");

const REGION = "ap-south-1"; // Mumbai region

const sesClient = new SESClient({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SES_SECRET_KEY,
  },
});

module.exports = { sesClient };
```

**Why?**
Creates a **singleton SES client** for re-use across your backend to send emails securely.

---

### 2️⃣ Create `sendEmail.js` inside `utils/`

```js
const { SendEmailCommand } = require("@aws-sdk/client-ses");
const { sesClient } = require("./sesClient.js");

const createSendEmailCommand = (toAddress, fromAddress) => {
  return new SendEmailCommand({
    Destination: { ToAddresses: [toAddress] },
    Message: {
      Body: {
        Html: { Charset: "UTF-8", Data: "<h1>Welcome to DevTinder!</h1><p>Thanks for joining.</p>" },
        Text: { Charset: "UTF-8", Data: "Welcome to DevTinder! Thanks for joining." },
      },
      Subject: { Charset: "UTF-8", Data: "Welcome to DevTinder!" },
    },
    Source: fromAddress,
  });
};

const run = async () => {
  const sendEmailCommand = createSendEmailCommand(
    "ankitsingh79834@gmail.com", // Replace with recipient user email dynamically
    "ankit@devtinder.in"         // Replace with your verified sender domain email
  );

  try {
    return await sesClient.send(sendEmailCommand);
  } catch (error) {
    if (error instanceof Error && error.name === "MessageRejected") {
      return error;
    }
    throw error;
  }
};

module.exports = { run };
```

---

## 🚩 Step: Using SES in Your Route

In `requestRouter.js`, inside your:

```js
requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
```

after saving the connection request:

```js
const data = await connectionRequest.save();

const emailRes = await sendEmail.run();
console.log(emailRes);
```

✅ This sends an email automatically when a request is sent.

---

## 🚩 Why Amazon SES?

✅ **Cost-effective**: much cheaper than SendGrid or Mailgun.
✅ **High deliverability**: uses AWS infrastructure and DKIM/SPF signed emails.
✅ **Scalable**: can send transactional, notification, or marketing emails reliably.
✅ **Works well with AWS stack**.

---

## 🚩 Where to check email sending logs?

* SES Dashboard → **Sending Statistics** to view metrics.
* Use `pm2 logs` in your backend server to debug in real-time.

---

## 🚩 Final Checklist:

✅ Domain verified on SES.
✅ Production access approved.
✅ IAM access keys generated and saved in `.env`.
✅ SDK installed and SES client created.
✅ Email sending code integrated and tested.
✅ Ready for sending transactional emails in your DevTinder backend!


---

## 🚩 Recap: Email Sent Successfully

✅ Your `emailRes`:

```json
{
  "$metadata": { httpStatusCode: 200, ... },
  "MessageId": "01100197c1011761-..."
}
```

means **Amazon SES has successfully accepted your email for delivery**.

---

## 🚩 Making SES Emails Dynamic

You have now **parameterized subject and body** to send personalized emails, such as:

```js
const emailRes = await sendEmail.run(
  "A new Connection Request from " + req.user.firstName,
  req.user.firstName + "'s status for " + toUserIdExists.firstName + " is now " + status
);
```

---

## 🚩 Code Modifications Done

### 1️⃣ Modify `run` function

```js
const run = async (subject, body) => {
  const sendEmailCommand = createSendEmailCommand(
    "recipient@example.com",    // Replace with dynamic user email later
    "sender@devtinder.in",      // Verified SES domain email
    subject,
    body
  );

  try {
    return await sesClient.send(sendEmailCommand);
  } catch (caught) {
    if (caught instanceof Error && caught.name === "MessageRejected") {
      return caught;
    }
    throw caught;
  }
};

module.exports = { run };
```

✅ This allows you to **pass any subject/body dynamically** for different emails.

---

### 2️⃣ Modify `createSendEmailCommand` function

```js
const createSendEmailCommand = (toAddress, fromAddress, subject, body) => {
  return new SendEmailCommand({
    Destination: {
      ToAddresses: [toAddress],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: `<h1>${body}</h1>`,
        },
        Text: {
          Charset: "UTF-8",
          Data: body,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },
    Source: fromAddress,
  });
};
```

✅ This dynamically injects:

* **`subject`** for clear email context.
* **`body`** as both HTML and plain text.

---

## 🚩 Important Note: Sandbox Mode

⚠️ **While your SES account is in Sandbox Mode:**

✅ You can **only send emails to verified email addresses** (both sender and recipient).
✅ Once your account is in **production**, you can send emails to any address globally.

---

## 🚩 Why is this important?

✅ You can now:

* **Send personalized transactional emails** (e.g., connection request, password reset, OTP).
* Improve **user engagement** on DevTinder.
* Use SES for **production-scale notifications at low cost**.

---

## 🚩 Next Possible Improvements

✅ Dynamically replace:

* `"recipient@example.com"` with the **actual user’s email**.
* `"sender@devtinder.in"` should match your verified SES domain.

✅ Use a **template generator** for HTML to create beautiful emails.
✅ Implement a **queue system** (like SQS) for email jobs if sending large volumes.
✅ Log emails sent for auditing in your database if needed.

---

## 🚩 Summary

✅ You have **SES email sending fully working and dynamic** in your backend:
✅ Can now send personalized connection notifications on user actions.
✅ Ready for production after SES is moved out of the sandbox.
✅ Scalable, cost-efficient, and aligned with your DevTinder production roadmap.

---

