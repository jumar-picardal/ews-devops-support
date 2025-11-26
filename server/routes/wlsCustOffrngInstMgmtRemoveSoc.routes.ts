/**
 * WLS Customer Offering Instance Management - Remove SOC Routes
 * Removes SOC (Service Offering Code) from customer's phone number
 */

import express, { Request, Response } from 'express';
import { createWlsCustOffrngInstMgmtRemoveSocService } from '../services/wlsCustOffrngInstMgmtRemoveSoc.service';

const router = express.Router();

/**
 * POST /api/remove-soc
 * Remove SOC from customer's phone number
 */
router.post('/api/remove-soc', async (req: Request, res: Response) => {
  try {
    const { ban, phoneNumber, socCode } = req.body;

    // Validate required fields
    if (!ban || !phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'BAN and phone number are required'
      });
    }

    const timestamp = new Date().toISOString();
    console.log(`${timestamp} === ROUTE: POST /api/remove-soc ===`);
    console.log(`${timestamp} [REMOVE_SOC_ROUTE] Request:`, {
      ban, 
      phoneNumber, 
      socCode: socCode || 'SDCCMB (default)' 
    });

    const service = createWlsCustOffrngInstMgmtRemoveSocService();
    const result = await service.wlsRemoveSoc({ ban, phoneNumber, socCode });

    console.log(`${timestamp} [REMOVE_SOC_ROUTE] Response:`, {
      status: result.status,
      httpStatus: result.httpStatus,
      message: result.message
    });

    if (result.status === 'Success') {
      res.json({
        success: true,
        message: result.message,
        data: result.data,
        httpStatus: result.httpStatus
      });
    } else {
      res.status(result.httpStatus || 500).json({
        success: false,
        error: result.message,
        details: result.errorDescription,
        httpStatus: result.httpStatus
      });
    }

  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`${timestamp} [REMOVE_SOC_ROUTE] Error:`, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    res.status(500).json({
      success: false,
      error: 'Failed to remove SOC',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
