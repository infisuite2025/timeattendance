import { Router, Response } from 'express';
import type { RowDataPacket } from 'mysql2';
import { DevicesService } from './devices.service.js';
import { AuthenticatedRequest, authGuard } from '../../middleware/auth-guard.js';
import { pool } from '../../database/db.js';

export const devicesRouter = Router();

// GET /api/v1/devices
devicesRouter.get('/', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = req.user?.tenantId || 'ten_acme_001';
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT d.id, d.device_identifier AS deviceIdentifier, d.name, d.device_type AS deviceType,
              d.status, d.ip_address AS ipAddress, d.last_heartbeat_at AS lastHeartbeatAt, l.name AS locationName
       FROM tp_devices d
       LEFT JOIN tp_locations l ON l.id = d.location_id
       WHERE d.tenant_id = ?
       ORDER BY d.name`,
      [tenantId]
    );
    const data = rows;
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
    const tenantId = req.user?.tenantId || 'ten_acme_001';
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, name, latitude, longitude, geofence_radius_meters AS radiusMeters
       FROM tp_locations WHERE tenant_id = ? AND is_active = 1 ORDER BY name`,
      [tenantId]
    );
    const data = rows;
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
