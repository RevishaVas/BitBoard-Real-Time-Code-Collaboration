const mongoose = require('mongoose');
const users = require('./dummyUsers');
const User = require('../model/User');

require('dotenv').config({ path: '../.env' });


// Use your actual Mongo URI here if needed
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tasksDB';

const seedUsers = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`🌐 Connected to DB: ${mongoose.connection.name}`);


    await User.deleteMany(); // Optional: clear existing users
    const inserted = await User.insertMany(users);

    console.log(`Inserted ${inserted.length} users into tasksDB.Users`);
     const count = await User.countDocuments();
    console.log(`DB has ${count} users after insert`);
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    mongoose.connection.close();
  }
};

seedUsers();
