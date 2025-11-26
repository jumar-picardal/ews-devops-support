/**
 * Update Transaction Status to SUCCESS Service
 * Updates transaction status from FAIL/REPORTED/SKIP to SUCCESS for retry processing
 */

import pool from '../../../config/ewsDatabase';

interface UpdateResult {
  contractId: string;
  rowsUpdated: number;
}

export const updateReportedStatToSuccess = async (contractId: string): Promise<UpdateResult> => {
  const client = await pool.connect();
  
  try {
    const query = `
      UPDATE EWSADM.EXTND_WRNTY_TXN 
      SET EXTND_WRNTY_TXN_STAT_CD = 'SUCCESS'
      WHERE EXTND_WRNTY_TXN_STAT_CD IN ('FAIL', 'REPORTED', 'SKIP')
        AND EXTND_WRNTY_CONTRACT_ID = $1
    `;

    const result = await client.query(query, [contractId]);

    return {
      contractId,
      rowsUpdated: result.rowCount ?? 0
    };
  } catch (error) {
    throw new Error(
      `Failed to update transaction status: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  } finally {
    client.release();
  }
};
