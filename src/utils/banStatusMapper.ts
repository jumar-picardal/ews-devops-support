/**
 * BAN Status Mapper Utility
 * Maps KB BILLING_ACCOUNT status codes to user-friendly messages
 */

export interface KbBanStatus {
  BAN_STATUS: string;
  STATUS_ACTV_CODE: string;
  STATUS_ACTV_RSN_CODE: string;
}

/**
 * Get user-friendly BAN status message from KB status data
 */
export const getBanStatusMessage = (banStatusData: KbBanStatus | null): string => {
  if (!banStatusData) return '';

  // Trim whitespace from all values to ensure clean comparisons
  const BAN_STATUS = banStatusData.BAN_STATUS?.toString().trim();
  const STATUS_ACTV_CODE = banStatusData.STATUS_ACTV_CODE?.toString().trim();
  const STATUS_ACTV_RSN_CODE = banStatusData.STATUS_ACTV_RSN_CODE?.toString().trim();

  // Debug logging to see actual values
  console.log('BAN Status Debug:', {
    BAN_STATUS: `"${BAN_STATUS}"`,
    STATUS_ACTV_CODE: `"${STATUS_ACTV_CODE}"`,
    STATUS_ACTV_RSN_CODE: `"${STATUS_ACTV_RSN_CODE}"`
  });

  // BAN status lookup table: Maps "BAN_STATUS-STATUS_ACTV_CODE-STATUS_ACTV_RSN_CODE" combinations to user-friendly messages
  const statusMappings: Record<string, string> = {
    'C-CBN-CL': 'Closed (Automatic close of BAN)',
    'T-TEN-NB': 'Tentative (New BAN)',
    'N-CAN-FRD': 'Cancelled (Fraud (TMW))',
    'N-CAN-AIE': 'Cancelled (Activated in Error)',
    'N-CAN-AREA': 'Cancelled (Left TELUS Area)',
    'N-CAN-CNP1': 'Cancelled (Non Payment (TMW))',
    'N-CAN-DEC': 'Cancelled (Deceased)',
    'N-CAN-DNP': 'Cancelled (Termination Non-payment)',
    'N-CAN-LSTL': 'Cancelled (Lost or Stolen Unit)',
    'N-CAN-POKO': 'Cancelled (Port out PCS postpaid)',
    'N-CAN-PRTO': 'Cancelled (Ported Out)',
    'N-MCN-TOWN': 'Cancelled (Move due to TOWN)',
    'S-SUS-FRUD': 'Suspended (Potential Fraud Account)',
    'S-SUS-SNP': 'Suspended (Collection Suspend Nonpay (delinquent))',
    'S-SUS-CLMS': 'Suspended (Credit Limit Suspension)',
    'S-SUS-CVAD': 'Suspended (Consumer VAD)',
    'O-MCN-CR': 'Open (Customer Request)',
    'O-MCN-PRPO': 'Open (Migrate to Post-paid)',
    'O-NAC-CA': 'Open (Account Set-Up Fee $X)',
    'O-NAC-CAPO': 'Open (Apollo PCS No fee)',
    'O-NAC-CGEM': 'Open (Web RA PCS Activ $X Fee)',
    'O-NAC-CMNF': 'Open (Mercury PCS No Fee)',
    'O-NAC-CSA': 'Open (Account Set Up Fee)',
    'O-NAC-CSAD': 'Open (Data Account Set Up Fee)',
    'O-NAC-MKPO': 'Open (MiKE to PCS Post-paid)',
    'O-NAC-TG': 'Open (DO NOT USE)',
    'O-RCL-CRQ': 'Open (Per Customer Request)',
    'O-RCL-RNP': 'Open (Nonpay Cancel)',
    'O-RCL-WINB': 'Open (Resume Ported Subscriber)',
    'O-RSP-CLMR': 'Open (Credit Limit Restore)',
    'O-RSP-CNPA': 'Open (Collections (NPA))',
    'O-RSP-CNV': 'Open (Conversion Default)',
    'O-RSP-CRQ': 'Open (Per Customer Request)',
    'O-RSP-FND': 'Open (Unit Found)',
    'O-RSP-FPP': 'Open (Full Payment (Auto))',
    'O-RSP-PR': 'Open (Procedural)',
    'O-RSP-PY': 'Open (Payment Received (Manual))',
    'O-RSP-SR': 'Open (SIM Replacement (Lost/Stolen))',
    'O-RSP-STL': 'Open (Stolen Until Found)',
    'O-RSP-UNS': 'Open (Unsuspend Customer)',
    'O-RSP-VADR': 'Open (VAD Resume)',
    'O-RSP-VAR': 'Open (Vacation Reconnect)',
    'O-MCN-POPR': 'Open (Migrate to Pre-paid (Pre-paid account is not eligible for EWS; ERR_WCOIM_ACCOUNT_TYPE_UNSUPPORTED))',
    'O-MCN-TOWN': 'Open (Move due to TOWN)'
  };

  // Create lookup key and return corresponding message
  const lookupKey = `${BAN_STATUS}-${STATUS_ACTV_CODE}-${STATUS_ACTV_RSN_CODE}`;
  const statusMessage = statusMappings[lookupKey];

  if (statusMessage) {
    return statusMessage;
  }

  // If no specific combination found, provide fallback based on BAN_STATUS
  const statusFallbacks: Record<string, string> = {
    'C': `Closed (${BAN_STATUS}-${STATUS_ACTV_CODE}-${STATUS_ACTV_RSN_CODE})`,
    'T': `Tentative (${BAN_STATUS}-${STATUS_ACTV_CODE}-${STATUS_ACTV_RSN_CODE})`,
    'N': `Cancelled (${BAN_STATUS}-${STATUS_ACTV_CODE}-${STATUS_ACTV_RSN_CODE})`,
    'S': `Suspended (${BAN_STATUS}-${STATUS_ACTV_CODE}-${STATUS_ACTV_RSN_CODE})`,
    'O': `Open (${BAN_STATUS}-${STATUS_ACTV_CODE}-${STATUS_ACTV_RSN_CODE})`
  };

  const fallbackMessage = statusFallbacks[BAN_STATUS];
  if (fallbackMessage) {
    return fallbackMessage;
  }

  // If BAN_STATUS is also unknown, return the full combination
  return `(${BAN_STATUS} (${STATUS_ACTV_CODE} (${STATUS_ACTV_RSN_CODE})`;
};

/**
 * Get background color for BAN status badge
 */
export const getBanStatusBackgroundColor = (banStatusData: KbBanStatus | null): string => {
  if (!banStatusData) return 'lightcoral';

  const BAN_STATUS = banStatusData.BAN_STATUS?.toString().trim();

  // lightgreen for Open, lightcoral for everything else
  return BAN_STATUS === 'O' ? 'lightgreen' : 'lightcoral';
};
