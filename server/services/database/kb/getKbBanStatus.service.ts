/**
 * Get KB BAN Status Service
 * Retrieves BAN status information from Oracle KB database
 */

import { getKbOracleConnection, oracledb } from '../../../config/kbDatabase';

interface KbBanStatus {
  BAN_STATUS: string;
  STATUS_ACTV_CODE: string;
  STATUS_ACTV_RSN_CODE: string;
}

export const getKbBanStatus = async (ban: string): Promise<KbBanStatus | null> => {
  let connection;

  try {
    connection = await getKbOracleConnection();

    const result = await connection.execute(
      `SELECT BAN_STATUS, STATUS_ACTV_CODE, STATUS_ACTV_RSN_CODE 
       FROM BILLING_ACCOUNT 
       WHERE BAN = :ban`,
      { ban },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!result.rows || result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as KbBanStatus;
  } catch (error) {
    throw new Error(
      `Failed to get KB BAN status: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};
