/**
 * WLS Customer Offering Instance Management - Remove SOC Service
 * Removes SOC (Service Offering Code) from a customer's phone number
 */

import axios from 'axios';
import https from 'https';
import OAuth2TokenManager from './oauth/OAuth2TokenManager';

interface WlsRemoveSocParams {
  ban: string;
  phoneNumber: string;
  socCode?: string; // Default: 'SDCCMB'
}

interface WlsRemoveSocResponse {
  status: 'Success' | 'Error';
  message: string;
  httpStatus?: number;
  data?: unknown;
  errorDescription?: string;
}

interface WlsRemoveSocConfig {
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

class WlsCustOffrngInstMgmtRemoveSocService {
  private apiBaseUrl: string;
  private tokenManager: OAuth2TokenManager;

  constructor(config: WlsRemoveSocConfig) {
    this.apiBaseUrl = config.apiBaseUrl;
    this.tokenManager = new OAuth2TokenManager(config.oauth);
  }

  async wlsRemoveSoc(params: WlsRemoveSocParams): Promise<WlsRemoveSocResponse> {
    try {
      const timestamp = new Date().toISOString();
      console.log(`${timestamp} [WLS_REMOVE_SOC] Starting wlsRemoveSoc:`, params);

      const { ban, phoneNumber, socCode = 'SDCCMB' } = params;

      // Construct productId: {ban}-C{phoneNumber}
      const productId = `${ban}-C${phoneNumber}`;

      const requestBody = {
        auditInfo: {
          dealerCode: 'A001000001',
          salesRepCode: '0000',
          originatingApplication: 'EWSAPP',
          userId: '0'
        },
        serviceRequestInfo: {
          applicationId: '13875',
          applicationName: 'EWSAPP',
          language: 'EN'
        },
        notificationSuppressionInd: false,
        productId,
        addOnChanges: [
          {
            productOfferingId: socCode,
            transactionType: 'REMOVE'
          }
        ]
      };

      const authToken = await this.tokenManager.getAuthorizationTokenString();
      const httpsAgent = new https.Agent({ rejectUnauthorized: false });

      const url = `${this.apiBaseUrl}/offeringInstance/changeAddOns`;

      console.log(`${timestamp} [WLS_REMOVE_SOC] Request URL:`, url);
      console.log(`${timestamp} [WLS_REMOVE_SOC] Product ID:`, productId);
      console.log(`${timestamp} [WLS_REMOVE_SOC] SOC Code:`, socCode);

      const response = await axios.post(url, requestBody, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        },
        httpsAgent,
        timeout: 30000
      });

      console.log(`${timestamp} [WLS_REMOVE_SOC] Response Status:`, response.status);
      console.log(`${timestamp} [WLS_REMOVE_SOC] Response Data:`, response.data);

      return {
        status: 'Success',
        message: 'SOC removed successfully',
        data: response.data,
        httpStatus: response.status
      };

    } catch (error) {
      const timestamp = new Date().toISOString();
      
      if (axios.isAxiosError(error)) {
        console.error(`${timestamp} [WLS_REMOVE_SOC] API Error:`, {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });

        return {
          status: 'Error',
          message: 'Failed to remove SOC',
          errorDescription: error.response?.data?.message ?? error.message,
          httpStatus: error.response?.status,
          data: error.response?.data
        };
      }

      console.error(`${timestamp} [WLS_REMOVE_SOC] Error:`, error);
      return {
        status: 'Error',
        message: 'Failed to remove SOC',
        errorDescription: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export function createWlsCustOffrngInstMgmtRemoveSocService(): WlsCustOffrngInstMgmtRemoveSocService {
  const config: WlsRemoveSocConfig = {
    apiBaseUrl: process.env.WLS_CUST_OFFRNG_API_BASE_URL!,
    oauth: {
      tokenUrl: process.env.ACCESS_TOKEN_URL!,
      clientId: process.env.EWSMA_OAUTH_CLIENT_ID!,
      clientSecret: process.env.EWSMA_OAUTH_CLIENT_SECRET!,
      scope: process.env.WLS_CUST_OFFRNG_OAUTH_SCOPE!,
      tokenExpiryInSecs: parseInt(process.env.TOKEN_EXPIRY_IN_SECS!),
      gracePeriodInSecs: parseInt(process.env.TOKEN_REFRESH_BEFORE_EXPIRY_IN_SECS!)
    }
  };

  return new WlsCustOffrngInstMgmtRemoveSocService(config);
}

export default WlsCustOffrngInstMgmtRemoveSocService;
