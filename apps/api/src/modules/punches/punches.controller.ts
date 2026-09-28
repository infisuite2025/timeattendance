import { Router, Request, Response } from 'express';
import { PunchesService } from './punches.service.js';
import {
  IngestPunchRequestDTO,
  BatchIngestPunchRequestDTO,
  RawPunchFilterDTO
} from '@infi-timepro/shared-types';

export const punchesRouter = Router();

// GET /api/v1/punches/raw
punchesRouter.get('/raw', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-demo-001';
    const filter: RawPunchFilterDTO = {
      search: req.query.search as string,
      source: req.query.source as any,
      eventType: req.query.eventType as any,
      isFlagged: req.query.isFlagged !== undefined ? req.query.isFlagged === 'true' : undefined,
      departmentId: req.query.departmentId as string,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 25,
    };

    const result = await PunchesService.getPunches(tenantId, filter);

    res.json({
      success: true,
      data: result.punches,
      meta: {
        total: result.total,
        page: filter.page,
        limit: filter.limit,
        totalPages: Math.ceil(result.total / (filter.limit || 25))
      },
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'req-punches-001'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'PUNCH_QUERY_ERROR', message: error.message }
    });
  }
});

// GET /api/v1/punches/metrics
punchesRouter.get('/metrics', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-demo-001';
    const metrics = await PunchesService.getMetrics(tenantId);
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'req-punch-metrics-001'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'METRICS_ERROR', message: error.message }
    });
  }
});

// POST /api/v1/punches/ingest
punchesRouter.post('/ingest', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-demo-001';
    const payload: IngestPunchRequestDTO = req.body;

    if (!payload.employeeId || !payload.timestamp || !payload.eventType || !payload.source) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'employeeId, timestamp, eventType and source are required' }
      });
    }

    const result = await PunchesService.ingestPunch(tenantId, payload);
    const status = result.status === 'duplicate' ? 409 : (result.status === 'flagged' ? 202 : 201);

    res.status(status).json({
      success: result.success,
      data: result,
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'req-punch-ingest'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'INGEST_ERROR', message: error.message }
    });
  }
});

// POST /api/v1/punches/batch
punchesRouter.post('/batch', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-demo-001';
    const batch: BatchIngestPunchRequestDTO = req.body;

    if (!batch.punches || !Array.isArray(batch.punches)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'punches array is required' }
      });
    }

    const result = await PunchesService.batchIngest(tenantId, batch);
    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'req-punch-batch'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'BATCH_INGEST_ERROR', message: error.message }
    });
  }
});
