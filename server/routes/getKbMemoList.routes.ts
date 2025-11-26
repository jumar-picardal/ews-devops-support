/**
 * Get KB Memo List Routes
 * API endpoint for retrieving consolidated MEMO records
 */

import { Router, Request, Response } from 'express';
import { getKbMemoList } from '../services/database/kb/getKbMemoList.service';

const router = Router();

/**
 * GET /api/kb-memo-list/:ban
 * Retrieves consolidated MEMO records for specified BAN
 */
router.get('/api/kb-memo-list/:ban', async (req: Request, res: Response) => {
  const timestamp = new Date().toISOString();
  const { ban } = req.params;

  try {
    console.log(`${timestamp} [GET_KB_MEMO_LIST_ROUTE] Request - BAN: ${ban}`);

    if (!ban) {
      return res.status(400).json({
        timestamp,
        error: 'BAN is required'
      });
    }

    const memos = await getKbMemoList(ban);

    console.log(`${timestamp} [GET_KB_MEMO_LIST_ROUTE] Success - Found ${memos.length} records`);

    res.json({
      timestamp,
      success: true,
      data: memos,
      count: memos.length
    });
  } catch (error) {
    console.error(`${timestamp} [GET_KB_MEMO_LIST_ROUTE] Error:`, error);
    res.status(500).json({
      timestamp,
      error: error instanceof Error ? error.message : 'Failed to retrieve KB memo list'
    });
  }
});

export default router;
