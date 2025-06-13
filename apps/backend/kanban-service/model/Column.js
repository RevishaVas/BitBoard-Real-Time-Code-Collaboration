const mongoose = require('mongoose');

const ColumnSchema = new mongoose.Schema({
  name: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Column', ColumnSchema);
