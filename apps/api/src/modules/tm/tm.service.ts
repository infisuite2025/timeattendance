import {
  TMClientDTO,
  TMProjectDTO,
  TMTaskDTO,
  TMTimesheetEntryDTO,
  TMRateCardDTO,
  TMInvoiceDTO,
  TMDashboardSummaryDTO,
} from '@infi-timepro/shared-types';

export class TMService {
  // ─── Clients ────────────────────────────────────────────────────────────────
  private static clients: TMClientDTO[] = [
    {
      id: 'cl-001',
      tenantId: 'tenant-001',
      name: 'Apex Financial Group',
      code: 'AFG',
      industry: 'Banking & Finance',
      contactName: 'Robert Chen',
      contactEmail: 'r.chen@apexfg.com',
      contactPhone: '+1-415-800-1100',
      billingCurrency: 'USD',
      country: 'USA',
      status: 'active',
      contractStartDate: '2025-01-01',
      contractEndDate: '2026-12-31',
      totalBudget: 850000,
      invoicedToDate: 312500,
      createdAt: '2025-01-01T09:00:00.000Z',
    },
    {
      id: 'cl-002',
      tenantId: 'tenant-001',
      name: 'NovaTech Solutions Pvt Ltd',
      code: 'NTSP',
      industry: 'Information Technology',
      contactName: 'Priya Sharma',
      contactEmail: 'priya.sharma@novatech.in',
      contactPhone: '+91-80-4567-8900',
      billingCurrency: 'INR',
      country: 'India',
      status: 'active',
      contractStartDate: '2025-03-15',
      contractEndDate: '2026-03-14',
      totalBudget: 12500000,
      invoicedToDate: 4800000,
      createdAt: '2025-03-10T09:00:00.000Z',
    },
    {
      id: 'cl-003',
      tenantId: 'tenant-001',
      name: 'GulfBridge Logistics LLC',
      code: 'GBL',
      industry: 'Logistics & Supply Chain',
      contactName: 'Khalid Al-Rashidi',
      contactEmail: 'k.rashidi@gulfbridge.ae',
      contactPhone: '+971-4-300-9988',
      billingCurrency: 'AED',
      country: 'UAE',
      status: 'active',
      contractStartDate: '2025-06-01',
      contractEndDate: '2026-05-31',
      totalBudget: 500000,
      invoicedToDate: 110000,
      createdAt: '2025-05-25T09:00:00.000Z',
    },
    {
      id: 'cl-004',
      tenantId: 'tenant-001',
      name: 'HealthCore EU GmbH',
      code: 'HCEU',
      industry: 'Healthcare',
      contactName: 'Hans Mueller',
      contactEmail: 'h.mueller@healthcore.eu',
      contactPhone: '+49-89-7654-3210',
      billingCurrency: 'EUR',
      country: 'Germany',
      status: 'inactive',
      contractStartDate: '2024-04-01',
      contractEndDate: '2025-03-31',
      totalBudget: 200000,
      invoicedToDate: 200000,
      createdAt: '2024-03-28T09:00:00.000Z',
    },
  ];

  // ─── Rate Cards ─────────────────────────────────────────────────────────────
  private static rateCards: TMRateCardDTO[] = [
    {
      id: 'rc-001',
      tenantId: 'tenant-001',
      name: 'Senior Software Engineer',
      roleTitle: 'Senior Software Engineer',
      clientId: 'cl-001',
      clientName: 'Apex Financial Group',
      currency: 'USD',
      hourlyRate: 185,
      overtimeMultiplier: 1.5,
      effectiveFrom: '2025-01-01',
      effectiveTo: '2026-12-31',
      isActive: true,
      billingType: 'time_and_materials',
    },
    {
      id: 'rc-002',
      tenantId: 'tenant-001',
      name: 'QA Automation Engineer',
      roleTitle: 'QA Automation Engineer',
      clientId: 'cl-001',
      clientName: 'Apex Financial Group',
      currency: 'USD',
      hourlyRate: 145,
      overtimeMultiplier: 1.5,
      effectiveFrom: '2025-01-01',
      effectiveTo: '2026-12-31',
      isActive: true,
      billingType: 'time_and_materials',
    },
    {
      id: 'rc-003',
      tenantId: 'tenant-001',
      name: 'Full-Stack Developer (INR)',
      roleTitle: 'Full-Stack Developer',
      clientId: 'cl-002',
      clientName: 'NovaTech Solutions Pvt Ltd',
      currency: 'INR',
      hourlyRate: 4500,
      overtimeMultiplier: 1.5,
      effectiveFrom: '2025-03-15',
      effectiveTo: '2026-03-14',
      isActive: true,
      billingType: 'time_and_materials',
    },
    {
      id: 'rc-004',
      tenantId: 'tenant-001',
      name: 'Logistics Consultant (AED)',
      roleTitle: 'Supply Chain Consultant',
      clientId: 'cl-003',
      clientName: 'GulfBridge Logistics LLC',
      currency: 'AED',
      hourlyRate: 450,
      overtimeMultiplier: 1.5,
      effectiveFrom: '2025-06-01',
      effectiveTo: '2026-05-31',
      isActive: true,
      billingType: 'fixed_price',
    },
    {
      id: 'rc-005',
      tenantId: 'tenant-001',
      name: 'Project Manager (USD)',
      roleTitle: 'Senior Project Manager',
      clientId: 'cl-001',
      clientName: 'Apex Financial Group',
      currency: 'USD',
      hourlyRate: 210,
      overtimeMultiplier: 1.0,
      effectiveFrom: '2025-01-01',
      effectiveTo: '2026-12-31',
      isActive: true,
      billingType: 'time_and_materials',
    },
  ];

  // ─── Projects ────────────────────────────────────────────────────────────────
  private static projects: TMProjectDTO[] = [
    {
      id: 'proj-001',
      tenantId: 'tenant-001',
      clientId: 'cl-001',
      clientName: 'Apex Financial Group',
      name: 'Core Banking Modernisation - Phase 2',
      code: 'AFG-CBM-P2',
      description: 'Legacy COBOL migration to Java Spring microservices with AWS cloud hosting and ISO-20022 SWIFT integration.',
      status: 'active',
      budget: 450000,
      budgetCurrency: 'USD',
      billedToDate: 187500,
      startDate: '2025-02-01',
      targetEndDate: '2025-11-30',
      projectManagerId: 'EMP-1003',
      projectManagerName: 'David Park',
      teamSize: 8,
      totalBillableHours: 1200,
      totalNonBillableHours: 95,
      utilizationPercent: 92.7,
      completionPercent: 42,
      rateCardId: 'rc-001',
    },
    {
      id: 'proj-002',
      tenantId: 'tenant-001',
      clientId: 'cl-002',
      clientName: 'NovaTech Solutions Pvt Ltd',
      name: 'ERP Integration & Automation Suite',
      code: 'NTSP-ERP-001',
      description: 'SAP S/4HANA integration with custom workflow automation, real-time inventory sync, and Power BI dashboards.',
      status: 'active',
      budget: 8500000,
      budgetCurrency: 'INR',
      billedToDate: 3200000,
      startDate: '2025-04-01',
      targetEndDate: '2026-01-31',
      projectManagerId: 'EMP-1005',
      projectManagerName: 'Ananya Krishnan',
      teamSize: 12,
      totalBillableHours: 2340,
      totalNonBillableHours: 180,
      utilizationPercent: 89.5,
      completionPercent: 38,
      rateCardId: 'rc-003',
    },
    {
      id: 'proj-003',
      tenantId: 'tenant-001',
      clientId: 'cl-003',
      clientName: 'GulfBridge Logistics LLC',
      name: 'Route Optimization Platform',
      code: 'GBL-ROP-001',
      description: 'AI-powered last-mile delivery route optimization with GPS fleet tracking and real-time traffic integration.',
      status: 'active',
      budget: 280000,
      budgetCurrency: 'AED',
      billedToDate: 110000,
      startDate: '2025-06-15',
      targetEndDate: '2025-12-31',
      projectManagerId: 'EMP-1006',
      projectManagerName: 'Fatima Al-Zaabi',
      teamSize: 5,
      totalBillableHours: 680,
      totalNonBillableHours: 45,
      utilizationPercent: 93.8,
      completionPercent: 39,
      rateCardId: 'rc-004',
    },
    {
      id: 'proj-004',
      tenantId: 'tenant-001',
      clientId: 'cl-001',
      clientName: 'Apex Financial Group',
      name: 'Risk Analytics Dashboard',
      code: 'AFG-RAD-001',
      description: 'Basel III/IV compliant real-time risk aggregation engine with scenario modelling and regulatory reporting.',
      status: 'on_hold',
      budget: 120000,
      budgetCurrency: 'USD',
      billedToDate: 32000,
      startDate: '2025-05-01',
      targetEndDate: '2025-09-30',
      projectManagerId: 'EMP-1003',
      projectManagerName: 'David Park',
      teamSize: 4,
      totalBillableHours: 320,
      totalNonBillableHours: 40,
      utilizationPercent: 88.9,
      completionPercent: 27,
      rateCardId: 'rc-001',
    },
    {
      id: 'proj-005',
      tenantId: 'tenant-001',
      clientId: 'cl-004',
      clientName: 'HealthCore EU GmbH',
      name: 'GDPR Patient Data Vault',
      code: 'HCEU-GDPR-001',
      description: 'GDPR-compliant patient data anonymisation engine with consent management and erasure workflow.',
      status: 'completed',
      budget: 200000,
      budgetCurrency: 'EUR',
      billedToDate: 200000,
      startDate: '2024-04-01',
      targetEndDate: '2025-03-31',
      actualEndDate: '2025-03-15',
      projectManagerId: 'EMP-1005',
      projectManagerName: 'Ananya Krishnan',
      teamSize: 6,
      totalBillableHours: 1580,
      totalNonBillableHours: 120,
      utilizationPercent: 92.9,
      completionPercent: 100,
      rateCardId: 'rc-001',
    },
  ];

  // ─── Tasks ──────────────────────────────────────────────────────────────────
  private static tasks: TMTaskDTO[] = [
    { id: 'task-001', projectId: 'proj-001', name: 'Requirements Analysis & SOW', description: 'Gather business requirements and finalize Statement of Work', status: 'completed', billable: true, estimatedHours: 40, loggedHours: 38.5, assignedEmployeeId: 'EMP-1003', assignedEmployeeName: 'David Park', dueDate: '2025-02-15', createdAt: '2025-02-01T09:00:00.000Z' },
    { id: 'task-002', projectId: 'proj-001', name: 'Architecture Design & Review', description: 'Microservices architecture design with AWS deployment topology', status: 'completed', billable: true, estimatedHours: 80, loggedHours: 82, assignedEmployeeId: 'EMP-1001', assignedEmployeeName: 'Sarah Jenkins', dueDate: '2025-03-15', createdAt: '2025-02-15T09:00:00.000Z' },
    { id: 'task-003', projectId: 'proj-001', name: 'COBOL to Java Migration - Module 1', description: 'Migrate core account management COBOL routines to Spring Boot', status: 'in_progress', billable: true, estimatedHours: 200, loggedHours: 124, assignedEmployeeId: 'EMP-1001', assignedEmployeeName: 'Sarah Jenkins', dueDate: '2025-09-30', createdAt: '2025-03-16T09:00:00.000Z' },
    { id: 'task-004', projectId: 'proj-001', name: 'QA & Integration Testing', description: 'End-to-end testing of migrated modules with regression suite', status: 'not_started', billable: true, estimatedHours: 120, loggedHours: 0, assignedEmployeeId: 'EMP-1001', assignedEmployeeName: 'Sarah Jenkins', dueDate: '2025-10-31', createdAt: '2025-03-16T09:00:00.000Z' },
    { id: 'task-005', projectId: 'proj-002', name: 'SAP S/4HANA Connector Development', description: 'Custom BAPI and RFC connector for real-time data sync', status: 'in_progress', billable: true, estimatedHours: 300, loggedHours: 215, assignedEmployeeId: 'EMP-1005', assignedEmployeeName: 'Ananya Krishnan', dueDate: '2025-09-01', createdAt: '2025-04-01T09:00:00.000Z' },
    { id: 'task-006', projectId: 'proj-002', name: 'Power BI Dashboard Development', description: 'Executive KPI dashboards with real-time SAP data feeds', status: 'not_started', billable: true, estimatedHours: 120, loggedHours: 0, assignedEmployeeId: 'EMP-1006', assignedEmployeeName: 'Fatima Al-Zaabi', dueDate: '2025-11-30', createdAt: '2025-04-01T09:00:00.000Z' },
    { id: 'task-007', projectId: 'proj-003', name: 'Route Optimization Algorithm', description: 'Implement Travelling Salesman + dynamic programming for last-mile routing', status: 'in_progress', billable: true, estimatedHours: 160, loggedHours: 98, assignedEmployeeId: 'EMP-1006', assignedEmployeeName: 'Fatima Al-Zaabi', dueDate: '2025-09-30', createdAt: '2025-06-15T09:00:00.000Z' },
  ];

  // ─── Timesheets ──────────────────────────────────────────────────────────────
  private static timesheets: TMTimesheetEntryDTO[] = [
    { id: 'ts-001', tenantId: 'tenant-001', employeeId: 'EMP-1001', employeeName: 'Sarah Jenkins', projectId: 'proj-001', projectName: 'Core Banking Modernisation - Phase 2', taskId: 'task-003', taskName: 'COBOL to Java Migration - Module 1', date: '2025-09-08', hoursLogged: 8, isBillable: true, rateCardId: 'rc-002', hourlyRate: 145, billedAmount: 1160, description: 'Completed AccountService unit tests and refactored transaction validator', status: 'approved', submittedAt: '2025-09-09T09:00:00.000Z', approvedBy: 'David Park', approvedAt: '2025-09-09T14:00:00.000Z' },
    { id: 'ts-002', tenantId: 'tenant-001', employeeId: 'EMP-1001', employeeName: 'Sarah Jenkins', projectId: 'proj-001', projectName: 'Core Banking Modernisation - Phase 2', taskId: 'task-003', taskName: 'COBOL to Java Migration - Module 1', date: '2025-09-09', hoursLogged: 7.5, isBillable: true, rateCardId: 'rc-002', hourlyRate: 145, billedAmount: 1087.5, description: 'ISO-20022 message schema mapping and SWIFT integration tests', status: 'approved', submittedAt: '2025-09-10T09:00:00.000Z', approvedBy: 'David Park', approvedAt: '2025-09-10T11:00:00.000Z' },
    { id: 'ts-003', tenantId: 'tenant-001', employeeId: 'EMP-1001', employeeName: 'Sarah Jenkins', projectId: 'proj-001', projectName: 'Core Banking Modernisation - Phase 2', taskId: 'task-003', taskName: 'COBOL to Java Migration - Module 1', date: '2025-09-10', hoursLogged: 8, isBillable: true, rateCardId: 'rc-002', hourlyRate: 145, billedAmount: 1160, description: 'Integration with upstream core banking API gateway', status: 'pending', submittedAt: '2025-09-11T08:30:00.000Z' },
    { id: 'ts-004', tenantId: 'tenant-001', employeeId: 'EMP-1001', employeeName: 'Sarah Jenkins', projectId: 'proj-001', projectName: 'Core Banking Modernisation - Phase 2', taskId: 'task-003', taskName: 'COBOL to Java Migration - Module 1', date: '2025-09-11', hoursLogged: 6, isBillable: true, rateCardId: 'rc-002', hourlyRate: 145, billedAmount: 870, description: 'Client sprint review meeting + bug fixes from UAT feedback', status: 'pending', submittedAt: '2025-09-12T09:00:00.000Z' },
    { id: 'ts-005', tenantId: 'tenant-001', employeeId: 'EMP-1003', employeeName: 'David Park', projectId: 'proj-001', projectName: 'Core Banking Modernisation - Phase 2', taskId: 'task-001', taskName: 'Requirements Analysis & SOW', date: '2025-09-08', hoursLogged: 8, isBillable: true, rateCardId: 'rc-005', hourlyRate: 210, billedAmount: 1680, description: 'Stakeholder interview sessions and SOW finalization with legal', status: 'approved', submittedAt: '2025-09-09T09:00:00.000Z', approvedBy: 'Ananya Krishnan', approvedAt: '2025-09-09T16:00:00.000Z' },
    { id: 'ts-006', tenantId: 'tenant-001', employeeId: 'EMP-1005', employeeName: 'Ananya Krishnan', projectId: 'proj-002', projectName: 'ERP Integration & Automation Suite', taskId: 'task-005', taskName: 'SAP S/4HANA Connector Development', date: '2025-09-08', hoursLogged: 9, isBillable: true, rateCardId: 'rc-003', hourlyRate: 4500, billedAmount: 40500, description: 'BAPI connector for MM/WM modules with error handling and retry logic', status: 'approved', submittedAt: '2025-09-09T10:00:00.000Z', approvedBy: 'David Park', approvedAt: '2025-09-09T18:00:00.000Z' },
    { id: 'ts-007', tenantId: 'tenant-001', employeeId: 'EMP-1006', employeeName: 'Fatima Al-Zaabi', projectId: 'proj-003', projectName: 'Route Optimization Platform', taskId: 'task-007', taskName: 'Route Optimization Algorithm', date: '2025-09-09', hoursLogged: 8, isBillable: true, rateCardId: 'rc-004', hourlyRate: 450, billedAmount: 3600, description: 'Implemented Christofides approximation for TSP with real-time traffic weights', status: 'pending', submittedAt: '2025-09-10T09:00:00.000Z' },
    { id: 'ts-008', tenantId: 'tenant-001', employeeId: 'EMP-1001', employeeName: 'Sarah Jenkins', projectId: 'proj-001', projectName: 'Core Banking Modernisation - Phase 2', taskId: 'task-002', taskName: 'Architecture Design & Review', date: '2025-09-12', hoursLogged: 4, isBillable: false, rateCardId: 'rc-002', hourlyRate: 145, billedAmount: 0, description: 'Internal team knowledge transfer session (non-billable)', status: 'draft' },
  ];

  // ─── Invoices ────────────────────────────────────────────────────────────────
  private static invoices: TMInvoiceDTO[] = [
    {
      id: 'inv-001',
      tenantId: 'tenant-001',
      invoiceNumber: 'INV-AFG-2025-001',
      clientId: 'cl-001',
      clientName: 'Apex Financial Group',
      projectIds: ['proj-001'],
      periodFrom: '2025-02-01',
      periodTo: '2025-04-30',
      currency: 'USD',
      subtotal: 112500,
      taxRate: 0,
      taxAmount: 0,
      totalAmount: 112500,
      status: 'paid',
      dueDate: '2025-05-30',
      paidDate: '2025-05-15',
      lineItems: [
        { description: 'Senior Engineer - Architecture & Analysis (450h @ $185)', quantity: 450, unitPrice: 185, amount: 83250, billable: true },
        { description: 'QA Engineer - Test Setup & Strategy (200h @ $145)', quantity: 200, unitPrice: 145, amount: 29000, billable: true },
        { description: 'Project Management (25h @ $210)', quantity: 25, unitPrice: 210, amount: 5250, billable: true },
      ],
      createdAt: '2025-05-01T09:00:00.000Z',
      sentAt: '2025-05-02T09:00:00.000Z',
    },
    {
      id: 'inv-002',
      tenantId: 'tenant-001',
      invoiceNumber: 'INV-AFG-2025-002',
      clientId: 'cl-001',
      clientName: 'Apex Financial Group',
      projectIds: ['proj-001', 'proj-004'],
      periodFrom: '2025-05-01',
      periodTo: '2025-07-31',
      currency: 'USD',
      subtotal: 75000,
      taxRate: 0,
      taxAmount: 0,
      totalAmount: 75000,
      status: 'paid',
      dueDate: '2025-08-31',
      paidDate: '2025-08-20',
      lineItems: [
        { description: 'Senior Engineer - COBOL Migration Module 1 (280h @ $185)', quantity: 280, unitPrice: 185, amount: 51800, billable: true },
        { description: 'QA Engineer - Integration Testing (120h @ $145)', quantity: 120, unitPrice: 145, amount: 17400, billable: true },
        { description: 'Risk Analytics - Initial Assessment (27h @ $210)', quantity: 27, unitPrice: 210, amount: 5670, billable: true },
      ],
      createdAt: '2025-08-01T09:00:00.000Z',
      sentAt: '2025-08-02T09:00:00.000Z',
    },
    {
      id: 'inv-003',
      tenantId: 'tenant-001',
      invoiceNumber: 'INV-NTSP-2025-001',
      clientId: 'cl-002',
      clientName: 'NovaTech Solutions Pvt Ltd',
      projectIds: ['proj-002'],
      periodFrom: '2025-04-01',
      periodTo: '2025-06-30',
      currency: 'INR',
      subtotal: 3200000,
      taxRate: 18,
      taxAmount: 576000,
      totalAmount: 3776000,
      status: 'paid',
      dueDate: '2025-07-31',
      paidDate: '2025-07-25',
      lineItems: [
        { description: 'Full-Stack Developer - SAP Connector Phase 1 (480h @ ₹4500)', quantity: 480, unitPrice: 4500, amount: 2160000, billable: true },
        { description: 'Tech Lead Oversight & Architecture Review (80h @ ₹6500)', quantity: 80, unitPrice: 6500, amount: 520000, billable: true },
        { description: 'QA & Testing Infrastructure Setup (120h @ ₹4300)', quantity: 120, unitPrice: 4300, amount: 516000, billable: true },
      ],
      createdAt: '2025-07-01T09:00:00.000Z',
      sentAt: '2025-07-03T09:00:00.000Z',
    },
    {
      id: 'inv-004',
      tenantId: 'tenant-001',
      invoiceNumber: 'INV-AFG-2025-003',
      clientId: 'cl-001',
      clientName: 'Apex Financial Group',
      projectIds: ['proj-001'],
      periodFrom: '2025-08-01',
      periodTo: '2025-09-12',
      currency: 'USD',
      subtotal: 45500,
      taxRate: 0,
      taxAmount: 0,
      totalAmount: 45500,
      status: 'sent',
      dueDate: '2025-10-12',
      lineItems: [
        { description: 'Senior Engineer - COBOL Migration Module 1 Continuation (160h @ $185)', quantity: 160, unitPrice: 185, amount: 29600, billable: true },
        { description: 'QA Engineer - Current Sprint Testing (108h @ $145)', quantity: 108, unitPrice: 145, amount: 15660, billable: true },
        { description: 'Project Management (10h @ $210)', quantity: 10, unitPrice: 210, amount: 2100, billable: true },
      ],
      createdAt: '2025-09-13T09:00:00.000Z',
      sentAt: '2025-09-13T11:00:00.000Z',
    },
    {
      id: 'inv-005',
      tenantId: 'tenant-001',
      invoiceNumber: 'INV-GBL-2025-001',
      clientId: 'cl-003',
      clientName: 'GulfBridge Logistics LLC',
      projectIds: ['proj-003'],
      periodFrom: '2025-06-15',
      periodTo: '2025-08-31',
      currency: 'AED',
      subtotal: 110000,
      taxRate: 5,
      taxAmount: 5500,
      totalAmount: 115500,
      status: 'sent',
      dueDate: '2025-09-30',
      lineItems: [
        { description: 'Route Optimization Algorithm Development (Phase 1)', quantity: 1, unitPrice: 110000, amount: 110000, billable: true },
      ],
      createdAt: '2025-09-01T09:00:00.000Z',
      sentAt: '2025-09-02T09:00:00.000Z',
    },
  ];

  // ─── Public API ──────────────────────────────────────────────────────────────

  static async getDashboardSummary(tenantId: string): Promise<TMDashboardSummaryDTO> {
    const activeProjects = this.projects.filter(p => p.tenantId === tenantId && p.status === 'active');
    const allTimesheets = this.timesheets.filter(t => t.tenantId === tenantId);
    const pendingTimesheets = allTimesheets.filter(t => t.status === 'pending');
    const allInvoices = this.invoices.filter(i => i.tenantId === tenantId);
    const sentInvoices = allInvoices.filter(i => i.status === 'sent');
    const totalBillable = allTimesheets.filter(t => t.isBillable).reduce((s, t) => s + t.hoursLogged, 0);
    const totalHours = allTimesheets.reduce((s, t) => s + t.hoursLogged, 0);

    return {
      totalActiveClients: this.clients.filter(c => c.tenantId === tenantId && c.status === 'active').length,
      totalActiveProjects: activeProjects.length,
      totalProjectBudgetUSD: activeProjects.reduce((s, p) => s + (p.budgetCurrency === 'USD' ? p.budget : p.budget / 83), 0),
      totalBilledUSD: activeProjects.reduce((s, p) => s + (p.budgetCurrency === 'USD' ? p.billedToDate : p.billedToDate / 83), 0),
      pendingTimesheetApprovals: pendingTimesheets.length,
      currentWeekBillableHours: 62.5,
      currentWeekNonBillableHours: 12,
      overallUtilizationPercent: totalHours > 0 ? Math.round((totalBillable / totalHours) * 100 * 10) / 10 : 0,
      outstandingInvoiceAmount: sentInvoices.reduce((s, i) => s + i.totalAmount, 0),
      outstandingInvoiceCount: sentInvoices.length,
      overdueInvoiceCount: 0,
      totalInvoicedThisMonth: 45500,
    };
  }

  static async getClients(tenantId: string): Promise<TMClientDTO[]> {
    return this.clients.filter(c => c.tenantId === tenantId);
  }

  static async getClientById(tenantId: string, clientId: string): Promise<TMClientDTO | undefined> {
    return this.clients.find(c => c.tenantId === tenantId && c.id === clientId);
  }

  static async getProjects(tenantId: string, clientId?: string): Promise<TMProjectDTO[]> {
    return this.projects.filter(p => p.tenantId === tenantId && (!clientId || p.clientId === clientId));
  }

  static async getProjectById(tenantId: string, projectId: string): Promise<TMProjectDTO | undefined> {
    return this.projects.find(p => p.tenantId === tenantId && p.id === projectId);
  }

  static async getTasksByProject(projectId: string): Promise<TMTaskDTO[]> {
    return this.tasks.filter(t => t.projectId === projectId);
  }

  static async getRateCards(tenantId: string, clientId?: string): Promise<TMRateCardDTO[]> {
    return this.rateCards.filter(r => r.tenantId === tenantId && (!clientId || r.clientId === clientId));
  }

  static async getTimesheets(tenantId: string, employeeId?: string, projectId?: string, status?: string): Promise<TMTimesheetEntryDTO[]> {
    return this.timesheets.filter(t =>
      t.tenantId === tenantId &&
      (!employeeId || t.employeeId === employeeId) &&
      (!projectId || t.projectId === projectId) &&
      (!status || t.status === status)
    );
  }

  static async submitTimesheet(tenantId: string, payload: Partial<TMTimesheetEntryDTO>): Promise<TMTimesheetEntryDTO> {
    const rateCard = payload.rateCardId ? this.rateCards.find(r => r.id === payload.rateCardId) : undefined;
    const hourlyRate = rateCard?.hourlyRate || 0;
    const hours = payload.hoursLogged || 0;

    const entry: TMTimesheetEntryDTO = {
      id: `ts-${Date.now()}`,
      tenantId,
      employeeId: payload.employeeId!,
      employeeName: payload.employeeName!,
      projectId: payload.projectId!,
      projectName: payload.projectName || '',
      taskId: payload.taskId,
      taskName: payload.taskName,
      date: payload.date!,
      hoursLogged: hours,
      isBillable: payload.isBillable ?? true,
      rateCardId: payload.rateCardId,
      hourlyRate,
      billedAmount: payload.isBillable ? hours * hourlyRate : 0,
      description: payload.description || '',
      status: 'draft',
      submittedAt: new Date().toISOString(),
    };

    this.timesheets.push(entry);
    return entry;
  }

  static async approveTimesheet(timesheetId: string, approverName: string): Promise<TMTimesheetEntryDTO> {
    const entry = this.timesheets.find(t => t.id === timesheetId);
    if (!entry) throw new Error(`Timesheet ${timesheetId} not found`);
    entry.status = 'approved';
    entry.approvedBy = approverName;
    entry.approvedAt = new Date().toISOString();
    return entry;
  }

  static async rejectTimesheet(timesheetId: string, approverName: string, notes: string): Promise<TMTimesheetEntryDTO> {
    const entry = this.timesheets.find(t => t.id === timesheetId);
    if (!entry) throw new Error(`Timesheet ${timesheetId} not found`);
    entry.status = 'rejected';
    entry.approvedBy = approverName;
    entry.approvedAt = new Date().toISOString();
    entry.description = `${entry.description} | Rejected: ${notes}`;
    return entry;
  }

  static async createRateCard(tenantId: string, payload: Partial<TMRateCardDTO>): Promise<TMRateCardDTO> {
    const card: TMRateCardDTO = {
      id: `rc-${Date.now()}`,
      tenantId,
      name: payload.name || 'New Rate Card',
      roleTitle: payload.roleTitle || 'Consultant',
      clientId: payload.clientId,
      clientName: payload.clientName,
      currency: payload.currency || 'USD',
      hourlyRate: Number(payload.hourlyRate) || 100,
      overtimeMultiplier: Number(payload.overtimeMultiplier) || 1.5,
      effectiveFrom: payload.effectiveFrom || new Date().toISOString().split('T')[0],
      effectiveTo: payload.effectiveTo || '2026-12-31',
      isActive: payload.isActive ?? true,
      billingType: payload.billingType || 'time_and_materials',
    };
    this.rateCards.push(card);
    return card;
  }

  static async updateRateCard(rateCardId: string, payload: Partial<TMRateCardDTO>): Promise<TMRateCardDTO> {
    const card = this.rateCards.find(r => r.id === rateCardId);
    if (!card) throw new Error(`Rate card ${rateCardId} not found`);
    if (payload.name !== undefined) card.name = payload.name;
    if (payload.roleTitle !== undefined) card.roleTitle = payload.roleTitle;
    if (payload.clientId !== undefined) card.clientId = payload.clientId;
    if (payload.clientName !== undefined) card.clientName = payload.clientName;
    if (payload.currency !== undefined) card.currency = payload.currency;
    if (payload.hourlyRate !== undefined) card.hourlyRate = Number(payload.hourlyRate);
    if (payload.overtimeMultiplier !== undefined) card.overtimeMultiplier = Number(payload.overtimeMultiplier);
    if (payload.isActive !== undefined) card.isActive = payload.isActive;
    if (payload.billingType !== undefined) card.billingType = payload.billingType;
    return card;
  }

  static async getInvoices(tenantId: string, clientId?: string, status?: string): Promise<TMInvoiceDTO[]> {
    return this.invoices.filter(i =>
      i.tenantId === tenantId &&
      (!clientId || i.clientId === clientId) &&
      (!status || i.status === status)
    );
  }

  static async generateInvoice(tenantId: string, clientId: string, periodFrom: string, periodTo: string): Promise<TMInvoiceDTO> {
    const client = this.clients.find(c => c.id === clientId);
    if (!client) throw new Error(`Client ${clientId} not found`);

    const approvedTimesheets = this.timesheets.filter(t => {
      const proj = this.projects.find(p => p.id === t.projectId);
      const effectiveClientId = t.clientId || proj?.clientId;
      return (
        t.tenantId === tenantId &&
        effectiveClientId === clientId &&
        t.isBillable &&
        t.status === 'approved' &&
        t.date >= periodFrom &&
        t.date <= periodTo
      );
    });

    const subtotal = approvedTimesheets.reduce((s, t) => s + t.billedAmount, 0);
    const taxRate = client.country === 'India' ? 18 : client.country === 'UAE' ? 5 : 0;
    const taxAmount = subtotal * (taxRate / 100);

    const invoice: TMInvoiceDTO = {
      id: `inv-${Date.now()}`,
      tenantId,
      invoiceNumber: `INV-${client.code}-${Date.now()}`,
      clientId,
      clientName: client.name,
      projectIds: [...new Set(approvedTimesheets.map(t => t.projectId))],
      periodFrom,
      periodTo,
      currency: client.billingCurrency,
      subtotal,
      taxRate,
      taxAmount,
      totalAmount: subtotal + taxAmount,
      status: 'draft',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lineItems: approvedTimesheets.length > 0 ? approvedTimesheets.map(t => ({
        description: `${t.taskName || t.projectName} - ${t.date} (${t.hoursLogged}h @ ${t.hourlyRate})`,
        quantity: t.hoursLogged,
        unitPrice: t.hourlyRate,
        amount: t.billedAmount,
        billable: true,
      })) : [
        {
          description: `Blank Invoice Draft - No approved billable timesheets found for ${client.name} between ${periodFrom} and ${periodTo}`,
          quantity: 0,
          unitPrice: 0,
          amount: 0,
          billable: false,
        }
      ],
      createdAt: new Date().toISOString(),
    };

    this.invoices.push(invoice);
    return invoice;
  }
}
