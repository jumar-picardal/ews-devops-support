/**
 * Get Warranty Status Service
 * Retrieves current warranty status description for a contract
 */

import pool from '../../../config/ewsDatabase';

export interface WarrantyStatus {
  status_typ_desc_txt: string;
}

export const getWarrantyStatus = async (contractId: string): Promise<WarrantyStatus | null> => {
  const client = await pool.connect();
  
  try {
    console.log(`[getWarrantyStatus] Fetching warranty status for Contract ID: ${contractId}`);
    
    const query = `
      SELECT AST.STATUS_TYP_DESC_TXT
      FROM EWSADM.EXTND_WRNTY_CNTRCT_STATUS EWCS
      INNER JOIN EWSADM.AGRMT_STATUS_TYP AST
        ON EWCS.AGRMT_STATUS_CATGY_ID = AST.AGRMT_STATUS_CATGY_ID
        AND EWCS.AGRMT_STATUS_TYP_ID = AST.AGRMT_STATUS_TYP_ID
        AND EWCS.CURRENT_IND = 'Y'
        AND EWCS.AGRMT_STATUS_CATGY_ID IN (1, 4)
      WHERE EWCS.EXTND_WRNTY_CONTRACT_ID = $1 
      ORDER BY EWCS.EXTND_WRNTY_CNTRCT_STATUS_ID DESC 
      FETCH FIRST 1 ROW ONLY
    `;
    
    const result = await client.query(query, [contractId]);
    
    if (result.rows.length === 0) {
      console.log(`[getWarrantyStatus] No warranty status found for Contract ID: ${contractId}`);
      return null;
    }
    
    console.log(`[getWarrantyStatus] Warranty status retrieved for Contract ID: ${contractId}`);
    return result.rows[0];
  } catch (error) {
    console.error(`[getWarrantyStatus] Error fetching warranty status:`, error);
    throw error;
  } finally {
    client.release();
  }
};
