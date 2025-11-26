/**
 * Fetch Details Hook for Reconcile Tender
 * Fetches EWS contract, customer, warranty status, and transaction info in parallel
 */

import { useState } from 'react';
import { getEwContractInfo } from '../../services/api/getEwContractInfo.api';
import { getEwCustomerInfo } from '../../services/api/getEwCustomerInfo.api';
import { getWarrantyStatus } from '../../services/api/getWarrantyStatus.api';
import { getEwTransactionInfo } from '../../services/api/getEwTransactionInfo.api';
import { getBanStatus } from '../../services/api/getKbBanStatus.api';
import { getKbMemoList } from '../../services/api/getKbMemoList.api';
import { getPhoneNumListInfo } from '../../services/api/wlsProdInvMgmtPhoneNumListInfo.api';
import type { ExtndWrntyContractRow } from '../../../types/extnd_wrnty_contract.types';
import type { ExtndWrntyContractCustRow } from '../../../types/extnd_wrnty_contract_cust.types';
import type { ExtndWrntyTxnRow } from '../../../types/extnd_wrnty_txn.types';
import type { KbBanStatus } from '../../utils/banStatusMapper';
import type { KbMemoRow } from '../../../types/kb_memo.types';
import type { WlsProdInvMgmtProduct } from '../../../types/wlsProductInvMgmt.types';

interface WarrantyStatus {
  status_typ_desc_txt: string;
}

export const useFetchDetails = () => {
  const [ewContractData, setEwContractData] = useState<ExtndWrntyContractRow | null>(null);
  const [ewCustomerData, setEwCustomerData] = useState<ExtndWrntyContractCustRow | null>(null);
  const [warrantyStatus, setWarrantyStatus] = useState<WarrantyStatus | null>(null);
  const [ewTransactionData, setEwTransactionData] = useState<ExtndWrntyTxnRow[]>([]);
  const [kbBanStatus, setKbBanStatus] = useState<KbBanStatus | null>(null);
  const [kbMemoList, setKbMemoList] = useState<KbMemoRow[]>([]);
  const [phoneNumListInfo, setPhoneNumListInfo] = useState<WlsProdInvMgmtProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = async (contractId: string, loadKbSubscribers: boolean = true, loadKbMemoList: boolean = true) => {
    console.log('=== FETCH DETAILS START ===');
    console.log('Contract ID:', contractId);

    setLoading(true);
    setError(null);

    // Clear previous data
    setEwContractData(null);
    setEwCustomerData(null);
    setWarrantyStatus(null);
    setEwTransactionData([]);
    setKbBanStatus(null);
    setKbMemoList([]);
    setPhoneNumListInfo([]);

    try {
      // Fetch contract first to get BAN
      const contractInfo = await getEwContractInfo(contractId);
      console.log('✅ EWS Contract Data loaded:', contractInfo);
      setEwContractData(contractInfo);

      // Now start remaining API calls in parallel (including BAN status)
      const customerPromise = getEwCustomerInfo(contractId);
      const warrantyPromise = getWarrantyStatus(contractId);
      const transactionPromise = getEwTransactionInfo(contractId);
      const banStatusPromise = contractInfo?.billing_account_num 
        ? getBanStatus(contractInfo.billing_account_num)
        : Promise.resolve(null);
      const memoListPromise = (contractInfo?.billing_account_num && loadKbMemoList)
        ? getKbMemoList(contractInfo.billing_account_num)
        : Promise.resolve([]);
      // Only load KB Subscribers if user wants it (based on expand/collapse state)
      const phoneNumListInfoPromise = (contractInfo?.billing_account_num && loadKbSubscribers)
        ? getPhoneNumListInfo(contractInfo.billing_account_num)
        : Promise.resolve([]);

      // Update UI as each API completes (progressive loading)
      customerPromise.then(data => {
        console.log('✅ EWS Customer Data loaded:', data);
        setEwCustomerData(data);
      }).catch(err => console.error('❌ Customer API failed:', err));

      warrantyPromise.then(data => {
        console.log('✅ Warranty Status loaded:', data);
        setWarrantyStatus(data);
      }).catch(err => console.error('❌ Warranty API failed:', err));

      transactionPromise.then(data => {
        console.log('✅ Transaction Data loaded:', data);
        setEwTransactionData(data);
      }).catch(err => console.error('❌ Transaction API failed:', err));

      banStatusPromise.then(data => {
        console.log('✅ KB BAN Status loaded:', data);
        setKbBanStatus(data);
      }).catch(err => console.error('❌ BAN Status API failed:', err));

      if (loadKbMemoList) {
        memoListPromise.then(data => {
          console.log('✅ KB Memo List loaded:', data);
          setKbMemoList(data || []);
        }).catch(err => {
          console.error('❌ Memo List failed:', err);
          setKbMemoList([]);
        });
      } else {
        console.log('⏭️ Skipping KB Memo List (collapsed)');
      }

      if (loadKbSubscribers) {
        phoneNumListInfoPromise.then(data => {
          console.log('✅ Phone List loaded:', data);
          setPhoneNumListInfo(data);
        }).catch(err => {
          console.error('❌ Phone List failed:', err);
          setPhoneNumListInfo([]);
        });
      } else {
        console.log('⏭️ Skipping KB Subscribers (collapsed)');
      }


      // Wait for critical APIs to complete (customer, warranty, transaction)
      const [customerInfo, warrantyStatusInfo, transactionInfo] = await Promise.all([
        customerPromise,
        warrantyPromise,
        transactionPromise
      ]);

      // Wait for KB APIs
      const [banStatusInfo, memoListData, phoneNumListInfoData] = await Promise.allSettled([
        banStatusPromise,
        memoListPromise,
        phoneNumListInfoPromise
      ]).then(results => {
        return results.map((r, i) => {
          if (r.status === 'fulfilled') {
            return r.value;
          } else {
            console.error(`API ${i} rejected:`, r.reason);
            return i === 1 ? [] : null;
          }
        });
      });

      console.log('=== FETCH DETAILS SUCCESS ===');
      return { contractInfo, customerInfo, warrantyStatusInfo, transactionInfo, banStatusInfo, memoListData, phoneNumListInfoData };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch contract details';
      console.error('=== FETCH DETAILS ERROR ===', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshTransactionData = async (contractId: string) => {
    console.log('=== REFRESH TRANSACTION DATA START ===');
    console.log('Contract ID:', contractId);

    setLoading(true);
    setError(null);
    setWarrantyStatus(null);
    setEwTransactionData([]);

    try {
      // Fetch only warranty status and transaction data
      const warrantyPromise = getWarrantyStatus(contractId);
      const transactionPromise = getEwTransactionInfo(contractId);

      // Update UI as each completes
      warrantyPromise.then(data => {
        console.log('✅ Warranty Status refreshed:', data);
        setWarrantyStatus(data);
      }).catch(err => console.error('❌ Warranty refresh failed:', err));

      transactionPromise.then(data => {
        console.log('✅ Transaction Data refreshed:', data);
        setEwTransactionData(data);
      }).catch(err => console.error('❌ Transaction refresh failed:', err));

      // Wait for both to complete
      const [warrantyStatusInfo, transactionInfo] = await Promise.all([
        warrantyPromise,
        transactionPromise
      ]);

      console.log('=== REFRESH TRANSACTION DATA SUCCESS ===');
      return { warrantyStatusInfo, transactionInfo };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh transaction data';
      console.error('=== REFRESH TRANSACTION DATA ERROR ===', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchPhoneNumList = async (ban: string) => {
    console.log('=== FETCH PHONE NUM LIST (ON-DEMAND) ===');
    try {
      const data = await getPhoneNumListInfo(ban);
      console.log('✅ Phone List loaded:', data);
      setPhoneNumListInfo(data);
    } catch (err) {
      console.error('❌ Phone List failed:', err);
      setPhoneNumListInfo([]);
    }
  };

  const fetchKbMemoList = async (ban: string) => {
    console.log('=== FETCH KB MEMO LIST (ON-DEMAND) ===');
    try {
      const data = await getKbMemoList(ban);
      console.log('✅ KB Memo List loaded:', data);
      setKbMemoList(data || []);
    } catch (err) {
      console.error('❌ KB Memo List failed:', err);
      setKbMemoList([]);
    }
  };

  return {
    ewContractData,
    ewCustomerData,
    warrantyStatus,
    ewTransactionData,
    kbBanStatus,
    kbMemoList,
    phoneNumListInfo,
    loading,
    error,
    fetchDetails,
    refreshTransactionData,
    fetchPhoneNumList,
    fetchKbMemoList,
  };
};
