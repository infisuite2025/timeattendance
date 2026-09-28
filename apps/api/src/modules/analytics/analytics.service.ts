import {
  DashboardKPISummaryDTO,
  HourlyAttendanceTrendItem,
  LocationDistributionItem,
  SystemStatusItem,
} from '@infi-timepro/shared-types';
import { organizationService } from '../organization/organization.service.js';

export class AnalyticsService {
  getDashboardSummary(location?: string, date?: string): DashboardKPISummaryDTO {
    const locations = organizationService.getLocations();
    let totalBase = locations.reduce((sum, l) => sum + (l.employeeCount || 0), 0);

    if (location && location !== 'All Locations') {
      const foundLoc = locations.find(l =>
        l.name.toLowerCase().includes(location.toLowerCase()) ||
        location.toLowerCase().includes(l.city.toLowerCase())
      );
      if (foundLoc) {
        totalBase = foundLoc.employeeCount;
      }
    }

    const presentRatio = 0.715;
    const lateRatio = 0.050;
    const onLeaveRatio = 0.046;
    const wfhRatio = 0.035;
    const fieldRatio = 0.021;
    const missingRatio = 0.008;

    const presentCount = Math.round(totalBase * presentRatio);
    const lateCount = Math.round(totalBase * lateRatio);
    const onLeaveCount = Math.round(totalBase * onLeaveRatio);
    const wfhCount = Math.round(totalBase * wfhRatio);
    const fieldDutyCount = Math.round(totalBase * fieldRatio);
    const missingPunchCount = Math.round(totalBase * missingRatio);
    const notArrivedCount = totalBase - presentCount - onLeaveCount - wfhCount - fieldDutyCount;

    return {
      totalEmployees: { count: totalBase, changeVsLastMonth: '+2.4%' },
      present: { count: presentCount, percentage: Number(((presentCount / totalBase) * 100).toFixed(1)) },
      notArrived: { count: Math.max(0, notArrivedCount), percentage: Number(((Math.max(0, notArrivedCount) / totalBase) * 100).toFixed(1)) },
      late: { count: lateCount, percentage: Number(((lateCount / totalBase) * 100).toFixed(1)) },
      onLeave: { count: onLeaveCount, percentage: Number(((onLeaveCount / totalBase) * 100).toFixed(1)) },
      wfh: { count: wfhCount, percentage: Number(((wfhCount / totalBase) * 100).toFixed(1)) },
      fieldDuty: { count: fieldDutyCount, percentage: Number(((fieldDutyCount / totalBase) * 100).toFixed(1)) },
      missingPunch: { count: missingPunchCount, percentage: Number(((missingPunchCount / totalBase) * 100).toFixed(1)) },
    };
  }

  getHourlyTrend(location?: string): HourlyAttendanceTrendItem[] {
    const locations = organizationService.getLocations();
    let totalBase = locations.reduce((sum, l) => sum + (l.employeeCount || 0), 0);

    if (location && location !== 'All Locations') {
      const foundLoc = locations.find(l =>
        l.name.toLowerCase().includes(location.toLowerCase()) ||
        location.toLowerCase().includes(l.city.toLowerCase())
      );
      if (foundLoc) {
        totalBase = foundLoc.employeeCount;
      }
    }

    const scale = totalBase / 1248;

    return [
      { hour: '6 AM', present: Math.round(50 * scale), expected: Math.round(80 * scale) },
      { hour: '8 AM', present: Math.round(480 * scale), expected: Math.round(550 * scale) },
      { hour: '10 AM', present: Math.round(892 * scale), expected: Math.round(920 * scale) },
      { hour: '12 PM', present: Math.round(885 * scale), expected: Math.round(920 * scale) },
      { hour: '2 PM', present: Math.round(870 * scale), expected: Math.round(920 * scale) },
      { hour: '4 PM', present: Math.round(860 * scale), expected: Math.round(920 * scale) },
      { hour: '6 PM', present: Math.round(720 * scale), expected: Math.round(850 * scale) },
      { hour: '8 PM', present: Math.round(310 * scale), expected: Math.round(400 * scale) },
    ];
  }

  getLocationDistribution(): LocationDistributionItem[] {
    const locations = organizationService.getLocations();
    const total = locations.reduce((sum, l) => sum + l.employeeCount, 0);
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#64748B'];

    return locations.map((loc, idx) => ({
      location: loc.name,
      count: loc.employeeCount,
      percentage: Number(((loc.employeeCount / total) * 100).toFixed(0)),
      color: colors[idx % colors.length],
    }));
  }

  getAttentionRequired() {
    return [
      { id: '1', type: 'not_arrived', title: '156 employees not arrived yet', subtitle: 'As of 10:30 AM', severity: 'medium' },
      { id: '2', type: 'missing_punch', title: '10 employees with missing punch', subtitle: 'Today', severity: 'high' },
      { id: '3', type: 'late', title: '62 employees are late', subtitle: 'Today', severity: 'low' },
      { id: '4', type: 'devices_offline', title: '5 devices offline', subtitle: 'Across 2 locations', severity: 'high' },
      { id: '5', type: 'exceeded_hours', title: '2 employees exceeded 12 hours', subtitle: 'Rakesh Verma, Anil Kapoor', severity: 'medium' },
    ];
  }

  getSystemStatus(): SystemStatusItem[] {
    return [
      { serviceName: 'Attendance Services', status: 'Operational', uptimePercentage: 99.9 },
      { serviceName: 'Device Connectivity', status: 'Operational', uptimePercentage: 99.7 },
      { serviceName: 'Geofencing Services', status: 'Operational', uptimePercentage: 99.9 },
      { serviceName: 'Integrations', status: 'Operational', uptimePercentage: 99.8 },
      { serviceName: 'Database', status: 'Operational', uptimePercentage: 100.0 },
    ];
  }
}

export const analyticsService = new AnalyticsService();
