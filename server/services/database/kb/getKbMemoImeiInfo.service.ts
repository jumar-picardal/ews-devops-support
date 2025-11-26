/**
 * Get KB Memo IMEI Info Service
 * Retrieves MEMO records by BAN and IMEI search in MEMO_MANUAL_TXT
 */

import { getKbOracleConnection, oracledb } from '../../../config/kbDatabase';
import type { KbMemoRow } from '../../../../types/kb_memo.types';

export const getKbMemoImeiInfo = async (ban: string, imei: string): Promise<KbMemoRow[]> => {
  let connection;
  
  try {
    connection = await getKbOracleConnection();

    const result = await connection.execute(
      `SELECT MEMO_BAN, MEMO_SUBSCRIBER, MEMO_TYPE, MEMO_SYSTEM_TXT, MEMO_MANUAL_TXT, MEMO_DATE
       FROM MEMO
       WHERE MEMO_BAN = :ban 
       AND MEMO_MANUAL_TXT LIKE '%' || :imei || '%'
       ORDER BY MEMO_DATE DESC`,
      { ban, imei },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!result.rows || result.rows.length === 0) {
      return [];
    }

    return result.rows as KbMemoRow[];
  } catch (error) {
    throw new Error(
      `Failed to get KB memo IMEI info: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};
