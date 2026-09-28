import { Router, Request, Response } from 'express';
import { BillingService } from './billing.service.js';

export const billingRouter = Router();

// Super Admin: Get Payment Gateway Configs
billingRouter.get('/gateway-config', async (req: Request, res: Response) => {
  try {
    const configs = await BillingService.getPaymentGatewayConfigs();
    res.json({ success: true, data: configs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Super Admin: Update Payment Gateway Config
billingRouter.post('/gateway-config', async (req: Request, res: Response) => {
  try {
    const updated = await BillingService.updatePaymentGatewayConfig(req.body);
    res.json({ success: true, data: updated, message: 'Payment gateway configuration updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Super Admin: Get Pricing Tiers
billingRouter.get('/pricing-plans', async (req: Request, res: Response) => {
  try {
    const tiers = await BillingService.getPricingTiers();
    res.json({ success: true, data: tiers });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Super Admin: Update Pricing Tier
billingRouter.put('/pricing-plans/:id', async (req: Request, res: Response) => {
  try {
    const updated = await BillingService.updatePricingTier(req.params.id, req.body);
    res.json({ success: true, data: updated, message: 'Pricing tier updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Tenant / Super Admin: Get Invoices
billingRouter.get('/tenant-invoices', async (req: Request, res: Response) => {
  try {
    const tenantId = req.query.tenantId as string || req.headers['x-tenant-id'] as string;
    const invoices = await BillingService.getTenantInvoices(tenantId);
    res.json({ success: true, data: invoices });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Tenant: Pay Invoice via Payment Gateway
billingRouter.post('/pay-invoice', async (req: Request, res: Response) => {
  try {
    const { invoiceId, paymentMethod } = req.body;
    if (!invoiceId) {
      return res.status(400).json({ success: false, error: { message: 'Invoice ID is required' } });
    }
    const invoice = await BillingService.payInvoice(invoiceId, paymentMethod || 'Visa ending in 4242');
    res.json({ success: true, data: invoice, message: 'Payment processed successfully via payment gateway' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Super Admin: Global Revenue Summary
billingRouter.get('/global-revenue', async (req: Request, res: Response) => {
  try {
    const summary = await BillingService.getGlobalRevenueSummary();
    res.json({ success: true, data: summary });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});
