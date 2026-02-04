const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// POST — save message
router.post('/', async (req, res) => {
  try {
    await Contact.create(req.body);
    res.status(201).json({ message: "Message saved successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error saving message" });
  }
});

// GET — fetch all
router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch {
    res.status(500).json({ message: "Error fetching contacts" });
  }
});

router.get('/count', async (req, res) => {
  try {
    const count = await Contact.countDocuments();

    res.set('Cache-Control', 'no-store');   // 🔥 ADD THIS
    res.status(200).json({ count });

  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
});

module.exports = router;