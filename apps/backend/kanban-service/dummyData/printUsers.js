require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../model/User');
require('dotenv').config({ path: '../.env' });


(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`🧠 Connected to: ${mongoose.connection.name}`);

    const users = await User.find();
    console.log(`👤 Found ${users.length} users:`);
    users.forEach(u => console.log(`${u._id} - ${u.name} (${u.role})`));

    mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
})();
