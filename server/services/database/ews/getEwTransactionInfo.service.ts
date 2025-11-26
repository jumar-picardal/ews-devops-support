/**
 * Get EW Transaction Info Service
 * Retrieves transaction details for a warranty contract
 */

import pool from '../../../config/ewsDatabase';

export interface EwTransactionInfo {
  extnd_wrnty_txn_typ_cd: string;
  extnd_wrnty_txn_stat_cd: string;
  extnd_wrnty_txn_err_cd: string | null;
  extnd_wrnty_txn_err_txt: string | null;
}

export const getEwTransactionInfo = async (contractId: string): Promise<EwTransactionInfo[]> => {
  const client = await pool.connect();
  
  try {
    console.log(`[getEwTransactionInfo] Fetching transaction info for Contract ID: ${contractId}`);
    
    const query = `
      SELECT 
        EXTND_WRNTY_TXN_TYP_CD, 
        EXTND_WRNTY_TXN_STAT_CD,
        EXTND_WRNTY_TXN_ERR_CD, 
        EXTND_WRNTY_TXN_ERR_TXT
      FROM EWSADM.EXTND_WRNTY_TXN
      WHERE EXTND_WRNTY_CONTRACT_ID = $1 
      ORDER BY EXTND_WRNTY_TXN_TYP_CD
    `;
    
    const result = await client.query(query, [contractId]);
    
    console.log(`[getEwTransactionInfo] Found ${result.rows.length} transactions for Contract ID: ${contractId}`);
    return result.rows;
  } catch (error) {
    console.error(`[getEwTransactionInfo] Error fetching transaction info:`, error);
    throw error;
  } finally {
    client.release();
  }
};
