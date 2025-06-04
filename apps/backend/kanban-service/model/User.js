const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  dob: String,
  role: {
    type: String,
    enum: ['developer', 'collaborator', 'project member', 'project manager'],
  },
}, { collection: 'Users' });

module.exports = mongoose.model('User', userSchema);
