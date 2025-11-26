/**
 * WLS Customer Offering Instance Management Routes
 * Handles SOC (Service Offering Code) add/remove operations
 */

import express, { Request, Response } from 'express';
import { createWlsCustOffrngInstMgmtService } from '../services/wlsCustOffrngInstMgmt.service';

const router = express.Router();

/**
 * POST /api/manage-soc
 * Add or remove SOC from customer's phone number
 */
router.post('/api/manage-soc', async (req: Request, res: Response) => {
  try {
    const { ban, phoneNumber, socCode, transactionType } = req.body;

    // Validate required fields
    if (!ban || !phoneNumber || !transactionType) {
      return res.status(400).json({
        success: false,
        error: 'BAN, phone number, and transaction type are required'
      });
    }

    // Validate transactionType
    if (transactionType !== 'ADD' && transactionType !== 'REMOVE') {
      return res.status(400).json({
        success: false,
        error: 'Transaction type must be either ADD or REMOVE'
      });
    }

    const timestamp = new Date().toISOString();
    console.log(`${timestamp} === ROUTE: POST /api/manage-soc ===`);
    console.log(`${timestamp} [MANAGE_SOC_ROUTE] Request:`, {
      ban, 
      phoneNumber, 
      socCode: socCode || 'SDCCMB (default)',
      transactionType
    });

    const service = createWlsCustOffrngInstMgmtService();
    const result = await service.manageSoc({ ban, phoneNumber, socCode, transactionType });

    console.log(`${timestamp} [MANAGE_SOC_ROUTE] Response:`, {
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
    console.error(`${timestamp} [MANAGE_SOC_ROUTE] Error:`, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    res.status(500).json({
      success: false,
      error: 'Failed to manage SOC',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
