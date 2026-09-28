import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/env.js';
import { authGuard } from './middleware/auth-guard.js';
import { tenantMiddleware } from './middleware/tenant-context.js';
import { superAdminPrivacyGuard } from './middleware/privacy-guard.js';

// Controller Routers
import { authRouter } from './modules/auth/auth.controller.js';
import { analyticsRouter } from './modules/analytics/analytics.controller.js';
import { attendanceRouter } from './modules/attendance/attendance.controller.js';
import { employeesRouter } from './modules/employees/employees.controller.js';
import { organizationRouter } from './modules/organization/organization.controller.js';
import { shiftsRouter } from './modules/shifts/shifts.controller.js';
import { policiesRouter } from './modules/policies/policies.controller.js';
import { punchesRouter } from './modules/punches/punches.controller.js';
import { exceptionsRouter } from './modules/exceptions/exceptions.controller.js';
import { approvalsRouter } from './modules/approvals/approvals.controller.js';
import { devicesRouter } from './modules/devices/devices.controller.js';
import { finalisationRouter } from './modules/finalisation/finalisation.controller.js';
import { reportsRouter } from './modules/reports/reports.controller.js';
import { superadminRouter } from './modules/superadmin/superadmin.controller.js';
import { auditRouter } from './modules/audit/audit.controller.js';
import { integrationsRouter } from './modules/integrations/integrations.controller.js';
import { leavesRouter } from './modules/leaves/leaves.controller.js';
import { addonsRouter } from './modules/addons/addons.controller.js';
import { hrRouter } from './modules/hr/hr.controller.js';
import { tmRouter } from './modules/tm/tm.controller.js';
import { securityRouter } from './modules/security/security.controller.js';
import { payrollDisbursementRouter } from './modules/payroll-disbursement/payroll-disbursement.controller.js';
import { fieldForceRouter } from './modules/field-force/field-force.controller.js';
import { globalPayrollRouter } from './modules/global-payroll/global-payroll.controller.js';
import { billingRouter } from './modules/billing/billing.controller.js';
import { helpBotRouter } from './modules/help-bot/help-bot.controller.js';
import { dpdpaRouter } from './modules/dpdpa/dpdpa.controller.js';

const app = express();

// Security & Middlewares
app.use(helmet());
app.use(cors({ origin: config.corsOrigins, credentials: true }));
app.use(express.json());

// Tenant-Aware API Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req as any).user?.tenantId || req.ip
});
app.use(limiter);

// Global Unauthenticated Endpoints
app.use('/api/v1/auth', authRouter);

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'InfiTimePro API Gateway',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Authenticated Gateway Pipeline: AuthGuard -> TenantContext
app.use(authGuard);
app.use(tenantMiddleware);

// Super Admin Platform & Billing Management Endpoints
app.use('/api/v1/superadmin', superadminRouter);
app.use('/api/v1/billing', billingRouter);
app.use('/api/v1/audit', auditRouter);
app.use('/api/v1/addons', addonsRouter);

// Tenant Operational Endpoints (Guarded with Super Admin Privacy Boundary)
app.use('/api/v1/analytics', superAdminPrivacyGuard, analyticsRouter);
app.use('/api/v1/attendance', superAdminPrivacyGuard, attendanceRouter);
app.use('/api/v1/employees', superAdminPrivacyGuard, employeesRouter);
app.use('/api/v1/organization', superAdminPrivacyGuard, organizationRouter);
app.use('/api/v1/shifts', superAdminPrivacyGuard, shiftsRouter);
app.use('/api/v1/policies', superAdminPrivacyGuard, policiesRouter);
app.use('/api/v1/punches', superAdminPrivacyGuard, punchesRouter);
app.use('/api/v1/exceptions', superAdminPrivacyGuard, exceptionsRouter);
app.use('/api/v1/approvals', superAdminPrivacyGuard, approvalsRouter);
app.use('/api/v1/devices', superAdminPrivacyGuard, devicesRouter);
app.use('/api/v1/finalisation', superAdminPrivacyGuard, finalisationRouter);
app.use('/api/v1/reports', superAdminPrivacyGuard, reportsRouter);
app.use('/api/v1/integrations', superAdminPrivacyGuard, integrationsRouter);
app.use('/api/v1/leaves', superAdminPrivacyGuard, leavesRouter);
app.use('/api/v1/hr', superAdminPrivacyGuard, hrRouter);
app.use('/api/v1/tm', superAdminPrivacyGuard, tmRouter);
app.use('/api/v1/security', superAdminPrivacyGuard, securityRouter);
app.use('/api/v1/payroll-disbursement', superAdminPrivacyGuard, payrollDisbursementRouter);
app.use('/api/v1/field-force', superAdminPrivacyGuard, fieldForceRouter);
app.use('/api/v1/global-payroll', superAdminPrivacyGuard, globalPayrollRouter);
app.use('/api/v1/help-bot', helpBotRouter);
app.use('/api/v1/dpdpa', dpdpaRouter);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled API Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'ERR_INTERNAL_SERVER',
      message: err.message || 'An internal server error occurred',
    },
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] || `req_${Date.now()}`,
  });
});

app.listen(config.port, () => {
  console.log(`========================================================`);
  console.log(`🚀 InfiTimePro API Gateway running on port ${config.port}`);
  console.log(`🔒 Cryptographic Tenant Isolation & Super Admin Privacy Active`);
  console.log(`========================================================`);
});

export default app;
