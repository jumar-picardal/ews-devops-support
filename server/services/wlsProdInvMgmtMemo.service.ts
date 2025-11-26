/**
 * WLS Product Inventory Management Memo Service
 * Queries memo by product.id (BAN-PhoneNumber format)
 */

import axios from 'axios';
import https from 'https';
import OAuth2TokenManager from './oauth/OAuth2TokenManager';
import type { WlsProductConfig } from '../../types/wlsProductConfig.types';
import type { WlsProdInvMgmtMemo } from '../../types/wlsProductInvMgmt.types';

interface WlsMemoResponse {
  status: 'Success' | 'Error';
  message: string;
  data?: WlsProdInvMgmtMemo[];
  httpStatus?: number;
  errorDescription?: string;
}

class WlsProdInvMgmtMemoSrvc {
  private apiBaseUrl: string;
  private tokenManager: OAuth2TokenManager;

  constructor(config: WlsProductConfig) {
    this.apiBaseUrl = config.apiBaseUrl;
    this.tokenManager = new OAuth2TokenManager(config.oauth);
  }

  async getMemo(ban: string, phoneNumber: string): Promise<WlsMemoResponse> {
    try {
      console.log('[WLS_MEMO_SERVICE] Starting getMemo with BAN:', ban, 'Phone:', phoneNumber);
      
      if (!ban || !phoneNumber) {
        throw new Error('BAN and Phone Number are required');
      }

      const productId = `${ban}-C${phoneNumber}`;
      const queryParams = new URLSearchParams({
        'product.id': productId
      });

      const authToken = await this.tokenManager.getAuthorizationTokenString();
      const httpsAgent = new https.Agent({ rejectUnauthorized: false });
      const url = `${this.apiBaseUrl}/memo?${queryParams.toString()}`;

      console.log('WLS Product Inventory Memo Request URL:', url);

      const response = await axios.get(url, {
        headers: { 'Authorization': authToken },
        httpsAgent,
        timeout: 30000
      });

      console.log('Response Status:', response.status);
      console.log('Memo Data:', response.data);

      return {
        status: 'Success',
        message: 'Memo retrieved successfully',
        data: response.data,
        httpStatus: response.status
      };

    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('WLS Product Memo API Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });

        return {
          status: 'Error',
          message: 'Failed to retrieve memo',
          errorDescription: error.response?.data?.message ?? error.message,
          httpStatus: error.response?.status,
          data: error.response?.data
        };
      }

      return {
        status: 'Error',
        message: 'Failed to retrieve memo',
        errorDescription: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const createWlsProdInvMgmtMemoSrvc = (): WlsProdInvMgmtMemoSrvc => {
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

  return new WlsProdInvMgmtMemoSrvc(config);
};

export default WlsProdInvMgmtMemoSrvc;
