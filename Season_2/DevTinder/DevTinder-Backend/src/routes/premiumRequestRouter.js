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

    res.json({ success: true, message: 'Premium request saved. We will verify and enable premium shortly.', requestId: newRequest._id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin approves premium manually
router.patch('/approvePremiumRequest/:adminPass/:id', adminAuth, async (req, res) => {
  try {
    const request = await PremiumRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    request.status = 'approved';
    request.approvedAt = new Date();
    await request.save();

    // You may also update the User model here to set user.premium = true or user.plan = request.plan

    res.json({ success: true, message: 'Premium request approved', request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin fetches pending requests for review
router.get('/pendingPremiumRequests/:adminPass', adminAuth, async (req, res) => {
  try {
    const pendingRequests = await PremiumRequest.find({ status: 'pending' }).populate('userId', 'email name');
    res.json({ success: true, pendingRequests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
