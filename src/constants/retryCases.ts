/**
 * Retry Case Definitions
 * Shared across ReconcileTender and RetryContracts pages
 */

export type RetryCaseId = 'case1' | 'case2' | 'case3' | 'case4' | 'case5' | 'case6' | 'case7';

export interface RetryCase {
  id: RetryCaseId;
  label: string;
  description: string;
  actions: string[];
  applicableStatuses: string[];
}

export const RETRY_CASES: RetryCase[] = [
  {
    id: 'case1',
    label: 'Case 1',
    description: 'Update REPORTED to FAIL → RETRY',
    actions: [
      'Mark transaction states from REPORTED to FAIL',
      'Perform RETRY warranty',
      'For contracts with TENDER, ACTIVE_PROCESSING, CLOSED_UNREGISTER, CLOSED_TENDER status'
    ],
    applicableStatuses: ['TENDER', 'ACTIVE_PROCESSING', 'CLOSED_UNREGISTER', 'CLOSED_TENDER']
  },
  {
    id: 'case2',
    label: 'Case 2',
    description: 'Update REPORTED and FAIL to SUCCESS → RETRY',
    actions: [
      'Mark transaction states from REPORTED/FAIL/SKIP to SUCCESS',
      'Perform RETRY warranty'
    ],
    applicableStatuses: ['TENDER', 'ACTIVE_PROCESSING', 'CLOSED_UNREGISTER', 'CLOSED_TENDER']
  },
  {
    id: 'case3',
    label: 'Case 3',
    description: 'CLOSED_UNREGISTER status with Closed BAN or Inactive Phone no. → RETRY',
    actions: [
      'Process only contracts with CLOSED_UNREGISTER status',
      'If BAN is NOT Open OR Phone number is NOT Active in KB:',
      '  - Mark transaction states from REPORTED/FAIL to SUCCESS',
      '  - Perform RETRY warranty',
      'If both BAN is Open AND Phone is Active: Skip'
    ],
    applicableStatuses: ['CLOSED_UNREGISTER']
  },
  {
    id: 'case4',
    label: 'Case 4',
    description: 'CLOSED_UNREGISTER status with Open BAN and Active Phone no. → RETRY',
    actions: [
      'Process only contracts with CLOSED_UNREGISTER status',
      'If BAN is Open OR Phone number is Active in KB:',
      '  - Remove its SOC from KB',
      '  - Mark transaction states from REPORTED/FAIL to SUCCESS',
      '  - Perform RETRY warranty'
    ],
    applicableStatuses: ['CLOSED_UNREGISTER']
  },
  {
    id: 'case5',
    label: 'Case 5',
    description: 'CLOSED_TENDER status with failed CREATE_VENDOR_ORDER (Asurion) → RETRY',
    actions: [
      'Process only contracts with CLOSED_TENDER status',
      'If vendor is Asurion: Cancel Asurion enrollment',
      'If vendor is Apple: Skip'
    ],
    applicableStatuses: ['CLOSED_TENDER']
  },
  {
    id: 'case6',
    label: 'Case 6',
    description: 'ACTIVE_PROCESSING status with failed ADD_SUBSCRIBER_SOC → RETRY',
    actions: [
      'Process only contracts with ACTIVE_PROCESSING status',
      'If BAN is Open AND Phone number is Active in KB:',
      '  - Add its SOC to KB',
      '  - Mark transaction states from REPORTED to FAIL',
      '  - Perform RETRY warranty'
    ],
    applicableStatuses: ['ACTIVE_PROCESSING']
  },
  {
    id: 'case7',
    label: 'Case 7',
    description: 'ACTIVE_PROCESSING status with failed CREATE_VENDOR_ORDER (DCC) → RETRY',
    actions: [
      'Process only contracts with ACTIVE_PROCESSING status',
      'If BAN is Open AND Phone number is Active AND vendor is Asurion:',
      '  - Create Asurion enrollment',
      '  - Mark transaction states from REPORTED to FAIL',
      '  - Perform RETRY warranty'
    ],
    applicableStatuses: ['ACTIVE_PROCESSING']
  }
];

export const getRetryCaseById = (id: RetryCaseId): RetryCase | undefined => {
  return RETRY_CASES.find(c => c.id === id);
};

export const getRetryCaseLabel = (id: RetryCaseId): string => {
  const retryCase = getRetryCaseById(id);
  return retryCase ? `${retryCase.label}: ${retryCase.description}` : '';
};

export const getApplicableCases = (warrantyStatus: string): RetryCase[] => {
  return RETRY_CASES.filter(c => 
    c.applicableStatuses.includes(warrantyStatus)
  );
};
