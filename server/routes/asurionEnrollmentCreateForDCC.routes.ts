import { Router, Request, Response } from 'express';
import { createAsurionEnrollmentCreateForDCCService } from '../services/asurionEnrollmentCreateForDCC.service';
import { getDccEnrollmentRequest } from '../services/database/ews/getDccEnrollmentRequest.service';

const router = Router();

router.post('/api/asurion-enrollment-create-dcc/:contractId', async (req: Request, res: Response) => {
  try {
    const { contractId } = req.params;

    console.log(`[POST /api/asurion-enrollment-create-dcc/${contractId}] Request received`);

    // Get enrollment data from database
    const enrollmentData = await getDccEnrollmentRequest(contractId);

    if (!enrollmentData) {
      console.log(`[POST /api/asurion-enrollment-create-dcc/${contractId}] No enrollment data found`);
      return res.status(404).json({ error: 'Enrollment data not found' });
    }

    // Create enrollment via Asurion API
    const service = createAsurionEnrollmentCreateForDCCService();
    const result = await service.enrollmentCreate(enrollmentData);

    console.log(`[POST /api/asurion-enrollment-create-dcc/${contractId}] Response:`, {
      status: result.status,
      httpStatus: result.httpStatus
    });

    if (result.status === 'Error') {
      return res.status(result.httpStatus || 500).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('[POST /api/asurion-enrollment-create-dcc] Error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
