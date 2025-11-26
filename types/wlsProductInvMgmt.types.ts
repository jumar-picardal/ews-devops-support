/**
 * WLS Product Inventory Management Types
 * Shared type definitions for WLS Product API responses
 */

export interface WlsProdInvMgmtProduct {
  name: string;
  billingAccount: {
    id: string;
  };
  productTerm?: Array<{
    validFor: {
      startDateTime: string;
    };
  }>;
  relatedParty?: Array<{
    familyName: string;
    givenName: string;
    languageCd: string;
    contactMedium: {
      addressTypeCd: string;
      city: string;
      stateOrProvince: string;
      postCode: string;
      country: string;
    };
  }>;
  status: 'active' | 'cancelled' | 'suspended' | 'pendingActive';
  subscriptionId: string;
  marketProvinceCd: string;
  brandId: string;
  salesRepCd: string;
  previousPhoneNum?: string;
}

export interface WlsProdInvMgmtMemo {
  id: string;
  author: string;
  date: string;
  '@type': 'Memo';
  productId: string;
  memoType: string;
  systemText?: string;
  text?: string;
  operatorId: number;
  manualInd: boolean;
}

export interface ProductQueryParams {
  ban?: string;
  phoneNumber?: string;
}
