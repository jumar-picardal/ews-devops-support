/**
 * Maps KB Memo Type codes to human-readable descriptions and categories
 */

const MEMO_TYPE_MAP: Record<string, string> = {
  'PNCH': 'Phone Number Change',
  'PHCH': 'Phone Number Change',
  '0009': 'Subscriber Changed',
  'AOFR': 'Acquisition Offer',
  'AOMM': 'Acquisition Offer',
  '0004': 'Activation',
  'REFL': 'Renewal Fulfilled',
  'EQW': 'Equipment Warranty',
  'CHCH': 'Channel Care Chat',
  'GENE': 'General',
  'FYI': 'FYI',
  'INQ': 'Inquiry/Education',
  '0001': 'Tentative BAN'
};

// Simple category lookup for radio button grouping
const MEMO_CATEGORY_MAP: Record<string, string> = {
  'PNCH': 'Subscriber Changed',
  '0009': 'Subscriber Changed',
  'PHCH': 'Subscriber Changed',
  'AOFR': 'Subscriber Activated',
  'AOMM': 'Subscriber Activated',
  '0004': 'Subscriber Activated',
  'REFL': 'Subscriber Activated',
  'EQW': 'Subscriber Activated',
  'CHCH': 'FYI',
  'GENE': 'FYI',
  'FYI': 'FYI',
  'INQ': 'FYI',
  '0001': 'Tentative'
};

export const getMemoTypeDescription = (memoType: string): string => {
  const trimmedType = memoType.trim();
  return MEMO_TYPE_MAP[trimmedType] ?? trimmedType;
};

export const getMemoCategory = (memoType: string): string => {
  const trimmedType = memoType.trim();
  return MEMO_CATEGORY_MAP[trimmedType] ?? 'Unknown';
};
