const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  dob: String,
  role: {
    type: String,
    enum: ['manager', 'member'],
  },
}, { collection: 'Users' });

module.exports = mongoose.model('User', userSchema);
