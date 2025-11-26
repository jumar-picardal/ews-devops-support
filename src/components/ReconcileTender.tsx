import { useState, useEffect } from 'react';
import '../styles/design-system.css';
import { useFetchDetails } from '../hooks/reconcileTender/useFetchDetails';
import { RETRY_CASES, type RetryCaseId } from '../constants/retryCases';
import { useCase1Retry } from '../hooks/retryContracts/useCase1Retry';
import { useCase2Retry } from '../hooks/retryContracts/useCase2Retry';
import { useCase3Retry } from '../hooks/retryContracts/useCase3Retry';
import { useCase4Retry } from '../hooks/retryContracts/useCase4Retry';
import { useCase5Retry } from '../hooks/retryContracts/useCase5Retry';
import { useCase6Retry } from '../hooks/retryContracts/useCase6Retry';
import { useCase7Retry } from '../hooks/retryContracts/useCase7Retry';
import MessageLog, { type Message, type MessageType } from './MessageLog';
import { getBanStatusMessage, getBanStatusBackgroundColor } from '../utils/banStatusMapper';
import { getMemoTypeDescription, getMemoCategory } from '../utils/memoTypeMapper';
import { getKbMemoImeiInfo } from '../services/api/getKbMemoImeiInfo.api';
import { getKbMemoSocInfo } from '../services/api/getKbMemoSocInfo.api';
import { getWlsMemo } from '../services/api/wlsProdInvMgmtMemo.api';
import type { KbMemoRow } from '../../types/kb_memo.types';
import type { KbServiceAgreementRow } from '../../types/kb_service_agreement.types';
import type { WlsProdInvMgmtMemo } from '../../types/wlsProductInvMgmt.types';

// Reusable memo card component
const MemoCard = ({ memo }: { memo: KbMemoRow }) => {
  const isTentative = getMemoCategory(memo.MEMO_TYPE) === 'Tentative';
  
  return (
    <div style={{ 
      padding: '15px',
      backgroundColor: 'white',
      borderRadius: '8px',
      border: '1px solid #e9ecef',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
    }}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr auto',
        marginBottom: '10px',
        paddingBottom: '8px',
        borderBottom: '1px solid #f1f1f1'
      }}>
        <span style={{ fontWeight: 600, color: '#333' }}>
          {isTentative ? `BAN: ${memo.MEMO_BAN}` : `Phone number: ${memo.MEMO_SUBSCRIBER}`}
        </span>
      <span style={{ 
        justifySelf: 'end',
        color: '#666',
        fontSize: '0.9em'
      }}>
        {new Date(memo.MEMO_DATE).toLocaleString()}
      </span>
    </div>
    {(memo.MEMO_SYSTEM_TXT || memo.MEMO_MANUAL_TXT) && (
      <div style={{ 
        color: '#333',
        marginTop: '5px',
        lineHeight: '1.5'
      }}>
        <span style={{ 
          padding: '2px 8px',
          marginRight: '12px',
          borderRadius: '4px',
          backgroundColor: '#e5e7eb',
          fontSize: '0.85em',
          fontWeight: 500
        }}>
          {getMemoTypeDescription(memo.MEMO_TYPE)}
        </span>
        <span>{memo.MEMO_SYSTEM_TXT || memo.MEMO_MANUAL_TXT}</span>
      </div>
    )}
    </div>
  );
};

const ReconcileTender = () => {
  const [contractId, setContractId] = useState('');
  const [autoUpdate, setAutoUpdate] = useState(false);
  const [selectedMemoCategory, setSelectedMemoCategory] = useState<'Subscriber Changed' | 'Subscriber Activated' | 'FYI' | 'Tentative' | 'IMEI Info' | 'SOC Info' | 'by Phone No.'>('Subscriber Changed');
  const [selectedPhoneNumForMemo, setSelectedPhoneNumForMemo] = useState<string>('');
  const [kbMemoImeiInfo, setKbMemoImeiInfo] = useState<KbMemoRow[]>([]);
  const [isLoadingImeiInfo, setIsLoadingImeiInfo] = useState(false);
  const [kbMemoSocInfo, setKbMemoSocInfo] = useState<KbServiceAgreementRow[]>([]);
  const [isLoadingMemoSocInfo, setIsLoadingMemoSocInfo] = useState(false);
  const [wlsMemoByPhone, setWlsMemoByPhone] = useState<WlsProdInvMgmtMemo[]>([]);
  const [isLoadingWlsMemo, setIsLoadingWlsMemo] = useState(false);
  const [isMemoExpanded, setIsMemoExpanded] = useState(true);
  const [isSubscribersExpanded, setIsSubscribersExpanded] = useState(true);
  const [selectedRetryCase, setSelectedRetryCase] = useState<RetryCaseId>('case1');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedPhoneNum, setSelectedPhoneNum] = useState<string>('');

  const { ewContractData, ewCustomerData, warrantyStatus, ewTransactionData, kbBanStatus, kbMemoList, phoneNumListInfo, loading, fetchDetails, refreshTransactionData, fetchPhoneNumList, fetchKbMemoList } = useFetchDetails();

  const addMessage = (type: MessageType, text: string) => {
    setMessages(prev => [{ type, text }, ...prev.slice(0, 30)]);
  };

  // Initialize retry hooks
  const { retryCase1, state: case1State } = useCase1Retry();
  const { retryCase2, state: case2State } = useCase2Retry();
  const { retryCase3, state: case3State } = useCase3Retry();
  const { retryCase4, state: case4State } = useCase4Retry();
  const { retryCase5, state: case5State } = useCase5Retry();
  const { retryCase6, state: case6State } = useCase6Retry();
  const { retryCase7, state: case7State } = useCase7Retry();

  // Get current retry state based on selected case
  const currentRetryState = (() => {
    switch (selectedRetryCase) {
      case 'case1': return case1State;
      case 'case2': return case2State;
      case 'case3': return case3State;
      case 'case4': return case4State;
      case 'case5': return case5State;
      case 'case6': return case6State;
      case 'case7': return case7State;
      default: return { isProcessing: false, error: null };
    }
  })();

  // Map phoneNumListInfo from API to display format
  const kbSubscriberList = phoneNumListInfo.map(item => ({
    phoneNumStatus: item.status,
    phoneNum: item.name,
    subscriptionId: item.subscriptionId,
    brandId: item.brandId,
    firstName: item.relatedParty?.[0]?.givenName ?? '',
    lastName: item.relatedParty?.[0]?.familyName ?? ''
  }));

  // Auto-select phone number on KB Subscribers radio button that matches EWC contract phone number
  useEffect(() => {
    if (ewContractData?.cust_phone_num && kbSubscriberList.length > 0) {
      const matchingPhone = kbSubscriberList.find(
        sub => sub.phoneNum === ewContractData.cust_phone_num && sub.phoneNumStatus === 'active'
      );
      if (matchingPhone) {
        setSelectedPhoneNum(matchingPhone.phoneNum);
      }
    }
  }, [ewContractData?.cust_phone_num, kbSubscriberList.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractId) return;

    addMessage('info', `🔍 Fetching details for contract ${contractId}...`);
    
    try {
      const result = await fetchDetails(contractId, isSubscribersExpanded, isMemoExpanded);
      // Get memo count from the actual API response
      const recordCount = result?.memoListData?.length ?? 0;
      addMessage('success', `✓ Contract ${contractId} loaded successfully - Found ${recordCount} memo records`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to fetch details:', err);
      addMessage('error', `✗ Failed to fetch contract ${contractId}: ${errorMsg}`);
    }
  };

  const handleContractIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setContractId(value);
  };

  const handleRefresh = async () => {
    if (!contractId || !ewContractData) return;

    addMessage('info', `🔄 Refreshing transaction data for contract ${contractId}...`);

    try {
      const result = await refreshTransactionData(contractId);
      if (result) {
        console.log('Transaction data refreshed successfully');
        addMessage('success', `✓ Transaction data for contract ${contractId} refreshed`);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to refresh transaction data:', err);
      addMessage('error', `✗ Failed to refresh transaction data: ${errorMsg}`);
    }
  };

  const handleRetry = async () => {
    if (!contractId || !ewContractData) return;

    console.log(`[RETRY] Executing ${selectedRetryCase} for contract ${contractId}`);
    addMessage('info', `Starting retry for contract ${contractId} using ${selectedRetryCase}...`);

    try {
      let result;

      addMessage('info', `Processing contract ${contractId}...`);

      switch (selectedRetryCase) {
        case 'case1':
          result = await retryCase1(contractId);
          break;
        case 'case2':
          result = await retryCase2(contractId);
          break;
        case 'case3':
          result = await retryCase3(contractId);
          break;
        case 'case4':
          result = await retryCase4(contractId);
          break;
        case 'case5':
          result = await retryCase5(contractId);
          break;
        case 'case6':
          result = await retryCase6(contractId);
          break;
        case 'case7':
          result = await retryCase7(contractId);
          break;
        default:
          console.error('[RETRY] Invalid case selected');
          addMessage('error', 'Invalid retry case selected');
          return;
      }

      console.log('[RETRY] Result:', result);
      
      if (result.success) {
        addMessage('success', `✓ Contract ${contractId}: ${result.message}`);
        // Refresh transaction data after successful retry
        await handleRefresh();
      } else {
        const errorDetail = result.details ? `: ${result.details}` : '';
        if (result.retryAttempted) {
          addMessage('error', `✗ Contract ${contractId}: ${result.message}${errorDetail}`);
        } else {
          addMessage('info', `⊘ Contract ${contractId}: ${result.message}`);
        }
      }

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('[RETRY] Error:', errorMsg);
      addMessage('error', `✗ Contract ${contractId}: ${errorMsg}`);
    }
  };

  const handlePhoneNumMemoSelect = async (phoneNum: string) => {
    setSelectedPhoneNumForMemo(phoneNum);
    
    if (!phoneNum || !ewContractData?.billing_account_num) {
      setWlsMemoByPhone([]);
      return;
    }

    setIsLoadingWlsMemo(true);
    try {
      console.log('Fetching WLS Memo for phone:', phoneNum);
      const memoData = await getWlsMemo(ewContractData.billing_account_num, phoneNum);
      console.log('WLS Memo fetched:', memoData);
      setWlsMemoByPhone(memoData);
    } catch (err) {
      console.error('Failed to fetch WLS Memo:', err);
      setWlsMemoByPhone([]);
    } finally {
      setIsLoadingWlsMemo(false);
    }
  };

  return (
    <>
      <title>Reconcile Tender Contracts - EWS DevOps Support</title>
      
      <div className="page-container">
        <div className="content-wrapper">
          <div className="card">
            <h1 className="card-title">Reconcile Tender Contracts</h1>
            
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <input
                    type="text"
                    value={contractId}
                    onChange={handleContractIdChange}
                    placeholder="Enter Contract ID, BAN, or Phone Number"
                    required
                    className="form-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-success btn-lg"
                  >
                    {loading ? 'Loading...' : 'Fetch Details'}
                  </button>

                  <label style={{ display: 'flex', alignItems: 'start', fontSize: '14px', color: 'var(--color-neutral-700)', cursor: 'pointer', maxWidth: '500px' }}>
                    <input
                      type="checkbox"
                      checked={autoUpdate}
                      onChange={(e) => setAutoUpdate(e.target.checked)}
                      style={{ marginRight: '8px', marginTop: '3px' }}
                    />
                    <span>
                      Auto-update the phone number on EWS for Tender contracts with a single active phone number in KB.
                    </span>
                  </label>
                </div>
              </form>
            </div>
          </div>

          {/* EWS Data Card */}
          <div className="card">
            <h2 className="section-header">
              EWS Data
            </h2>
            <div className="card-body">
              <div className="data-grid">
                {[
                  ['Contract ID:', ewContractData?.billing_account_num ? contractId : '-'],
                  ['BAN:', (
                    <>
                      {ewContractData?.billing_account_num ?? '-'}
                      {kbBanStatus && (
                        <span style={{ 
                          marginLeft: '12px',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: getBanStatusBackgroundColor(kbBanStatus),
                          color: 'black',
                          fontWeight: 'normal',
                          fontSize: '14px'
                        }}>
                          {getBanStatusMessage(kbBanStatus)}
                        </span>
                      )}
                    </>
                  )],
                  ['IMEI:', ewContractData?.covered_device_serial_num ?? '-'],
                  ['Subscription ID:', ewContractData?.subscription_id ?? '-'],
                  ['Warranty:', ewContractData ? `${ewContractData.wrnty_srvc_cd} ${ewContractData.payment_method_cd} $${ewContractData.service_cost_amt} (${ewContractData.order_type_cd})` : '-'],
                  ['Start Date:', ewContractData?.warranty_start_dt ? `${ewContractData.warranty_start_dt.split('T')[0]} (${ewContractData.wrnty_typ_cd})` : '-'],
                  ['EWC Phone no.:', ewContractData?.cust_phone_num ?? '-'],
                  ['EWCC Phone no.:', ewCustomerData?.cust_phone_num ?? '-'],
                  ['Customer Name:', ewContractData ? `${ewContractData.cust_first_nm} ${ewContractData.cust_last_nm}` : '-']
                ].map(([label, value], idx) => (
                  <div key={idx} className="data-grid-row">
                    <span className="data-grid-label">{label}</span>
                    <span className="data-grid-value">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* KB Subscribers Card */}
          <div className="card">
                  <div className="section-header-row">
                    <h2>KB Subscribers</h2>
                    <button
                      type="button"
                      onClick={() => {
                        const newExpandedState = !isSubscribersExpanded;
                        setIsSubscribersExpanded(newExpandedState);
                        // Load KB Subscribers on-demand when expanding (if not already loaded)
                        if (newExpandedState && phoneNumListInfo.length === 0 && ewContractData?.billing_account_num) {
                          fetchPhoneNumList(ewContractData.billing_account_num);
                        }
                      }}
                      className="btn btn-sm btn-secondary"
                      style={{ fontSize: '18px', fontWeight: 'bold', minWidth: '40px' }}
                    >
                      {isSubscribersExpanded ? '−' : '+'}
                    </button>
                  </div>
                  {isSubscribersExpanded && (
                    <div className="card-body">
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#f9fafb' }}>
                              <th style={{ textAlign: 'center', padding: '12px', borderBottom: '1px solid #e5e7eb', fontWeight: 600, width: '60px' }}>Select</th>
                              <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e5e7eb', fontWeight: 600, width: '60px', whiteSpace: 'nowrap' }}>Status</th>
                              <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e5e7eb', fontWeight: 600, width: '60px', whiteSpace: 'nowrap' }}>Phone Number</th>
                              <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e5e7eb', fontWeight: 600, width: '60px', whiteSpace: 'nowrap' }}>Subscription ID</th>
                              <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e5e7eb', fontWeight: 600, width: '60px', whiteSpace: 'nowrap' }}>Brand</th>
                              <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>Customer Name</th>
                            </tr>
                          </thead>
                          <tbody>
                            {kbSubscriberList.map((subsInfo, index) => (
                              <tr 
                                key={index}
                                style={{ transition: 'background-color 0.2s' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <td style={{ textAlign: 'center', padding: '12px', borderBottom: '1px solid #e5e7eb' }}>
                                  <input
                                    type="radio"
                                    name="phoneNum"
                                    value={subsInfo.phoneNum}
                                    checked={selectedPhoneNum === subsInfo.phoneNum}
                                    onChange={(e) => setSelectedPhoneNum(e.target.value)}
                                    disabled={subsInfo.phoneNumStatus !== 'active'}
                                  />
                                </td>
                                <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>
                                  <span style={{ 
                                    padding: '4px 8px', 
                                    borderRadius: '4px', 
                                    fontSize: '12px', 
                                    fontWeight: 500,
                                    backgroundColor: 
                                      subsInfo.phoneNumStatus === 'active' ? 'lightgreen' :
                                      subsInfo.phoneNumStatus === 'pendingActive' ? '#F0E68C' :
                                      'lightcoral',
                                    color: 'black'
                                  }}>
                                    {subsInfo.phoneNumStatus.charAt(0).toUpperCase() + subsInfo.phoneNumStatus.slice(1)}
                                  </span>
                                </td>
                                <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{subsInfo.phoneNum}</td>
                                <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{subsInfo.subscriptionId}</td>
                                <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>
                                  {subsInfo.brandId === '1' ? 'TELUS' : subsInfo.brandId === '3' ? 'KOODO' : subsInfo.brandId}
                                </td>
                                <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>
                                  {subsInfo.firstName} {subsInfo.lastName}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
          </div>

          {/* KB Memo List Card */}
          <div className="card">
            <div className="section-header-row">
              <h2>KB Memo List</h2>
              <button
                type="button"
                onClick={() => {
                  const newExpandedState = !isMemoExpanded;
                  setIsMemoExpanded(newExpandedState);
                  // Load KB Memo List on-demand when expanding (if not already loaded)
                  if (newExpandedState && kbMemoList.length === 0 && ewContractData?.billing_account_num) {
                    fetchKbMemoList(ewContractData.billing_account_num);
                  }
                }}
                className="btn btn-sm btn-secondary"
                style={{ fontSize: '18px', fontWeight: 'bold', minWidth: '40px' }}
              >
                {isMemoExpanded ? '−' : '+'}
              </button>
            </div>
            {isMemoExpanded && (
              <div className="card-body">
                {/* Category Filter */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                  {(['Subscriber Changed', 'Subscriber Activated', 'FYI', 'Tentative'] as const).map(category => {
                    const count = kbMemoList.filter(m => getMemoCategory(m.MEMO_TYPE) === category).length;
                    const isSelected = selectedMemoCategory === category;
                    return (
                      <label 
                        key={category}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          cursor: 'pointer',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          transition: 'background-color 0.2s',
                          fontWeight: isSelected ? 600 : 'normal'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f2f5'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <input
                          type="radio"
                          name="memoCategory"
                          value={category}
                          checked={isSelected}
                          onChange={(e) => setSelectedMemoCategory(e.target.value as typeof selectedMemoCategory)}
                          style={{ marginRight: '6px' }}
                        />
                        <span>{category} ({count})</span>
                      </label>
                    );
                  })}
                  <label 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      transition: 'background-color 0.2s',
                      fontWeight: selectedMemoCategory === 'IMEI Info' ? 600 : 'normal'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f2f5'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <input
                      type="radio"
                      name="memoCategory"
                      value="IMEI Info"
                      checked={selectedMemoCategory === 'IMEI Info'}
                      onChange={async (e) => {
                        setSelectedMemoCategory(e.target.value as typeof selectedMemoCategory);
                        if (kbMemoImeiInfo.length === 0 && ewContractData?.billing_account_num && ewContractData?.covered_device_serial_num) {
                          setIsLoadingImeiInfo(true);
                          try {
                            console.log('Fetching IMEI Info...');
                            const imeiData = await getKbMemoImeiInfo(
                              ewContractData.billing_account_num,
                              ewContractData.covered_device_serial_num
                            );
                            console.log('IMEI Info fetched:', imeiData);
                            setKbMemoImeiInfo(imeiData);
                          } catch (err) {
                            console.error('Failed to fetch IMEI Info:', err);
                            setKbMemoImeiInfo([]);
                          } finally {
                            setIsLoadingImeiInfo(false);
                          }
                        }
                      }}
                      style={{ marginRight: '6px' }}
                    />
                    <span>IMEI Info ({kbMemoImeiInfo.length})</span>
                  </label>
                  <label 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      transition: 'background-color 0.2s',
                      fontWeight: selectedMemoCategory === 'SOC Info' ? 600 : 'normal'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f2f5'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <input
                      type="radio"
                      name="memoCategory"
                      value="SOC Info"
                      checked={selectedMemoCategory === 'SOC Info'}
                      onChange={async (e) => {
                        setSelectedMemoCategory(e.target.value as typeof selectedMemoCategory);
                        if (kbMemoSocInfo.length === 0 && ewContractData?.billing_account_num) {
                          setIsLoadingMemoSocInfo(true);
                          try {
                            console.log('Fetching SOC Info...');
                            const socData = await getKbMemoSocInfo(ewContractData.billing_account_num);
                            console.log('SOC Info fetched:', socData);
                            setKbMemoSocInfo(socData);
                          } catch (err) {
                            console.error('Failed to fetch SOC Info:', err);
                            setKbMemoSocInfo([]);
                          } finally {
                            setIsLoadingMemoSocInfo(false);
                          }
                        }
                      }}
                      style={{ marginRight: '6px' }}
                    />
                    <span>SOC Info ({kbMemoSocInfo.length})</span>
                  </label>
                  <label 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      transition: 'background-color 0.2s',
                      fontWeight: selectedMemoCategory === 'by Phone No.' ? 600 : 'normal'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f2f5'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <input
                      type="radio"
                      name="memoCategory"
                      value="by Phone No."
                      checked={selectedMemoCategory === 'by Phone No.'}
                      onChange={(e) => setSelectedMemoCategory(e.target.value as typeof selectedMemoCategory)}
                      style={{ marginRight: '6px' }}
                    />
                    <span>by Phone No.</span>
                  </label>
                </div>

                {/* Phone Number Dropdown - shown when "by Phone No." is selected */}
                {selectedMemoCategory === 'by Phone No.' && (
                  <div style={{ marginBottom: '20px' }}>
                    <select
                      value={selectedPhoneNumForMemo}
                      onChange={(e) => handlePhoneNumMemoSelect(e.target.value)}
                      className="form-input"
                      style={{ width: '300px' }}
                    >
                      <option value="">Select a phone number</option>
                      {kbSubscriberList
                        .filter(sub => sub.phoneNumStatus === 'active')
                        .map((sub, index) => (
                          <option key={index} value={sub.phoneNum}>
                            {sub.phoneNum}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {/* Memo Cards */}
                {selectedMemoCategory === 'by Phone No.' ? (
                  isLoadingWlsMemo ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#666', fontStyle: 'italic' }}>
                      Loading...
                    </div>
                  ) : wlsMemoByPhone.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {wlsMemoByPhone
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((memo, index) => {
                          const phoneNumber = memo.id.split('-')[1];
                          return (
                            <div key={index} style={{ 
                              padding: '15px',
                              backgroundColor: 'white',
                              borderRadius: '8px',
                              border: '1px solid #e9ecef',
                              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                            }}>
                              <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: '1fr auto',
                                marginBottom: '10px',
                                paddingBottom: '8px',
                                borderBottom: '1px solid #f1f1f1'
                              }}>
                                <span style={{ fontWeight: 600, color: '#333' }}>
                                  Phone Number: {phoneNumber}
                                </span>
                                <span style={{ 
                                  justifySelf: 'end',
                                  color: '#666',
                                  fontSize: '0.9em'
                                }}>
                                  {new Date(memo.date).toLocaleString()}
                                </span>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                                <div><strong>Author:</strong> {memo.author}</div>
                                <div><strong>Memo Type:</strong> {memo.memoType}</div>
                                {(memo.systemText || memo.text) && (
                                  <div><strong>System Text:</strong> {memo.systemText ?? memo.text}</div>
                                )}
                                <div><strong>Operator Id:</strong> {memo.operatorId}</div>
                                <div><strong>Manual Ind:</strong> {memo.manualInd ? 'true' : 'false'}</div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : selectedPhoneNumForMemo ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#666', fontStyle: 'italic' }}>
                      No memos found for this phone number
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#666', fontStyle: 'italic' }}>
                      Please select a phone number
                    </div>
                  )
                ) : selectedMemoCategory === 'IMEI Info' ? (
                  isLoadingImeiInfo ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#666', fontStyle: 'italic' }}>
                      Loading...
                    </div>
                  ) : kbMemoImeiInfo.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {kbMemoImeiInfo.map((memo, index) => (
                        <MemoCard key={index} memo={memo} />
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#666', fontStyle: 'italic' }}>
                      No IMEI Info memos found
                    </div>
                  )
                ) : selectedMemoCategory === 'SOC Info' ? (
                  isLoadingMemoSocInfo ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#666', fontStyle: 'italic' }}>
                      Loading...
                    </div>
                  ) : kbMemoSocInfo.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f9fafb' }}>
                            <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>SOC</th>
                            <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>Subscriber No</th>
                            <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>Application ID</th>
                            <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>Creation Date</th>
                            <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>Effective Date</th>
                            <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>Expiration Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {kbMemoSocInfo.map((soc, index) => (
                            <tr 
                              key={index}
                              style={{ transition: 'background-color 0.2s' }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{soc.SOC}</td>
                              <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{soc.SUBSCRIBER_NO}</td>
                              <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{soc.APPLICATION_ID}</td>
                              <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{new Date(soc.SYS_CREATION_DATE).toLocaleString()}</td>
                              <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{new Date(soc.SOC_EFFECTIVE_DATE).toLocaleDateString()}</td>
                              <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{new Date(soc.EXPIRATION_DATE).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#666', fontStyle: 'italic' }}>
                      No SOC records found
                    </div>
                  )
                ) : kbMemoList && kbMemoList.length > 0 ? (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {kbMemoList
                        .filter(memo => getMemoCategory(memo.MEMO_TYPE) === selectedMemoCategory)
                        .map((memo, index) => (
                          <MemoCard key={index} memo={memo} />
                        ))}
                    </div>

                    {kbMemoList.filter(m => getMemoCategory(m.MEMO_TYPE) === selectedMemoCategory).length === 0 && (
                      <div style={{ textAlign: 'center', padding: '20px', color: '#666', fontStyle: 'italic' }}>
                        No memos found
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#666', fontStyle: 'italic' }}>
                    No KB memos found for this BAN
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Warranty Transaction Card */}
              <div className="card">
                <div className="section-header-row">
                  <h2>Warranty Transaction</h2>
                  <button 
                    type="button" 
                    onClick={handleRefresh}
                    disabled={loading || !ewContractData}
                    className="btn btn-success"
                  >
                    {loading ? 'Refreshing...' : 'REFRESH'}
                  </button>
                </div>
                <div className="card-body">
                  <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
                    <span style={{ fontWeight: 600, marginRight: '16px' }}>Warranty Status:</span>
                    <span style={{ color: 'var(--color-neutral-800)' }}>
                      {warrantyStatus?.status_typ_desc_txt ?? '-'}
                    </span>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    {ewTransactionData && ewTransactionData.length > 0 ? (
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f9fafb' }}>
                            <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>Transaction Type</th>
                            <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>Status</th>
                            <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>Error Code</th>
                            <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>Error Text</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ewTransactionData.map((txn, index) => (
                            <tr 
                              key={index}
                              style={{ transition: 'background-color 0.2s' }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{txn.extnd_wrnty_txn_typ_cd}</td>
                              <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{txn.extnd_wrnty_txn_stat_cd}</td>
                              <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{txn.extnd_wrnty_txn_err_cd ?? '-'}</td>
                              <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{txn.extnd_wrnty_txn_err_txt ?? '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '20px', borderRadius: '4px', fontStyle: 'italic', color: 'var(--color-neutral-600)', backgroundColor: '#f9fafb' }}>
                        No transaction data found.
                      </div>
                    )}
                  </div>
                </div>
              </div>

          {/* Retry Operation Section */}
          {ewContractData && (
            <div className="card">
              <h2 className="section-header">Retry Operation</h2>
              <div className="card-body">
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1', minWidth: '300px' }}>
                    <select
                      value={selectedRetryCase}
                      onChange={(e) => setSelectedRetryCase(e.target.value as RetryCaseId)}
                      className="form-input"
                      style={{ width: '100%' }}
                    >
                      {RETRY_CASES.map(retryCase => (
                        <option key={retryCase.id} value={retryCase.id}>
                          {retryCase.label}: {retryCase.description}
                        </option>
                      ))}
                    </select>
                    
                    {/* Action Details */}
                    <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f0f2f5', borderRadius: '4px', fontSize: '13px' }}>
                      <strong>Action:</strong>
                      <ul style={{ marginTop: '5px', marginBottom: '0', paddingLeft: '20px' }}>
                        {RETRY_CASES.find(c => c.id === selectedRetryCase)?.actions.map((action, idx) => (
                          <li key={idx}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <button 
                    type="button" 
                    onClick={handleRetry}
                    className="btn btn-success btn-lg"
                    disabled={loading || currentRetryState.isProcessing}
                    style={{ alignSelf: 'flex-start' }}
                  >
                    {currentRetryState.isProcessing ? 'Retrying...' : 'RETRY'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <MessageLog messages={messages} title="Results" />
        </div>
      </div>
    </>
  );
};

export default ReconcileTender;
