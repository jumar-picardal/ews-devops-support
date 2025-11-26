import express, { Request, Response } from 'express';
import { getEwContractInfo } from '../services/database/ews/getEwContractInfo.service';

const router = express.Router();

router.get('/api/get-ewc-info/:contractId', async (req: Request, res: Response) => {
  try {
    const { contractId } = req.params;

    const timestamp = new Date().toISOString();
    console.log(`${timestamp} === ROUTE: GET /api/get-ewc-info/:contractId ===`);
    console.log(`${timestamp} [GET_EW_CONTRACT_INFO] Request:`, { contractId });

    const contractInfo = await getEwContractInfo(contractId);
    
    if (!contractInfo) {
      console.log(`${timestamp} [GET_EW_CONTRACT_INFO] Contract not found:`, { contractId });
      return res.status(404).json({ 
        success: false,
        error: 'Contract not found' 
      });
    }
    
    console.log(`${timestamp} [GET_EW_CONTRACT_INFO] Success:`, { contractId });
    res.json({
      success: true,
      data: contractInfo
    });
  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`${timestamp} [GET_EW_CONTRACT_INFO] Error:`, {
      contractId: req.params.contractId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to retrieve contract information',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
