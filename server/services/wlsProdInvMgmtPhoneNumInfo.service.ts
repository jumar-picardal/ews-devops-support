/**
 * WLS Product Inventory Management Service
 * Queries product status by BAN and/or phone number
 */

import axios from 'axios';
import https from 'https';
import OAuth2TokenManager from './oauth/OAuth2TokenManager';
import type { WlsProdInvMgmtProduct, ProductQueryParams } from '../../types/wlsProductInvMgmt.types';
import type { WlsProductConfig } from '../../types/wlsProductConfig.types';

interface WlsProductResponse {
  status: 'Success' | 'Error';
  message: string;
  data?: WlsProdInvMgmtProduct[];
  httpStatus?: number;
  errorDescription?: string;
}

class WlsProdInvMgmtPhoneNumInfoSrvc {
  private apiBaseUrl: string;
  private tokenManager: OAuth2TokenManager;

  constructor(config: WlsProductConfig) {
    this.apiBaseUrl = config.apiBaseUrl;
    this.tokenManager = new OAuth2TokenManager(config.oauth);
  }

  async getPhoneNumInfo(params: ProductQueryParams): Promise<WlsProductResponse> {
    try {
      console.log('[WLS_SERVICE] Starting getPhoneNumInfo with params:', params);
      
      if (!params.ban && !params.phoneNumber) {
        throw new Error('Either BAN or phone number is required');
      }

      const queryParams = new URLSearchParams();
      
      if (params.ban) {
        queryParams.append('billingAccount.id', params.ban);
      }
      
      if (params.phoneNumber) {
        queryParams.append('name', params.phoneNumber);
      }
      
      queryParams.append('status', 'active,cancelled,suspended,pendingActive');
      queryParams.append('includes', 'relatedParty,resource');

      const authToken = await this.tokenManager.getAuthorizationTokenString();
      
      const httpsAgent = new https.Agent({ rejectUnauthorized: false });

      const url = `${this.apiBaseUrl}/product?${queryParams.toString()}`;

      console.log('WLS Product Inventory Request URL:', url);
      console.log('Query Params:', { ban: params.ban, phoneNumber: params.phoneNumber });

      const response = await axios.get(url, {
        headers: {
          'Authorization': authToken
        },
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
        console.error('WLS Product API Error:', {
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

export function createWlsProdInvMgmtPhoneNumInfoSrvc(): WlsProdInvMgmtPhoneNumInfoSrvc {
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

  return new WlsProdInvMgmtPhoneNumInfoSrvc(config);
}

export default WlsProdInvMgmtPhoneNumInfoSrvc;
