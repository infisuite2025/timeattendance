import { Router, Response } from 'express';
import { DevicesService } from './devices.service.js';
import { AuthenticatedRequest, authGuard } from '../../middleware/auth-guard.js';

export const devicesRouter = Router();

// GET /api/v1/devices
devicesRouter.get('/', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-demo-001';
    const filter = {
      status: req.query.status as string,
      search: req.query.search as string
    };
    const data = await DevicesService.getDevices(tenantId, filter);
    res.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DEVICES_QUERY_ERROR', message: error.message }
    });
  }
});

// POST /api/v1/devices
devicesRouter.post('/', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-demo-001';
    const data = await DevicesService.createDevice(tenantId, req.body);
    res.status(201).json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'CREATE_DEVICE_ERROR', message: error.message }
    });
  }
});

// POST /api/v1/devices/:id/command
devicesRouter.post('/:id/command', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { command } = req.body;
    const data = await DevicesService.executeCommand({ deviceId: req.params.id, command });
    res.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DEVICE_COMMAND_ERROR', message: error.message }
    });
  }
});

// GET /api/v1/devices/geofences
devicesRouter.get('/geofences', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-demo-001';
    const data = await DevicesService.getGeofences(tenantId);
    res.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'GEOFENCE_QUERY_ERROR', message: error.message }
    });
  }
});

// PUT /api/v1/devices/geofences/:id
devicesRouter.put('/geofences/:id', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await DevicesService.updateGeofence(req.params.id, req.body);
    res.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'UPDATE_GEOFENCE_ERROR', message: error.message }
    });
  }
});
