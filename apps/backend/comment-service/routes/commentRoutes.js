const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const axios = require('axios');
const upload = require('../middleware/uploadMiddleware'); 

const KANBAN_URL = process.env.KANBAN_API_URL; 

//Add comment or reply, with mentions,attachment
router.post('/:taskId/comments', upload.single('attachment'), async (req, res) => {
  const { author, text, parentCommentId, mentions } = req.body;
  const taskId = req.params.taskId;

  try {

    await axios.get(`${KANBAN_URL}/tasks/${taskId}`);

    let attachment;
    if (req.file) {
      attachment = {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
        url: `/uploads/${req.file.filename}`
      };
    }

    const comment = new Comment({
      taskId,
      author,
      text,
      mentions: mentions ? JSON.parse(mentions) : [],
      parentCommentId: parentCommentId || null,
      attachment
    });

    await comment.save();
    res.status(201).json(comment);
  } catch (err) {
    console.error(' Error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Edit comment including mentions and optional new file
router.put('/comments/:commentId', upload.single('attachment'), async (req, res) => {
  const { text, mentions } = req.body;

  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    if (text) comment.text = text;
    if (mentions) comment.mentions = JSON.parse(mentions);

    if (req.file) {
      comment.attachment = {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
        url: `/uploads/${req.file.filename}`
      };
    }

    await comment.save();
    res.json({ message: 'Comment updated', comment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete comment
router.delete('/comments/:commentId', async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    await comment.deleteOne();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get ALL comments for a task 
router.get('/:taskId/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ taskId: req.params.taskId });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get replies for a comment
router.get('/comments/:commentId/replies', async (req, res) => {
  try {
    const replies = await Comment.find({ parentCommentId: req.params.commentId });
    res.json(replies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// React reaction on comment
router.patch('/comments/:commentId/reactions', async (req, res) => {
  const { userId, emoji } = req.body;
  const { commentId } = req.params;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    const existingIndex = comment.reactions.findIndex(
      (r) => r.userId === userId && r.emoji === emoji
    );

    if (existingIndex !== -1) {
    
      comment.reactions.splice(existingIndex, 1);
    } else {
   
      comment.reactions.push({ userId, emoji });
    }

    await comment.save();
    res.json({ message: 'Reaction updated', reactions: comment.reactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
