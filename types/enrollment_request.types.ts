export interface EnrollmentRequestData {
  subscription_id: string;
  billing_account_num: string;
  cust_first_nm: string;
  cust_last_nm: string;
  e_mail_address_txt: string;
  cust_phone_num: string;
  wrnty_srvc_cd: string;
  warranty_start_dt: Date;
  service_cost_amt: string;
  covered_device_serial_num: string;
  wrnty_vendor_cd: string;
  address_1: string;
  city_name: string;
  province_cd: string;
  postal_cd: string;
  device_product_cd: string;
  device_description_txt: string;
  cond_type: string;
}
