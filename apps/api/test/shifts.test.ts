import { describe, it, expect } from 'vitest';
import { shiftsService } from '../src/modules/shifts/shifts.service.js';

describe('Shifts & Rostering Module', () => {
  it('should return initial shift library items', () => {
    const shifts = shiftsService.getShifts();
    expect(shifts.length).toBeGreaterThanOrEqual(5);
    expect(shifts.find(s => s.code === 'GS')).toBeDefined();
    expect(shifts.find(s => s.code === 'MS')).toBeDefined();
  });

  it('should create a new shift', () => {
    const initialCount = shiftsService.getShifts().length;
    const newShift = shiftsService.createShift({
      code: 'TEST_SFT',
      name: 'Test Shift',
      shiftType: 'fixed',
      startTime: '08:00 AM',
      endTime: '04:00 PM',
    });

    expect(newShift.id).toBeDefined();
    expect(newShift.code).toBe('TEST_SFT');
    expect(shiftsService.getShifts().length).toBe(initialCount + 1);
  });

  it('should update shift status', () => {
    const updated = shiftsService.updateShiftStatus('shf_1', 'archived');
    expect(updated).not.toBeNull();
    expect(updated?.status).toBe('archived');

    // Restore to active
    shiftsService.updateShiftStatus('shf_1', 'active');
  });

  it('should fetch shift groups and create a group', () => {
    const groups = shiftsService.getShiftGroups();
    expect(groups.length).toBeGreaterThanOrEqual(3);

    const newGroup = shiftsService.createShiftGroup({
      name: 'Logistics Group',
      code: 'GRP-LOG',
      patternType: 'Rotational',
    });
    expect(newGroup.id).toBeDefined();
    expect(newGroup.name).toBe('Logistics Group');
  });

  it('should assign a shift to an employee', () => {
    const assignment = shiftsService.assignShift({
      employeeId: 'emp_test_01',
      employeeCode: 'EMP-999',
      employeeName: 'John Test',
      currentShift: 'Night Shift',
    });
    expect(assignment.id).toBeDefined();
    expect(assignment.employeeCode).toBe('EMP-999');
    expect(shiftsService.getShiftAssignments()[0].id).toBe(assignment.id);
  });

  it('should manage shift swap request lifecycle', () => {
    const swap = shiftsService.createShiftSwap({
      requesterId: 'emp_001',
      swapWithId: 'emp_002',
      reason: 'Testing swap',
    });
    expect(swap.status).toBe('pending');

    const approved = shiftsService.approveShiftSwap(swap.id);
    expect(approved?.status).toBe('approved');
  });

  it('should update schedule matrix cell', () => {
    const matrix = shiftsService.getScheduleMatrix();
    expect(matrix.schedule.length).toBeGreaterThanOrEqual(1);

    const empId = matrix.schedule[0].employeeId;
    const firstDate = matrix.schedule[0].shifts[0].date;

    const ok = shiftsService.updateScheduleCell(empId, firstDate, 'MS');
    expect(ok).toBe(true);

    const updatedMatrix = shiftsService.getScheduleMatrix();
    const updatedCell = updatedMatrix.schedule[0].shifts.find(s => s.date === firstDate);
    expect(updatedCell?.shiftCode).toBe('MS');
  });
});
