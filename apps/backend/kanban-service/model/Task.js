const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  attachment: {
    data: String,        
    contentType: String  
  },
  assignee: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
},
  deadline: Date,
  status: String,
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
