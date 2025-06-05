const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  dob: String,
  role: {
    type: String,
    enum: ['admin', 'guest'],
  },
}, { collection: 'Users' });

module.exports = mongoose.model('User', userSchema);
