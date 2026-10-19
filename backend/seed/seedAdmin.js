require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin'); // correct path

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    await Admin.deleteMany({}); // clear old admins

    const hashed = await bcrypt.hash('admin123', 10);

    await Admin.create({
      email: 'admin@example.com',
      password: hashed
    });

    console.log('✅ Admin seeded successfully');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
