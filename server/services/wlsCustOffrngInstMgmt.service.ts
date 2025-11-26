/**
 * WLS Customer Offering Instance Management Service
 * Manages SOC (Service Offering Code) add/remove operations for customer phone numbers
 */

import axios from 'axios';
import https from 'https';
import OAuth2TokenManager from './oauth/OAuth2TokenManager';

type TransactionType = 'ADD' | 'REMOVE';

interface WlsManageSocParams {
  ban: string;
  phoneNumber: string;
  socCode?: string; // Default: 'SDCCMB'
  transactionType: TransactionType;
}

interface WlsManageSocResponse {
  status: 'Success' | 'Error';
  message: string;
  httpStatus?: number;
  data?: unknown;
  errorDescription?: string;
}

interface WlsManageSocConfig {
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

class WlsCustOffrngInstMgmtService {
  private apiBaseUrl: string;
  private tokenManager: OAuth2TokenManager;

  constructor(config: WlsManageSocConfig) {
    this.apiBaseUrl = config.apiBaseUrl;
    this.tokenManager = new OAuth2TokenManager(config.oauth);
  }

  async manageSoc(params: WlsManageSocParams): Promise<WlsManageSocResponse> {
    try {
      const timestamp = new Date().toISOString();
      console.log(`${timestamp} [WLS_MANAGE_SOC] Starting manageSoc:`, params);

      const { ban, phoneNumber, socCode = 'SDCCMB', transactionType } = params;

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
            transactionType
          }
        ]
      };

      const authToken = await this.tokenManager.getAuthorizationTokenString();
      const httpsAgent = new https.Agent({ rejectUnauthorized: false });

      const url = `${this.apiBaseUrl}/offeringInstance/changeAddOns`;

      console.log(`${timestamp} [WLS_MANAGE_SOC] Request URL:`, url);
      console.log(`${timestamp} [WLS_MANAGE_SOC] Product ID:`, productId);
      console.log(`${timestamp} [WLS_MANAGE_SOC] SOC Code:`, socCode);
      console.log(`${timestamp} [WLS_MANAGE_SOC] Transaction Type:`, transactionType);

      const response = await axios.post(url, requestBody, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        },
        httpsAgent,
        timeout: 30000
      });

      console.log(`${timestamp} [WLS_MANAGE_SOC] Response Status:`, response.status);
      console.log(`${timestamp} [WLS_MANAGE_SOC] Response Data:`, response.data);

      const action = transactionType === 'ADD' ? 'added' : 'removed';
      return {
        status: 'Success',
        message: `SOC ${action} successfully`,
        data: response.data,
        httpStatus: response.status
      };

    } catch (error) {
      const timestamp = new Date().toISOString();
      
      if (axios.isAxiosError(error)) {
        console.error(`${timestamp} [WLS_MANAGE_SOC] API Error:`, {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });

        const action = params.transactionType === 'ADD' ? 'add' : 'remove';
        return {
          status: 'Error',
          message: `Failed to ${action} SOC`,
          errorDescription: error.response?.data?.message ?? error.message,
          httpStatus: error.response?.status,
          data: error.response?.data
        };
      }

      console.error(`${timestamp} [WLS_MANAGE_SOC] Error:`, error);
      const action = params.transactionType === 'ADD' ? 'add' : 'remove';
      return {
        status: 'Error',
        message: `Failed to ${action} SOC`,
        errorDescription: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export function createWlsCustOffrngInstMgmtService(): WlsCustOffrngInstMgmtService {
  const config: WlsManageSocConfig = {
    apiBaseUrl: process.env.WLS_CUST_OFFRNG_API_BASE_URL!,
    oauth: {
      tokenUrl: process.env.ACCESS_TOKEN_URL!,
      clientId: process.env.OLD_EWSMA_OAUTH_CLIENT_ID!,
      clientSecret: process.env.OLD_EWSMA_OAUTH_CLIENT_SECRET!,
      scope: process.env.WLS_CUST_OFFRNG_OAUTH_SCOPE!,
      tokenExpiryInSecs: parseInt(process.env.TOKEN_EXPIRY_IN_SECS!),
      gracePeriodInSecs: parseInt(process.env.TOKEN_REFRESH_BEFORE_EXPIRY_IN_SECS!)
    }
  };

  return new WlsCustOffrngInstMgmtService(config);
}

export default WlsCustOffrngInstMgmtService;
