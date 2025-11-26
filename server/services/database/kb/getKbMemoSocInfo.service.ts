/**
 * Get KB SOC Info Service
 * Retrieves SERVICE_AGREEMENT records for warranty-related SOCs
 */

import { getKbOracleConnection, oracledb } from '../../../config/kbDatabase';
import type { KbServiceAgreementRow } from '../../../../types/kb_service_agreement.types';

export const getKbMemoSocInfo = async (ban: string): Promise<KbServiceAgreementRow[]> => {
  const connection = await getKbOracleConnection();
  
  try {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} [GET_KB_SOC_INFO] Querying Oracle KB for BAN:`, ban);

    const result = await connection.execute(
      `SELECT SOC, BAN, SUBSCRIBER_NO, APPLICATION_ID, SYS_CREATION_DATE, SOC_EFFECTIVE_DATE, EXPIRATION_DATE
       FROM SERVICE_AGREEMENT 
       WHERE BAN = :ban 
         AND (
           -- Warranty SOC patterns (LIKE matches contain)
           SOC LIKE '%SAPCA%'
           OR SOC LIKE '%SAPP%'
           OR SOC LIKE '%SAPSCA%'
           OR SOC LIKE '%SDCBOYD%'
           OR SOC LIKE '%SDCC%'
           OR SOC LIKE '%SDVCA%'
           OR SOC LIKE '%S36DVC9%'
           OR SOC LIKE '%SDVC9M36%'
           OR SOC LIKE '%SDEVCARSK%'
           -- Exact warranty SOC codes
           OR SOC IN ('3SPPCT36', '3SMBPP36', '3SSKPPM36')
         ) 
       ORDER BY SYS_CREATION_DATE DESC`,
      [ban],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    console.log(`${timestamp} [GET_KB_SOC_INFO] Found ${result.rows?.length || 0} records`);
    return result.rows as KbServiceAgreementRow[];
  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`${timestamp} [GET_KB_SOC_INFO] Error:`, error);
    throw error;
  } finally {
    await connection.close();
  }
};
