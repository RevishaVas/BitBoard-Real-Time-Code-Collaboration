const express = require('express');
const router = express.Router();
const User = require('../model/User');

// GET: All users
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, 'name'); // Only fetch names and _id
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: User name
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name'); // select only the name
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
