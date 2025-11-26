/**
 * Get Closed Tender Information Routes
 * Retrieves CLOSED_TENDER contract information from database
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { getClosedTenderInfo } from '../services/database/ews/getClosedTenderInfo.service';

const router = Router();

/**
 * GET /api/get_closed_tender_info/:contractId
 * Get closed tender information for a contract
 */
router.get('/api/get_closed_tender_info/:contractId', async (req: Request, res: Response) => {
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
    console.log(`${timestamp} === ROUTE: GET /api/get_closed_tender_info/:contractId ===`);
    console.log(`${timestamp} [GET_CLOSED_TENDER] Request:`, { contractId });

    const result = await getClosedTenderInfo(contractId);

    if (!result) {
      console.log(`${timestamp} [GET_CLOSED_TENDER] Not Found:`, { contractId });
      return res.status(404).json({
        success: false,
        error: 'Contract not found',
        details: 'No closed tender information found for this contract ID'
      });
    }

    console.log(`${timestamp} [GET_CLOSED_TENDER] Success:`, { 
      contractId,
      vendor: result.wrnty_vendor_cd,
      subscriptionId: result.subscription_id
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`${timestamp} [GET_CLOSED_TENDER] Error:`, { 
      contractId: req.params.contractId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve closed tender information',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
