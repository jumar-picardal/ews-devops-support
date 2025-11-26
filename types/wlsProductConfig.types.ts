/**
 * WLS Product Configuration Types
 * Shared configuration interface for WLS Product Inventory Management services
 */

export interface WlsProductConfig {
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
