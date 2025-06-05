const express = require('express');
const router = express.Router();
const multer = require('multer');
const Task = require('../model/Task');
const { pub } = require('../redis/client'); // Redis publisher

// Multer config (store in memory instead of saving to disk)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * POST: Create Task with file in DB
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

    // Redis: Publish created task
    await pub.publish('taskCreated', JSON.stringify(task));

    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET: Fetch all tasks with populated assignee name
 */
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().populate('assignee', 'name'); // ✅ Populate assignee name
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET: Fetch single task by ID with populated assignee name
 */
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('assignee', 'name'); // ✅ Populate assignee name
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PATCH: Update task status (for drag-and-drop or edits)
 */
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('assignee', 'name'); // Optional: populate if needed for frontend

    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Redis: Publish updated task
    await pub.publish('taskUpdated', JSON.stringify(task));

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE: Delete a task by ID
 */
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Redis: Publish deleted task ID
    await pub.publish('taskDeleted', JSON.stringify({ id: task._id }));

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const Task = require('../model/Task');
// const { pub } = require('../redis/client'); // Redis publisher

// // Multer config (store in memory instead of saving to disk)
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// /**
//  * POST: Create Task with file in DB
//  */
// router.post('/', upload.single('attachment'), async (req, res) => {
//   try {
//     const taskData = {
//       title: req.body.title,
//       description: req.body.description,
//       assignee: req.body.assignee,
//       deadline: req.body.deadline,
//       status: req.body.status,
//     };

//     if (req.file) {
//       taskData.attachment = {
//         data: req.file.buffer.toString('base64'),
//         contentType: req.file.mimetype,
//       };
//     }

//     const task = new Task(taskData);
//     await task.save();

//     //Redis: Publish created task
//     await pub.publish('taskCreated', JSON.stringify(task));

//     res.status(201).json(task);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// /**
//  * GET: Fetch all tasks
//  */
// router.get('/', async (req, res) => {
//   try {
//     const tasks = await Task.find();
//     res.json(tasks);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// /**
//  * GET: Fetch single task by ID
//  */
// router.get('/:id', async (req, res) => {
//   try {
//     const task = await Task.findById(req.params.id);
//     if (!task) return res.status(404).json({ error: 'Task not found' });
//     res.json(task);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// /**
//  * PATCH: Update task status (for drag-and-drop or edits)
//  */
// router.patch('/:id', async (req, res) => {
//   try {
//     const { status } = req.body;
//     const task = await Task.findByIdAndUpdate(
//       req.params.id,
//       { status },
//       { new: true }
//     );
//     if (!task) return res.status(404).json({ error: 'Task not found' });

//     // Redis: Publish updated task
//     await pub.publish('taskUpdated', JSON.stringify(task));

//     res.json(task);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// /**
//  * DELETE: Delete a task by ID
//  */
// router.delete('/:id', async (req, res) => {
//   try {
//     const task = await Task.findByIdAndDelete(req.params.id);
//     if (!task) return res.status(404).json({ error: 'Task not found' });

//     //Redis: Publish deleted task ID
//     await pub.publish('taskDeleted', JSON.stringify({ id: task._id }));

//     res.json({ message: 'Task deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;
