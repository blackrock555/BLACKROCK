/**
 * Encryption Verification Script
 *
 * Verifies that field-level encryption is working correctly:
 * 1. Tests encryption/decryption cycle
 * 2. Verifies encrypted data in MongoDB
 * 3. Confirms no plaintext sensitive data exists
 *
 * Usage:
 *   npx ts-node scripts/verify-encryption.ts
 *   # or
 *   npx tsx scripts/verify-encryption.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import {
  encrypt,
  decrypt,
  isEncrypted,
  validateEncryptionSetup,
} from '../lib/encryption/crypto';
import {
  USER_ENCRYPTED_FIELDS,
  KYC_REQUEST_ENCRYPTED_FIELDS,
  WITHDRAWAL_REQUEST_ENCRYPTED_FIELDS,
} from '../lib/encryption/fields-config';

interface VerificationResult {
  test: string;
  passed: boolean;
  details: string;
}

const results: VerificationResult[] = [];

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current: unknown, key: string) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/**
 * Test 1: Encryption Setup Validation
 */
async function testEncryptionSetup(): Promise<void> {
  console.log('\n🔑 Test 1: Encryption Setup Validation');

  try {
    const isValid = validateEncryptionSetup();
    results.push({
      test: 'Encryption Setup',
      passed: isValid,
      details: isValid
        ? 'Encryption key configured correctly'
        : 'Encryption key not configured or invalid',
    });
    console.log(isValid ? '   ✓ PASSED' : '   ✗ FAILED');
  } catch (error) {
    results.push({
      test: 'Encryption Setup',
      passed: false,
      details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
    console.log('   ✗ FAILED');
  }
}

/**
 * Test 2: Encryption/Decryption Cycle
 */
async function testEncryptionCycle(): Promise<void> {
  console.log('\n🔄 Test 2: Encryption/Decryption Cycle');

  const testCases = [
    'Simple text',
    'John Doe',
    '1990-01-15',
    '123-456-7890',
    '0x1eb17E4367F8D6aAF8C3cEC631f8e01103d7A716',
    'Special chars: @#$%^&*()!',
    'Unicode: 你好世界 مرحبا',
    'Long text: ' + 'a'.repeat(1000),
  ];

  let allPassed = true;

  for (const testCase of testCases) {
    try {
      const encrypted = encrypt(testCase);
      const decrypted = decrypt(encrypted);

      const passed = decrypted === testCase && isEncrypted(encrypted);

      if (!passed) {
        allPassed = false;
        console.log(`   ✗ Failed for: "${testCase.substring(0, 30)}..."`);
      }
    } catch (error) {
      allPassed = false;
      console.log(`   ✗ Error for: "${testCase.substring(0, 30)}..."`);
    }
  }

  results.push({
    test: 'Encryption/Decryption Cycle',
    passed: allPassed,
    details: allPassed
      ? 'All test cases passed'
      : 'Some test cases failed',
  });
  console.log(allPassed ? '   ✓ PASSED' : '   ✗ FAILED');
}

/**
 * Test 3: Verify Encrypted Data in Users Collection
 */
async function testUsersEncryption(): Promise<void> {
  console.log('\n👤 Test 3: Users Collection Encryption');

  try {
    const collection = mongoose.connection.collection('users');
    const users = await collection.find({}).limit(10).toArray();

    if (users.length === 0) {
      results.push({
        test: 'Users Encryption',
        passed: true,
        details: 'No users found - skipped',
      });
      console.log('   ⚠ No users found - skipped');
      return;
    }

    let encryptedCount = 0;
    let plaintextCount = 0;
    let emptyCount = 0;

    for (const user of users) {
      for (const field of USER_ENCRYPTED_FIELDS) {
        const value = getNestedValue(user as Record<string, unknown>, field);

        if (!value || typeof value !== 'string') {
          emptyCount++;
          continue;
        }

        if (isEncrypted(value)) {
          encryptedCount++;
        } else {
          plaintextCount++;
          console.log(`   ⚠ Plaintext found in user ${user._id}: ${field}`);
        }
      }
    }

    const passed = plaintextCount === 0;
    results.push({
      test: 'Users Encryption',
      passed,
      details: `Encrypted: ${encryptedCount}, Plaintext: ${plaintextCount}, Empty: ${emptyCount}`,
    });
    console.log(passed ? '   ✓ PASSED' : '   ✗ FAILED');
  } catch (error) {
    results.push({
      test: 'Users Encryption',
      passed: false,
      details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
    console.log('   ✗ FAILED');
  }
}

/**
 * Test 4: Verify Encrypted Data in KYC Requests Collection
 */
async function testKYCEncryption(): Promise<void> {
  console.log('\n📋 Test 4: KYC Requests Collection Encryption');

  try {
    const collection = mongoose.connection.collection('kycrequests');
    const kycRequests = await collection.find({}).limit(10).toArray();

    if (kycRequests.length === 0) {
      results.push({
        test: 'KYC Requests Encryption',
        passed: true,
        details: 'No KYC requests found - skipped',
      });
      console.log('   ⚠ No KYC requests found - skipped');
      return;
    }

    let encryptedCount = 0;
    let plaintextCount = 0;
    let emptyCount = 0;

    for (const kyc of kycRequests) {
      for (const field of KYC_REQUEST_ENCRYPTED_FIELDS) {
        const value = getNestedValue(kyc as Record<string, unknown>, field);

        if (!value || typeof value !== 'string') {
          emptyCount++;
          continue;
        }

        if (isEncrypted(value)) {
          encryptedCount++;
        } else {
          plaintextCount++;
          console.log(`   ⚠ Plaintext found in KYC ${kyc._id}: ${field}`);
        }
      }
    }

    const passed = plaintextCount === 0;
    results.push({
      test: 'KYC Requests Encryption',
      passed,
      details: `Encrypted: ${encryptedCount}, Plaintext: ${plaintextCount}, Empty: ${emptyCount}`,
    });
    console.log(passed ? '   ✓ PASSED' : '   ✗ FAILED');
  } catch (error) {
    results.push({
      test: 'KYC Requests Encryption',
      passed: false,
      details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
    console.log('   ✗ FAILED');
  }
}

/**
 * Test 5: Verify Encrypted Data in Withdrawals Collection
 */
async function testWithdrawalsEncryption(): Promise<void> {
  console.log('\n💸 Test 5: Withdrawals Collection Encryption');

  try {
    const collection = mongoose.connection.collection('withdrawalrequests');
    const withdrawals = await collection.find({}).limit(10).toArray();

    if (withdrawals.length === 0) {
      results.push({
        test: 'Withdrawals Encryption',
        passed: true,
        details: 'No withdrawals found - skipped',
      });
      console.log('   ⚠ No withdrawals found - skipped');
      return;
    }

    let encryptedCount = 0;
    let plaintextCount = 0;
    let emptyCount = 0;

    for (const withdrawal of withdrawals) {
      for (const field of WITHDRAWAL_REQUEST_ENCRYPTED_FIELDS) {
        const value = getNestedValue(withdrawal as Record<string, unknown>, field);

        if (!value || typeof value !== 'string') {
          emptyCount++;
          continue;
        }

        if (isEncrypted(value)) {
          encryptedCount++;
        } else {
          plaintextCount++;
          console.log(`   ⚠ Plaintext found in withdrawal ${withdrawal._id}: ${field}`);
        }
      }
    }

    const passed = plaintextCount === 0;
    results.push({
      test: 'Withdrawals Encryption',
      passed,
      details: `Encrypted: ${encryptedCount}, Plaintext: ${plaintextCount}, Empty: ${emptyCount}`,
    });
    console.log(passed ? '   ✓ PASSED' : '   ✗ FAILED');
  } catch (error) {
    results.push({
      test: 'Withdrawals Encryption',
      passed: false,
      details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
    console.log('   ✗ FAILED');
  }
}

/**
 * Test 6: Encrypted Values Are Not Readable
 */
async function testEncryptedValuesUnreadable(): Promise<void> {
  console.log('\n🔒 Test 6: Encrypted Values Not Readable Without Key');

  const testValue = 'John Doe';
  const encrypted = encrypt(testValue);

  // Verify the encrypted value doesn't contain the original text
  const containsPlaintext = encrypted.includes(testValue);
  const looksEncrypted = encrypted.startsWith('ENC:v1:');

  const passed = !containsPlaintext && looksEncrypted;

  results.push({
    test: 'Encrypted Values Unreadable',
    passed,
    details: passed
      ? 'Encrypted values do not contain plaintext'
      : 'Encrypted values may expose plaintext',
  });
  console.log(passed ? '   ✓ PASSED' : '   ✗ FAILED');
}

/**
 * Print Summary
 */
function printSummary(): void {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('                     Verification Summary');
  console.log('═══════════════════════════════════════════════════════════════\n');

  let passedCount = 0;
  let failedCount = 0;

  for (const result of results) {
    const status = result.passed ? '✓ PASSED' : '✗ FAILED';
    console.log(`${result.test.padEnd(35)} ${status}`);
    console.log(`${''.padEnd(35)} ${result.details}\n`);

    if (result.passed) {
      passedCount++;
    } else {
      failedCount++;
    }
  }

  console.log('───────────────────────────────────────────────────────────────');
  console.log(`Total: ${results.length} tests, ${passedCount} passed, ${failedCount} failed`);
  console.log('');

  if (failedCount > 0) {
    console.log('⚠️  Some tests failed. Please review the results above.');
    console.log('   - Run the migration script if data is not encrypted');
    console.log('   - Check FIELD_ENCRYPTION_KEY environment variable');
  } else {
    console.log('✅ All tests passed! Encryption is working correctly.');
  }
}

/**
 * Main function
 */
async function main(): Promise<void> {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('       BLACKROCK Encryption Verification Script');
  console.log('═══════════════════════════════════════════════════════════════');

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('\n❌ MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  console.log('\n🔌 Connecting to MongoDB...');

  try {
    await mongoose.connect(mongoUri);
    console.log('   ✓ Connected successfully');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }

  try {
    await testEncryptionSetup();
    await testEncryptionCycle();
    await testUsersEncryption();
    await testKYCEncryption();
    await testWithdrawalsEncryption();
    await testEncryptedValuesUnreadable();

    printSummary();
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run verification
main()
  .then(() => process.exit(results.some((r) => !r.passed) ? 1 : 0))
  .catch((error) => {
    console.error('Verification failed:', error);
    process.exit(1);
  });
