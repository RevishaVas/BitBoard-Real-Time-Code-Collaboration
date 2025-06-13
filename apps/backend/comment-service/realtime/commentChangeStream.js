const Comment = require('../models/Comment');

function watchComments(io) {
  const changeStream = Comment.watch();

  changeStream.on('change', (change) => {
    switch (change.operationType) {
      case 'insert':
        io.emit('commentAdded', change.fullDocument);
        break;

      case 'update':
        io.emit('commentUpdated', {
          _id: change.documentKey._id,
          updates: change.updateDescription.updatedFields
        });
        break;

      case 'delete':
        io.emit('commentDeleted', change.documentKey._id);
        break;

      default:
        console.log('Unhandled operation type:', change.operationType);
    }
  });

  console.log('Watching comment collection for changes...');
}

module.exports = watchComments;
