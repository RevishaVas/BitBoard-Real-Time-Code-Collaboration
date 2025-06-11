const mongoose = require('mongoose');
const reactionSchema = new mongoose.Schema({
  userId: String,  
  emoji: String    
});

const commentSchema = new mongoose.Schema({
  taskId: { type: String, required: true },
  author: String,
  text: String,
   mentions: [{ type: String }], 
  parentCommentId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
   reactions: [reactionSchema],

});

module.exports = mongoose.model('Comment', commentSchema);
