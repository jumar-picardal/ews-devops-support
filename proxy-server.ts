/**
 * Express Proxy Server for EWS DevOps Support Application
 * Handles backend API calls, database connections, and SOAP services
 */

import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.BACKEND_PORT;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Import routes
import retryRoutes from './server/routes/ewMaintenanceRetry.routes';
import updateReportedStatToFailRoutes from './server/routes/updateReportedStatToFail.routes';
import updateReportedStatToSuccessRoutes from './server/routes/updateReportedStatToSuccess.routes';
import getClosedTenderInfoRoutes from './server/routes/getClosedTenderInfo.routes';
import getClosedUnregisterInfoRoutes from './server/routes/getClosedUnregisterInfo.routes';
import getActiveProcessingInfoRoutes from './server/routes/getActiveProcessingInfo.routes';
import getKbBanStatusRoutes from './server/routes/getKbBanStatus.routes';
import getKbMemoListRoutes from './server/routes/getKbMemoList.routes';
import getKbMemoImeiInfoRoutes from './server/routes/getKbMemoImeiInfo.routes';
import getKbMemoSocInfoRoutes from './server/routes/getKbMemoSocInfo.routes';
import asurionEnrollmentCancelRoutes from './server/routes/asurionEnrollmentCancel.routes';
import asurionEnrollmentCreateForDCCRoutes from './server/routes/asurionEnrollmentCreateForDCC.routes';
import wlsProdInvMgmtPhoneNumInfoRoutes from './server/routes/wlsProdInvMgmtPhoneNumInfo.routes';
import wlsProdInvMgmtPhoneNumListInfoRoutes from './server/routes/wlsProdInvMgmtPhoneNumListInfo.routes';
import wlsProdInvMgmtMemoRoutes from './server/routes/wlsProdInvMgmtMemo.routes';
import wlsManageSocRoutes from './server/routes/wlsCustOffrngInstMgmt.routes';
import getEwContractInfoRoutes from './server/routes/getEwContractInfo.routes';
import getEwCustomerInfoRoutes from './server/routes/getEwCustomerInfo.routes';
import getEwTransactionInfoRoutes from './server/routes/getEwTransactionInfo.routes';
import getWarrantyStatusRoutes from './server/routes/getWarrantyStatus.routes';
import getDccEnrollmentRequestRoutes from './server/routes/getDccEnrollmentRequest.routes';
import getDccsEnrollmentRequestRoutes from './server/routes/getDccsEnrollmentRequest.routes';

// API Routes
app.use(retryRoutes);
app.use(updateReportedStatToFailRoutes);
app.use(updateReportedStatToSuccessRoutes);
app.use(getClosedTenderInfoRoutes);
app.use(getClosedUnregisterInfoRoutes);
app.use(getActiveProcessingInfoRoutes);
app.use(getKbBanStatusRoutes);
app.use(getKbMemoListRoutes);
app.use(getKbMemoImeiInfoRoutes);
app.use(getKbMemoSocInfoRoutes);
app.use(asurionEnrollmentCancelRoutes);
app.use(asurionEnrollmentCreateForDCCRoutes);
app.use(wlsProdInvMgmtPhoneNumInfoRoutes);
app.use(wlsProdInvMgmtPhoneNumListInfoRoutes);
app.use(wlsProdInvMgmtMemoRoutes);
app.use(wlsManageSocRoutes);
app.use(getEwContractInfoRoutes);
app.use(getEwCustomerInfoRoutes);
app.use(getEwTransactionInfoRoutes);
app.use(getWarrantyStatusRoutes);
app.use(getDccEnrollmentRequestRoutes);
app.use(getDccsEnrollmentRequestRoutes);


// Error handling middleware
interface ErrorWithStatus extends Error {
  status?: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: ErrorWithStatus, req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
