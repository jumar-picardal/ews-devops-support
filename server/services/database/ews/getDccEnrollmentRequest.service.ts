import pool from '../../../config/ewsDatabase';
import { EnrollmentRequestData } from '../../../../types/enrollment_request.types';

export const getDccEnrollmentRequest = async (contractId: string): Promise<EnrollmentRequestData | null> => {
  const client = await pool.connect();
  
  try {
    console.log(`[getDccEnrollmentRequest] Fetching enrollment data for Contract ID: ${contractId}`);
    
    const query = `
      SELECT 
        EWC.SUBSCRIPTION_ID,
        EWC.BILLING_ACCOUNT_NUM,
        EWC.CUST_FIRST_NM,
        EWC.CUST_LAST_NM,
        EWC.E_MAIL_ADDRESS_TXT,
        EWC.CUST_PHONE_NUM,
        EWC.WRNTY_SRVC_CD,
        EWC.WARRANTY_START_DT,
        EWC.SERVICE_COST_AMT,
        EWC.COVERED_DEVICE_SERIAL_NUM,
        EWC.WRNTY_VENDOR_CD,
        EWCC.ADDRESS_1,
        EWCC.CITY_NAME,
        EWCC.PROVINCE_CD,
        EWCC.POSTAL_CD,
        EWCD.DEVICE_PRODUCT_CD,
        EWCD.DEVICE_DESCRIPTION_TXT,
        EWCD.COND_TYPE
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
      console.log(`[getDccEnrollmentRequest] No enrollment data found for Contract ID: ${contractId}`);
      return null;
    }
    
    console.log(`[getDccEnrollmentRequest] Enrollment data retrieved successfully for Contract ID: ${contractId}`);
    return result.rows[0];
  } catch (error) {
    console.error(`[getDccEnrollmentRequest] Error fetching enrollment data:`, error);
    throw error;
  } finally {
    client.release();
  }
};
