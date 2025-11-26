/**
 * Get KB Memo List Service
 * Retrieves consolidated MEMO records for multiple memo types
 */

import { getKbOracleConnection, oracledb } from '../../../config/kbDatabase';
import type { KbMemoRow } from '../../../../types/kb_memo.types';

export const getKbMemoList = async (ban: string): Promise<KbMemoRow[]> => {
  let connection;
  
  try {
    connection = await getKbOracleConnection();

    const result = await connection.execute(
      `SELECT MEMO_BAN, MEMO_SUBSCRIBER, MEMO_TYPE, MEMO_SYSTEM_TXT, MEMO_MANUAL_TXT, MEMO_DATE
       FROM MEMO WHERE MEMO_BAN = :ban 
       AND MEMO_TYPE IN (
       	  'PNCH', '0009', 'PHCH', -- Subscriber Changed
       		'AOFR', 'AOMM', '0004', 'REFL', 'EQW', -- Subscriber Activated
       		'CHCH', 'GENE', 'FYI', 'INQ', -- FYI
       		'0001' -- Tentative
       )
       ORDER BY MEMO_DATE DESC`,
      { ban },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!result.rows || result.rows.length === 0) {
      return [];
    }

    return result.rows as KbMemoRow[];
  } catch (error) {
    throw new Error(
      `Failed to get KB memo list: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};
