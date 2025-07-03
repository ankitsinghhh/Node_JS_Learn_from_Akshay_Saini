const express = require("express");
const Razorpay = require("razorpay");
const { userAuth } = require("../middlewares/auth");
const razorpayRouter = express.Router();
const razorpayInstance = require("../utils/razorpay");
const Payment = require("../models/payments");
const { membershipAmount } = require("../utils/constants");
const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");
const User = require("../models/user");

razorpayRouter.post("/payment/create", userAuth, async (req, res) => {
  try {
    const { membershipType } = req.body;
    const { firstName, lastName, email } = req.user;

    const order = await razorpayInstance.orders.create({
      amount: membershipAmount[membershipType] * 100, //this means 50000 paisa that is 500 rupees
      currency: "INR",
      receipt: "receipt#1",
      notes: {
        firstName: firstName,
        lastName: lastName,
        email: email,
        membershipType: membershipType,
      },
    });

    // console.log(order)
    //save it in database
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

    //return back the order details to the frontend

    // res.json({order});
    res.json({ ...savedPayment.toJSON(), keyId: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: err.message });
  }
});

razorpayRouter.post("/payment/webhook", async (req, res) => {
    console.log("webhook called")
  const webhookSignature = req.get("X-Razorpay-Signature");
  const isWebhookValid = await validateWebhookSignature(
    JSON.stringify(req.body),
    webhookSignature,
    process.env.RAZORPAY_WEBHOOK_SECRET
  );

  if (!isWebhookValid) {
    return res.status(400).json({ msg: "Invalid webhook signature" });
  }

  //update the payment status in the database
  const paymentDetails = req.body.payload.payment.entity;

  const payment = await Payment.findOne({
        orderId: paymentDetails.order_id
  })
  payment.status = paymentDetails.status;
  await payment.save();

  //update the user as premium

  const user = await User.findOne({ _id: payment.userId });

//   user.isPremium = true
//   user.membershipType = payment.notes.membershipType
//   await user.save()

    // Only mark user as premium if payment is successful
    if (paymentDetails.status === "captured") {
        const user = await User.findOne({ _id: payment.userId });
    
        user.isPremium = true;
        user.membershipType = payment.notes.membershipType;
        await user.save();
      }



  //return success response to razorpay as the webhook will kept sent if it doesn't the 200 success status from the backend
  return res.status(200).json({ msg: "Webhook reived successfully" });
});

razorpayRouter.get(
    "/premium/verify",
    userAuth,
    async (req,res) =>{
        const user = req.user
        if(user.isPremium){
            return res.json({ isPremium: true });
        }
        return res.json({ isPremium: false });

    }
)

module.exports = razorpayRouter;
