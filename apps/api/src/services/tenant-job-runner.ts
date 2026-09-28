import { tenantStorage, TenantContext, getTenantContext } from '../middleware/tenant-context.js';

export interface TenantJobPayload<T = any> {
  jobId: string;
  jobType: string;
  tenantId: string;
  payload: T;
  enqueuedAt: string;
}

export class TenantJobRunner {
  private static jobQueue: TenantJobPayload[] = [];

  /**
   * Binds async processes inside an explicit AsyncLocalStorage tenant context block.
   */
  static async runInTenantContext<T>(
    context: TenantContext,
    jobFn: () => Promise<T>
  ): Promise<T> {
    return tenantStorage.run(context, async () => {
      console.log(`⚙️ JOB RUNNER: Starting background job under tenant context: ${context.tenantId} (${context.subdomain})`);
      try {
        const result = await jobFn();
        console.log(`✅ JOB RUNNER: Background job completed cleanly for tenant: ${context.tenantId}`);
        return result;
      } catch (err) {
        console.error(`❌ JOB RUNNER ERROR: Background job failed under tenant ${context.tenantId}:`, err);
        throw err;
      }
    });
  }

  /**
   * Safely enqueues a background job stamped with the active tenant context.
   */
  static enqueueJob<T>(jobType: string, payload: T, explicitTenantId?: string): TenantJobPayload<T> {
    const tenantId = explicitTenantId || getTenantContext().tenantId;
    const job: TenantJobPayload<T> = {
      jobId: `job_${Math.floor(100000 + Math.random() * 900000)}`,
      jobType,
      tenantId,
      payload,
      enqueuedAt: new Date().toISOString()
    };
    this.jobQueue.push(job);
    return job;
  }

  /**
   * Processes an enqueued background job strictly in its target tenant context.
   */
  static async processNextJob(handler: (job: TenantJobPayload) => Promise<any>): Promise<TenantJobPayload | null> {
    const job = this.jobQueue.shift();
    if (!job) return null;

    const targetContext: TenantContext = {
      tenantId: job.tenantId,
      subdomain: job.tenantId,
      timezone: 'UTC',
      currency: 'USD'
    };

    await this.runInTenantContext(targetContext, async () => {
      await handler(job);
    });

    return job;
  }
}
