import express, { Request, Response } from 'express';
import { getEwCustomerInfo } from '../services/database/ews/getEwCustomerInfo.service';

const router = express.Router();

router.get('/api/get-ewcc-info/:contractId', async (req: Request, res: Response) => {
  try {
    const { contractId } = req.params;

    const timestamp = new Date().toISOString();
    console.log(`${timestamp} === ROUTE: GET /api/get-ewcc-info/:contractId ===`);
    console.log(`${timestamp} [GET_EW_CUSTOMER_INFO] Request:`, { contractId });

    const customerInfo = await getEwCustomerInfo(contractId);
    
    if (!customerInfo) {
      console.log(`${timestamp} [GET_EW_CUSTOMER_INFO] Customer info not found:`, { contractId });
      return res.status(404).json({ 
        success: false,
        error: 'Customer information not found' 
      });
    }
    
    console.log(`${timestamp} [GET_EW_CUSTOMER_INFO] Success:`, { contractId });
    res.json({
      success: true,
      data: customerInfo
    });
  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`${timestamp} [GET_EW_CUSTOMER_INFO] Error:`, {
      contractId: req.params.contractId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to retrieve customer information',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
