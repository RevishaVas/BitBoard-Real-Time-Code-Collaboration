const mongoose = require('mongoose');
const users = require('./dummyUsers');
const User = require('./model/User');

// Use your actual Mongo URI here if needed
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tasksDB';

const seedUsers = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await User.deleteMany(); // Optional: clear existing users
    const inserted = await User.insertMany(users);

    console.log(`Inserted ${inserted.length} users into tasksDB.Users`);
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    mongoose.connection.close();
  }
};

seedUsers();
