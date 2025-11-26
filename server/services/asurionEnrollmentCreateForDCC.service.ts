/**
 * Asurion Enrollment Create for DCC Service
 * Follows same pattern as asurionEnrollmentCancel.service.ts
 */

import axios from 'axios';
import https from 'https';
import OAuth2TokenManager from './oauth/OAuth2TokenManager';
import { EnrollmentRequestData } from '../../types/enrollment_request.types';

interface EnrollmentCreateResponse {
  status: 'Success' | 'Error';
  message: string;
  subscriptionId?: string;
  response?: unknown;
  httpStatus?: number;
  errorDescription?: string;
}

interface AsurionConfig {
  apiBaseUrl: string;
  oauth: {
    tokenUrl: string;
    clientId: string;
    clientSecret: string;
    scope: string;
    tokenExpiryInSecs: number;
    gracePeriodInSecs: number;
  };
}

class AsurionEnrollmentCreateForDCCService {
  private apiBaseUrl: string;
  private tokenManager: OAuth2TokenManager;

  constructor(config: AsurionConfig) {
    this.apiBaseUrl = config.apiBaseUrl;
    this.tokenManager = new OAuth2TokenManager(config.oauth);
  }

  async enrollmentCreate(enrollmentData: EnrollmentRequestData): Promise<EnrollmentCreateResponse> {
    try {
      if (!enrollmentData.subscription_id) {
        throw new Error('subscription_id is required');
      }

      if (!enrollmentData.wrnty_srvc_cd) {
        throw new Error('wrnty_srvc_cd is required');
      }

      // Determine partnerId from serviceCode
      let partnerId: string;
      
      if (enrollmentData.wrnty_srvc_cd.includes('TELUS')) {
        partnerId = process.env.ASURION_TELUS_PARTNER_ID!;
      } else if (enrollmentData.wrnty_srvc_cd.includes('KOODO') || enrollmentData.wrnty_srvc_cd.includes('KPP')) {
        partnerId = process.env.ASURION_KOODO_PARTNER_ID!;
      } else {
        throw new Error(`Invalid service code: ${enrollmentData.wrnty_srvc_cd}`);
      }

      const formatDate = (date: Date) => date.toISOString().split('T')[0];

      const requestBody = {
        partner_id: partnerId,
        enrollment_id: enrollmentData.subscription_id,
        account: {
          status: 'active',
          type: 'individual',
          number: enrollmentData.billing_account_num
        },
        primary_customer: {
          first_name: enrollmentData.cust_first_nm,
          last_name: enrollmentData.cust_last_nm,
          email: enrollmentData.e_mail_address_txt,
          phone: enrollmentData.cust_phone_num,
          preferred_mode_comm: 'email',
          preferred_locale: 'en-CA'
        },
        address: [
          {
            type: 'billing',
            line1: enrollmentData.address_1,
            city: enrollmentData.city_name,
            state: enrollmentData.province_cd,
            postal_code: enrollmentData.postal_cd,
            country: 'CA'
          }
        ],
        plan: {
          sku: enrollmentData.wrnty_srvc_cd,
          start_date: formatDate(enrollmentData.warranty_start_dt),
          price: String(enrollmentData.service_cost_amt),
          payment_frequency: 'monthly' // Default value (API accepts 'monthly' or 'single')
        },
        asset: {
          mdn: enrollmentData.cust_phone_num,
          country_code: '1',
          imei: enrollmentData.covered_device_serial_num,
          activation_date: formatDate(enrollmentData.warranty_start_dt),
          sku: enrollmentData.device_product_cd,
          device_indicator: enrollmentData.cond_type,
          model: enrollmentData.device_description_txt
        }
      };

      console.log('Create Asurion DCC Enrollment:', {
        subscriptionId: enrollmentData.subscription_id,
        serviceCode: enrollmentData.wrnty_srvc_cd,
        partnerId: partnerId,
        accountNumber: enrollmentData.billing_account_num
      });

      const authToken = await this.tokenManager.getAuthorizationTokenString();
      const httpsAgent = new https.Agent({ rejectUnauthorized: false });

      const response = await axios.post(this.apiBaseUrl, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken,
          'Asurion-correlationid': `enroll-dcc-${enrollmentData.subscription_id}-${Date.now()}`
        },
        httpsAgent,
        timeout: 30000
      });

      return {
        status: 'Success',
        message: 'DCC enrollment created successfully',
        subscriptionId: enrollmentData.subscription_id,
        response: response.data,
        httpStatus: response.status
      };

    } catch (error) {
      if (axios.isAxiosError(error)) {
      const errorData = error.response?.data;
      const errorCode = errorData?.error?.code || 'unknown';
      const errorMsg = errorData?.error?.message || errorData?.message || error.message;
      
      console.error('Asurion API Error:', {
        status: error.response?.status,
        code: errorCode,
        message: errorMsg
      });
        
      return {
        status: 'Error',
        message: `DCC enrollment failed: ${errorCode}`,
        errorDescription: errorMsg,
        httpStatus: error.response?.status,
        response: error.response?.data
      };
      }

      console.error('Unexpected error:', error);
      
      return {
        status: 'Error',
        message: 'DCC enrollment creation failed',
        errorDescription: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export function createAsurionEnrollmentCreateForDCCService(): AsurionEnrollmentCreateForDCCService {
  const config: AsurionConfig = {
    apiBaseUrl: process.env.ASURION_ENROLLMT_API_BASE_URL!,
    oauth: {
      tokenUrl: process.env.ACCESS_TOKEN_URL!,
      clientId: process.env.EWSMA_OAUTH_CLIENT_ID!,
      clientSecret: process.env.EWSMA_OAUTH_CLIENT_SECRET!,
      scope: process.env.ASURION_ENROLLMT_OAUTH_SCOPE!,
      tokenExpiryInSecs: parseInt(process.env.TOKEN_EXPIRY_IN_SECS!),
      gracePeriodInSecs: parseInt(process.env.TOKEN_REFRESH_BEFORE_EXPIRY_IN_SECS!)
    }
  };

  return new AsurionEnrollmentCreateForDCCService(config);
}

export default AsurionEnrollmentCreateForDCCService;
