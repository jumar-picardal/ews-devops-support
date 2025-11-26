/**
 * Get Closed Tender Information Service
 * Retrieves contract information for CLOSED_TENDER status contracts (Case 5)
 */

import pool from '../../../config/ewsDatabase';

interface ClosedTenderInfo {
  extnd_wrnty_contract_id: string;
  wrnty_vendor_cd: string;
  wrnty_srvc_cd: string;
  subscription_id: string;
}

export const getClosedTenderInfo = async (contractId: string): Promise<ClosedTenderInfo | null> => {
  const client = await pool.connect();
  
  try {
    const query = `
      SELECT 
        EWC.EXTND_WRNTY_CONTRACT_ID, 
        EWC.WRNTY_VENDOR_CD, 
        EWC.WRNTY_SRVC_CD, 
        EWC.SUBSCRIPTION_ID
      FROM EWSADM.EXTND_WRNTY_CONTRACT EWC
      INNER JOIN EWSADM.EXTND_WRNTY_CNTRCT_STATUS EWCS
        ON EWC.EXTND_WRNTY_CONTRACT_ID = EWCS.EXTND_WRNTY_CONTRACT_ID
        AND EWCS.CURRENT_IND = 'Y'
        AND EWCS.AGRMT_STATUS_CATGY_ID = 1 
        AND EWCS.AGRMT_STATUS_TYP_ID = 6
      INNER JOIN EWSADM.EXTND_WRNTY_TXN EWT
        ON EWC.EXTND_WRNTY_CONTRACT_ID = EWT.EXTND_WRNTY_CONTRACT_ID
        AND EWT.EXTND_WRNTY_TXN_STAT_CD IN ('REPORTED', 'FAIL')
      WHERE EWC.EXTND_WRNTY_CONTRACT_ID = $1
    `;

    const result = await client.query(query, [contractId]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    throw new Error(
      `Failed to get closed tender info: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  } finally {
    client.release();
  }
};
