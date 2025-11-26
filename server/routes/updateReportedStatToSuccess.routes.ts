/**
 * Update Transaction Status to SUCCESS Routes
 * Updates transaction status from FAIL/REPORTED/SKIP to SUCCESS
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { updateReportedStatToSuccess } from '../services/database/ews/updateReportedStatToSuccess.service';

const router = Router();

/**
 * POST /api/success-reported-txn
 * Update transaction status from FAIL/REPORTED/SKIP to SUCCESS for a contract
 */
router.post('/api/success-reported-txn', async (req: Request, res: Response) => {
  try {
    const { contractId } = req.body;
    
    // Validate contract ID
    if (!contractId) {
      return res.status(400).json({
        success: false,
        error: 'Contract ID is required'
      });
    }

    if (!/^\d{7,9}$/.test(contractId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid contract ID format',
        details: 'Contract ID must be 7-9 digits'
      });
    }

    const timestamp = new Date().toISOString();
    console.log(`${timestamp} === ROUTE: POST /api/success-reported-txn ===`);
    console.log(`${timestamp} [UPDATE_TO_SUCCESS] Request:`, { contractId });

    const result = await updateReportedStatToSuccess(contractId);

    console.log(`${timestamp} [UPDATE_TO_SUCCESS] Success:`, { 
      contractId, 
      rowsUpdated: result.rowsUpdated 
    });

    res.json({
      success: true,
      message: 'Transaction(s) updated to SUCCESS status successfully',
      contractId: result.contractId,
      rowsUpdated: result.rowsUpdated
    });

  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`${timestamp} [UPDATE_TO_SUCCESS] Error:`, { 
      contractId: req.body.contractId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to update transaction status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
