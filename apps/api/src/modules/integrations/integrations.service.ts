import {
  IntegrationConnectorDTO,
  WebhookSubscriptionDTO,
  WebhookDeliveryLogDTO,
  TriggerWebhookTestRequestDTO
} from '@infi-timepro/shared-types';
import crypto from 'crypto';

export class IntegrationsService {
  private static connectors: IntegrationConnectorDTO[] = [
    {
      id: 'int-001',
      code: 'workday-hrms',
      name: 'Workday Human Capital Management',
      category: 'hrms',
      icon: 'Building2',
      status: 'connected',
      description: 'Bidirectional sync of worker profiles, job assignments, supervisory orgs, and cost centers.',
      lastSyncAt: '2026-09-14T17:00:00.000Z',
      nextSyncAt: '2026-09-14T18:00:00.000Z',
      syncFrequency: 'hourly',
      recordsCount: 254
    },
    {
      id: 'int-002',
      code: 'sap-successfactors',
      name: 'SAP SuccessFactors Employee Central',
      category: 'hrms',
      icon: 'Layers',
      status: 'connected',
      description: 'Inbound employee demographic updates and automatic organizational hierarchy sync.',
      lastSyncAt: '2026-09-14T12:00:00.000Z',
      nextSyncAt: '2026-09-15T00:00:00.000Z',
      syncFrequency: 'daily',
      recordsCount: 1420
    },
    {
      id: 'int-003',
      code: 'adp-workforce-now',
      name: 'ADP Vantage / Workforce Now',
      category: 'payroll',
      icon: 'FileSpreadsheet',
      status: 'connected',
      description: 'Automated payroll handoff batch pushing payable regular hours, overtime tiers, and LOP deductions.',
      lastSyncAt: '2026-09-01T15:00:00.000Z',
      nextSyncAt: '2026-10-01T00:00:00.000Z',
      syncFrequency: 'manual',
      recordsCount: 248
    },
    {
      id: 'int-004',
      code: 'zkteco-biometric-push',
      name: 'ZKTeco ADMS / Standalone Push Bridge',
      category: 'hardware_bridge',
      icon: 'Cpu',
      status: 'connected',
      description: 'Biometric hardware punch telemetry ingestion and automated template face distribution.',
      lastSyncAt: '2026-09-14T18:30:00.000Z',
      syncFrequency: 'realtime',
      recordsCount: 148200
    },
    {
      id: 'int-005',
      code: 'suprema-biostar2',
      name: 'Suprema BioStar 2 Cloud WebSocket API',
      category: 'hardware_bridge',
      icon: 'ShieldCheck',
      status: 'connected',
      description: 'Real-time WebSocket event bridge capturing facial recognition and access control turnstile punches.',
      lastSyncAt: '2026-09-14T18:35:00.000Z',
      syncFrequency: 'realtime',
      recordsCount: 65400
    },
    {
      id: 'int-006',
      code: 'azure-ad-scim',
      name: 'Microsoft Entra ID (Azure AD) SCIM & SSO',
      category: 'identity_scim',
      icon: 'KeyRound',
      status: 'connected',
      description: 'Single Sign-On (SAML 2.0 / OIDC) and automated employee user provisioning via SCIM 2.0.',
      lastSyncAt: '2026-09-14T06:00:00.000Z',
      syncFrequency: 'hourly',
      recordsCount: 254
    }
  ];

  private static webhooks: WebhookSubscriptionDTO[] = [
    {
      id: 'wh-001',
      tenantId: 'tenant-demo-001',
      url: 'https://api.company.com/webhooks/attendance-events',
      description: 'Corporate Slack and HRMS real-time attendance notification consumer.',
      secretKey: 'whsec_' + crypto.randomBytes(16).toString('hex'),
      events: ['punch.ingested', 'regularisation.approved', 'exception.detected'],
      status: 'active',
      successRate: 99.8,
      createdAt: '2026-08-01T10:00:00.000Z',
      lastTriggeredAt: '2026-09-14T18:25:00.000Z'
    },
    {
      id: 'wh-002',
      tenantId: 'tenant-demo-001',
      url: 'https://payroll-bridge.internal.company.com/api/v1/inbound-time',
      description: 'Enterprise ERP staging listener for period lock and overtime clearance.',
      secretKey: 'whsec_' + crypto.randomBytes(16).toString('hex'),
      events: ['pay_period.locked', 'overtime.approved'],
      status: 'active',
      successRate: 100.0,
      createdAt: '2026-08-15T11:00:00.000Z',
      lastTriggeredAt: '2026-09-01T14:30:00.000Z'
    }
  ];

  private static deliveryLogs: WebhookDeliveryLogDTO[] = [
    {
      id: 'del-901',
      webhookId: 'wh-001',
      eventType: 'punch.ingested',
      timestamp: '2026-09-14T18:25:00.000Z',
      statusCode: 200,
      durationMs: 142,
      payload: {
        event: 'punch.ingested',
        employeeId: 'emp-002',
        employeeCode: 'EMP-1002',
        punchTime: '2026-09-14T18:25:00Z',
        type: 'OUT',
        device: 'BIO-01 (Office Gate 1)'
      },
      responseBody: '{"status": "received", "event_id": "evt_90123"}',
      status: 'success'
    },
    {
      id: 'del-902',
      webhookId: 'wh-001',
      eventType: 'regularisation.approved',
      timestamp: '2026-09-14T16:20:00.000Z',
      statusCode: 200,
      durationMs: 98,
      payload: {
        event: 'regularisation.approved',
        requestId: 'REG-8092',
        employeeId: 'emp-003',
        approver: 'Naresh Andukoori'
      },
      responseBody: '{"status": "ok"}',
      status: 'success'
    }
  ];

  static async getConnectors(): Promise<IntegrationConnectorDTO[]> {
    return this.connectors;
  }

  static async createConnector(payload: Partial<IntegrationConnectorDTO>): Promise<IntegrationConnectorDTO> {
    const newConnector: IntegrationConnectorDTO = {
      id: `int-${Math.floor(100 + Math.random() * 900)}`,
      code: payload.code || `custom-bridge-${Date.now()}`,
      name: payload.name || 'Custom Enterprise Connector',
      category: payload.category || 'hrms',
      icon: payload.icon || 'Building2',
      status: payload.status || 'connected',
      description: payload.description || 'Custom data integration pipeline.',
      lastSyncAt: new Date().toISOString(),
      syncFrequency: payload.syncFrequency || 'hourly',
      recordsCount: payload.recordsCount || 100
    };
    this.connectors.push(newConnector);
    return newConnector;
  }

  static async updateConnector(id: string, payload: Partial<IntegrationConnectorDTO>): Promise<IntegrationConnectorDTO | null> {
    const idx = this.connectors.findIndex(c => c.id === id || c.code === id);
    if (idx === -1) return null;
    this.connectors[idx] = { ...this.connectors[idx], ...payload };
    return this.connectors[idx];
  }

  static async deleteConnector(id: string): Promise<boolean> {
    const idx = this.connectors.findIndex(c => c.id === id || c.code === id);
    if (idx === -1) return false;
    this.connectors.splice(idx, 1);
    return true;
  }

  static async triggerSync(connectorId: string): Promise<{ success: boolean; syncedRecords: number; timestamp: string }> {
    const conn = this.connectors.find(c => c.id === connectorId);
    if (!conn) throw new Error('Connector not found');

    conn.status = 'connected';
    conn.lastSyncAt = new Date().toISOString();
    return {
      success: true,
      syncedRecords: conn.recordsCount || 254,
      timestamp: conn.lastSyncAt
    };
  }

  static async getWebhooks(tenantId: string): Promise<WebhookSubscriptionDTO[]> {
    return this.webhooks;
  }

  static async createWebhook(payload: Omit<WebhookSubscriptionDTO, 'id' | 'createdAt' | 'successRate' | 'secretKey'>): Promise<WebhookSubscriptionDTO> {
    const newWebhook: WebhookSubscriptionDTO = {
      ...payload,
      id: `wh-${Math.floor(100 + Math.random() * 900)}`,
      secretKey: 'whsec_' + crypto.randomBytes(16).toString('hex'),
      successRate: 100,
      createdAt: new Date().toISOString()
    };
    this.webhooks.unshift(newWebhook);
    return newWebhook;
  }

  static async updateWebhook(id: string, payload: Partial<WebhookSubscriptionDTO>): Promise<WebhookSubscriptionDTO | null> {
    const idx = this.webhooks.findIndex(w => w.id === id);
    if (idx === -1) return null;
    this.webhooks[idx] = { ...this.webhooks[idx], ...payload };
    return this.webhooks[idx];
  }

  static async deleteWebhook(id: string): Promise<boolean> {
    const idx = this.webhooks.findIndex(w => w.id === id);
    if (idx === -1) return false;
    this.webhooks.splice(idx, 1);
    return true;
  }

  static async triggerTestWebhook(payload: TriggerWebhookTestRequestDTO): Promise<WebhookDeliveryLogDTO> {
    const webhook = this.webhooks.find(w => w.id === payload.webhookId) || this.webhooks[0];
    const log: WebhookDeliveryLogDTO = {
      id: `del-${Math.floor(1000 + Math.random() * 9000)}`,
      webhookId: webhook.id,
      eventType: payload.eventType || 'test.ping',
      timestamp: new Date().toISOString(),
      statusCode: 200,
      durationMs: Math.floor(80 + Math.random() * 90),
      payload: payload.samplePayload || {
        event: payload.eventType || 'test.ping',
        tenantId: 'tenant-demo-001',
        message: 'InfiTimePro webhook ping verification',
        timestamp: new Date().toISOString()
      },
      responseBody: '{"status": "delivered", "signature_verified": true}',
      status: 'success'
    };

    webhook.lastTriggeredAt = log.timestamp;
    this.deliveryLogs.unshift(log);
    return log;
  }

  static async getDeliveryLogs(): Promise<WebhookDeliveryLogDTO[]> {
    return this.deliveryLogs;
  }
}
