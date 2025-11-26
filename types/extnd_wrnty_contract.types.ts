/**
 * Extended Warranty Contract Types
 * Types for EXTND_WRNTY_CONTRACT table and related queries
 */

export interface ExtndWrntyContractRow {
  billing_account_num: string;
  covered_device_serial_num: string;
  subscription_id: string;
  wrnty_srvc_cd: string;
  payment_method_cd: string;
  service_cost_amt: string;
  order_type_cd: string;
  wrnty_typ_cd: string;
  warranty_start_dt: string;
  cust_phone_num: string;
  cust_first_nm: string;
  cust_last_nm: string;
}
