/**
 * Get EW Transaction Info Route
 * Endpoint: GET /api/ew-txn-info/:contractId
 */

import express from 'express';
import { getEwTransactionInfo } from '../services/database/ews/getEwTransactionInfo.service';

const router = express.Router();

router.get('/api/ew-txn-info/:contractId', async (req, res) => {
  const timestamp = new Date().toISOString();
  const { contractId } = req.params;

  try {
    console.log(`${timestamp} [GET_EW_TXN_INFO] Request received for Contract ID: ${contractId}`);

    const transactions = await getEwTransactionInfo(contractId);

    console.log(`${timestamp} [GET_EW_TXN_INFO] Success - Found ${transactions.length} transactions`);
    res.json(transactions);
  } catch (error) {
    console.error(`${timestamp} [GET_EW_TXN_INFO] Error:`, error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch transaction info' 
    });
  }
});

export default router;
