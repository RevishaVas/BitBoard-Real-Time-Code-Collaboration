const mongoose = require('mongoose');
const columns = require('./dummyColumns');
const Column = require('../model/Column');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tasksDB';

const seedColumns = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await Column.deleteMany();
    const inserted = await Column.insertMany(columns);

    console.log(`Inserted ${inserted.length} columns.`);
  } catch (err) {
    console.error('Error seeding columns:', err);
  } finally {
    mongoose.connection.close();
  }
};

seedColumns();
