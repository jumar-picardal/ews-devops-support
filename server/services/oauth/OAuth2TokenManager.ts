/**
 * OAuth2 Token Manager
 * Handles OAuth2 token refresh with automatic expiry management
 */

import axios from 'axios';
import https from 'https';

interface OAuth2Config {
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
  scope: string;
  tokenExpiryInSecs: number;
  gracePeriodInSecs: number;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

class OAuth2TokenManager {
  private tokenUrl: string;
  private clientId: string;
  private clientSecret: string;
  private scope: string;
  private tokenExpiryInSecs: number;
  private gracePeriodInSecs: number;
  
  private currentToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(config: OAuth2Config) {
    this.tokenUrl = config.tokenUrl;
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.scope = config.scope;
    this.tokenExpiryInSecs = config.tokenExpiryInSecs;
    this.gracePeriodInSecs = config.gracePeriodInSecs;
  }

  async getAuthorizationTokenString(): Promise<string> {
    if (!this.isTokenValid()) {
      await this.refreshToken();
    }
    return `Bearer ${this.currentToken}`;
  }

  private isTokenValid(): boolean {
    if (!this.currentToken) {
      return false;
    }

    const now = Date.now();
    const gracePeriodMs = this.gracePeriodInSecs * 1000;
    
    return now < (this.tokenExpiry - gracePeriodMs);
  }

  private async refreshToken(): Promise<void> {
    try {
      console.log('[OAuth2] Requesting token from:', this.tokenUrl);
      console.log('[OAuth2] Scope:', this.scope);
      
      const httpsAgent = new https.Agent({
        rejectUnauthorized: false
      });

      const response = await axios.post<TokenResponse>(
        this.tokenUrl,
        {
          grant_type: 'client_credentials',
          scope: this.scope
        },
        {
          auth: {
            username: this.clientId,
            password: this.clientSecret
          },
          httpsAgent,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.currentToken = response.data.access_token;
      
      const expirySeconds = response.data.expires_in ?? this.tokenExpiryInSecs;
      this.tokenExpiry = Date.now() + (expirySeconds * 1000);
      
      console.log('[OAuth2] Token obtained successfully, expires in:', expirySeconds, 'seconds');

    } catch (error) {
      console.error('[OAuth2] Token refresh failed:', {
        url: this.tokenUrl,
        scope: this.scope,
        error: error instanceof Error ? error.message : 'Unknown error',
        response: axios.isAxiosError(error) ? {
          status: error.response?.status,
          data: error.response?.data
        } : undefined
      });
      throw new Error(`Failed to refresh OAuth2 token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default OAuth2TokenManager;
