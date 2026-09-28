import {
  FFJobSiteDTO,
  FFFieldEngineerDTO,
  FFJobOrderDTO,
  FFSiteCheckInDTO,
  FFVehicleDTO,
  FFMileageClaimDTO,
  FFDashboardSummaryDTO,
} from '@infi-timepro/shared-types';

export class FieldForceService {

  // ─── Job Sites ──────────────────────────────────────────────────────────────
  private static jobSites: FFJobSiteDTO[] = [
    { id: 'site-001', tenantId: 'tenant-001', siteName: 'Apex Financial HQ', siteCode: 'SITE-APX-001', address: '45 Nehru Place, New Delhi', city: 'New Delhi', country: 'India', latitude: 28.5491, longitude: 77.2517, geofenceRadiusMeters: 150, clientName: 'Apex Financial Group', clientContactName: 'Rajan Mehta', clientContactPhone: '+91-9810000001', territory: 'North India', status: 'active', totalJobsCompleted: 47, averageJobDurationMins: 85, lastVisitedAt: '2025-09-13T14:30:00.000Z', createdAt: '2025-01-10T09:00:00.000Z' },
    { id: 'site-002', tenantId: 'tenant-001', siteName: 'NovaTech Bangalore Campus', siteCode: 'SITE-NVT-001', address: 'Electronic City Phase 1, Bangalore', city: 'Bangalore', country: 'India', latitude: 12.8399, longitude: 77.6770, geofenceRadiusMeters: 200, clientName: 'NovaTech Solutions', clientContactName: 'Priya Reddy', clientContactPhone: '+91-9880000002', territory: 'South India', status: 'active', totalJobsCompleted: 63, averageJobDurationMins: 110, lastVisitedAt: '2025-09-14T09:00:00.000Z', createdAt: '2025-01-15T09:00:00.000Z' },
    { id: 'site-003', tenantId: 'tenant-001', siteName: 'GulfBridge Dubai Office', siteCode: 'SITE-GBR-001', address: 'Business Bay, Dubai', city: 'Dubai', country: 'UAE', latitude: 25.1868, longitude: 55.2729, geofenceRadiusMeters: 100, clientName: 'GulfBridge Logistics', clientContactName: 'Omar Al-Rashid', clientContactPhone: '+971-50-0000003', territory: 'UAE', status: 'active', totalJobsCompleted: 29, averageJobDurationMins: 75, lastVisitedAt: '2025-09-12T11:00:00.000Z', createdAt: '2025-03-01T09:00:00.000Z' },
    { id: 'site-004', tenantId: 'tenant-001', siteName: 'HealthCore Mumbai Clinic', siteCode: 'SITE-HLC-001', address: 'Bandra Kurla Complex, Mumbai', city: 'Mumbai', country: 'India', latitude: 19.0607, longitude: 72.8677, geofenceRadiusMeters: 120, clientName: 'HealthCore Systems', clientContactName: 'Dr. Neha Shah', clientContactPhone: '+91-9920000004', territory: 'West India', status: 'active', totalJobsCompleted: 18, averageJobDurationMins: 140, lastVisitedAt: '2025-09-11T15:00:00.000Z', createdAt: '2025-04-01T09:00:00.000Z' },
    { id: 'site-005', tenantId: 'tenant-001', siteName: 'Pune Manufacturing Plant', siteCode: 'SITE-PMF-001', address: 'Chakan Industrial Area, Pune', city: 'Pune', country: 'India', latitude: 18.7636, longitude: 73.8987, geofenceRadiusMeters: 300, clientName: 'Infi-TimePro Internal', clientContactName: 'Vikram Singh', clientContactPhone: '+91-9900000005', territory: 'West India', status: 'active', totalJobsCompleted: 112, averageJobDurationMins: 60, lastVisitedAt: '2025-09-14T08:00:00.000Z', createdAt: '2025-01-01T09:00:00.000Z' },
    { id: 'site-006', tenantId: 'tenant-001', siteName: 'Abu Dhabi Data Centre', siteCode: 'SITE-ADC-001', address: 'Khalifa Industrial Zone, Abu Dhabi', city: 'Abu Dhabi', country: 'UAE', latitude: 24.4539, longitude: 54.3773, geofenceRadiusMeters: 250, clientName: 'GulfBridge Logistics', clientContactName: 'Farid Al-Mansoori', clientContactPhone: '+971-50-0000006', territory: 'UAE', status: 'inactive', totalJobsCompleted: 8, averageJobDurationMins: 200, createdAt: '2025-06-01T09:00:00.000Z' },
  ];

  // ─── Field Engineers ────────────────────────────────────────────────────────
  private static fieldEngineers: FFFieldEngineerDTO[] = [
    { id: 'fe-001', tenantId: 'tenant-001', employeeId: 'EMP-4101', employeeName: 'Arjun Sharma', employeeCode: 'EMP-4101', department: 'Field Operations', skills: ['HVAC', 'Electrical', 'BMS'], currentStatus: 'on_site', currentJobId: 'job-003', currentSiteId: 'site-005', currentLatitude: 18.7636, currentLongitude: 73.8987, lastLocationUpdatedAt: '2025-09-14T09:45:00.000Z', vehicleId: 'veh-001', vehicleNumber: 'MH-12-AB-4401', totalJobsThisMonth: 18, completionRate: 94.4, avgRating: 4.7, territory: 'West India' },
    { id: 'fe-002', tenantId: 'tenant-001', employeeId: 'EMP-4102', employeeName: 'Suresh Kumar', employeeCode: 'EMP-4102', department: 'Field Operations', skills: ['Networking', 'CCTV', 'Server Rack'], currentStatus: 'dispatched', currentJobId: 'job-001', currentSiteId: 'site-001', vehicleId: 'veh-002', vehicleNumber: 'DL-01-CD-5502', totalJobsThisMonth: 14, completionRate: 92.8, avgRating: 4.5, territory: 'North India' },
    { id: 'fe-003', tenantId: 'tenant-001', employeeId: 'EMP-4103', employeeName: 'Ravi Patel', employeeCode: 'EMP-4103', department: 'Field Operations', skills: ['UPS', 'Solar', 'Generator'], currentStatus: 'available', vehicleId: 'veh-003', vehicleNumber: 'KA-09-EF-6603', totalJobsThisMonth: 21, completionRate: 97.1, avgRating: 4.9, territory: 'South India' },
    { id: 'fe-004', tenantId: 'tenant-001', employeeId: 'EMP-4104', employeeName: 'Mohammed Al-Farsi', employeeCode: 'EMP-4104', department: 'Field Operations', skills: ['Electrical', 'AC', 'Plumbing'], currentStatus: 'on_site', currentJobId: 'job-002', currentSiteId: 'site-003', currentLatitude: 25.1868, currentLongitude: 55.2729, lastLocationUpdatedAt: '2025-09-14T10:00:00.000Z', vehicleId: 'veh-004', vehicleNumber: 'DXB-P-77401', totalJobsThisMonth: 12, completionRate: 91.6, avgRating: 4.6, territory: 'UAE' },
    { id: 'fe-005', tenantId: 'tenant-001', employeeId: 'EMP-4105', employeeName: 'Divya Nair', employeeCode: 'EMP-4105', department: 'Field Operations', skills: ['Biomedical', 'Medical Devices', 'Calibration'], currentStatus: 'available', vehicleId: 'veh-005', vehicleNumber: 'MH-01-GH-7705', totalJobsThisMonth: 9, completionRate: 100, avgRating: 5.0, territory: 'West India' },
    { id: 'fe-006', tenantId: 'tenant-001', employeeId: 'EMP-4106', employeeName: 'Khalid Hassan', employeeCode: 'EMP-4106', department: 'Field Operations', skills: ['IT Support', 'Networking', 'Surveillance'], currentStatus: 'off_duty', vehicleId: 'veh-006', vehicleNumber: 'AUH-P-88806', totalJobsThisMonth: 6, completionRate: 83.3, avgRating: 4.2, territory: 'UAE' },
  ];

  // ─── Job Orders ─────────────────────────────────────────────────────────────
  private static jobOrders: FFJobOrderDTO[] = [
    { id: 'job-001', tenantId: 'tenant-001', jobCode: 'JOB-2025-0914-001', title: 'Network Switch Replacement', description: 'Replace 3x Cisco 48-port switches in server room B12. Verify all uplinks post-installation. Test failover.', siteId: 'site-001', siteName: 'Apex Financial HQ', siteAddress: '45 Nehru Place, New Delhi', clientName: 'Apex Financial Group', assignedEngineerId: 'EMP-4102', assignedEngineerName: 'Suresh Kumar', priority: 'high', status: 'dispatched', scheduledAt: '2025-09-14T10:00:00.000Z', estimatedDurationMins: 120, dispatchedAt: '2025-09-14T09:30:00.000Z', createdAt: '2025-09-13T09:00:00.000Z' },
    { id: 'job-002', tenantId: 'tenant-001', jobCode: 'JOB-2025-0914-002', title: 'Central AC Servicing', description: 'Quarterly AC maintenance for all 8 units in Dubai office. Replace filters, clean coils, check refrigerant levels.', siteId: 'site-003', siteName: 'GulfBridge Dubai Office', siteAddress: 'Business Bay, Dubai', clientName: 'GulfBridge Logistics', assignedEngineerId: 'EMP-4104', assignedEngineerName: 'Mohammed Al-Farsi', priority: 'normal', status: 'on_site', scheduledAt: '2025-09-14T08:00:00.000Z', estimatedDurationMins: 180, dispatchedAt: '2025-09-14T07:30:00.000Z', arrivedAt: '2025-09-14T08:15:00.000Z', createdAt: '2025-09-13T14:00:00.000Z' },
    { id: 'job-003', tenantId: 'tenant-001', jobCode: 'JOB-2025-0914-003', title: 'BMS Panel Calibration', description: 'Full recalibration of Building Management System panels 1-4. Update firmware to v3.2.1.', siteId: 'site-005', siteName: 'Pune Manufacturing Plant', siteAddress: 'Chakan Industrial Area, Pune', clientName: 'Infi-TimePro Internal', assignedEngineerId: 'EMP-4101', assignedEngineerName: 'Arjun Sharma', priority: 'normal', status: 'on_site', scheduledAt: '2025-09-14T08:30:00.000Z', estimatedDurationMins: 90, dispatchedAt: '2025-09-14T08:00:00.000Z', arrivedAt: '2025-09-14T08:45:00.000Z', createdAt: '2025-09-13T16:00:00.000Z' },
    { id: 'job-004', tenantId: 'tenant-001', jobCode: 'JOB-2025-0913-004', title: 'UPS Battery Replacement', description: 'Replace 12 x 100Ah VRLA batteries in UPS Bank A. Load test post-replacement. Runtime target: 45 mins at full load.', siteId: 'site-002', siteName: 'NovaTech Bangalore Campus', siteAddress: 'Electronic City Phase 1, Bangalore', clientName: 'NovaTech Solutions', assignedEngineerId: 'EMP-4103', assignedEngineerName: 'Ravi Patel', priority: 'critical', status: 'completed', scheduledAt: '2025-09-13T09:00:00.000Z', estimatedDurationMins: 240, actualDurationMins: 210, dispatchedAt: '2025-09-13T08:30:00.000Z', arrivedAt: '2025-09-13T09:15:00.000Z', completedAt: '2025-09-13T12:45:00.000Z', completionNotes: 'All 12 batteries replaced. Load test passed at 47 min runtime. Client signed off.', partsUsed: ['VRLA-100AH x12', 'Terminal Connectors x24', 'Battery Straps x12'], customerRating: 5, createdAt: '2025-09-12T09:00:00.000Z' },
    { id: 'job-005', tenantId: 'tenant-001', jobCode: 'JOB-2025-0914-005', title: 'Medical Equipment Calibration', description: 'Annual calibration of 6x patient monitoring stations. Compliance with ISO 13485 required. Generate calibration certificates.', siteId: 'site-004', siteName: 'HealthCore Mumbai Clinic', siteAddress: 'Bandra Kurla Complex, Mumbai', clientName: 'HealthCore Systems', priority: 'high', status: 'scheduled', scheduledAt: '2025-09-14T14:00:00.000Z', estimatedDurationMins: 180, createdAt: '2025-09-12T10:00:00.000Z' },
    { id: 'job-006', tenantId: 'tenant-001', jobCode: 'JOB-2025-0912-006', title: 'CCTV System Expansion', description: 'Install 4 additional IP cameras in car park level B2-B3. Configure NVR storage. Test motion detection zones.', siteId: 'site-001', siteName: 'Apex Financial HQ', siteAddress: '45 Nehru Place, New Delhi', clientName: 'Apex Financial Group', assignedEngineerId: 'EMP-4102', assignedEngineerName: 'Suresh Kumar', priority: 'normal', status: 'completed', scheduledAt: '2025-09-12T10:00:00.000Z', estimatedDurationMins: 150, actualDurationMins: 135, dispatchedAt: '2025-09-12T09:30:00.000Z', arrivedAt: '2025-09-12T10:10:00.000Z', completedAt: '2025-09-12T12:25:00.000Z', completionNotes: 'All 4 cameras installed. NVR configured with 30-day retention. Motion zones tested OK.', partsUsed: ['IP Camera x4', 'CAT6 Cable 80m', 'PoE Switch 8-port x1'], customerRating: 4, createdAt: '2025-09-11T09:00:00.000Z' },
    { id: 'job-007', tenantId: 'tenant-001', jobCode: 'JOB-2025-0914-007', title: 'Generator AMC Service', description: 'Annual maintenance contract service for 500kVA generator. Oil change, filter replacement, load bank test.', siteId: 'site-002', siteName: 'NovaTech Bangalore Campus', siteAddress: 'Electronic City Phase 1, Bangalore', clientName: 'NovaTech Solutions', priority: 'normal', status: 'scheduled', scheduledAt: '2025-09-14T15:30:00.000Z', estimatedDurationMins: 120, createdAt: '2025-09-13T11:00:00.000Z' },
  ];

  // ─── Site Check-Ins ─────────────────────────────────────────────────────────
  private static siteCheckIns: FFSiteCheckInDTO[] = [
    { id: 'chk-001', tenantId: 'tenant-001', jobId: 'job-004', employeeId: 'EMP-4103', employeeName: 'Ravi Patel', employeeCode: 'EMP-4103', siteId: 'site-002', siteName: 'NovaTech Bangalore Campus', checkInLatitude: 12.8401, checkInLongitude: 77.6772, distanceFromSiteMeters: 28, isWithinGeofence: true, checkInAt: '2025-09-13T09:15:00.000Z', checkOutAt: '2025-09-13T12:45:00.000Z', durationMins: 210, gpsAccuracyMeters: 5, verificationStatus: 'verified' },
    { id: 'chk-002', tenantId: 'tenant-001', jobId: 'job-006', employeeId: 'EMP-4102', employeeName: 'Suresh Kumar', employeeCode: 'EMP-4102', siteId: 'site-001', siteName: 'Apex Financial HQ', checkInLatitude: 28.5490, checkInLongitude: 77.2515, distanceFromSiteMeters: 15, isWithinGeofence: true, checkInAt: '2025-09-12T10:10:00.000Z', checkOutAt: '2025-09-12T12:25:00.000Z', durationMins: 135, gpsAccuracyMeters: 8, verificationStatus: 'verified' },
    { id: 'chk-003', tenantId: 'tenant-001', jobId: 'job-002', employeeId: 'EMP-4104', employeeName: 'Mohammed Al-Farsi', employeeCode: 'EMP-4104', siteId: 'site-003', siteName: 'GulfBridge Dubai Office', checkInLatitude: 25.1868, checkInLongitude: 55.2729, distanceFromSiteMeters: 5, isWithinGeofence: true, checkInAt: '2025-09-14T08:15:00.000Z', gpsAccuracyMeters: 4, verificationStatus: 'verified' },
    { id: 'chk-004', tenantId: 'tenant-001', jobId: 'job-003', employeeId: 'EMP-4101', employeeName: 'Arjun Sharma', employeeCode: 'EMP-4101', siteId: 'site-005', siteName: 'Pune Manufacturing Plant', checkInLatitude: 18.7636, checkInLongitude: 73.8987, distanceFromSiteMeters: 3, isWithinGeofence: true, checkInAt: '2025-09-14T08:45:00.000Z', gpsAccuracyMeters: 3, verificationStatus: 'verified' },
    { id: 'chk-005', tenantId: 'tenant-001', jobId: 'job-001', employeeId: 'EMP-4102', employeeName: 'Suresh Kumar', employeeCode: 'EMP-4102', siteId: 'site-001', siteName: 'Apex Financial HQ', checkInLatitude: 28.5610, checkInLongitude: 77.2650, distanceFromSiteMeters: 1640, isWithinGeofence: false, checkInAt: '2025-09-14T10:42:00.000Z', gpsAccuracyMeters: 22, verificationStatus: 'outside_geofence' },
  ];

  // ─── Vehicles ───────────────────────────────────────────────────────────────
  private static vehicles: FFVehicleDTO[] = [
    { id: 'veh-001', tenantId: 'tenant-001', vehicleNumber: 'MH-12-AB-4401', make: 'Tata', model: 'Ace Gold', year: 2023, vehicleType: 'van', status: 'assigned', assignedEngineerId: 'EMP-4101', assignedEngineerName: 'Arjun Sharma', currentOdometerKm: 24850, lastServiceKm: 20000, nextServiceKm: 30000, fuelType: 'diesel', insuranceExpiryDate: '2026-03-31', registrationExpiryDate: '2026-01-15', territory: 'West India' },
    { id: 'veh-002', tenantId: 'tenant-001', vehicleNumber: 'DL-01-CD-5502', make: 'Mahindra', model: 'Bolero Pik-Up', year: 2022, vehicleType: 'truck', status: 'assigned', assignedEngineerId: 'EMP-4102', assignedEngineerName: 'Suresh Kumar', currentOdometerKm: 41200, lastServiceKm: 40000, nextServiceKm: 45000, fuelType: 'diesel', insuranceExpiryDate: '2025-11-30', registrationExpiryDate: '2026-05-20', territory: 'North India' },
    { id: 'veh-003', tenantId: 'tenant-001', vehicleNumber: 'KA-09-EF-6603', make: 'Maruti', model: 'Eeco', year: 2024, vehicleType: 'van', status: 'available', currentOdometerKm: 8350, lastServiceKm: 5000, nextServiceKm: 10000, fuelType: 'petrol', insuranceExpiryDate: '2026-08-31', registrationExpiryDate: '2027-03-10', territory: 'South India' },
    { id: 'veh-004', tenantId: 'tenant-001', vehicleNumber: 'DXB-P-77401', make: 'Toyota', model: 'Hilux', year: 2023, vehicleType: 'truck', status: 'assigned', assignedEngineerId: 'EMP-4104', assignedEngineerName: 'Mohammed Al-Farsi', currentOdometerKm: 18900, lastServiceKm: 15000, nextServiceKm: 20000, fuelType: 'petrol', insuranceExpiryDate: '2026-06-30', registrationExpiryDate: '2026-04-15', territory: 'UAE' },
    { id: 'veh-005', tenantId: 'tenant-001', vehicleNumber: 'MH-01-GH-7705', make: 'Hyundai', model: 'Creta', year: 2024, vehicleType: 'car', status: 'available', currentOdometerKm: 5120, lastServiceKm: 5000, nextServiceKm: 10000, fuelType: 'petrol', insuranceExpiryDate: '2026-09-30', registrationExpiryDate: '2027-08-01', territory: 'West India' },
    { id: 'veh-006', tenantId: 'tenant-001', vehicleNumber: 'AUH-P-88806', make: 'Nissan', model: 'Patrol', year: 2021, vehicleType: 'car', status: 'maintenance', currentOdometerKm: 67000, lastServiceKm: 65000, nextServiceKm: 70000, fuelType: 'petrol', insuranceExpiryDate: '2026-01-31', registrationExpiryDate: '2025-12-31', territory: 'UAE' },
  ];

  // ─── Mileage Claims ─────────────────────────────────────────────────────────
  private static mileageClaims: FFMileageClaimDTO[] = [
    { id: 'mil-001', tenantId: 'tenant-001', employeeId: 'EMP-4101', employeeName: 'Arjun Sharma', employeeCode: 'EMP-4101', jobId: 'job-003', jobCode: 'JOB-2025-0914-003', vehicleId: 'veh-001', vehicleNumber: 'MH-12-AB-4401', tripDate: '2025-09-14', fromLocation: 'Infi-TimePro Office, Pune', toLocation: 'Pune Manufacturing Plant, Chakan', distanceKm: 32, ratePerKm: 8, claimAmount: 256, currency: 'INR', status: 'submitted', submittedAt: '2025-09-14T13:00:00.000Z' },
    { id: 'mil-002', tenantId: 'tenant-001', employeeId: 'EMP-4102', employeeName: 'Suresh Kumar', employeeCode: 'EMP-4102', jobId: 'job-006', jobCode: 'JOB-2025-0912-006', vehicleId: 'veh-002', vehicleNumber: 'DL-01-CD-5502', tripDate: '2025-09-12', fromLocation: 'Infi-TimePro Delhi Office', toLocation: 'Apex Financial HQ, Nehru Place', distanceKm: 18, ratePerKm: 8, claimAmount: 144, currency: 'INR', status: 'approved', submittedAt: '2025-09-12T13:30:00.000Z', approvedBy: 'Vikram Singh', approvedAt: '2025-09-13T10:00:00.000Z' },
    { id: 'mil-003', tenantId: 'tenant-001', employeeId: 'EMP-4103', employeeName: 'Ravi Patel', employeeCode: 'EMP-4103', jobId: 'job-004', jobCode: 'JOB-2025-0913-004', vehicleId: 'veh-003', vehicleNumber: 'KA-09-EF-6603', tripDate: '2025-09-13', fromLocation: 'Infi-TimePro Bangalore Office', toLocation: 'NovaTech Bangalore Campus, Electronic City', distanceKm: 28, ratePerKm: 8, claimAmount: 224, currency: 'INR', status: 'approved', submittedAt: '2025-09-13T13:00:00.000Z', approvedBy: 'Vikram Singh', approvedAt: '2025-09-14T09:00:00.000Z' },
    { id: 'mil-004', tenantId: 'tenant-001', employeeId: 'EMP-4104', employeeName: 'Mohammed Al-Farsi', employeeCode: 'EMP-4104', jobId: 'job-002', jobCode: 'JOB-2025-0914-002', vehicleId: 'veh-004', vehicleNumber: 'DXB-P-77401', tripDate: '2025-09-14', fromLocation: 'Infi-TimePro Dubai Office, JLT', toLocation: 'GulfBridge Office, Business Bay', distanceKm: 14, ratePerKm: 2.5, claimAmount: 35, currency: 'AED', status: 'submitted', submittedAt: '2025-09-14T11:00:00.000Z' },
    { id: 'mil-005', tenantId: 'tenant-001', employeeId: 'EMP-4102', employeeName: 'Suresh Kumar', employeeCode: 'EMP-4102', jobId: 'job-001', jobCode: 'JOB-2025-0914-001', vehicleId: 'veh-002', vehicleNumber: 'DL-01-CD-5502', tripDate: '2025-09-14', fromLocation: 'Infi-TimePro Delhi Office', toLocation: 'Apex Financial HQ, Nehru Place', distanceKm: 18, ratePerKm: 8, claimAmount: 144, currency: 'INR', status: 'draft' },
  ];

  // ─── Public API ─────────────────────────────────────────────────────────────

  static async getDashboardSummary(tenantId: string): Promise<FFDashboardSummaryDTO> {
    const engineers = this.fieldEngineers.filter(e => e.tenantId === tenantId);
    const sites = this.jobSites.filter(s => s.tenantId === tenantId);
    const jobs = this.jobOrders.filter(j => j.tenantId === tenantId);
    const vehicles = this.vehicles.filter(v => v.tenantId === tenantId);
    const claims = this.mileageClaims.filter(m => m.tenantId === tenantId);
    const today = '2025-09-14';
    const todayJobs = jobs.filter(j => j.scheduledAt.startsWith(today));
    const now = new Date('2025-09-14T12:00:00Z');
    const overdue = jobs.filter(j => !['completed', 'cancelled'].includes(j.status) && new Date(j.scheduledAt) < now);
    const avgRating = jobs.filter(j => j.customerRating).reduce((s, j) => s + (j.customerRating || 0), 0) / Math.max(1, jobs.filter(j => j.customerRating).length);
    const pendingClaims = claims.filter(m => m.status === 'submitted');
    return {
      totalFieldEngineers: engineers.length,
      engineersOnSite: engineers.filter(e => e.currentStatus === 'on_site').length,
      engineersAvailable: engineers.filter(e => e.currentStatus === 'available').length,
      engineersOffDuty: engineers.filter(e => e.currentStatus === 'off_duty').length,
      totalJobSites: sites.length,
      activeJobSites: sites.filter(s => s.status === 'active').length,
      jobsScheduledToday: todayJobs.length,
      jobsCompletedToday: todayJobs.filter(j => j.status === 'completed').length,
      jobsInProgress: jobs.filter(j => ['dispatched', 'en_route', 'on_site'].includes(j.status)).length,
      jobsOverdue: overdue.length,
      avgCompletionRate: Math.round(engineers.reduce((s, e) => s + e.completionRate, 0) / engineers.length * 10) / 10,
      avgCustomerRating: Math.round(avgRating * 10) / 10,
      pendingMileageClaims: pendingClaims.length,
      totalMileageClaimAmountPending: pendingClaims.reduce((s, m) => s + m.claimAmount, 0),
      fleetAvailable: vehicles.filter(v => v.status === 'available').length,
      fleetAssigned: vehicles.filter(v => v.status === 'assigned').length,
      fleetInMaintenance: vehicles.filter(v => v.status === 'maintenance').length,
    };
  }

  static async getJobSites(tenantId: string, status?: string): Promise<FFJobSiteDTO[]> {
    return this.jobSites.filter(s => s.tenantId === tenantId && (!status || s.status === status));
  }

  static async getFieldEngineers(tenantId: string, status?: string): Promise<FFFieldEngineerDTO[]> {
    return this.fieldEngineers.filter(e => e.tenantId === tenantId && (!status || e.currentStatus === status));
  }

  static async getJobOrders(tenantId: string, status?: string, assignedEngineerId?: string): Promise<FFJobOrderDTO[]> {
    return this.jobOrders.filter(j =>
      j.tenantId === tenantId &&
      (!status || j.status === status) &&
      (!assignedEngineerId || j.assignedEngineerId === assignedEngineerId)
    );
  }

  static async dispatchEngineer(jobId: string, engineerId: string, engineerName: string): Promise<FFJobOrderDTO> {
    const job = this.jobOrders.find(j => j.id === jobId);
    if (!job) throw new Error(`Job ${jobId} not found`);
    job.assignedEngineerId = engineerId;
    job.assignedEngineerName = engineerName;
    job.status = 'dispatched';
    job.dispatchedAt = new Date().toISOString();
    const eng = this.fieldEngineers.find(e => e.employeeId === engineerId);
    if (eng) { eng.currentStatus = 'dispatched'; eng.currentJobId = jobId; }
    return job;
  }

  static async completeJob(jobId: string, notes: string, rating: number, partsUsed: string[]): Promise<FFJobOrderDTO> {
    const job = this.jobOrders.find(j => j.id === jobId);
    if (!job) throw new Error(`Job ${jobId} not found`);
    job.status = 'completed';
    job.completedAt = new Date().toISOString();
    job.completionNotes = notes;
    job.customerRating = rating;
    job.partsUsed = partsUsed;
    job.actualDurationMins = job.arrivedAt
      ? Math.round((new Date(job.completedAt).getTime() - new Date(job.arrivedAt).getTime()) / 60000) : undefined;
    const eng = this.fieldEngineers.find(e => e.employeeId === job.assignedEngineerId);
    if (eng) { eng.currentStatus = 'available'; eng.currentJobId = undefined; eng.totalJobsThisMonth += 1; }
    return job;
  }

  static async getSiteCheckIns(tenantId: string, jobId?: string): Promise<FFSiteCheckInDTO[]> {
    return this.siteCheckIns.filter(c => c.tenantId === tenantId && (!jobId || c.jobId === jobId));
  }

  static async getVehicles(tenantId: string, status?: string): Promise<FFVehicleDTO[]> {
    return this.vehicles.filter(v => v.tenantId === tenantId && (!status || v.status === status));
  }

  static async getMileageClaims(tenantId: string, status?: string, employeeId?: string): Promise<FFMileageClaimDTO[]> {
    return this.mileageClaims.filter(m =>
      m.tenantId === tenantId &&
      (!status || m.status === status) &&
      (!employeeId || m.employeeId === employeeId)
    );
  }

  static async approveMileageClaim(claimId: string, approvedBy: string): Promise<FFMileageClaimDTO> {
    const claim = this.mileageClaims.find(m => m.id === claimId);
    if (!claim) throw new Error(`Claim ${claimId} not found`);
    claim.status = 'approved';
    claim.approvedBy = approvedBy;
    claim.approvedAt = new Date().toISOString();
    return claim;
  }

  static async rejectMileageClaim(claimId: string, approvedBy: string, reason: string): Promise<FFMileageClaimDTO> {
    const claim = this.mileageClaims.find(m => m.id === claimId);
    if (!claim) throw new Error(`Claim ${claimId} not found`);
    claim.status = 'rejected';
    claim.approvedBy = approvedBy;
    claim.approvedAt = new Date().toISOString();
    claim.rejectionReason = reason;
    return claim;
  }
}
