import pool from '../../../config/ewsDatabase';

export const getEwContractInfo = async (contractId: string) => {
  const client = await pool.connect();
  
  try {
    console.log(`[getEwContractInfo] Fetching contract info for Contract ID: ${contractId}`);
    
    const query = `
      SELECT 
        BILLING_ACCOUNT_NUM, 
        COVERED_DEVICE_SERIAL_NUM, 
        SUBSCRIPTION_ID, 
        WRNTY_SRVC_CD, 
        PAYMENT_METHOD_CD, 
        SERVICE_COST_AMT, 
        ORDER_TYPE_CD, 
        WRNTY_TYP_CD, 
        WARRANTY_START_DT, 
        CUST_PHONE_NUM, 
        CUST_FIRST_NM, 
        CUST_LAST_NM
      FROM EWSADM.EXTND_WRNTY_CONTRACT
      WHERE EXTND_WRNTY_CONTRACT_ID = $1
    `;
    
    const result = await client.query(query, [contractId]);
    
    if (result.rows.length === 0) {
      console.log(`[getEwContractInfo] No contract found for Contract ID: ${contractId}`);
      return null;
    }
    
    console.log(`[getEwContractInfo] Contract info retrieved successfully for Contract ID: ${contractId}`);
    return result.rows[0];
  } catch (error) {
    console.error(`[getEwContractInfo] Error fetching contract info:`, error);
    throw error;
  } finally {
    client.release();
  }
};
