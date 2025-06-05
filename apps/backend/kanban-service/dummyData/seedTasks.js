const mongoose = require('mongoose');
const dummyTasks = require('./dummyTasks');
const Task = require('../model/Task');
const User = require('../model/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tasksDB';

const seedTasks = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    const users = await User.find();
    if (!users.length) {
      console.error("No users found. Please seed users first.");
      return;
    }

    // Assign real user IDs to tasks
    const tasksWithValidAssignees = dummyTasks.map(task => {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      return {
        ...task,
        assignee: randomUser._id
      };
    });

    await Task.deleteMany();
    const inserted = await Task.insertMany(tasksWithValidAssignees);
    console.log(`Inserted ${inserted.length} tasks.`);
  } catch (err) {
    console.error("Error seeding tasks:", err);
  } finally {
    mongoose.connection.close();
  }
};

seedTasks();

// const mongoose = require('mongoose');
// const tasks = require('./dummyTasks');
// const Task = require('../model/Task');

// const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tasksDB';

// const seedTasks = async () => {
//   try {
//     await mongoose.connect(MONGO_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });

//     await Task.deleteMany();
//     const inserted = await Task.insertMany(tasks);

//     console.log(`Inserted ${inserted.length} tasks.`);
//   } catch (err) {
//     console.error('Error seeding tasks:', err);
//   } finally {
//     mongoose.connection.close();
//   }
// };

// seedTasks();
