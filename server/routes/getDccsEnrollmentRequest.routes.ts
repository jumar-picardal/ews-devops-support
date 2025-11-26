import express, { Request, Response } from 'express';
import { getDccsEnrollmentRequest } from '../services/database/ews/getDccsEnrollmentRequest.service';

const router = express.Router();

router.get('/api/get-dccs-enrollment-request/:contractId', async (req: Request, res: Response) => {
  try {
    const { contractId } = req.params;

    const timestamp = new Date().toISOString();
    console.log(`${timestamp} === ROUTE: GET /api/get-dccs-enrollment-request/:contractId ===`);
    console.log(`${timestamp} [GET_DCCS_ENROLLMENT_REQUEST] Request:`, { contractId });

    const enrollmentData = await getDccsEnrollmentRequest(contractId);
    
    if (!enrollmentData) {
      console.log(`${timestamp} [GET_DCCS_ENROLLMENT_REQUEST] Enrollment data not found:`, { contractId });
      return res.status(404).json({ 
        success: false,
        error: 'Enrollment data not found' 
      });
    }
    
    console.log(`${timestamp} [GET_DCCS_ENROLLMENT_REQUEST] Success:`, { contractId });
    res.json({
      success: true,
      data: enrollmentData
    });
  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`${timestamp} [GET_DCCS_ENROLLMENT_REQUEST] Error:`, {
      contractId: req.params.contractId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to retrieve enrollment data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
