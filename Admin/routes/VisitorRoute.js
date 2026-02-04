// ✅ Updated Visitor route.js to exclude localhost IPs

const express = require('express');
const axios = require('axios');
const Visitor = require('../models/Visitor');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

// ✅ GET all visitors
router.get('/', async (req, res) => {
  try {
    const visitors = await Visitor.find().sort({ createdAt: -1 });
    res.json(visitors);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch visitors', error });
  }
});

// ✅ Log visitor data
router.post('/admin-visitor', async (req, res) => {
  try {
    // ✅ Get real client IP
    let clientIp =
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.socket.remoteAddress ||
      req.ip;

    // ✅ Clean IPv6 (::ffff:127.0.0.1 → 127.0.0.1)
    if (clientIp?.includes('::ffff:')) {
      clientIp = clientIp.split('::ffff:')[1];
    }

    // ✅ Detect localhost
    const isLocalhost = ['::1', '127.0.0.1', '0.0.0.0'].includes(clientIp);

    // ✅ DEV MODE: rotate fake IPs
    const fakeIps = [
      "8.8.8.8",
      "1.1.1.1",
      "49.37.0.1",
      "91.198.174.192",
      "3.108.45.22"
    ];

    if (isLocalhost) {
      clientIp = fakeIps[Math.floor(Math.random() * fakeIps.length)];
    }

    // 🛑 DUPLICATE PREVENTION (🔥 THIS WAS MISSING)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const alreadyLogged = await Visitor.findOne({
      ip: clientIp,
      createdAt: { $gte: today }
    });

    if (alreadyLogged) {
      return res.status(200).send('Visitor already logged today');
    }

    // 🌍 Fetch geo info
    const response = await axios.get(`https://ipapi.co/${clientIp}/json`);
    const { city, region, country_name, postal } = response.data;

    // 💾 Save visitor
    const newVisitor = new Visitor({
      ip: clientIp,
      city: city || 'Unknown',
      region: region || 'Unknown',
      postalCode: postal || 'Unknown',
      country: country_name || 'Unknown'
    });

    await newVisitor.save();

    res.status(200).send('Visitor data logged successfully!');
  } catch (err) {
    console.error('Error logging visitor:', err.message);
    res.status(500).send('Error logging visitor data');
  }
});




// ✅ Count route
router.get('/count', async (req, res) => {
  try {
    const count = await Visitor.countDocuments();
    res.status(200).json({ count });
  } catch (err) {
    console.error("Error fetching visitor count", err);
    res.status(500).send('Error fetching visitor count');
  }
});

module.exports = router;