import express, { Request, Response } from 'express';
import { getDccEnrollmentRequest } from '../services/database/ews/getDccEnrollmentRequest.service';

const router = express.Router();

router.get('/api/get-dcc-enrollment-request/:contractId', async (req: Request, res: Response) => {
  try {
    const { contractId } = req.params;

    const timestamp = new Date().toISOString();
    console.log(`${timestamp} === ROUTE: GET /api/get-dcc-enrollment-request/:contractId ===`);
    console.log(`${timestamp} [GET_DCC_ENROLLMENT_REQUEST] Request:`, { contractId });

    const enrollmentData = await getDccEnrollmentRequest(contractId);
    
    if (!enrollmentData) {
      console.log(`${timestamp} [GET_DCC_ENROLLMENT_REQUEST] Enrollment data not found:`, { contractId });
      return res.status(404).json({ 
        success: false,
        error: 'Enrollment data not found' 
      });
    }
    
    console.log(`${timestamp} [GET_DCC_ENROLLMENT_REQUEST] Success:`, { contractId });
    res.json({
      success: true,
      data: enrollmentData
    });
  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`${timestamp} [GET_DCC_ENROLLMENT_REQUEST] Error:`, {
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
