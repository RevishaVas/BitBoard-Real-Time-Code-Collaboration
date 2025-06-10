const express = require('express');
const router = express.Router();
const multer = require('multer');
const Task = require('../model/Task');
const { pub } = require('../redis/client');

// Multer config (store in memory instead of saving to disk)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * POST: Create Task with optional file upload
 */
router.post('/', upload.single('attachment'), async (req, res) => {
  try {
    const taskData = {
      title: req.body.title,
      description: req.body.description,
      assignee: req.body.assignee,
      deadline: req.body.deadline,
      status: req.body.status,
    };

    if (req.file) {
      taskData.attachment = {
        data: req.file.buffer.toString('base64'),
        contentType: req.file.mimetype,
      };
    }

    const task = new Task(taskData);
    await task.save();

    await pub.publish('taskCreated', JSON.stringify(task));
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET: Fetch all tasks (admin view)
 */
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().populate('assignee', 'name');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET: Fetch tasks assigned to a specific user (My Tasks View)
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const tasks = await Task.find({ assignee: req.params.userId }).populate('assignee', 'name');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET: Fetch single task by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('assignee', 'name');
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PATCH: Update task (title, description, status, assignee, deadline)
 */
router.patch('/:id', async (req, res) => {
  try {
    const updateFields = {
      title: req.body.title,
      description: req.body.description,
      assignee: req.body.assignee,
      deadline: req.body.deadline,
      status: req.body.status,
    };

    // Clean undefined fields
    Object.keys(updateFields).forEach((key) => {
      if (updateFields[key] === undefined) delete updateFields[key];
    });

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    ).populate('assignee', 'name');

    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await pub.publish('taskUpdated', JSON.stringify(updatedTask));
    res.status(200).json(updatedTask); // ✅ Ensure JSON response always sent
  } catch (err) {
    console.error("PATCH error:", err);
    res.status(500).json({ error: err.message || 'Internal Server Error' }); // ✅ Always send JSON
  }
});


/**
 * DELETE: Remove task
 */
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    await pub.publish('taskDeleted', JSON.stringify({ id: task._id }));
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
