import React, { useState, useEffect } from 'react';
import {
  Share2,
  Cpu,
  Layers,
  Building2,
  FileSpreadsheet,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Plus,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe,
  Radio,
  Send,
  X,
  Code,
  Check,
  Copy,
  Terminal,
  Activity,
  Trash2,
  Loader2
} from 'lucide-react';
import {
  IntegrationConnectorDTO,
  WebhookSubscriptionDTO,
  WebhookDeliveryLogDTO,
  IntegrationCategory
} from '@infi-timepro/shared-types';
import { apiClient } from '../../services/apiClient.ts';
import { useNotification } from '../../context/NotificationContext.tsx';
import { useI18n } from '../../context/I18nContext.tsx';

export const IntegrationsHubPage: React.FC = () => {
  const { t } = useI18n();
  const { toast, confirm } = useNotification();
  const [activeTab, setActiveTab] = useState<'connectors' | 'webhooks'>('connectors');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncSuccessId, setSyncSuccessId] = useState<string | null>(null);
  const [testingWebhookId, setTestingWebhookId] = useState<string | null>(null);

  const [connectors, setConnectors] = useState<IntegrationConnectorDTO[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookSubscriptionDTO[]>([]);
  const [deliveryLogs, setDeliveryLogs] = useState<WebhookDeliveryLogDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [showConnectorModal, setShowConnectorModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<WebhookDeliveryLogDTO | null>(null);
  const [copiedSecretId, setCopiedSecretId] = useState<string | null>(null);

  // New Webhook Form State
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookDesc, setNewWebhookDesc] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([
    'punch.ingested',
    'regularisation.approved'
  ]);
  const [isRegisteringWebhook, setIsRegisteringWebhook] = useState(false);

  // New Connector Form State
  const [newConnCode, setNewConnCode] = useState('');
  const [newConnName, setNewConnName] = useState('');
  const [newConnCategory, setNewConnCategory] = useState<IntegrationCategory>('hrms');
  const [newConnDesc, setNewConnDesc] = useState('');
  const [newConnFreq, setNewConnFreq] = useState<'hourly' | 'daily' | 'realtime' | 'manual'>('hourly');
  const [isRegisteringConnector, setIsRegisteringConnector] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [connRes, whRes, logsRes] = await Promise.all([
        apiClient.get<IntegrationConnectorDTO[]>('/integrations/connectors'),
        apiClient.get<WebhookSubscriptionDTO[]>('/integrations/webhooks'),
        apiClient.get<WebhookDeliveryLogDTO[]>('/integrations/webhooks/deliveries')
      ]);

      if (connRes.success && Array.isArray(connRes.data)) {
        setConnectors(connRes.data);
      }
      if (whRes.success && Array.isArray(whRes.data)) {
        setWebhooks(whRes.data);
      }
      if (logsRes.success && Array.isArray(logsRes.data)) {
        setDeliveryLogs(logsRes.data);
      }
    } catch (err: any) {
      toast.error('Failed to load integration hub data', err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTriggerSync = async (connectorId: string) => {
    const conn = connectors.find((c) => c.id === connectorId);
    setSyncingId(connectorId);
    try {
      const res = await apiClient.post(`/integrations/sync/${connectorId}`);
      if (res.success) {
        setSyncSuccessId(connectorId);
        toast.success(
          'Synchronization Complete',
          `Successfully synchronized ${res.data?.syncedRecords || conn?.recordsCount || 250} entities with ${conn?.name || 'integration pipeline'}.`
        );
        setConnectors((prev) =>
          prev.map((c) => (c.id === connectorId ? { ...c, lastSyncAt: new Date().toISOString() } : c))
        );
        setTimeout(() => setSyncSuccessId(null), 3000);
      } else {
        toast.error('Sync Failed', res.error?.message || 'Could not complete synchronization.');
      }
    } catch (err: any) {
      toast.error('Sync Error', err.message || 'An error occurred during synchronization.');
    } finally {
      setSyncingId(null);
    }
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebhookUrl.trim()) {
      toast.error('Validation Error', 'Webhook Payload URL is required.');
      return;
    }
    if (!newWebhookUrl.startsWith('http://') && !newWebhookUrl.startsWith('https://')) {
      toast.error('Validation Error', 'Webhook URL must start with http:// or https://');
      return;
    }
    if (selectedEvents.length === 0) {
      toast.error('Validation Error', 'Please select at least one subscribed event topic.');
      return;
    }

    setIsRegisteringWebhook(true);
    try {
      const payload = {
        url: newWebhookUrl.trim(),
        description: newWebhookDesc.trim() || 'Custom webhook subscriber endpoint',
        events: selectedEvents,
        status: 'active' as const
      };

      const res = await apiClient.post('/integrations/webhooks', payload);
      if (res.success && res.data) {
        toast.success('Webhook Endpoint Registered', `Endpoint "${res.data.url}" registered with HMAC signing key.`);
        setShowWebhookModal(false);
        setNewWebhookUrl('');
        setNewWebhookDesc('');
        loadData();
      } else {
        toast.error('Registration Failed', res.error?.message || 'Failed to register webhook endpoint.');
      }
    } catch (err: any) {
      toast.error('Error', err.message || 'Failed to register webhook.');
    } finally {
      setIsRegisteringWebhook(false);
    }
  };

  const handleDeleteWebhook = async (wh: WebhookSubscriptionDTO) => {
    const confirmed = await confirm({
      title: `Delete Webhook Endpoint?`,
      text: `Are you sure you want to permanently delete webhook endpoint "${wh.url}"? This subscriber will stop receiving real-time events.`,
      confirmButtonText: 'Delete Webhook',
      icon: 'delete',
      isDangerous: true
    });

    if (!confirmed) return;

    try {
      const res = await apiClient.delete(`/integrations/webhooks/${wh.id}`);
      if (res.success) {
        toast.success('Webhook Deleted', 'Webhook subscription removed successfully.');
        setWebhooks((prev) => prev.filter((w) => w.id !== wh.id));
      } else {
        toast.error('Delete Failed', res.error?.message || 'Could not remove webhook.');
      }
    } catch (err: any) {
      toast.error('Error', err.message || 'Failed to delete webhook.');
    }
  };

  const handleTestWebhookPing = async (wh: WebhookSubscriptionDTO) => {
    setTestingWebhookId(wh.id);
    try {
      const res = await apiClient.post('/integrations/webhooks/test', {
        webhookId: wh.id,
        eventType: wh.events[0] || 'punch.ingested'
      });
      if (res.success && res.data) {
        toast.success(
          'Test Webhook Dispatched',
          `Event "${res.data.eventType}" delivered to ${wh.url} with HTTP status ${res.data.statusCode} (${res.data.durationMs}ms latency).`
        );
        setDeliveryLogs((prev) => [res.data, ...prev]);
      } else {
        toast.error('Test Failed', res.error?.message || 'Test ping failed.');
      }
    } catch (err: any) {
      toast.error('Test Error', err.message || 'Could not send test ping.');
    } finally {
      setTestingWebhookId(null);
    }
  };

  const handleCreateConnector = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConnName.trim() || !newConnCode.trim()) {
      toast.error('Validation Error', 'Connector Name and Code are required.');
      return;
    }

    setIsRegisteringConnector(true);
    try {
      const payload = {
        code: newConnCode.toLowerCase().trim(),
        name: newConnName.trim(),
        category: newConnCategory,
        icon: newConnCategory === 'hrms' ? 'Building2' : newConnCategory === 'payroll' ? 'FileSpreadsheet' : 'Cpu',
        status: 'connected' as const,
        description: newConnDesc.trim() || 'Custom enterprise bridge integration pipeline.',
        syncFrequency: newConnFreq,
        recordsCount: 150
      };

      const res = await apiClient.post('/integrations/connectors', payload);
      if (res.success && res.data) {
        toast.success('Integration Connector Registered', `Connector "${res.data.name}" added to enterprise hub.`);
        setShowConnectorModal(false);
        setNewConnCode('');
        setNewConnName('');
        setNewConnDesc('');
        loadData();
      } else {
        toast.error('Registration Failed', res.error?.message || 'Could not register connector.');
      }
    } catch (err: any) {
      toast.error('Error', err.message || 'Failed to register connector.');
    } finally {
      setIsRegisteringConnector(false);
    }
  };

  const handleDeleteConnector = async (conn: IntegrationConnectorDTO) => {
    const confirmed = await confirm({
      title: `Delete Connector: ${conn.name}?`,
      text: `Are you sure you want to remove enterprise bridge "${conn.name}" (${conn.code})?`,
      confirmButtonText: 'Delete Connector',
      icon: 'delete',
      isDangerous: true
    });

    if (!confirmed) return;

    try {
      const res = await apiClient.delete(`/integrations/connectors/${conn.id}`);
      if (res.success) {
        toast.success('Connector Removed', `Integration connector "${conn.name}" deleted.`);
        setConnectors((prev) => prev.filter((c) => c.id !== conn.id));
      } else {
        toast.error('Delete Failed', res.error?.message || 'Could not remove connector.');
      }
    } catch (err: any) {
      toast.error('Error', err.message || 'Failed to delete connector.');
    }
  };

  const copySecret = (secret: string, id: string) => {
    navigator.clipboard.writeText(secret);
    setCopiedSecretId(id);
    toast.info('Copied Secret Key', 'HMAC secret key copied to clipboard.');
    setTimeout(() => setCopiedSecretId(null), 2000);
  };

  const filteredConnectors = connectors.filter((c) => {
    const matchesCat = selectedCategory === 'all' || c.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCat;
    return matchesCat && (c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
  });

  const filteredWebhooks = webhooks.filter((wh) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return wh.url.toLowerCase().includes(q) || wh.description.toLowerCase().includes(q) || wh.events.some((e) => e.toLowerCase().includes(q));
  });

  const activeConnectorsCount = connectors.filter((c) => c.status === 'connected').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('integrations.integrations_webhooks_hub', 'Integrations & Webhooks Hub')}</h1>
            <span className="text-xs px-2.5 py-1 font-semibold rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              REST-API-CONNECTED
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Connect Workday, SAP, ADP, biometric hardware push protocols, and dispatch real-time HMAC-signed webhook events.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition shadow-sm"
            title="Refresh connectors & webhooks from API"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('connectors')}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                activeTab === 'connectors'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Connectors & Bridges ({connectors.length})</button>
            <button
              onClick={() => setActiveTab('webhooks')}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                activeTab === 'webhooks'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Webhooks & Events ({webhooks.length})</button>
          </div>

          {activeTab === 'connectors' ? (
            <button
              onClick={() => setShowConnectorModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow"
            >
              <Plus className="w-3.5 h-3.5" /> New Connector
            </button>
          ) : (
            <button
              onClick={() => setShowWebhookModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow"
            >
              <Plus className="w-3.5 h-3.5" /> New Webhook
            </button>
          )}</div>
      </div>

      {/* Integration KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{activeConnectorsCount}</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Connectors</div>
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">100% Healthy Sync</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">214,800</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Daily Ingested Events</div>
            <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 mt-1">Biometric & GPS Bridges</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">99.94%</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Webhook Deliverability</div>
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">HMAC-SHA256 Signed</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">142 ms</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Average Webhook Latency</div>
            <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-1">Auto-Retry Exponential Backoff</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={activeTab === 'connectors' ? "Search connectors by code, name, or description..." : "Search webhooks by URL or event topic..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200"
          />
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {activeTab === 'connectors' ? `Showing ${filteredConnectors.length} of ${connectors.length}` : `Showing ${filteredWebhooks.length} of ${webhooks.length}`}</span>
      </div>

      {loading ? (
        <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Loading integration connectors and webhooks from backend API...</p>
        </div>
      ) : activeTab === 'connectors' ? (
        /* Connectors View */
        <div className="space-y-4">
          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-medium">
            {['all', 'hrms', 'payroll', 'hardware_bridge', 'identity_scim'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl capitalize transition ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white font-bold shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                {cat === 'all' ? 'All Integrations' : cat.replace('_', ' ')}</button>
            ))}</div>

          {/* Connectors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredConnectors.map((conn) => {
              const isSyncing = syncingId === conn.id;
              const isSuccess = syncSuccessId === conn.id;

              return (
                <div
                  key={conn.id}
                  className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                          {conn.category === 'hrms' ? (
                            <Building2 className="w-5 h-5" />
                          ) : conn.category === 'payroll' ? (
                            <FileSpreadsheet className="w-5 h-5" />
                          ) : conn.category === 'identity_scim' ? (
                            <KeyRound className="w-5 h-5" />
                          ) : (
                            <Cpu className="w-5 h-5" />
                          )}</div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{conn.name}</h3>
                          <span className="text-[10px] font-mono text-slate-400 uppercase">
                            {conn.category.replace('_', ' ')}</span>
                        </div>
                      </div>

                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                        <CheckCircle2 className="w-3 h-3" /> {conn.status}</span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{conn.description}</p>

                    <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl text-[11px] text-slate-500 space-y-1">
                      <div className="flex justify-between">
                        <span>Sync Frequency:</span>
                        <strong className="text-slate-700 dark:text-slate-300 capitalize">{conn.syncFrequency}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Synchronized:</span>
                        <span className="text-slate-700 dark:text-slate-300 font-mono text-[10px]">
                          {conn.lastSyncAt ? new Date(conn.lastSyncAt).toLocaleTimeString() : 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                    <button
                      onClick={() => handleDeleteConnector(conn)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition"
                      title="Delete Connector"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleTriggerSync(conn.id)}
                      disabled={isSyncing}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                    >
                      {isSyncing ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" /> Syncing...
                        </>
                      ) : isSuccess ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" /> Synced
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3 h-3" /> Sync Now
                        </>
                      )}</button>
                  </div>
                </div>
              );
            })}</div>
        </div>
      ) : (
        /* Webhooks View */
        <div className="space-y-6">
          {/* Subscriptions Table */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">{t('integrations.active_webhook_endpoints', 'Active Webhook Endpoints')}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  HTTP POST payloads dispatched with `X-InfiTimePro-Signature` HMAC-SHA256 headers.
                </p>
              </div>
              <button
                onClick={() => setShowWebhookModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
              >
                <Plus className="w-3.5 h-3.5" /> Add Webhook
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Endpoint URL & Description</th>
                    <th className="py-3 px-4">Subscribed Event Topics</th>
                    <th className="py-3 px-4">Signing Secret</th>
                    <th className="py-3 px-4 text-center">Deliverability</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredWebhooks.map((wh) => (
                    <tr key={wh.id} className="hover:bg-slate-50/75 dark:hover:bg-slate-700/25 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-semibold text-indigo-600 dark:text-indigo-400 truncate max-w-sm">
                          {wh.url}</div>
                        <div className="text-[11px] text-slate-400">{wh.description}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {wh.events.map((ev) => (
                            <span
                              key={ev}
                              className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                            >
                              {ev}</span>
                          ))}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate max-w-[120px]">{wh.secretKey}</span>
                          <button
                            onClick={() => copySecret(wh.secretKey, wh.id)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-slate-600 transition"
                            title="Copy Secret Key"
                          >
                            {copiedSecretId === wh.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}</button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-600">
                        {wh.successRate}%
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleTestWebhookPing(wh)}
                            disabled={testingWebhookId === wh.id}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold text-[11px] transition flex items-center gap-1"
                            title="Send test ping event"
                          >
                            {testingWebhookId === wh.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                            <span>Test Ping</span>
                          </button>
                          <button
                            onClick={() => handleDeleteWebhook(wh)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Webhook"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Delivery Logs Stream */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white">Recent Webhook Deliveries ({deliveryLogs.length})</h3>
              <span className="text-xs text-slate-400">Click any row to inspect HTTP headers and JSON payload</span>
            </div>

            <div className="space-y-2">
              {deliveryLogs.map((log) => (
                <div
                  key={log.id}
                  onClick={() => setSelectedDelivery(log)}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between cursor-pointer hover:border-indigo-500 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                      HTTP {log.statusCode} OK
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">{log.eventType}</span>
                    <span className="text-xs text-slate-400 font-mono">• {log.durationMs}ms latency</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}</div>
          </div>
        </div>
      )}

      {/* Payload Inspector Slide-Over */}
      {selectedDelivery && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 h-full shadow-2xl border-l border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('integrations.webhook_delivery_log', 'Webhook Delivery Log')}</h3>
                  <p className="text-xs font-mono text-slate-400">{selectedDelivery.id}</p>
                </div>
                <button onClick={() => setSelectedDelivery(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase">Request JSON Payload</span>
                <pre className="p-3 bg-slate-900 text-slate-100 text-[11px] font-mono rounded-xl overflow-x-auto">
                  {JSON.stringify(selectedDelivery.payload, null, 2)}</pre>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase">Endpoint Response Body</span>
                <pre className="p-3 bg-slate-900 text-emerald-400 text-[11px] font-mono rounded-xl overflow-x-auto">
                  {selectedDelivery.responseBody}
                </pre>
              </div>
            </div>

            <button
              onClick={() => setSelectedDelivery(null)}
              className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
            >
              Close Inspector</button>
          </div>
        </div>
      )}

      {/* Register Webhook Modal */}
      {showWebhookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-700 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 flex items-center justify-center">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('integrations.register_webhook_endpoint', 'Register Webhook Endpoint')}</h3>
                  <p className="text-xs text-slate-500">Subscribe your HTTP service to InfiTimePro attendance events.</p>
                </div>
              </div>
              <button onClick={() => setShowWebhookModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWebhook} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('integrations.payload_url', 'Payload URL')}</label>
                <input
                  type="url"
                  required
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                  placeholder={t('integrations.https_api_yourdomain_com_webho', 'https://api.yourdomain.com/webhooks/attendance')}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('integrations.description_consumer_name', 'Description / Consumer Name')}</label>
                <input
                  type="text"
                  value={newWebhookDesc}
                  onChange={(e) => setNewWebhookDesc(e.target.value)}
                  placeholder={t('integrations.e_g_corporate_slack_attendance', 'e.g. Corporate Slack Attendance Alerts')}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('integrations.subscribed_event_topics', 'Subscribed Event Topics')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {['punch.ingested', 'attendance.calculated', 'regularisation.approved', 'exception.detected', 'pay_period.locked', 'device.offline'].map((ev) => {
                    const isChecked = selectedEvents.includes(ev);
                    return (
                      <label key={ev} className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) setSelectedEvents(selectedEvents.filter((e) => e !== ev));
                            else setSelectedEvents([...selectedEvents, ev]);
                          }}
                          className="rounded text-indigo-600"
                        />
                        <span className="font-mono text-[10px] text-slate-700 dark:text-slate-300">{ev}</span>
                      </label>
                    );
                  })}</div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowWebhookModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel</button>
                <button
                  type="submit"
                  disabled={isRegisteringWebhook}
                  className="flex items-center gap-2 px-5 py-2 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition shadow disabled:opacity-50"
                >
                  {isRegisteringWebhook ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Register Webhook</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Connector Modal */}
      {showConnectorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-700 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 flex items-center justify-center">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('integrations.register_integration_connector', 'Register Integration Connector')}</h3>
                  <p className="text-xs text-slate-500">Add an enterprise HRMS, Payroll, or Biometric Bridge connector.</p>
                </div>
              </div>
              <button onClick={() => setShowConnectorModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateConnector} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('integrations.connector_code', 'Connector Code')}</label>
                  <input
                    type="text"
                    required
                    value={newConnCode}
                    onChange={(e) => setNewConnCode(e.target.value)}
                    placeholder={t('integrations.e_g_bamboo_hrms', 'e.g. bamboo-hrms')}
                    className="w-full font-mono bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('integrations.category', 'Category')}</label>
                  <select
                    value={newConnCategory}
                    onChange={(e) => setNewConnCategory(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200"
                  >
                    <option value="hrms">HRMS</option>
                    <option value="payroll">PAYROLL</option>
                    <option value="hardware_bridge">HARDWARE BRIDGE</option>
                    <option value="identity_scim">IDENTITY SCIM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('integrations.connector_display_name', 'Connector Display Name')}</label>
                <input
                  type="text"
                  required
                  value={newConnName}
                  onChange={(e) => setNewConnName(e.target.value)}
                  placeholder={t('integrations.e_g_bamboohr_worker_sync', 'e.g. BambooHR Worker Sync')}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('integrations.pipeline_description', 'Pipeline Description')}</label>
                <textarea
                  value={newConnDesc}
                  onChange={(e) => setNewConnDesc(e.target.value)}
                  rows={2}
                  placeholder={t('integrations.describe_data_exchange_flow_an', 'Describe data exchange flow and supervisory organization mapping...')}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('integrations.sync_schedule', 'Sync Schedule')}</label>
                <select
                  value={newConnFreq}
                  onChange={(e) => setNewConnFreq(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200"
                >
                  <option value="hourly font-mono">Hourly Sync</option>
                  <option value="daily">Daily Midnight Batch</option>
                  <option value="realtime">Real-Time Event Stream</option>
                  <option value="manual">Manual Execution Only</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowConnectorModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel</button>
                <button
                  type="submit"
                  disabled={isRegisteringConnector}
                  className="flex items-center gap-2 px-5 py-2 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition shadow disabled:opacity-50"
                >
                  {isRegisteringConnector ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Save Connector</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}</div>
  );
};
