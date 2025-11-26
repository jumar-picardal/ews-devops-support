/**
 * Get Active Processing Information Service
 * Retrieves contract information for ACTIVE_PROCESSING status contracts
 */

import pool from '../../../config/ewsDatabase';

interface ActiveProcessingInfo {
  extnd_wrnty_contract_id: string;
  billing_account_num: string;
  cust_phone_num: string;
  soc_cd: string;
}

export const getActiveProcessingInfo = async (contractId: string): Promise<ActiveProcessingInfo | null> => {
  const client = await pool.connect();
  
  try {
    const query = `
      SELECT 
        EWC.EXTND_WRNTY_CONTRACT_ID,
        EWC.BILLING_ACCOUNT_NUM,
        EWC.CUST_PHONE_NUM,
        EWC.SOC_CD
      FROM EWSADM.EXTND_WRNTY_CONTRACT EWC
      INNER JOIN EWSADM.EXTND_WRNTY_CNTRCT_STATUS EWCS
        ON EWC.EXTND_WRNTY_CONTRACT_ID = EWCS.EXTND_WRNTY_CONTRACT_ID
        AND EWCS.CURRENT_IND = 'Y'
        AND EWCS.AGRMT_STATUS_CATGY_ID = 1 
        AND EWCS.AGRMT_STATUS_TYP_ID = 4
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
      `Failed to get active processing info: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  } finally {
    client.release();
  }
};
