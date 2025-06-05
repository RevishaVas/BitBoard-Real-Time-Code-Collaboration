const mongoose = require('mongoose');
const tasks = require('./dummyTasks');
const Task = require('../model/Task');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tasksDB';

const seedTasks = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await Task.deleteMany();
    const inserted = await Task.insertMany(tasks);

    console.log(`Inserted ${inserted.length} tasks.`);
  } catch (err) {
    console.error('Error seeding tasks:', err);
  } finally {
    mongoose.connection.close();
  }
};

seedTasks();
