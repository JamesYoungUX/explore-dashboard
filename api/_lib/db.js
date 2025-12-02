import { neon } from '@neondatabase/serverless';

/**
 * Validates that required environment variables are present
 * @throws {Error} If DATABASE_URL is not set
 */
function validateEnvironment() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
}

/**
 * Gets a configured Neon SQL client
 * @returns {Function} Neon SQL client
 * @throws {Error} If environment is not properly configured
 */
export function getDb() {
  validateEnvironment();
  return neon(process.env.DATABASE_URL);
}

/**
 * Tests database connectivity
 * @returns {Promise<boolean>} True if connection successful
 */
export async function testConnection() {
  try {
    const sql = getDb();
    await sql`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}
