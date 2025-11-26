/**
 * KB Oracle Database Configuration
 * Handles connection to Oracle KB database for BAN status and subscriber information
 * Uses connection pooling to prevent SESSIONS_PER_USER limit errors
 */

import oracledb from 'oracledb';

// Initialize Oracle Client
if (process.env.KB_ORACLE_CLIENT_PATH) {
  oracledb.initOracleClient({ libDir: process.env.KB_ORACLE_CLIENT_PATH });
}

oracledb.fetchAsString = [oracledb.CLOB];
oracledb.autoCommit = true;

// KB Oracle pool configuration
const kbOraclePoolConfig = {
  user: process.env.KB_ORACLE_USER,
  password: process.env.KB_ORACLE_PASSWORD,
  connectString: process.env.KB_ORACLE_CONNECT_STRING,
  poolMin: 1,
  poolMax: 3,
  poolIncrement: 1,
  stmtCacheSize: 30
};

let kbOraclePool: oracledb.Pool | null = null;

/**
 * Initialize KB Oracle connection pool
 */
async function initKbOraclePool() {
  if (kbOraclePool) {
    return kbOraclePool;
  }

  if (!process.env.KB_ORACLE_USER || 
      !process.env.KB_ORACLE_PASSWORD || 
      !process.env.KB_ORACLE_CONNECT_STRING) {
    throw new Error('KB Oracle environment variables (KB_ORACLE_USER, KB_ORACLE_PASSWORD, KB_ORACLE_CONNECT_STRING) must be set in .env file');
  }

  try {
    kbOraclePool = await oracledb.createPool(kbOraclePoolConfig);
    console.log('✅ KB Oracle connection pool created');
    return kbOraclePool;
  } catch (err) {
    console.error('❌ Failed to create KB Oracle pool:', err);
    throw err;
  }
}

/**
 * Get KB Oracle connection from pool
 * No retry mechanism to prevent account lockouts
 */
export async function getKbOracleConnection() {
  try {
    if (!kbOraclePool) {
      await initKbOraclePool();
    }
    const connection = await kbOraclePool!.getConnection();
    return connection;
  } catch (err) {
    console.log('KB Oracle connection failed - no retry attempts will be made');
    throw err;
  }
}

export { oracledb };
