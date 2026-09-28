import {
  OnboardingCandidateDTO,
  OnboardingTaskDTO,
  EmployeeDocumentDTO,
  CompanyAssetDTO,
  PerformanceReviewDTO,
  HRHelpdeskTicketDTO,
  HRDashboardSummaryDTO,
  DocumentCategory,
  AssetCategory,
  TicketCategory
} from '@infi-timepro/shared-types';

export class HRService {
  // Mock In-Memory Data Store for HR Entities
  private static candidates: OnboardingCandidateDTO[] = [
    {
      id: 'onb-cand-001',
      candidateName: 'Rohan Varma',
      email: 'rohan.varma@example.com',
      phone: '+91 98480 12345',
      department: 'Engineering & Quality',
      designation: 'Senior Backend Engineer',
      joiningDate: '2026-09-22',
      reportingManager: 'Vikram Singh (MGR-104)',
      location: 'Bengaluru R&D Hub',
      stage: 'it_provisioning',
      progressPercent: 60,
      contractSigned: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop',
      buddyName: 'Sarah Jenkins',
      tasks: [
        { id: 'tsk-01', title: 'Sign Employment Agreement & NDA', category: 'documentation', assignedToRole: 'Candidate', completed: true, completedAt: '2026-09-10T10:00:00Z', required: true },
        { id: 'tsk-02', title: 'Submit Government ID & Tax Identifiers', category: 'documentation', assignedToRole: 'Candidate', completed: true, completedAt: '2026-09-11T14:30:00Z', required: true },
        { id: 'tsk-03', title: 'Background Verification Clearance', category: 'documentation', assignedToRole: 'HR Specialist', completed: true, completedAt: '2026-09-12T09:15:00Z', required: true },
        { id: 'tsk-04', title: 'Provision Corporate Email & SSO Access', category: 'it_setup', assignedToRole: 'IT Admin', completed: false, required: true },
        { id: 'tsk-05', title: 'Ship MacBook Pro M3 & Security Key', category: 'it_setup', assignedToRole: 'IT Admin', completed: false, required: true },
        { id: 'tsk-06', title: 'HR Orientation & Day-1 Induction Session', category: 'hr_induction', assignedToRole: 'HR Manager', completed: false, required: true }
      ]
    },
    {
      id: 'onb-cand-002',
      candidateName: 'Fatima Al-Mansoor',
      email: 'fatima.almansoor@example.com',
      phone: '+971 50 234 5678',
      department: 'Customer Success & Operations',
      designation: 'Client Success Manager',
      joiningDate: '2026-09-29',
      reportingManager: 'Naresh Andukoori (ADM-001)',
      location: 'Middle East Hub - Dubai',
      stage: 'docs_pending',
      progressPercent: 33,
      contractSigned: true,
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop',
      buddyName: 'Priya Sharma',
      tasks: [
        { id: 'tsk-11', title: 'Sign Employment Agreement & NDA', category: 'documentation', assignedToRole: 'Candidate', completed: true, completedAt: '2026-09-13T11:00:00Z', required: true },
        { id: 'tsk-12', title: 'Submit Passport & Emirates ID Copy', category: 'documentation', assignedToRole: 'Candidate', completed: false, required: true },
        { id: 'tsk-13', title: 'Medical Fitness & UAE Visa Processing', category: 'documentation', assignedToRole: 'HR Specialist', completed: false, required: true },
        { id: 'tsk-14', title: 'Assign Dubai Office Access Badge & Desk', category: 'it_setup', assignedToRole: 'Facility Admin', completed: false, required: true }
      ]
    },
    {
      id: 'onb-cand-003',
      candidateName: 'Aditya Mehta',
      email: 'aditya.mehta@example.com',
      phone: '+91 99887 76655',
      department: 'Product & Design',
      designation: 'Product Designer (UI/UX)',
      joiningDate: '2026-09-15',
      reportingManager: 'Priya Sharma (TP0456)',
      location: 'Hyderabad Tech Park',
      stage: 'induction',
      progressPercent: 85,
      contractSigned: true,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop',
      buddyName: 'Srinivas Reddy',
      tasks: [
        { id: 'tsk-21', title: 'Sign Employment Agreement & NDA', category: 'documentation', assignedToRole: 'Candidate', completed: true, completedAt: '2026-09-02T10:00:00Z', required: true },
        { id: 'tsk-22', title: 'Submit Government ID & Tax Identifiers', category: 'documentation', assignedToRole: 'Candidate', completed: true, completedAt: '2026-09-03T11:00:00Z', required: true },
        { id: 'tsk-23', title: 'Background Verification Clearance', category: 'documentation', assignedToRole: 'HR Specialist', completed: true, completedAt: '2026-09-05T09:00:00Z', required: true },
        { id: 'tsk-24', title: 'Provision Figma Enterprise & Google Workspace', category: 'it_setup', assignedToRole: 'IT Admin', completed: true, completedAt: '2026-09-08T14:00:00Z', required: true },
        { id: 'tsk-25', title: 'Assign Dell UltraSharp 32" 4K Monitor & Laptop', category: 'it_setup', assignedToRole: 'IT Admin', completed: true, completedAt: '2026-09-09T16:00:00Z', required: true },
        { id: 'tsk-26', title: 'Conduct Welcome Induction & Team Meet', category: 'hr_induction', assignedToRole: 'HR Manager', completed: false, required: true }
      ]
    }
  ];

  private static documents: EmployeeDocumentDTO[] = [
    {
      id: 'doc-001',
      employeeId: 'emp_naresh_001',
      employeeName: 'Naresh Andukoori',
      employeeCode: 'TP0001',
      department: 'Executive Office',
      title: 'Executive Master Employment Agreement',
      category: 'contract',
      fileName: 'Naresh_Employment_Contract_Executed.pdf',
      fileSizeBytes: 2450000,
      fileType: 'application/pdf',
      documentNumber: 'CNT-2022-EX01',
      issueDate: '2022-01-10',
      expiryStatus: 'not_applicable',
      verified: true,
      verifiedBy: 'Board of Directors',
      verifiedAt: '2022-01-11T09:00:00Z',
      downloadUrl: '/api/v1/hr/documents/download/doc-001',
      createdAt: '2022-01-10T08:30:00Z'
    },
    {
      id: 'doc-002',
      employeeId: 'EMP-1001',
      employeeName: 'Sarah Jenkins',
      employeeCode: 'EMP-1001',
      department: 'Engineering & Quality',
      title: 'National Passport Document',
      category: 'identity',
      fileName: 'Sarah_Jenkins_Passport_Scan.pdf',
      fileSizeBytes: 1850000,
      fileType: 'application/pdf',
      documentNumber: 'P-98472910A',
      issueDate: '2019-10-15',
      expiryDate: '2026-10-15',
      expiryStatus: 'expiring_soon',
      daysUntilExpiry: 31,
      verified: true,
      verifiedBy: 'HR Compliance Officer',
      verifiedAt: '2024-02-15T11:00:00Z',
      downloadUrl: '/api/v1/hr/documents/download/doc-002',
      createdAt: '2024-02-15T10:45:00Z'
    },
    {
      id: 'doc-003',
      employeeId: 'EMP-1003',
      employeeName: 'Marcus Vance',
      employeeCode: 'EMP-1003',
      department: 'Operations & Assembly',
      title: 'Heavy Machinery & Safety Rig Certification',
      category: 'certification',
      fileName: 'Marcus_Vance_DGMS_Rig_Cert.pdf',
      fileSizeBytes: 950000,
      fileType: 'application/pdf',
      documentNumber: 'DGMS-CERT-9982',
      issueDate: '2023-08-01',
      expiryDate: '2026-08-01',
      expiryStatus: 'expired',
      daysUntilExpiry: -44,
      verified: true,
      verifiedBy: 'Safety Auditor',
      verifiedAt: '2023-08-02T10:00:00Z',
      downloadUrl: '/api/v1/hr/documents/download/doc-003',
      createdAt: '2023-08-01T15:00:00Z'
    },
    {
      id: 'doc-004',
      employeeId: 'emp_priya_003',
      employeeName: 'Priya Sharma',
      employeeCode: 'TP0456',
      department: 'Product & Design',
      title: 'Intellectual Property & Non-Disclosure Agreement',
      category: 'nda',
      fileName: 'Priya_Sharma_Proprietary_NDA.pdf',
      fileSizeBytes: 1200000,
      fileType: 'application/pdf',
      documentNumber: 'NDA-DES-2023-88',
      issueDate: '2023-04-12',
      expiryStatus: 'not_applicable',
      verified: true,
      verifiedBy: 'Legal Counsel',
      verifiedAt: '2023-04-13T14:20:00Z',
      downloadUrl: '/api/v1/hr/documents/download/doc-004',
      createdAt: '2023-04-12T09:00:00Z'
    },
    {
      id: 'doc-005',
      employeeId: 'EMP-1005',
      employeeName: 'Elena Rostova',
      employeeCode: 'EMP-1005',
      department: 'Operations & Assembly',
      title: 'Employment Residence Visa & Work Permit',
      category: 'visa',
      fileName: 'Elena_Rostova_Employment_Visa.pdf',
      fileSizeBytes: 3100000,
      fileType: 'application/pdf',
      documentNumber: 'UAE-WP-2024-99128',
      issueDate: '2024-11-01',
      expiryDate: '2026-11-01',
      expiryStatus: 'valid',
      daysUntilExpiry: 48,
      verified: true,
      verifiedBy: 'Global Mobility Specialist',
      verifiedAt: '2024-11-02T10:00:00Z',
      downloadUrl: '/api/v1/hr/documents/download/doc-005',
      createdAt: '2024-11-01T12:00:00Z'
    }
  ];

  private static assets: CompanyAssetDTO[] = [
    {
      id: 'ast-001',
      assetTag: 'AST-LT-1042',
      name: 'MacBook Pro 16" Apple Silicon M3 Max (36GB / 1TB)',
      category: 'laptop',
      model: 'Apple A2991',
      serialNumber: 'C02G9988MD6P',
      specifications: '16-core CPU, 40-core GPU, Space Black, Liquid Retina XDR',
      status: 'allocated',
      allocatedToEmployeeId: 'EMP-1001',
      allocatedToEmployeeName: 'Sarah Jenkins',
      allocatedToEmployeeCode: 'EMP-1001',
      allocatedDate: '2024-02-16',
      condition: 'brand_new',
      purchaseDate: '2024-02-10',
      warrantyExpiry: '2027-02-10',
      estimatedValueUsd: 3499.00,
      location: 'Bengaluru R&D Hub'
    },
    {
      id: 'ast-002',
      assetTag: 'AST-MON-0881',
      name: 'Dell UltraSharp 32" 4K USB-C Hub Monitor (U3223QE)',
      category: 'monitor',
      model: 'Dell U3223QE',
      serialNumber: 'CN-098K41-74441',
      specifications: 'IPS Black Technology, 90W Power Delivery, RJ45 Ethernet',
      status: 'allocated',
      allocatedToEmployeeId: 'EMP-1001',
      allocatedToEmployeeName: 'Sarah Jenkins',
      allocatedToEmployeeCode: 'EMP-1001',
      allocatedDate: '2024-02-16',
      condition: 'good',
      purchaseDate: '2024-02-10',
      warrantyExpiry: '2027-02-10',
      estimatedValueUsd: 899.00,
      location: 'Bengaluru R&D Hub'
    },
    {
      id: 'ast-003',
      assetTag: 'AST-KEY-0029',
      name: 'HID iCLASS SE Biometric Smart Access Card',
      category: 'access_card',
      model: 'HID-ICLASS-990',
      serialNumber: 'HID-RFID-881920',
      specifications: 'High-Security 13.56MHz Cryptographic RFID Tag',
      status: 'allocated',
      allocatedToEmployeeId: 'emp_naresh_001',
      allocatedToEmployeeName: 'Naresh Andukoori',
      allocatedToEmployeeCode: 'TP0001',
      allocatedDate: '2022-01-15',
      condition: 'good',
      purchaseDate: '2022-01-01',
      warrantyExpiry: '2030-01-01',
      estimatedValueUsd: 45.00,
      location: 'Hyderabad Tech Park'
    },
    {
      id: 'ast-004',
      assetTag: 'AST-LT-2099',
      name: 'Lenovo ThinkPad X1 Carbon Gen 11 (Intel i7, 32GB)',
      category: 'laptop',
      model: 'ThinkPad 21HM',
      serialNumber: 'PF-44X8910',
      specifications: '14" WUXGA Anti-Glare, Intel vPro, Cellular 5G e-SIM',
      status: 'available',
      condition: 'brand_new',
      purchaseDate: '2026-08-20',
      warrantyExpiry: '2029-08-20',
      estimatedValueUsd: 2199.00,
      location: 'Hyderabad Tech Park'
    },
    {
      id: 'ast-005',
      assetTag: 'AST-SIM-0144',
      name: 'Corporate Unlimited 5G Data & Roaming SIM',
      category: 'mobile_sim',
      model: 'Airtel Enterprise Corporate Postpaid',
      serialNumber: '89910029847192837',
      specifications: 'Unlimited International Roaming + High Speed Data Pool',
      status: 'allocated',
      allocatedToEmployeeId: 'MGR-104',
      allocatedToEmployeeName: 'Vikram Singh',
      allocatedToEmployeeCode: 'MGR-104',
      allocatedDate: '2023-05-10',
      condition: 'good',
      purchaseDate: '2023-05-01',
      warrantyExpiry: '2028-05-01',
      estimatedValueUsd: 120.00,
      location: 'Hyderabad Tech Park'
    },
    {
      id: 'ast-006',
      assetTag: 'AST-LT-3045',
      name: 'Apple MacBook Air 15" M2 (16GB / 512GB)',
      category: 'laptop',
      model: 'Apple A2941',
      serialNumber: 'C02H1199K8PL',
      specifications: 'Liquid Retina, Midnight Blue, MagSafe 3',
      status: 'maintenance',
      condition: 'fair',
      purchaseDate: '2023-09-15',
      warrantyExpiry: '2026-09-15',
      estimatedValueUsd: 1499.00,
      location: 'Bengaluru R&D Hub'
    }
  ];

  private static performanceReviews: PerformanceReviewDTO[] = [
    {
      id: 'rev-2026-01',
      employeeId: 'EMP-1001',
      employeeName: 'Sarah Jenkins',
      employeeCode: 'EMP-1001',
      department: 'Engineering & Quality',
      designation: 'Senior QA Automation Engineer',
      reviewerManagerId: 'MGR-104',
      reviewerManagerName: 'Vikram Singh',
      cycleName: 'FY2026 Mid-Year Performance & Appraisal Cycle',
      cycleStatus: 'in_review',
      selfRating: 4.5,
      managerRating: 4.8,
      finalRating: 4.7,
      managerFeedback: 'Sarah has demonstrated exceptional technical leadership in architecting end-to-end automation test suites and leading zero-defect sprint releases.',
      strengths: ['Test Automation Architecture', 'Cross-functional Collaboration', 'Mentorship'],
      growthAreas: ['Cloud Infrastructure & Kubernetes Scaling'],
      goals: [
        { id: 'g-01', title: 'Automate 100% Core Regression Scenarios', description: 'Achieve full test automation for attendance recalculation and geofencing', category: 'delivery', weightagePercent: 40, targetMetric: '100% test coverage', progressPercent: 95, status: 'on_track' },
        { id: 'g-02', title: 'Reduce CI/CD Build Pipeline Duration by 30%', description: 'Optimize Docker multi-stage builds and parallelize vitest executions', category: 'quality', weightagePercent: 30, targetMetric: '< 5 min build time', progressPercent: 80, status: 'on_track' },
        { id: 'g-03', title: 'Mentor 2 Junior QA Engineers', description: 'Weekly 1-on-1 pairing sessions and code review guidelines', category: 'leadership', weightagePercent: 30, targetMetric: '2 engineers certified', progressPercent: 100, status: 'completed' }
      ]
    },
    {
      id: 'rev-2026-02',
      employeeId: 'emp_srinivas_002',
      employeeName: 'Srinivas Reddy',
      employeeCode: 'TP1012',
      department: 'Product & Design',
      designation: 'Product Manager',
      reviewerManagerId: 'emp_naresh_001',
      reviewerManagerName: 'Naresh Andukoori',
      cycleName: 'FY2026 Mid-Year Performance & Appraisal Cycle',
      cycleStatus: 'completed',
      selfRating: 4.2,
      managerRating: 4.4,
      finalRating: 4.3,
      managerFeedback: 'Srinivas successfully spearheaded the delivery of the Universal Leave Studio and Biometric Device Mesh integrations ahead of schedule.',
      strengths: ['Product Strategy', 'Customer Empathy', 'Execution Velocity'],
      growthAreas: ['Enterprise RFP Response Turnaround'],
      completedAt: '2026-09-01T15:00:00Z',
      goals: [
        { id: 'g-11', title: 'Launch Biometric Device Mesh Integration', description: 'Support ZKTeco, Suprema, and Dahua enterprise terminals', category: 'delivery', weightagePercent: 50, targetMetric: '100% terminal sync', progressPercent: 100, status: 'completed' },
        { id: 'g-12', title: 'Increase Monthly Active User Adoption', description: 'Boost daily web kiosk check-ins across factory verticals', category: 'delivery', weightagePercent: 50, targetMetric: '> 90% DAU', progressPercent: 100, status: 'completed' }
      ]
    }
  ];

  private static tickets: HRHelpdeskTicketDTO[] = [
    {
      id: 'tkt-001',
      ticketNumber: 'TKT-HR-1042',
      employeeId: 'EMP-1001',
      employeeName: 'Sarah Jenkins',
      employeeCode: 'EMP-1001',
      department: 'Engineering & Quality',
      category: 'letter_request',
      subject: 'Request for Official Employment Bonafide Letter for Bank Loan',
      description: 'Kindly provide an authorized bonafide employment confirmation letter addressed to HDFC Bank for housing loan application.',
      priority: 'medium',
      status: 'resolved',
      assignedToHRName: 'Ananya Roy (HR Operations)',
      requestedLetterType: 'bonafide',
      resolutionNotes: 'Bonafide certificate generated with official digital seal and sent to employee email.',
      createdAt: '2026-09-12T09:30:00Z',
      updatedAt: '2026-09-12T14:15:00Z'
    },
    {
      id: 'tkt-002',
      ticketNumber: 'TKT-HR-1045',
      employeeId: 'EMP-1003',
      employeeName: 'Marcus Vance',
      employeeCode: 'EMP-1003',
      department: 'Operations & Assembly',
      category: 'policy_clarification',
      subject: 'Clarification on Night Shift Allowance & Rest Period Multiplier',
      description: 'Seeking clarity on whether working consecutive weekend night shifts qualifies for the 2.0x statutory DGMS rest allowance.',
      priority: 'high',
      status: 'in_progress',
      assignedToHRName: 'Rohit Deshmukh (Compliance Lead)',
      createdAt: '2026-09-14T08:00:00Z',
      updatedAt: '2026-09-14T11:20:00Z'
    },
    {
      id: 'tkt-003',
      ticketNumber: 'TKT-HR-1048',
      employeeId: 'EMP-1005',
      employeeName: 'Elena Rostova',
      employeeCode: 'EMP-1005',
      department: 'Operations & Assembly',
      category: 'letter_request',
      subject: 'Salary Certificate & Visa Invitation Letter for Schengen Travel',
      description: 'Requesting an embassy-attested salary certificate and No-Objection Certificate (NOC) for official European conference trip.',
      priority: 'urgent',
      status: 'open',
      assignedToHRName: 'Ananya Roy (HR Operations)',
      requestedLetterType: 'salary_certificate',
      createdAt: '2026-09-14T15:45:00Z',
      updatedAt: '2026-09-14T15:45:00Z'
    }
  ];

  static async getDashboardSummary(): Promise<HRDashboardSummaryDTO> {
    const activeOnboardings = this.candidates.filter(c => c.stage !== 'completed').length;
    const completedOnboardingsThisMonth = this.candidates.filter(c => c.stage === 'completed').length + 12;
    const totalAssetsManaged = this.assets.length;
    const allocatedAssets = this.assets.filter(a => a.status === 'allocated').length;
    const availableAssets = this.assets.filter(a => a.status === 'available').length;
    const expiringDocumentsNext30Days = this.documents.filter(d => d.expiryStatus === 'expiring_soon' || d.expiryStatus === 'expired').length;
    const activeAppraisalCycles = this.performanceReviews.filter(r => r.cycleStatus !== 'completed').length;
    const openHelpdeskTickets = this.tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;

    return {
      totalActiveEmployees: 1248,
      activeOnboardings,
      completedOnboardingsThisMonth,
      totalAssetsManaged,
      allocatedAssets,
      availableAssets,
      expiringDocumentsNext30Days,
      activeAppraisalCycles,
      openHelpdeskTickets,
      averageResolutionHours: 4.2
    };
  }

  // Onboarding API
  static async getCandidates(stage?: string): Promise<OnboardingCandidateDTO[]> {
    if (stage && stage !== 'all') {
      return this.candidates.filter(c => c.stage === stage);
    }
    return this.candidates;
  }

  static async toggleCandidateTask(candidateId: string, taskId: string): Promise<OnboardingCandidateDTO> {
    const candidate = this.candidates.find(c => c.id === candidateId);
    if (!candidate) throw new Error('Candidate not found');

    const task = candidate.tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date().toISOString() : undefined;
    task.completedBy = task.completed ? 'HR Administrator' : undefined;

    const completedCount = candidate.tasks.filter(t => t.completed).length;
    candidate.progressPercent = Math.round((completedCount / candidate.tasks.length) * 100);

    if (candidate.progressPercent === 100) {
      candidate.stage = 'completed';
    } else if (candidate.progressPercent >= 75) {
      candidate.stage = 'induction';
    } else if (candidate.progressPercent >= 50) {
      candidate.stage = 'it_provisioning';
    } else {
      candidate.stage = 'docs_pending';
    }

    return candidate;
  }

  // Document Vault API
  static async getDocuments(category?: DocumentCategory, search?: string): Promise<EmployeeDocumentDTO[]> {
    let docs = this.documents;
    if (category) {
      docs = docs.filter(d => d.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      docs = docs.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.employeeName.toLowerCase().includes(q) ||
        d.employeeCode.toLowerCase().includes(q) ||
        d.fileName.toLowerCase().includes(q)
      );
    }
    return docs;
  }

  static async uploadDocument(doc: Partial<EmployeeDocumentDTO>): Promise<EmployeeDocumentDTO> {
    const newDoc: EmployeeDocumentDTO = {
      id: `doc-${Date.now()}`,
      employeeId: doc.employeeId || 'EMP-1001',
      employeeName: doc.employeeName || 'Sarah Jenkins',
      employeeCode: doc.employeeCode || 'EMP-1001',
      department: doc.department || 'Engineering & Quality',
      title: doc.title || 'Uploaded Compliance Document',
      category: doc.category || 'certification',
      fileName: doc.fileName || 'Document_Upload.pdf',
      fileSizeBytes: doc.fileSizeBytes || 1024000,
      fileType: doc.fileType || 'application/pdf',
      documentNumber: doc.documentNumber || `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
      issueDate: doc.issueDate || new Date().toISOString().split('T')[0],
      expiryDate: doc.expiryDate,
      expiryStatus: doc.expiryDate ? 'valid' : 'not_applicable',
      verified: true,
      verifiedBy: 'HR Verification Engine',
      verifiedAt: new Date().toISOString(),
      downloadUrl: `/api/v1/hr/documents/download/doc-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    this.documents.unshift(newDoc);
    return newDoc;
  }

  // Assets Management API
  static async getAssets(category?: AssetCategory, status?: string): Promise<CompanyAssetDTO[]> {
    let list = this.assets;
    if (category) {
      list = list.filter(a => a.category === category);
    }
    if (status && status !== 'all') {
      list = list.filter(a => a.status === status);
    }
    return list;
  }

  static async allocateAsset(assetId: string, employeeId: string, employeeName: string, employeeCode: string): Promise<CompanyAssetDTO> {
    const asset = this.assets.find(a => a.id === assetId);
    if (!asset) throw new Error('Asset not found');

    asset.status = 'allocated';
    asset.allocatedToEmployeeId = employeeId;
    asset.allocatedToEmployeeName = employeeName;
    asset.allocatedToEmployeeCode = employeeCode;
    asset.allocatedDate = new Date().toISOString().split('T')[0];
    return asset;
  }

  static async returnAsset(assetId: string, condition: 'brand_new' | 'good' | 'fair' | 'damaged'): Promise<CompanyAssetDTO> {
    const asset = this.assets.find(a => a.id === assetId);
    if (!asset) throw new Error('Asset not found');

    asset.status = 'available';
    asset.allocatedToEmployeeId = undefined;
    asset.allocatedToEmployeeName = undefined;
    asset.allocatedToEmployeeCode = undefined;
    asset.allocatedDate = undefined;
    asset.condition = condition;
    return asset;
  }

  // Performance Reviews API
  static async getPerformanceReviews(): Promise<PerformanceReviewDTO[]> {
    return this.performanceReviews;
  }

  // HR Helpdesk API
  static async getTickets(status?: string, category?: TicketCategory): Promise<HRHelpdeskTicketDTO[]> {
    let list = this.tickets;
    if (status && status !== 'all') {
      list = list.filter(t => t.status === status);
    }
    if (category) {
      list = list.filter(t => t.category === category);
    }
    return list;
  }

  static async createTicket(payload: Partial<HRHelpdeskTicketDTO>): Promise<HRHelpdeskTicketDTO> {
    const newTicket: HRHelpdeskTicketDTO = {
      id: `tkt-${Date.now()}`,
      ticketNumber: `TKT-HR-${Math.floor(1000 + Math.random() * 9000)}`,
      employeeId: payload.employeeId || 'EMP-1001',
      employeeName: payload.employeeName || 'Sarah Jenkins',
      employeeCode: payload.employeeCode || 'EMP-1001',
      department: payload.department || 'Engineering & Quality',
      category: payload.category || 'general_hr',
      subject: payload.subject || 'HR Service Request',
      description: payload.description || '',
      priority: payload.priority || 'medium',
      status: 'open',
      assignedToHRName: 'Ananya Roy (HR Operations)',
      requestedLetterType: payload.requestedLetterType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.tickets.unshift(newTicket);
    return newTicket;
  }

  static async resolveTicket(ticketId: string, resolutionNotes: string): Promise<HRHelpdeskTicketDTO> {
    const ticket = this.tickets.find(t => t.id === ticketId);
    if (!ticket) throw new Error('Ticket not found');

    ticket.status = 'resolved';
    ticket.resolutionNotes = resolutionNotes;
    ticket.updatedAt = new Date().toISOString();
    return ticket;
  }
}
