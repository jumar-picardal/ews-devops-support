/**
 * Get Closed Unregister Information Routes
 * Retrieves CLOSED_UNREGISTER contract information from database
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { getClosedUnregisterInfo } from '../services/database/ews/getClosedUnregisterInfo.service';

const router = Router();

/**
 * GET /api/get_closed_unregister_info/:contractId
 * Get closed unregister information for a contract
 */
router.get('/api/get_closed_unregister_info/:contractId', async (req: Request, res: Response) => {
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
    console.log(`${timestamp} === ROUTE: GET /api/get_closed_unregister_info/:contractId ===`);
    console.log(`${timestamp} [GET_CLOSED_UNREGISTER] Request:`, { contractId });

    const result = await getClosedUnregisterInfo(contractId);

    if (!result) {
      console.log(`${timestamp} [GET_CLOSED_UNREGISTER] Not Found:`, { contractId });
      return res.status(404).json({
        success: false,
        error: 'Contract not found',
        details: 'No closed unregister information found for this contract ID'
      });
    }

    console.log(`${timestamp} [GET_CLOSED_UNREGISTER] Success:`, { 
      contractId, 
      ban: result.billing_account_num,
      phone: result.cust_phone_num 
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`${timestamp} [GET_CLOSED_UNREGISTER] Error:`, { 
      contractId: req.params.contractId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve closed unregister information',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
