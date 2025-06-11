const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const axios = require('axios');

const KANBAN_URL = process.env.KANBAN_API_URL;

router.post('/:taskId/comments', async (req, res) => {
  const { author, text } = req.body;
  const taskId = req.params.taskId;

  try {
    await axios.get(`${KANBAN_URL}/tasks/${taskId}`);

    const comment = new Comment({
      taskId,
      author,
      text
    });

    await comment.save();
    res.status(201).json(comment);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

router.put('/comments/:commentId', async (req, res) => {
  const { text } = req.body;

  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    if (text) comment.text = text;

    await comment.save();
    res.json({ message: 'Comment updated', comment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
