const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./models/User');
  const hash = await bcrypt.hash('Admin@123', 10);
  await User.findOneAndUpdate(
    { email: 'admin@smartcampus.com' },
    { name: 'Super Admin', email: 'admin@smartcampus.com', password: hash, role: 'admin', isVerified: true },
    { upsert: true, new: true }
  );
  console.log('Admin created successfully!');
  process.exit();
}).catch(e => { console.error(e); process.exit(1); });