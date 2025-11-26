/**
 * Get KB Memo IMEI Info Routes
 * API endpoint for retrieving MEMO records by BAN and IMEI
 */

import { Router, Request, Response } from 'express';
import { getKbMemoImeiInfo } from '../services/database/kb/getKbMemoImeiInfo.service';

const router = Router();

/**
 * GET /api/kb-memo-imeiinfo/:ban/:imei
 * Retrieves MEMO records for specified BAN with IMEI in MEMO_MANUAL_TXT
 */
router.get('/api/kb-memo-imeiinfo/:ban/:imei', async (req: Request, res: Response) => {
  const timestamp = new Date().toISOString();
  const { ban, imei } = req.params;

  try {
    console.log(`${timestamp} [GET_KB_MEMO_IMEI_ROUTE] Request - BAN: ${ban}, IMEI: ${imei}`);

    if (!ban || !imei) {
      return res.status(400).json({
        timestamp,
        error: 'BAN and IMEI are required'
      });
    }

    const memos = await getKbMemoImeiInfo(ban, imei);

    console.log(`${timestamp} [GET_KB_MEMO_IMEI_ROUTE] Success - Found ${memos.length} records`);

    res.json({
      timestamp,
      success: true,
      data: memos,
      count: memos.length
    });
  } catch (error) {
    console.error(`${timestamp} [GET_KB_MEMO_IMEI_ROUTE] Error:`, error);
    res.status(500).json({
      timestamp,
      error: error instanceof Error ? error.message : 'Failed to retrieve KB memo IMEI info'
    });
  }
});

export default router;
