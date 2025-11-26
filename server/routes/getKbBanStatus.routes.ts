/**
 * Get KB BAN Status Routes
 * Retrieves BAN status information from Oracle KB database
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { getKbBanStatus } from '../services/database/kb/getKbBanStatus.service';

const router = Router();

/**
 * GET /api/kb-ban-status/:ban
 * Get BAN status information from KB Oracle database
 */
router.get('/api/kb-ban-status/:ban', async (req: Request, res: Response) => {
  try {
    const { ban } = req.params;
    
    if (!ban) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        details: 'BAN is required'
      });
    }

    const timestamp = new Date().toISOString();
    console.log(`${timestamp} === ROUTE: GET /api/kb-ban-status/:ban ===`);
    console.log(`${timestamp} [GET_KB_BAN_STATUS] Request:`, { ban });

    const result = await getKbBanStatus(ban);

    if (!result) {
      console.log(`${timestamp} [GET_KB_BAN_STATUS] Not Found:`, { ban });
      return res.status(404).json({
        success: false,
        error: 'BAN not found',
        details: 'No BAN status information found for this BAN'
      });
    }

    console.log(`${timestamp} [GET_KB_BAN_STATUS] Success:`, { 
      ban, 
      status: result.BAN_STATUS 
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`${timestamp} [GET_KB_BAN_STATUS] Error:`, { 
      ban: req.params.ban,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve KB BAN status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
