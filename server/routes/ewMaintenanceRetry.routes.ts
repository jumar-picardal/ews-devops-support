/**
 * Retry Routes
 * Handles retry operations for failed warranty contracts
 */

import express, { Request, Response } from 'express';
import { createEWMaintenanceRetryService } from '../services/ewMaintenanceRetry.service';

const router = express.Router();

/**
 * POST /api/retry/warranty
 * Retry a warranty contract using EW Maintenance API
 */
router.post('/api/retry/warranty', async (req: Request, res: Response) => {
  try {
    const { contractId } = req.body;

    if (!contractId) {
      return res.status(400).json({
        success: false,
        error: 'contractId is required'
      });
    }

    const timestamp = new Date().toISOString();
    console.log(`${timestamp} === ROUTE: POST /api/retry/warranty ===`);
    console.log(`${timestamp} [RETRY_WARRANTY] Request:`, { contractId });

    const service = createEWMaintenanceRetryService();
    const result = await service.retryWarrantyContract({ contractId });

    console.log(`${timestamp} [RETRY_WARRANTY] Response:`, { 
      contractId,
      status: result.status,
      httpStatus: result.httpStatus
    });

    // Return formatted response
    res.json({
      success: result.status === 'Success',
      status: result.status,
      message: result.message,
      details: result.errorDescription,
      httpStatus: result.httpStatus,
      response: result.response
    });

  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`${timestamp} [RETRY_WARRANTY] Error:`, { 
      contractId: req.body.contractId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(500).json({
      success: false,
      error: 'Failed to retry warranty contract',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/retry/contract/:contractId
 * Convenience endpoint to retry by contract ID only
 */
router.post('/api/retry/contract/:contractId', async (req: Request, res: Response) => {
  try {
    const { contractId } = req.params;

    const timestamp = new Date().toISOString();
    console.log(`${timestamp} === ROUTE: POST /api/retry/contract/:contractId ===`);
    console.log(`${timestamp} [RETRY_CONTRACT] Request:`, { contractId });

    // Create service instance and execute retry
    const service = createEWMaintenanceRetryService();
    const result = await service.retryWarrantyContract({ contractId });

    console.log(`${timestamp} [RETRY_CONTRACT] Response:`, { 
      contractId,
      status: result.status,
      httpStatus: result.httpStatus
    });

    // Return formatted response
    res.json({
      success: result.status === 'Success',
      status: result.status,
      message: result.message,
      details: result.errorDescription,
      httpStatus: result.httpStatus,
      response: result.response
    });

  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`${timestamp} [RETRY_CONTRACT] Error:`, { 
      contractId: req.params.contractId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(500).json({
      success: false,
      error: 'Failed to retry contract',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
