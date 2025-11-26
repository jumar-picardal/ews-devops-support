import pool from '../../../config/ewsDatabase';

export const getEwCustomerInfo = async (contractId: string) => {
  const client = await pool.connect();
  
  try {
    console.log(`[getEwCustomerInfo] Fetching customer info for Contract ID: ${contractId}`);
    
    const query = `
      SELECT
        WARRANTY_EXPIRY_DT,
        EXTND_WRNTY_CONTRACT_ID,
        CUST_FIRST_NM,
        CUST_LAST_NM,
        CUST_PHONE_NUM,
        ACCOUNT_TYPE_CD,
        ACCOUNT_SUBTYPE_CD,
        STREET_NO,
        STREET_NAME,
        ADDRESS_1,
        ADDRESS_2,
        POSTAL_CD,
        CITY_NAME,
        PROVINCE_CD,
        COUNTRY_CD,
        EFFECTIVE_STOP_TS,
        CREATE_USER_ID,
        LAST_UPDT_USER_ID,
        SUBSCRIPTION_ID,
        BILLING_ACCOUNT_NUM,
        COMPANY_NM,
        ACCOUNT_CONTRACT_NM
      FROM EWSADM.EXTND_WRNTY_CONTRACT_CUST
      WHERE EXTND_WRNTY_CONTRACT_ID = $1 
        AND CURRENT_IND = 'Y'
    `;
    
    const result = await client.query(query, [contractId]);
    
    if (result.rows.length === 0) {
      console.log(`[getEwCustomerInfo] No customer info found for Contract ID: ${contractId}`);
      return null;
    }
    
    console.log(`[getEwCustomerInfo] Customer info retrieved successfully for Contract ID: ${contractId}`);
    return result.rows[0];
  } catch (error) {
    console.error(`[getEwCustomerInfo] Error fetching customer info:`, error);
    throw error;
  } finally {
    client.release();
  }
};
