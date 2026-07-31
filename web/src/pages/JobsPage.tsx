import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ListTodo,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  XCircle,
  Filter,
  Search,
  Check,
  X,
  Server,
  ShieldCheck,
  FileCode,
} from 'lucide-react';
import { useTrackedMutation } from '../hooks/useTrackedMutation';
import { useListParams } from '../hooks/useListParams';
import { getJobs, cancelJob, approveRenewal, rejectRenewal } from '../api/client';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import type { Column } from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import ErrorState from '../components/ErrorState';
import { formatDateTime } from '../api/utils';
import type { Job } from '../api/types';

function RejectModal({ job, onClose, onReject }: { job: Job; onClose: () => void; onReject: (reason: string) => void }) {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-surface border border-surface-border rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-surface-border pb-3">
          <h3 className="text-base font-bold text-ink flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-400" />
            <span>Từ chối Yêu cầu Gia hạn</span>
          </h3>
          <button onClick={onClose} className="text-ink-muted hover:text-ink text-xs p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2 text-xs">
          <p className="text-ink-muted">
            Từ chối tiến trình <span className="font-mono text-emerald-400 font-bold">{job.id}</span> cấp cho chứng chỉ <span className="font-mono text-ink font-semibold">{job.certificate_id}</span>.
          </p>
          <div>
            <label className="block text-xs font-semibold text-ink mb-1">Lý do từ chối *</label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Nhập lý do cụ thể..."
              className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-red-400"
              rows={3}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-3 border-t border-surface-border text-xs">
          <button onClick={onClose} className="btn btn-ghost px-4 py-2 rounded-xl">
            Hủy bỏ
          </button>
          <button
            onClick={() => onReject(reason)}
            disabled={!reason.trim()}
            className="btn bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-xl disabled:opacity-50"
          >
            Xác nhận Từ chối
          </button>
        </div>
      </div>
    </div>
  );
}

function VerificationBadge({ status }: { status?: string }) {
  if (!status) return <span className="text-xs text-ink-faint">—</span>;
  const styles: Record<string, string> = {
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    failed: 'bg-red-500/15 text-red-400 border-red-500/30',
    pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    skipped: 'bg-surface-muted text-ink-muted border-surface-border',
  };
  const labels: Record<string, string> = {
    success: 'Đã xác minh',
    failed: 'Thất bại',
    pending: 'Đang chờ',
    skipped: 'Bỏ qua',
  };
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono border font-semibold ${styles[status] || 'bg-surface-muted text-ink-muted border-surface-border'}`}>
      {labels[status] || status}
    </span>
  );
}

export default function JobsPage() {
  const { params: listParams, setPage, setPageSize, setFilter } = useListParams({ pageSize: 25 });
  const statusFilter = listParams.filters.status ?? '';
  const typeFilter = listParams.filters.type ?? '';
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectingJob, setRejectingJob] = useState<Job | null>(null);

  const page = listParams.page;
  const perPage = listParams.pageSize;

  const queryParams: Record<string, string> = {
    page: String(page),
    per_page: String(perPage),
  };
  if (statusFilter) queryParams.status = statusFilter;
  if (typeFilter) queryParams.type = typeFilter;

  // Main table query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['jobs', queryParams],
    queryFn: () => getJobs(queryParams),
    refetchInterval: 10000,
  });

  // Category total queries for 100% accurate Score Bar counts from database
  const { data: awaitingData } = useQuery({
    queryKey: ['jobs-count-awaiting'],
    queryFn: () => getJobs({ status: 'AwaitingApproval', page: '1', per_page: '1' }),
    refetchInterval: 10000,
  });
  const { data: awaitingCSRData } = useQuery({
    queryKey: ['jobs-count-awaiting-csr'],
    queryFn: () => getJobs({ status: 'AwaitingCSR', page: '1', per_page: '1' }),
    refetchInterval: 10000,
  });
  const { data: runningData } = useQuery({
    queryKey: ['jobs-count-running'],
    queryFn: () => getJobs({ status: 'Running', page: '1', per_page: '1' }),
    refetchInterval: 10000,
  });
  const { data: completedData } = useQuery({
    queryKey: ['jobs-count-completed'],
    queryFn: () => getJobs({ status: 'Completed', page: '1', per_page: '1' }),
    refetchInterval: 10000,
  });
  const { data: failedData } = useQuery({
    queryKey: ['jobs-count-failed'],
    queryFn: () => getJobs({ status: 'Failed', page: '1', per_page: '1' }),
    refetchInterval: 10000,
  });

  const cancelMutation = useTrackedMutation({
    mutationFn: cancelJob,
    invalidates: [['jobs'], ['jobs-count-awaiting'], ['jobs-count-awaiting-csr'], ['jobs-count-running'], ['jobs-count-completed'], ['jobs-count-failed']],
  });

  const approveMutation = useTrackedMutation({
    mutationFn: approveRenewal,
    invalidates: [['jobs'], ['jobs-count-awaiting'], ['jobs-count-awaiting-csr'], ['jobs-count-running'], ['jobs-count-completed'], ['jobs-count-failed']],
  });

  const rejectMutation = useTrackedMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectRenewal(id, reason),
    invalidates: [['jobs'], ['jobs-count-awaiting'], ['jobs-count-awaiting-csr'], ['jobs-count-running'], ['jobs-count-completed'], ['jobs-count-failed']],
    onSuccess: () => {
      setRejectingJob(null);
    },
  });

  const jobsList = data?.data || [];
  const totalJobs = data?.total || 0;

  // Server-side accurate counts
  const awaitingCount = awaitingData?.total || 0;
  const awaitingCSRCount = awaitingCSRData?.total || 0;
  const runningCount = runningData?.total || 0;
  const completedCount = completedData?.total || 0;
  const failedCount = failedData?.total || 0;

  const filteredJobs = jobsList.filter(j => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      j.id.toLowerCase().includes(q) ||
      j.certificate_id.toLowerCase().includes(q) ||
      (j.agent_id && j.agent_id.toLowerCase().includes(q)) ||
      j.type.toLowerCase().includes(q)
    );
  });

  const columns: Column<Job>[] = [
    {
      key: 'id',
      label: 'Mã Tiến Trình (Job ID)',
      render: (j) => (
        <div className="space-y-0.5">
          <Link
            to={`/jobs/${j.id}`}
            className="font-mono text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <ListTodo className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{j.id}</span>
          </Link>
          <div className="text-[10px] text-ink-faint font-mono uppercase tracking-wider">{j.type}</div>
        </div>
      ),
    },
    { key: 'status', label: 'Trạng Thái', render: (j) => <StatusBadge status={j.status} /> },
    {
      key: 'cert',
      label: 'Chứng Chỉ',
      render: (j) => (
        <div className="font-mono text-xs text-ink font-semibold flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span>{j.certificate_id}</span>
        </div>
      ),
    },
    {
      key: 'agent',
      label: 'Agent Giao Phụ Trách',
      render: (j) =>
        j.agent_id ? (
          <Link
            to={`/agents/${j.agent_id}`}
            className="text-xs text-emerald-300 hover:text-emerald-200 font-mono flex items-center gap-1 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <Server className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{j.agent_id}</span>
          </Link>
        ) : (
          <span className="text-xs text-ink-faint font-mono">—</span>
        ),
    },
    {
      key: 'attempts',
      label: 'Số Lần Thử',
      render: (j) => (
        <span className="text-xs font-mono text-ink-muted">
          {j.attempts} / {j.max_attempts}
        </span>
      ),
    },
    {
      key: 'error',
      label: 'Ghi Chú Lỗi',
      render: (j) =>
        j.status === 'Failed' && j.last_error ? (
          <span className="text-xs text-red-400 truncate max-w-[200px] inline-block font-mono" title={j.last_error}>
            {j.last_error.length > 70 ? j.last_error.substring(0, 70) + '...' : j.last_error}
          </span>
        ) : (
          <span className="text-xs text-ink-faint">—</span>
        ),
    },
    {
      key: 'scheduled',
      label: 'Thời Gian Lên Lịch',
      render: (j) => <span className="text-xs text-ink-muted font-mono">{formatDateTime(j.scheduled_at)}</span>,
    },
    {
      key: 'completed',
      label: 'Thời Gian Hoàn Thành',
      render: (j) => <span className="text-xs text-ink-muted font-mono">{formatDateTime(j.completed_at)}</span>,
    },
    {
      key: 'verification',
      label: 'Xác Minh Sau Phân Phối',
      render: (j) =>
        j.type === 'Deployment' ? <VerificationBadge status={j.verification_status} /> : <span className="text-xs text-ink-faint">—</span>,
    },
    {
      key: 'actions',
      label: '',
      render: (j) => (
        <div className="flex items-center justify-end gap-2">
          {j.status === 'AwaitingApproval' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  approveMutation.mutate(j.id);
                }}
                disabled={approveMutation.isPending}
                className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                title="Duyệt cấp chứng chỉ"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Duyệt</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setRejectingJob(j);
                }}
                className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/40 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                title="Từ chối yêu cầu"
              >
                <X className="w-3.5 h-3.5" />
                <span>Từ chối</span>
              </button>
            </>
          )}
          {(j.status === 'Pending' || j.status === 'Running' || j.status === 'AwaitingCSR') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                cancelMutation.mutate(j.id);
              }}
              className="px-2.5 py-1 bg-surface-muted hover:bg-red-500/20 text-red-400 border border-surface-border hover:border-red-500/30 rounded-lg text-xs font-medium transition-colors"
              title="Hủy tiến trình"
            >
              Hủy
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Theo Dõi Tiến Trình (Jobs)" subtitle={`${totalJobs} tiến trình hệ thống`} />

      {/* --- SCORE BAR / STAT CARDS THỐNG KÊ CHÍNH XÁC --- */}
      <div className="px-6 pt-4 pb-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 select-none">
        {/* Card 1: Total */}
        <div
          onClick={() => setFilter('status', null)}
          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
            !statusFilter
              ? 'bg-gradient-to-br from-emerald-950/80 to-teal-950/60 border-emerald-500/60 shadow-lg shadow-emerald-900/30 ring-1 ring-emerald-400/40'
              : 'bg-surface/80 border-surface-border hover:border-emerald-500/40 hover:bg-surface-muted'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Tất Cả</span>
            <ListTodo className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-white font-mono">{totalJobs}</div>
          <div className="text-[9px] text-ink-muted mt-0.5">Tổng số tiến trình</div>
        </div>

        {/* Card 2: Awaiting Approval */}
        <div
          onClick={() => setFilter('status', 'AwaitingApproval')}
          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'AwaitingApproval'
              ? 'bg-gradient-to-br from-amber-950/80 to-yellow-950/60 border-amber-500/60 shadow-lg shadow-amber-900/30 ring-1 ring-amber-400/40'
              : 'bg-surface/80 border-surface-border hover:border-amber-500/40 hover:bg-surface-muted'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Chờ Duyệt</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-extrabold text-amber-300 font-mono">{awaitingCount}</div>
          <div className="text-[9px] text-amber-400/80 mt-0.5">Cần phê duyệt</div>
        </div>

        {/* Card 3: Awaiting CSR */}
        <div
          onClick={() => setFilter('status', 'AwaitingCSR')}
          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'AwaitingCSR'
              ? 'bg-gradient-to-br from-purple-950/80 to-indigo-950/60 border-purple-500/60 shadow-lg shadow-purple-900/30 ring-1 ring-purple-400/40'
              : 'bg-surface/80 border-surface-border hover:border-purple-500/40 hover:bg-surface-muted'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Chờ CSR</span>
            <FileCode className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-extrabold text-purple-300 font-mono">{awaitingCSRCount}</div>
          <div className="text-[9px] text-purple-400/80 mt-0.5">Agent chưa gửi CSR</div>
        </div>

        {/* Card 4: Running */}
        <div
          onClick={() => setFilter('status', 'Running')}
          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'Running'
              ? 'bg-gradient-to-br from-cyan-950/80 to-blue-950/60 border-cyan-500/60 shadow-lg shadow-cyan-900/30 ring-1 ring-cyan-400/40'
              : 'bg-surface/80 border-surface-border hover:border-cyan-500/40 hover:bg-surface-muted'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Đang Chạy</span>
            <PlayCircle className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-extrabold text-cyan-300 font-mono">{runningCount}</div>
          <div className="text-[9px] text-cyan-400/80 mt-0.5">Đang xử lý thực tế</div>
        </div>

        {/* Card 5: Completed */}
        <div
          onClick={() => setFilter('status', 'Completed')}
          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'Completed'
              ? 'bg-gradient-to-br from-emerald-950/80 to-teal-950/60 border-emerald-500/60 shadow-lg shadow-emerald-900/30 ring-1 ring-emerald-400/40'
              : 'bg-surface/80 border-surface-border hover:border-emerald-500/40 hover:bg-surface-muted'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Hoàn Thành</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-emerald-300 font-mono">{completedCount}</div>
          <div className="text-[9px] text-emerald-400/80 mt-0.5">Thành công 100%</div>
        </div>

        {/* Card 6: Failed / Cancelled */}
        <div
          onClick={() => setFilter('status', 'Failed')}
          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'Failed' || statusFilter === 'Cancelled'
              ? 'bg-gradient-to-br from-rose-950/80 to-red-950/60 border-rose-500/60 shadow-lg shadow-rose-900/30 ring-1 ring-rose-400/40'
              : 'bg-surface/80 border-surface-border hover:border-rose-500/40 hover:bg-surface-muted'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Lỗi / Hủy</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-extrabold text-rose-300 font-mono">{failedCount}</div>
          <div className="text-[9px] text-rose-400/80 mt-0.5">Gặp sự cố</div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="px-6 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-surface-border bg-surface/50">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full max-w-md">
            <Search className="w-3.5 h-3.5 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo mã Job ID, Certificate ID, Agent..."
              className="w-full bg-surface-muted border border-surface-border rounded-xl pl-9 pr-3 py-1.5 text-xs text-ink focus:outline-none focus:border-emerald-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-ink-muted font-medium">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <span>Lọc:</span>
          </div>

          <select
            value={statusFilter}
            onChange={e => setFilter('status', e.target.value || null)}
            className="bg-surface-muted border border-surface-border rounded-xl px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-emerald-400 font-medium"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Pending">Pending (Chờ xử lý)</option>
            <option value="AwaitingApproval">Awaiting Approval (Chờ duyệt)</option>
            <option value="AwaitingCSR">Awaiting CSR (Chờ CSR)</option>
            <option value="Running">Running (Đang thực thi)</option>
            <option value="Completed">Completed (Hoàn thành)</option>
            <option value="Failed">Failed (Lỗi)</option>
            <option value="Cancelled">Cancelled (Đã hủy)</option>
          </select>

          <select
            value={typeFilter}
            onChange={e => setFilter('type', e.target.value || null)}
            className="bg-surface-muted border border-surface-border rounded-xl px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-emerald-400 font-medium"
          >
            <option value="">Tất cả loại tiến trình</option>
            <option value="Renewal">Renewal (Gia hạn)</option>
            <option value="Issuance">Issuance (Cấp mới)</option>
            <option value="Deployment">Deployment (Phân phối)</option>
            <option value="Validation">Validation (Xác thực)</option>
          </select>
        </div>
      </div>

      {/* DATA TABLE WITH REUSABLE PAGINATION */}
      <div className="flex-1 overflow-y-auto">
        {error ? (
          <ErrorState error={error as Error} onRetry={() => refetch()} />
        ) : (
          <DataTable
            columns={columns}
            data={filteredJobs}
            isLoading={isLoading}
            emptyMessage="Không tìm thấy tiến trình (Job) nào phù hợp"
            pagination={{
              page,
              perPage,
              total: totalJobs,
              onPageChange: setPage,
              onPerPageChange: setPageSize,
            }}
          />
        )}
      </div>

      {rejectingJob && (
        <RejectModal
          job={rejectingJob}
          onClose={() => setRejectingJob(null)}
          onReject={(reason) => rejectMutation.mutate({ id: rejectingJob.id, reason })}
        />
      )}
    </>
  );
}
