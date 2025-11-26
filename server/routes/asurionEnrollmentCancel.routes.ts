/**
 * Asurion Enrollment Cancel Routes
 * Handles Asurion enrollment cancellation
 */

import express, { Request, Response } from 'express';
import { createAsurionEnrollmentCancelService } from '../services/asurionEnrollmentCancel.service';

const router = express.Router();

/**
 * POST /api/cancel-asurion-enrollment
 * Cancel Asurion warranty enrollment
 */
router.post('/api/cancel-asurion-enrollment', async (req: Request, res: Response) => {
  try {
    const { subscriptionId, serviceCode, cancelDate, transactionDate, cancelReason } = req.body; // Changed from partnerId to serviceCode

    // Validate subscription ID
    if (!subscriptionId) {
      return res.status(400).json({
        success: false,
        error: 'subscriptionId is required'
      });
    }

    const timestamp = new Date().toISOString();
    console.log(`${timestamp} === ROUTE: POST /api/cancel-asurion-enrollment ===`);
    console.log(`${timestamp} [CANCEL_ASURION] Request:`, { 
      subscriptionId, 
      serviceCode // Log serviceCode instead of partnerId
    });

    // Cancel enrollment
    const service = createAsurionEnrollmentCancelService();
    const result = await service.enrollmentCancel({
      subscriptionId,
      serviceCode, // Pass serviceCode - backend determines partnerId
      cancelDate,
      transactionDate,
      cancelReason
    });

    console.log(`${timestamp} [CANCEL_ASURION] Response:`, { 
      subscriptionId,
      status: result.status,
      httpStatus: result.httpStatus
    });

    res.json({
      success: result.status === 'Success',
      status: result.status,
      message: result.message,
      subscriptionId: result.subscriptionId,
      cancelDate: result.cancelDate,
      details: result.errorDescription,
      httpStatus: result.httpStatus,
      response: result.response
    });

  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`${timestamp} [CANCEL_ASURION] Error:`, { 
      subscriptionId: req.body.subscriptionId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(500).json({
      success: false,
      error: 'Failed to cancel Asurion enrollment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
