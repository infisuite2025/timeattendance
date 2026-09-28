import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  RotateCcw,
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  ChevronRight,
  ArrowRight,
  MoreVertical,
  X,
  RefreshCw,
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { useNotification } from '../../context/NotificationContext.tsx';
import { useI18n } from '../../context/I18nContext.tsx';

export const ShiftSwapsPage: React.FC = () => {
  const { t } = useI18n();
  const { toast, confirm } = useNotification();
  const [swaps, setSwaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSwap, setSelectedSwap] = useState<any | null>(null);

  useEffect(() => {
    loadSwaps();
  }, []);

  const loadSwaps = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<any[]>('/shifts/swaps');
      const list = Array.isArray(res.data) ? res.data : (res.data as any)?.data || [];
      const mapped = list.map((s: any) => ({
        id: s.id,
        code: s.requestCode,
        requester: s.requesterName,
        reqDept: s.requesterDept,
        swapWith: s.swapWithName,
        swapDept: s.swapWithDept,
        date: s.date,
        from: `${s.currentShift} (${s.currentShiftTiming})`,
        to: `${s.requestedShift} (${s.requestedShiftTiming})`,
        currentShift: s.currentShift,
        requestedShift: s.requestedShift,
        reason: s.reason,
        status: s.status || 'pending',
        submitted: s.submittedOn,
        submittedOn: s.submittedOn,
        reqAvatar: s.requesterAvatar || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop',
        swapAvatar: s.swapWithAvatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop',
      }));
      setSwaps(mapped);
      if (mapped.length > 0) setSelectedSwap(mapped[0]);
    } catch {
      toast.error('Failed to load shift swap requests from database');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (swap: any) => {
    const ok = await confirm({
      title: `Approve Shift Swap ${swap.code}?`,
      text: `Approve shift exchange between ${swap.requester} and ${swap.swapWith} on ${swap.date}.`,
      icon: 'question',
      confirmButtonText: 'Approve Swap',
      cancelButtonText: 'Cancel'
    });
    if (!ok) return;

    const res = await apiClient.patch(`/shifts/swaps/${swap.id}/approve`, {});
    if (!res.error) {
      toast.success('Shift Swap Approved', `Request ${swap.code} approved successfully!`);
      loadSwaps();
    }
  };

  const handleReject = async (swap: any) => {
    const ok = await confirm({
      title: `Reject Shift Swap ${swap.code}?`,
      text: `Reject shift exchange between ${swap.requester} and ${swap.swapWith}.`,
      icon: 'warning',
      confirmButtonText: 'Reject Request',
      cancelButtonText: 'Cancel',
      isDangerous: true
    });
    if (!ok) return;

    const res = await apiClient.patch(`/shifts/swaps/${swap.id}/reject`, {});
    if (!res.error) {
      toast.success('Shift Swap Rejected', `Request ${swap.code} rejected.`);
      loadSwaps();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{t('nav.dashboard', 'Dashboard')}</span>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-slate-700">{t('shifts.shift_swap_requests', 'Shift Swap Requests')}</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{t('shifts.shift_swap_requests', 'Shift Swap Requests')}</h1>
          <p className="text-xs text-slate-500">
            {t('shifts.swap_requests_subtitle', 'View and manage employee shift exchange requests.')}
          </p>
        </div>

        <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          <span>{t('shifts.new_request', 'New Request')}</span>
        </button>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-blue-600">
            <RotateCcw className="h-5 w-5" />
            <span className="text-[10px] font-bold text-slate-400">{t('common.total', 'Total')}</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{swaps.length || 24}</p>
          <p className="text-xs font-semibold text-slate-600">{t('shifts.all_swap_requests', 'All shift swap requests')}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-amber-500">
            <Clock className="h-5 w-5" />
            <span className="text-[10px] font-bold text-amber-600">{t('common.pending', 'Pending')}</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-600">{swaps.filter(s => s.status === 'pending').length || 8}</p>
          <p className="text-xs font-semibold text-slate-600">{t('shifts.awaiting_approval', 'Awaiting approval')}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600">
            <CheckCircle className="h-5 w-5" />
            <span className="text-[10px] font-bold text-emerald-600">{t('common.approved', 'Approved')}</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{swaps.filter(s => s.status === 'approved').length || 12}</p>
          <p className="text-xs font-semibold text-slate-600">{t('shifts.approved_requests', 'Approved requests')}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-rose-500">
            <XCircle className="h-5 w-5" />
            <span className="text-[10px] font-bold text-rose-600">{t('common.rejected', 'Rejected')}</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-rose-600">{swaps.filter(s => s.status === 'rejected').length || 4}</p>
          <p className="text-xs font-semibold text-slate-600">{t('shifts.rejected_requests', 'Rejected requests')}</p>
        </div>
      </div>

      {/* Main Table & Slide-Over Drawer Split */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Table Area (8 Cols) */}
        <div className="space-y-4 lg:col-span-8">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-600">
                <tr>
                  <th className="px-4 py-3">{t('shifts.request_id', 'Request ID')}</th>
                  <th className="px-4 py-3">{t('shifts.requester', 'Requester')}</th>
                  <th className="px-4 py-3">{t('shifts.swap_with', 'Swap With')}</th>
                  <th className="px-4 py-3">{t('common.date', 'Date')}</th>
                  <th className="px-4 py-3">{t('shifts.shift_transition', 'Shift Transition')}</th>
                  <th className="px-4 py-3">{t('common.reason', 'Reason')}</th>
                  <th className="px-4 py-3">{t('common.status', 'Status')}</th>
                  <th className="w-10 px-4 py-3 text-center">{t('common.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {swaps.map((req) => (
                  <tr
                    key={req.code}
                    onClick={() => setSelectedSwap(req)}
                    className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-4 py-3 font-semibold text-blue-600">{req.code}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{req.requester}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{req.swapWith}</td>
                    <td className="px-4 py-3 text-slate-600">{req.date}</td>
                    <td className="px-4 py-3 text-slate-600">{req.from} &rarr; {req.to}</td>
                    <td className="px-4 py-3 text-slate-600">{req.reason}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${
                          req.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : req.status === 'pending'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {t(`status.${req.status}`, req.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button className="rounded p-1 text-slate-400 hover:bg-slate-100">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Slide-over Drawer (4 Cols) */}
        <div className="space-y-6 lg:col-span-4">
          {selectedSwap && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{t('shifts.request_details', 'Request Details')}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${
                    selectedSwap.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                    selectedSwap.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {t(`status.${selectedSwap.status}`, selectedSwap.status)}
                  </span>
                </div>
                <button onClick={() => setSelectedSwap(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <p className="font-bold text-blue-600 text-sm">{selectedSwap.code}</p>
                  <p className="text-[10px] text-slate-400">{t('shifts.submitted_on', 'Submitted on')} {selectedSwap.submittedOn}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                  <div className="rounded-lg bg-slate-50 p-2.5 space-y-1">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase">{t('shifts.requester', 'Requester')}</p>
                    <p className="font-bold text-slate-900">{selectedSwap.requester}</p>
                    <p className="text-[10px] text-slate-500">{selectedSwap.reqDept}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2.5 space-y-1">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase">{t('shifts.swap_with', 'Swap With')}</p>
                    <p className="font-bold text-slate-900">{selectedSwap.swapWith}</p>
                    <p className="text-[10px] text-slate-500">{selectedSwap.swapDept}</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">{t('common.date', 'Date')}</span>
                    <span className="font-semibold text-slate-800">{selectedSwap.date}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">{t('shifts.transition', 'Current → Requested')}</span>
                    <span className="font-semibold text-blue-600">{selectedSwap.currentShift} &rarr; {selectedSwap.requestedShift}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">{t('common.reason', 'Reason')}</span>
                    <p className="mt-0.5 text-slate-700 bg-slate-50 p-2 rounded-lg">{selectedSwap.reason}</p>
                  </div>
                </div>

                {selectedSwap.status === 'pending' && (
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleApprove(selectedSwap)}
                      className="flex-1 rounded-xl bg-emerald-600 py-2 font-semibold text-white hover:bg-emerald-700"
                    >
                      {t('shifts.approve', 'Approve')}
                    </button>
                    <button
                      onClick={() => handleReject(selectedSwap)}
                      className="flex-1 rounded-xl bg-rose-600 py-2 font-semibold text-white hover:bg-rose-700"
                    >
                      {t('shifts.reject', 'Reject')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
