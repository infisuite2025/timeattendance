import { Router, Request, Response } from 'express';
import { AddonsService } from './addons.service.js';
import { SubscribeAddonRequestDTO } from '@infi-timepro/shared-types';

export const addonsRouter = Router();

addonsRouter.get('/catalog', async (req: Request, res: Response) => {
  try {
    const catalog = await AddonsService.getCatalog();
    res.json({ success: true, data: catalog });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

addonsRouter.get('/subscriptions', async (req: Request, res: Response) => {
  try {
    const tenantId = (req.headers['x-tenant-id'] as string) || 'tenant-001';
    const subscriptions = await AddonsService.getTenantSubscriptions(tenantId);
    res.json({ success: true, data: subscriptions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

addonsRouter.post('/subscribe', async (req: Request, res: Response) => {
  try {
    const tenantId = (req.headers['x-tenant-id'] as string) || 'tenant-001';
    const payload: SubscribeAddonRequestDTO = req.body;
    const result = await AddonsService.subscribe(tenantId, payload);
    res.status(201).json({ success: true, data: result, message: 'Add-on subscription activated successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

addonsRouter.post('/cancel', async (req: Request, res: Response) => {
  try {
    const tenantId = (req.headers['x-tenant-id'] as string) || 'tenant-001';
    const { addonId } = req.body;
    const result = await AddonsService.cancelSubscription(tenantId, addonId);
    res.json({ success: true, data: result, message: 'Add-on subscription cancelled' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// SuperAdmin Addon Management Endpoints
addonsRouter.post('/catalog/item', async (req: Request, res: Response) => {
  try {
    const updated = await AddonsService.updateCatalogItem(req.body);
    res.json({ success: true, data: updated, message: 'Catalog item saved successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

addonsRouter.get('/all-subscriptions', async (req: Request, res: Response) => {
  try {
    const all = await AddonsService.getAllTenantSubscriptions();
    res.json({ success: true, data: all });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

addonsRouter.post('/override-grant', async (req: Request, res: Response) => {
  try {
    const { tenantId, addonId, status, billingCycle, seats } = req.body;
    const result = await AddonsService.grantTenantAddonOverride(tenantId, addonId, status, billingCycle, seats);
    res.json({ success: true, data: result, message: `Addon ${addonId} override applied for tenant ${tenantId}` });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

