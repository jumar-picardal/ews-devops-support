/**
 * Get Active Processing Information Routes
 * Retrieves ACTIVE_PROCESSING contract information from database
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { getActiveProcessingInfo } from '../services/database/ews/getActiveProcessingInfo.service';

const router = Router();

/**
 * GET /api/get_active_processing_info/:contractId
 * Get active processing information for a contract
 */
router.get('/api/get_active_processing_info/:contractId', async (req: Request, res: Response) => {
  try {
    const { contractId } = req.params;
    
    // Validate contractId format (7-9 digits)
    if (!/^\d{7,9}$/.test(contractId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid contract ID format',
        details: 'Contract ID must be 7-9 digits'
      });
    }

    const timestamp = new Date().toISOString();
    console.log(`${timestamp} === ROUTE: GET /api/get_active_processing_info/:contractId ===`);
    console.log(`${timestamp} [GET_ACTIVE_PROCESSING] Request:`, { contractId });

    const result = await getActiveProcessingInfo(contractId);

    if (!result) {
      console.log(`${timestamp} [GET_ACTIVE_PROCESSING] Not Found:`, { contractId });
      return res.status(404).json({
        success: false,
        error: 'Contract not found',
        details: 'No active processing information found for this contract ID'
      });
    }

    console.log(`${timestamp} [GET_ACTIVE_PROCESSING] Success:`, { 
      contractId,
      ban: result.billing_account_num,
      phone: result.cust_phone_num,
      socCode: result.soc_cd
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`${timestamp} [GET_ACTIVE_PROCESSING] Error:`, { 
      contractId: req.params.contractId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve active processing information',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
