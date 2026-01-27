/**
 * Database Seed Script for BLACKROCK
 *
 * Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/seed.ts
 * Or add to package.json: "seed": "ts-node scripts/seed.ts"
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blackrock';

// User Schema (simplified for seeding)
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  role: { type: String, default: 'USER' },
  status: { type: String, default: 'ACTIVE' },
  balance: { type: Number, default: 0 },
  depositBalance: { type: Number, default: 0 },
  referralCode: { type: String, unique: true },
  referralCount: { type: Number, default: 0 },
  kycStatus: { type: String, default: 'NOT_SUBMITTED' },
  emailVerified: Date,
  provider: { type: String, default: 'credentials' },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Generate unique referral code
function generateReferralCode(prefix = 'BR') {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = prefix;
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function seed() {
  console.log('🌱 Starting database seed...\n');

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data (optional - comment out in production)
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    console.log('✅ Cleared existing users\n');

    // Create Admin User
    console.log('👤 Creating admin user...');
    const adminPassword = await bcrypt.hash('Admin123!', 12);
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@blackrock.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      balance: 0,
      depositBalance: 0,
      referralCode: 'BRADMIN001',
      referralCount: 0,
      kycStatus: 'APPROVED',
      emailVerified: new Date(),
      provider: 'credentials',
    });
    console.log(`✅ Admin created: ${admin.email} (password: Admin123!)\n`);

    // Create Test Users
    console.log('👥 Creating test users...');
    const testUserPassword = await bcrypt.hash('User123!', 12);

    const testUsers = [
      {
        name: 'John Doe',
        email: 'john@test.com',
        balance: 1500,
        depositBalance: 1000,
        kycStatus: 'APPROVED',
      },
      {
        name: 'Jane Smith',
        email: 'jane@test.com',
        balance: 5000,
        depositBalance: 4500,
        kycStatus: 'APPROVED',
      },
      {
        name: 'Bob Wilson',
        email: 'bob@test.com',
        balance: 250,
        depositBalance: 200,
        kycStatus: 'PENDING',
      },
      {
        name: 'Alice Brown',
        email: 'alice@test.com',
        balance: 0,
        depositBalance: 0,
        kycStatus: 'NOT_SUBMITTED',
      },
      {
        name: 'Charlie Davis',
        email: 'charlie@test.com',
        balance: 15000,
        depositBalance: 12000,
        kycStatus: 'APPROVED',
      },
    ];

    for (const userData of testUsers) {
      const user = await User.create({
        ...userData,
        passwordHash: testUserPassword,
        role: 'USER',
        status: 'ACTIVE',
        referralCode: generateReferralCode(),
        referralCount: Math.floor(Math.random() * 10),
        emailVerified: new Date(),
        provider: 'credentials',
      });
      console.log(`  ✅ Created: ${user.email} (${user.name})`);
    }

    console.log('\n📊 Seed Summary:');
    console.log('================');
    console.log('Admin Account:');
    console.log('  Email: admin@blackrock.com');
    console.log('  Password: Admin123!');
    console.log('');
    console.log('Test Accounts:');
    console.log('  Password for all: User123!');
    console.log('  - john@test.com (balance: $1,500, KYC: Approved)');
    console.log('  - jane@test.com (balance: $5,000, KYC: Approved)');
    console.log('  - bob@test.com (balance: $250, KYC: Pending)');
    console.log('  - alice@test.com (balance: $0, KYC: Not Submitted)');
    console.log('  - charlie@test.com (balance: $15,000, KYC: Approved)');
    console.log('');
    console.log('🎉 Database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

seed();
