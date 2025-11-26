/**
 * EW Maintenance Retry Service
 */

import axios from 'axios';
import https from 'https';
import OAuth2TokenManager from './oauth/OAuth2TokenManager';

interface RetryData {
  contractId: string;
}

interface RetryResponse {
  status: 'Success' | 'Error';
  message: string;
  response?: unknown;
  httpStatus?: number;
  errorDescription?: string;
}

interface EWMaintenanceConfig {
  apiBaseUrl: string;
  environment: string;
  oauth: {
    tokenUrl: string;
    clientId: string;
    clientSecret: string;
    scope: string;
    tokenExpiryInSecs: number;
    gracePeriodInSecs: number;
  };
}

class EWMaintenanceRetryService {
  private apiBaseUrl: string;
  private environment: string;
  private tokenManager: OAuth2TokenManager;

  constructor(config: EWMaintenanceConfig) {
    this.apiBaseUrl = config.apiBaseUrl;
    this.environment = config.environment;
    this.tokenManager = new OAuth2TokenManager(config.oauth);
  }

  async retryWarrantyContract(retryData: RetryData): Promise<RetryResponse> {
    try {
      if (!retryData.contractId) {
        throw new Error('contractId is required');
      }

      const requestBody = {
        requestHeader: {
          requestDt: Date.now().toString(),
          requestRecordNum: 1,
          requestSequenceNum: 1
        },
        requestLineList: [
          {
            sequenceNum: 0,
            identifierTypeCd: 'CONTRACT_ID',
            identifierValue: retryData.contractId
          }
        ]
      };

      const authToken = await this.tokenManager.getAuthorizationTokenString();
      
      const httpsAgent = new https.Agent({ rejectUnauthorized: false });

      const url = `${this.apiBaseUrl}/retryExtendedWarrantyContract`;

      console.log('Request URL:', url);
      console.log('Request Body:', JSON.stringify(requestBody, null, 2));
      console.log('Environment:', this.environment);

      const response = await axios.post(url, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken,
          'X-Kong-Environment': this.environment
        },
        httpsAgent,
        timeout: 30000
      });

      console.log('Response Status:', response.status);
      console.log('Response Data:', JSON.stringify(response.data, null, 2));

      return {
        status: 'Success',
        message: 'Retry operation completed successfully',
        response: response.data,
        httpStatus: response.status
      };

    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          status: 'Error',
          message: 'Retry operation failed',
          errorDescription: error.response?.data?.message ?? error.message,
          httpStatus: error.response?.status,
          response: error.response?.data
        };
      }

      return {
        status: 'Error',
        message: 'Retry operation failed',
        errorDescription: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export function createEWMaintenanceRetryService(): EWMaintenanceRetryService {
  const config: EWMaintenanceConfig = {
    apiBaseUrl: process.env.EW_MAINTENANCE_API_BASE_URL!,
    environment: process.env.EW_MAINTENANCE_API_ENVIRONMENT!,
    oauth: {
      tokenUrl: process.env.ACCESS_TOKEN_URL!,
      clientId: process.env.EWSMA_OAUTH_CLIENT_ID!,
      clientSecret: process.env.EWSMA_OAUTH_CLIENT_SECRET!,
      scope: process.env.EW_MAINTENANCE_OAUTH_SCOPE!,
      tokenExpiryInSecs: parseInt(process.env.TOKEN_EXPIRY_IN_SECS!),
      gracePeriodInSecs: parseInt(process.env.TOKEN_REFRESH_BEFORE_EXPIRY_IN_SECS!)
    }
  };

  return new EWMaintenanceRetryService(config);
}

export default EWMaintenanceRetryService;
