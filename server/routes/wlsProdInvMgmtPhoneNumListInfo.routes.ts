/**
 * WLS Product Inventory Management Phone Number List Info Routes
 * Retrieves product status by BAN
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { createWlsProdInvMgmtPhoneNumListInfoSrvc } from '../services/wlsProdInvMgmtPhoneNumListInfo.service';

const router = Router();

/**
 * GET /api/wlsprod-phonenumlist-info/:ban
 * Get product status by BAN
 */
router.get('/api/wlsprod-phonenumlist-info/:ban', async (req: Request, res: Response) => {
  try {
    const { ban } = req.params;

    if (!ban) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        details: 'BAN is required'
      });
    }

    const timestamp = new Date().toISOString();
    console.log(`${timestamp} === ROUTE: GET /api/wlsprod-phonenumlist-info/${ban} ===`);
    console.log(`${timestamp} [GET_WLS_PROD_PHONE_NUM_LIST_INFO] Request:`, { ban });

    const service = createWlsProdInvMgmtPhoneNumListInfoSrvc();
    const result = await service.getPhoneNumListInfo(ban);

    if (result.status === 'Error') {
      console.error(`${timestamp} [GET_WLS_PROD_PHONE_NUM_LIST_INFO] Error:`, {
        ban,
        error: result.message 
      });
      return res.status(result.httpStatus ?? 500).json({
        success: false,
        error: result.message,
        details: result.errorDescription,
        data: result.data
      });
    }

    console.log(`${timestamp} [GET_WLS_PROD_PHONE_NUM_LIST_INFO] Success:`, { 
      ban,
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
    console.error(`${timestamp} [GET_WLS_PROD_PHONE_NUM_LIST_INFO] Exception:`, {
      ban: req.params.ban,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve WLS product phone number list info',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
