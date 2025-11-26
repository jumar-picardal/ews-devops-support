/**
 * Get KB SOC Info Routes
 * API endpoint for retrieving SERVICE_AGREEMENT SOC records
 */

import { Router, Request, Response } from 'express';
import { getKbMemoSocInfo } from '../services/database/kb/getKbMemoSocInfo.service';

const router = Router();

/**
 * GET /api/kb-memo-socinfo/:ban
 * Retrieves warranty-related SOC records for specified BAN
 */
router.get('/api/kb-memo-socinfo/:ban', async (req: Request, res: Response) => {
  const timestamp = new Date().toISOString();
  const { ban } = req.params;

  try {
    console.log(`${timestamp} [GET_KB_SOC_INFO_ROUTE] Request - BAN: ${ban}`);

    if (!ban) {
      return res.status(400).json({
        timestamp,
        error: 'BAN is required'
      });
    }

    const socs = await getKbMemoSocInfo(ban);

    console.log(`${timestamp} [GET_KB_SOC_INFO_ROUTE] Success - Found ${socs.length} records`);

    res.json({
      timestamp,
      success: true,
      data: socs,
      count: socs.length
    });
  } catch (error) {
    console.error(`${timestamp} [GET_KB_SOC_INFO_ROUTE] Error:`, error);
    res.status(500).json({
      timestamp,
      error: error instanceof Error ? error.message : 'Failed to retrieve KB SOC info'
    });
  }
});

export default router;
