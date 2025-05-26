const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  attachment: {
    data: String,        // Base64 string
    contentType: String  // e.g., image/png, application/pdf
  },
  assignee: String,
  deadline: Date,
  status: String,
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
