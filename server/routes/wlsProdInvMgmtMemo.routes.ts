/**
 * WLS Product Inventory Management Memo Routes
 * Retrieves memo by BAN and Phone Number
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { createWlsProdInvMgmtMemoSrvc } from '../services/wlsProdInvMgmtMemo.service';

const router = Router();

/**
 * GET /api/wlsprod-memo/:ban/:phoneNumber
 * Get memo by BAN and Phone Number
 */
router.get('/api/wlsprod-memo/:ban/:phoneNumber', async (req: Request, res: Response) => {
  try {
    const { ban, phoneNumber } = req.params;

    if (!ban || !phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        details: 'BAN and Phone Number are required'
      });
    }

    const timestamp = new Date().toISOString();
    console.log(`${timestamp} === ROUTE: GET /api/wlsprod-memo/${ban}/${phoneNumber} ===`);
    console.log(`${timestamp} [GET_WLS_PROD_MEMO] Request:`, { ban, phoneNumber });

    const service = createWlsProdInvMgmtMemoSrvc();
    const result = await service.getMemo(ban, phoneNumber);

    if (result.status === 'Error') {
      console.error(`${timestamp} [GET_WLS_PROD_MEMO] Error:`, {
        ban,
        phoneNumber,
        error: result.message 
      });
      return res.status(result.httpStatus ?? 500).json({
        success: false,
        error: result.message,
        details: result.errorDescription,
        data: result.data
      });
    }

    console.log(`${timestamp} [GET_WLS_PROD_MEMO] Success:`, { 
      ban,
      phoneNumber,
      dataReceived: !!result.data
    });

    res.json({
      success: true,
      message: result.message,
      data: result.data
    });

  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`${timestamp} [GET_WLS_PROD_MEMO] Exception:`, {
      ban: req.params.ban,
      phoneNumber: req.params.phoneNumber,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve WLS product memo',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
