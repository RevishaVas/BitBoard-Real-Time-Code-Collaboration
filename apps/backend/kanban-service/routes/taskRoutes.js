const express = require('express');
const router = express.Router();
const multer = require('multer');
const Task = require('../model/Task');

// Multer config (store in memory instead of saving to disk)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// POST: Create Task with file in DB
router.post('/', upload.single('attachment'), async (req, res) => {
  try {
    const taskData = {
      title: req.body.title,
      description: req.body.description,
      assignee: req.body.assignee,
      deadline: req.body.deadline,
      status: req.body.status,
    };

    // If file is attached
    if (req.file) {
      taskData.attachment = {
        data: req.file.buffer.toString('base64'),
        contentType: req.file.mimetype,
      };
    }

    const task = new Task(taskData);
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/test', async (req, res) => {
  const tasks = await Task.find(); // show all
  res.json(tasks);
});

// GET: Get a single task by ID
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;


// const express = require('express');
// const router = express.Router();
// const Task = require('../model/Task');

// // Create new task
// router.post('/', async (req, res) => {
//   try {
//     const task = new Task(req.body);
//     await task.save();
//     res.status(201).json(task);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // Get all tasks
// router.get('/', async (req, res) => {
//   try {
//     const tasks = await Task.find();
//     res.json(tasks);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;
