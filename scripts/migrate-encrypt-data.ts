/**
 * Data Migration Script: Encrypt Existing Data
 *
 * This script encrypts all existing sensitive data in the MongoDB database.
 * Run this ONCE after deploying the encryption changes.
 *
 * IMPORTANT:
 * - Backup your database before running this script
 * - Set FIELD_ENCRYPTION_KEY environment variable before running
 * - This script is idempotent - already encrypted data will be skipped
 *
 * Usage:
 *   npx ts-node scripts/migrate-encrypt-data.ts
 *   # or
 *   npx tsx scripts/migrate-encrypt-data.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Import encryption utilities
import { encrypt, isEncrypted, validateEncryptionSetup } from '../lib/encryption/crypto';
import {
  USER_ENCRYPTED_FIELDS,
  KYC_REQUEST_ENCRYPTED_FIELDS,
  WITHDRAWAL_REQUEST_ENCRYPTED_FIELDS,
  DEPOSIT_REQUEST_ENCRYPTED_FIELDS,
  TRANSACTION_ENCRYPTED_FIELDS,
  CERTIFICATE_ENCRYPTED_FIELDS,
} from '../lib/encryption/fields-config';

// Migration statistics
interface MigrationStats {
  collection: string;
  total: number;
  encrypted: number;
  skipped: number;
  errors: number;
}

const stats: MigrationStats[] = [];

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
 * Set nested value in object using dot notation
 */
function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split('.');
  const lastKey = keys.pop();

  if (!lastKey) return;

  let current = obj;
  for (const key of keys) {
    if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }

  current[lastKey] = value;
}

/**
 * Encrypt a single document's specified fields
 */
function encryptDocumentFields(
  doc: Record<string, unknown>,
  fields: readonly string[]
): { encrypted: boolean; doc: Record<string, unknown> } {
  let encrypted = false;

  for (const field of fields) {
    const value = getNestedValue(doc, field);

    // Skip if no value, not a string, or already encrypted
    if (!value || typeof value !== 'string') continue;
    if (isEncrypted(value)) continue;

    try {
      const encryptedValue = encrypt(value);
      setNestedValue(doc, field, encryptedValue);
      encrypted = true;
    } catch (error) {
      console.error(`  Error encrypting field ${field}:`, error);
    }
  }

  return { encrypted, doc };
}

/**
 * Migrate a collection's documents
 */
async function migrateCollection(
  collectionName: string,
  fields: readonly string[]
): Promise<MigrationStats> {
  console.log(`\n📦 Migrating collection: ${collectionName}`);
  console.log(`   Fields to encrypt: ${fields.join(', ')}`);

  const collection = mongoose.connection.collection(collectionName);
  const cursor = collection.find({});

  const stat: MigrationStats = {
    collection: collectionName,
    total: 0,
    encrypted: 0,
    skipped: 0,
    errors: 0,
  };

  while (await cursor.hasNext()) {
    const doc = (await cursor.next()) as Record<string, unknown>;
    if (!doc) continue;

    stat.total++;

    try {
      const { encrypted, doc: encryptedDoc } = encryptDocumentFields(doc, fields);

      if (encrypted) {
        await collection.updateOne(
          { _id: doc._id },
          { $set: encryptedDoc }
        );
        stat.encrypted++;
        process.stdout.write('.');
      } else {
        stat.skipped++;
      }
    } catch (error) {
      stat.errors++;
      console.error(`\n  Error processing document ${doc._id}:`, error);
    }
  }

  console.log(`\n   ✓ Total: ${stat.total}, Encrypted: ${stat.encrypted}, Skipped: ${stat.skipped}, Errors: ${stat.errors}`);

  return stat;
}

/**
 * Main migration function
 */
async function runMigration(): Promise<void> {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('       BLACKROCK Data Encryption Migration Script');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  // Validate environment
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  // Validate encryption setup
  console.log('🔑 Validating encryption setup...');
  if (!validateEncryptionSetup()) {
    console.error('❌ Encryption setup validation failed');
    console.error('   Ensure FIELD_ENCRYPTION_KEY is set correctly');
    process.exit(1);
  }
  console.log('   ✓ Encryption setup validated');

  // Connect to MongoDB
  console.log('\n🔌 Connecting to MongoDB...');
  try {
    await mongoose.connect(mongoUri);
    console.log('   ✓ Connected successfully');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }

  console.log('\n⚠️  IMPORTANT: Ensure you have a database backup before proceeding!');
  console.log('   This migration will encrypt existing plaintext data.');
  console.log('');

  try {
    // Migrate each collection
    stats.push(await migrateCollection('users', USER_ENCRYPTED_FIELDS));
    stats.push(await migrateCollection('kycrequests', KYC_REQUEST_ENCRYPTED_FIELDS));
    stats.push(await migrateCollection('withdrawalrequests', WITHDRAWAL_REQUEST_ENCRYPTED_FIELDS));
    stats.push(await migrateCollection('depositrequests', DEPOSIT_REQUEST_ENCRYPTED_FIELDS));
    stats.push(await migrateCollection('transactions', TRANSACTION_ENCRYPTED_FIELDS));
    stats.push(await migrateCollection('withdrawalcertificates', CERTIFICATE_ENCRYPTED_FIELDS));

    // Print summary
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('                     Migration Summary');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');

    let totalDocs = 0;
    let totalEncrypted = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    for (const s of stats) {
      totalDocs += s.total;
      totalEncrypted += s.encrypted;
      totalSkipped += s.skipped;
      totalErrors += s.errors;

      console.log(`${s.collection.padEnd(25)} Total: ${s.total}, Encrypted: ${s.encrypted}, Skipped: ${s.skipped}, Errors: ${s.errors}`);
    }

    console.log('─────────────────────────────────────────────────────────────');
    console.log(`${'TOTAL'.padEnd(25)} Total: ${totalDocs}, Encrypted: ${totalEncrypted}, Skipped: ${totalSkipped}, Errors: ${totalErrors}`);
    console.log('');

    if (totalErrors > 0) {
      console.log('⚠️  Some documents had errors. Please review the logs above.');
    } else {
      console.log('✅ Migration completed successfully!');
    }

    console.log('');
    console.log('Next steps:');
    console.log('1. Verify data in MongoDB Atlas - sensitive fields should show encrypted values');
    console.log('2. Test the application - admin panel should show decrypted data');
    console.log('3. Test user-facing pages - users should see their own decrypted data');
    console.log('');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run migration
runMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
