const express = require('express');
const router = express.Router();
const Message = require('../model/Message');
const User = require('../model/User');

router.post('/send', async (req, res) => {
  try {
    const { sender, receiver, message } = req.body;
    const msg = await Message.create({ sender, receiver, message });

    const io = req.app.get('io');
    if (io) {
      io.emit('newMessage', msg);
    }

    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

router.get('/history/:user1/:user2', async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    const history = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 }
      ]
    }).populate('sender receiver', 'name role');
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load chat history' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/chat/conversations/:userId
router.get('/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    });

    const participantIds = new Set();
    messages.forEach((msg) => {
      if (msg.sender != userId) participantIds.add(msg.sender.toString());
      if (msg.receiver != userId) participantIds.add(msg.receiver.toString());
    });

    const users = await User.find({ _id: { $in: [...participantIds] } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});


module.exports = router;