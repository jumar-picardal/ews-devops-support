/**
 * Get Warranty Status Route
 * Endpoint: GET /api/get-warranty-status/:contractId
 */

import express from 'express';
import { getWarrantyStatus } from '../services/database/ews/getWarrantyStatus.service';

const router = express.Router();

router.get('/api/get-warranty-status/:contractId', async (req, res) => {
  const timestamp = new Date().toISOString();
  const { contractId } = req.params;

  try {
    console.log(`${timestamp} [GET_WARRANTY_STATUS] Request received for Contract ID: ${contractId}`);

    const status = await getWarrantyStatus(contractId);

    if (!status) {
      console.log(`${timestamp} [GET_WARRANTY_STATUS] No status found for Contract ID: ${contractId}`);
      return res.status(404).json({ error: 'Warranty status not found' });
    }

    console.log(`${timestamp} [GET_WARRANTY_STATUS] Success - Status: ${status.status_typ_desc_txt}`);
    res.json(status);
  } catch (error) {
    console.error(`${timestamp} [GET_WARRANTY_STATUS] Error:`, error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch warranty status' 
    });
  }
});

export default router;
