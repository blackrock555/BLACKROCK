/**
 * Script to make a user an admin
 *
 * Usage: npx ts-node scripts/make-admin.ts <email>
 * or: npx tsx scripts/make-admin.ts <email>
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI environment variable is not set');
  process.exit(1);
}

// User Schema (simplified version for the script)
const userSchema = new mongoose.Schema({
  email: String,
  role: String,
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function makeAdmin(email: string) {
  try {
    console.log(`Connecting to database...`);
    await mongoose.connect(MONGODB_URI as string);
    console.log('Connected to MongoDB');

    console.log(`Looking for user with email: ${email}`);
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.error(`Error: User with email "${email}" not found`);
      process.exit(1);
    }

    if (user.role === 'ADMIN') {
      console.log(`User "${email}" is already an admin`);
      process.exit(0);
    }

    // Update user role to ADMIN
    await User.updateOne(
      { email: email.toLowerCase() },
      { $set: { role: 'ADMIN' } }
    );

    console.log(`Success! User "${email}" has been made an admin`);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Get email from command line arguments
const email = process.argv[2] || 'mirzahamza9512@gmail.com';

console.log('='.repeat(50));
console.log('BLACKROCK Admin Role Assignment Script');
console.log('='.repeat(50));

makeAdmin(email);
