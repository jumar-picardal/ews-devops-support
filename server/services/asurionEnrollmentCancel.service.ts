/**
 * Asurion Enrollment Cancel Service
 */

import axios from 'axios';
import https from 'https';
import OAuth2TokenManager from './oauth/OAuth2TokenManager';

interface EnrollmentCancelData {
  subscriptionId: string;
  serviceCode: string; // Changed from partnerId - backend determines partnerId
  cancelDate?: string;
  transactionDate?: string;
  cancelReason?: string;
}

interface EnrollmentCancelResponse {
  status: 'Success' | 'Error';
  message: string;
  subscriptionId?: string;
  cancelDate?: string;
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

class AsurionEnrollmentCancelService {
  private apiBaseUrl: string;
  private tokenManager: OAuth2TokenManager;

  constructor(config: AsurionConfig) {
    this.apiBaseUrl = config.apiBaseUrl;
    this.tokenManager = new OAuth2TokenManager(config.oauth);
  }

  async enrollmentCancel(cancelData: EnrollmentCancelData): Promise<EnrollmentCancelResponse> {
    try {
      if (!cancelData.subscriptionId) {
        throw new Error('subscriptionId is required');
      }

      if (!cancelData.serviceCode) {
        throw new Error('serviceCode is required');
      }

      // Backend determines partnerId based on serviceCode (best practice - keeps business logic server-side)
      let partnerId: string;
      
      if (cancelData.serviceCode.includes('TELUS')) {
        partnerId = process.env.ASURION_TELUS_PARTNER_ID!;
      } else if (cancelData.serviceCode.includes('KOODO') || cancelData.serviceCode.includes('KPP')) {
        partnerId = process.env.ASURION_KOODO_PARTNER_ID!;
      } else {
        throw new Error(`Invalid service code: ${cancelData.serviceCode} - no partner ID mapping found`);
      }

      const today = new Date().toISOString().split('T')[0];
      
      const requestBody = {
        partner_id: partnerId, // Uses server-determined partnerId
        cancel_date: cancelData.cancelDate ?? today,
        transaction_date: cancelData.transactionDate ?? today,
        cancel_reason: cancelData.cancelReason ?? 'customer_requested'
      };

      console.log('Cancel Asurion Request:', {
        subscriptionId: cancelData.subscriptionId,
        serviceCode: cancelData.serviceCode, // Log serviceCode received from frontend
        partnerId: requestBody.partner_id, // Log determined partnerId
        cancelDate: requestBody.cancel_date,
        transactionDate: requestBody.transaction_date,
        cancelReason: requestBody.cancel_reason
      });

      const authToken = await this.tokenManager.getAuthorizationTokenString();
      
      const httpsAgent = new https.Agent({ rejectUnauthorized: false });

      const url = `${this.apiBaseUrl}/${cancelData.subscriptionId}/cancel`;

      const response = await axios.post(url, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken,
          'Asurion-correlationid': `cancel-${cancelData.subscriptionId}-${Date.now()}`
        },
        httpsAgent,
        timeout: 30000
      });

      return {
        status: 'Success',
        message: 'Enrollment cancelled successfully',
        subscriptionId: cancelData.subscriptionId,
        cancelDate: requestBody.cancel_date,
        response: response.data,
        httpStatus: response.status
      };

    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Asurion API Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: JSON.stringify(error.response?.data, null, 2),
          message: error.message
        });
        
        return {
          status: 'Error',
          message: 'Cancellation operation failed',
          errorDescription: error.response?.data?.message ?? error.response?.data?.error ?? error.message,
          httpStatus: error.response?.status,
          response: error.response?.data
        };
      }

      console.error('Unexpected error:', error);
      
      return {
        status: 'Error',
        message: 'Cancellation operation failed',
        errorDescription: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export function createAsurionEnrollmentCancelService(): AsurionEnrollmentCancelService {
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

  return new AsurionEnrollmentCancelService(config);
}

export default AsurionEnrollmentCancelService;
