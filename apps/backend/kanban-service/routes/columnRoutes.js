const express = require('express');
const router = express.Router();
const Column = require('../model/Column');

// Create a new column
router.post('/', async (req, res) => {
  try {
    const column = new Column({ name: req.body.name });
    await column.save();
    res.status(201).json(column);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all columns
router.get('/', async (req, res) => {
  try {
    const columns = await Column.find();
    res.json(columns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
