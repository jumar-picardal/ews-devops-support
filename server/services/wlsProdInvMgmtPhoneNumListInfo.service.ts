/**
 * WLS Product Inventory Management Phone Number List Info Service
 * Queries product status by BAN only
 */

import axios from 'axios';
import https from 'https';
import OAuth2TokenManager from './oauth/OAuth2TokenManager';
import type { WlsProdInvMgmtProduct } from '../../types/wlsProductInvMgmt.types';
import type { WlsProductConfig } from '../../types/wlsProductConfig.types';

interface WlsProductResponse {
  status: 'Success' | 'Error';
  message: string;
  data?: WlsProdInvMgmtProduct[];
  httpStatus?: number;
  errorDescription?: string;
}

class WlsProdInvMgmtPhoneNumListInfoSrvc {
  private apiBaseUrl: string;
  private tokenManager: OAuth2TokenManager;

  constructor(config: WlsProductConfig) {
    this.apiBaseUrl = config.apiBaseUrl;
    this.tokenManager = new OAuth2TokenManager(config.oauth);
  }

  async getPhoneNumListInfo(ban: string): Promise<WlsProductResponse> {
    try {
      console.log('[WLS_PHONE_NUM_LIST_SERVICE] Starting getPhoneNumListInfo with BAN:', ban);
      
      if (!ban) {
        throw new Error('BAN is required');
      }

      const queryParams = new URLSearchParams({
        'billingAccount.id': ban,
        'status': 'active,cancelled,suspended,pendingActive',
        'includes': 'relatedParty'
      });

      const authToken = await this.tokenManager.getAuthorizationTokenString();
      const httpsAgent = new https.Agent({ rejectUnauthorized: false });
      const url = `${this.apiBaseUrl}/product?${queryParams.toString()}`;

      console.log('WLS Product Inventory Phone Number List Request URL:', url);

      const response = await axios.get(url, {
        headers: { 'Authorization': authToken },
        httpsAgent,
        timeout: 30000
      });

      console.log('Response Status:', response.status);
      console.log('Products Found:', Array.isArray(response.data) ? response.data.length : 0);

      return {
        status: 'Success',
        message: 'Product status retrieved successfully',
        data: response.data,
        httpStatus: response.status
      };

    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('WLS Product Phone Number List API Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });

        return {
          status: 'Error',
          message: 'Failed to retrieve product status',
          errorDescription: error.response?.data?.message ?? error.message,
          httpStatus: error.response?.status,
          data: error.response?.data
        };
      }

      return {
        status: 'Error',
        message: 'Failed to retrieve product status',
        errorDescription: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const createWlsProdInvMgmtPhoneNumListInfoSrvc = (): WlsProdInvMgmtPhoneNumListInfoSrvc => {
  const config: WlsProductConfig = {
    apiBaseUrl: process.env.WLS_PROD_INV_API_BASE_URL!,
    oauth: {
      tokenUrl: process.env.ACCESS_TOKEN_URL!,
      clientId: process.env.EWPOQ_OAUTH_CLIENT_ID!,
      clientSecret: process.env.EWPOQ_OAUTH_CLIENT_SECRET!,
      scope: process.env.WLS_PROD_INV_OAUTH_SCOPE!,
      tokenExpiryInSecs: parseInt(process.env.TOKEN_EXPIRY_IN_SECS!),
      gracePeriodInSecs: parseInt(process.env.TOKEN_REFRESH_BEFORE_EXPIRY_IN_SECS!)
    }
  };

  return new WlsProdInvMgmtPhoneNumListInfoSrvc(config);
};

export default WlsProdInvMgmtPhoneNumListInfoSrvc;
