const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function makeAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);

  // Update existing user to admin
  const result = await mongoose.connection.db.collection('users').updateOne(
    { email: 'mirzahamza9512@gmail.com' },
    { $set: { role: 'ADMIN' } }
  );
  console.log('Updated to ADMIN:', result.modifiedCount, 'user(s)');

  // List all users with roles
  const users = await mongoose.connection.db.collection('users').find({}).project({ email: 1, role: 1 }).toArray();
  console.log('\nUsers:');
  users.forEach(u => console.log(' -', u.email, '(' + (u.role || 'USER') + ')'));

  await mongoose.disconnect();
}

makeAdmin();
