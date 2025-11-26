/**
 * Extended Warranty Contract Customer Types
 * Database table: EWSADM.EXTND_WRNTY_CONTRACT_CUST
 */

export interface ExtndWrntyContractCustRow {
  warranty_expiry_dt: string;
  extnd_wrnty_contract_id: string;
  cust_first_nm: string;
  cust_last_nm: string;
  cust_phone_num: string;
  account_type_cd: string;
  account_subtype_cd: string;
  street_no: string;
  street_name: string;
  address_1: string;
  address_2: string;
  postal_cd: string;
  city_name: string;
  province_cd: string;
  country_cd: string;
  effective_stop_ts: string | null;
  create_user_id: string;
  last_updt_user_id: string;
  subscription_id: string;
  billing_account_num: string;
  company_nm: string;
  account_contract_nm: string;
}
