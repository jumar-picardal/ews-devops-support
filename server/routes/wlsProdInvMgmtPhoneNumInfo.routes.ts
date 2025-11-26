/**
 * WLS Product Inventory Management Routes
 * Retrieves product status by BAN and/or phone number
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { createWlsProdInvMgmtPhoneNumInfoSrvc } from '../services/wlsProdInvMgmtPhoneNumInfo.service';

const router = Router();

/**
 * GET /api/wlsprod-phonenum-info
 * Get product status by BAN and/or phone number
 * Query params: ban, phoneNumber
 */
router.get('/api/wlsprod-phonenum-info', async (req: Request, res: Response) => {
  try {
    const { ban, phoneNumber } = req.query;

    if (!ban && !phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        details: 'Either BAN or phone number is required'
      });
    }

    const timestamp = new Date().toISOString();
    console.log(`${timestamp} === ROUTE: GET /api/wlsprod-phonenum-info ===`);
    console.log(`${timestamp} [GET_WLS_PROD_PHONE#_INFO] Request:`, {
      ban: ban ?? 'N/A', 
      phoneNumber: phoneNumber ?? 'N/A' 
    });

    const service = createWlsProdInvMgmtPhoneNumInfoSrvc();
    const result = await service.getPhoneNumInfo({
      ban: ban as string,
      phoneNumber: phoneNumber as string
    });

    if (result.status === 'Error') {
      console.error(`${timestamp} [GET_WLS_PROD_PHONE#_INFO] Error:`, {
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

    console.log(`${timestamp} [GET_WLS_PROD_PHONE#_INFO] Success:`, { 
      ban, 
      phoneNumber,
      productsCount: result.data?.length ?? 0,
      firstProductStatus: result.data?.[0]?.status ?? 'N/A'
    });

    res.json({
      success: true,
      message: result.message,
      data: result.data
    });

  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`${timestamp} [GET_WLS_PROD_PHONE#_INFO] Exception:`, {
      ban: req.query.ban,
      phoneNumber: req.query.phoneNumber,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve WLS product phone number info',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
