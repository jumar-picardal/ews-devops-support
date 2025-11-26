/**
 * KB Service Agreement (SOC) Types
 * Types for WARRANTY-RELATED SOC records from SERVICE_AGREEMENT table
 */

export interface KbServiceAgreementRow {
  SOC: string;
  BAN: string;
  SUBSCRIBER_NO: string;
  APPLICATION_ID: string;
  SYS_CREATION_DATE: Date;
  SOC_EFFECTIVE_DATE: Date;
  EXPIRATION_DATE: Date;
