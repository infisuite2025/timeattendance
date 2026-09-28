import { Router, Request, Response } from 'express';
import { IntegrationsService } from './integrations.service.js';

export const integrationsRouter = Router();

integrationsRouter.get('/connectors', async (req: Request, res: Response) => {
  try {
    const connectors = await IntegrationsService.getConnectors();
    res.json({ success: true, data: connectors });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

integrationsRouter.post('/connectors', async (req: Request, res: Response) => {
  try {
    const created = await IntegrationsService.createConnector(req.body);
    res.status(201).json({ success: true, data: created, message: 'Integration connector registered successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

integrationsRouter.put('/connectors/:id', async (req: Request, res: Response) => {
  try {
    const updated = await IntegrationsService.updateConnector(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: { message: 'Connector not found' } });
    res.json({ success: true, data: updated, message: 'Connector updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

integrationsRouter.delete('/connectors/:id', async (req: Request, res: Response) => {
  try {
    const ok = await IntegrationsService.deleteConnector(req.params.id);
    if (!ok) return res.status(404).json({ success: false, error: { message: 'Connector not found' } });
    res.json({ success: true, message: 'Connector deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

integrationsRouter.post('/sync/:id', async (req: Request, res: Response) => {
  try {
    const result = await IntegrationsService.triggerSync(req.params.id);
    res.json({ success: true, data: result, message: 'Integration synchronization job executed successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

integrationsRouter.get('/webhooks', async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string || 'tenant-demo-001';
    const webhooks = await IntegrationsService.getWebhooks(tenantId);
    res.json({ success: true, data: webhooks });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

integrationsRouter.post('/webhooks', async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string || 'tenant-demo-001';
    const created = await IntegrationsService.createWebhook({ ...req.body, tenantId });
    res.status(201).json({ success: true, data: created, message: 'Webhook endpoint registered successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

integrationsRouter.put('/webhooks/:id', async (req: Request, res: Response) => {
  try {
    const updated = await IntegrationsService.updateWebhook(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: { message: 'Webhook not found' } });
    res.json({ success: true, data: updated, message: 'Webhook updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

integrationsRouter.delete('/webhooks/:id', async (req: Request, res: Response) => {
  try {
    const ok = await IntegrationsService.deleteWebhook(req.params.id);
    if (!ok) return res.status(404).json({ success: false, error: { message: 'Webhook not found' } });
    res.json({ success: true, message: 'Webhook deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

integrationsRouter.post('/webhooks/test', async (req: Request, res: Response) => {
  try {
    const delivery = await IntegrationsService.triggerTestWebhook(req.body);
    res.json({ success: true, data: delivery, message: 'Test webhook event dispatched with HMAC signature' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

integrationsRouter.get('/webhooks/deliveries', async (req: Request, res: Response) => {
  try {
    const logs = await IntegrationsService.getDeliveryLogs();
    res.json({ success: true, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});
