import pool from '../../../config/ewsDatabase';
import { EnrollmentRequestData } from '../../../../types/enrollment_request.types';

export const getDccsEnrollmentRequest = async (contractId: string): Promise<EnrollmentRequestData | null> => {
  const client = await pool.connect();
  
  try {
    console.log(`[getDccsEnrollmentRequest] Fetching DCCS enrollment data for Contract ID: ${contractId}`);
    
    const query = `
      SELECT 
        EWC.SUBSCRIPTION_ID,
        EWC.WRNTY_SRVC_CD,
        EWC.SERVICE_COST_AMT,
        EWC.WARRANTY_START_DT,
        EWC.WRNTY_VENDOR_CD
      FROM EWSADM.EXTND_WRNTY_CONTRACT EWC
      LEFT JOIN EWSADM.EXTND_WRNTY_CONTRACT_CUST EWCC 
        ON EWC.EXTND_WRNTY_CONTRACT_ID = EWCC.EXTND_WRNTY_CONTRACT_ID
        AND EWCC.CURRENT_IND = 'Y'
      LEFT JOIN EWSADM.EXTND_WRNTY_CONTRACT_DVC EWCD 
        ON EWC.EXTND_WRNTY_CONTRACT_ID = EWCD.EXTND_WRNTY_CONTRACT_ID
        AND EWCD.CURRENT_IND = 'Y'
      WHERE EWC.EXTND_WRNTY_CONTRACT_ID = $1
    `;
    
    const result = await client.query(query, [contractId]);
    
    if (result.rows.length === 0) {
      console.log(`[getDccsEnrollmentRequest] No DCCS enrollment data found for Contract ID: ${contractId}`);
      return null;
    }
    
    console.log(`[getDccsEnrollmentRequest] DCCS enrollment data retrieved successfully for Contract ID: ${contractId}`);
    return result.rows[0];
  } catch (error) {
    console.error(`[getDccsEnrollmentRequest] Error fetching DCCS enrollment data:`, error);
    throw error;
  } finally {
    client.release();
  }
};
