import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  HeartPulse,
  Plus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  AlertOctagon,
  HelpCircle,
  X,
  Trash2,
  Check,
  Clock,
  Activity,
  Filter,
} from 'lucide-react';
import { useTrackedMutation } from '../hooks/useTrackedMutation';
import {
  listHealthChecks,
  createHealthCheck,
  deleteHealthCheck,
  acknowledgeHealthCheck,
  getHealthCheckSummary,
} from '../api/client';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import type { Column } from '../components/DataTable';
import ErrorState from '../components/ErrorState';
import StatusBadge from '../components/StatusBadge';
import { formatDateTime } from '../api/utils';
import type { EndpointHealthCheck, HealthCheckSummary } from '../api/types';

function CreateHealthCheckModal({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (data: Partial<EndpointHealthCheck>) => void;
}) {
  const [endpoint, setEndpoint] = useState('');
  const [expectedFingerprint, setExpectedFingerprint] = useState('');
  const [checkInterval, setCheckInterval] = useState('300');
  const [degradedThreshold, setDegradedThreshold] = useState('2');
  const [downThreshold, setDownThreshold] = useState('5');

  const handleSubmit = () => {
    onCreate({
      endpoint,
      expected_fingerprint: expectedFingerprint,
      check_interval_seconds: parseInt(checkInterval, 10),
      degraded_threshold: parseInt(degradedThreshold, 10),
      down_threshold: parseInt(downThreshold, 10),
      enabled: true,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-surface border border-surface-border rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between pb-3 border-b border-surface-border">
          <div className="flex items-center gap-2 font-bold text-sm text-ink">
            <HeartPulse className="w-4 h-4 text-emerald-400" />
            <span>Tạo Điểm Kiểm Tra Sức Khỏe Mới (New Health Check)</span>
          </div>
          <button onClick={onClose} className="text-ink-muted hover:text-ink text-xs p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-ink mb-1">
              Endpoint TLS <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={endpoint}
              onChange={e => setEndpoint(e.target.value)}
              placeholder="e.g., example.com:443 hoặc 10.0.1.12:8443"
              className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs font-mono text-ink focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="block font-semibold text-ink mb-1">Expected Fingerprint (SHA-256)</label>
            <input
              type="text"
              value={expectedFingerprint}
              onChange={e => setExpectedFingerprint(e.target.value)}
              placeholder="Optional: Tùy chọn tự động khớp vân tay chứng chỉ"
              className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs font-mono text-ink focus:outline-none focus:border-emerald-400"
            />
            <p className="text-[11px] text-ink-faint mt-1">Leave empty to auto-detect from first successful probe</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-ink mb-1">Check Interval (s)</label>
              <input
                type="number"
                value={checkInterval}
                onChange={e => setCheckInterval(e.target.value)}
                min="60"
                className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="block font-semibold text-ink mb-1">Degraded Threshold</label>
              <input
                type="number"
                value={degradedThreshold}
                onChange={e => setDegradedThreshold(e.target.value)}
                min="1"
                className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="block font-semibold text-ink mb-1">Down Threshold</label>
              <input
                type="number"
                value={downThreshold}
                onChange={e => setDownThreshold(e.target.value)}
                min="1"
                className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-surface-border">
          <button onClick={onClose} className="btn btn-ghost text-xs px-4 py-2 rounded-xl">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!endpoint.trim()}
            className="btn btn-primary text-xs font-semibold px-4 py-2 rounded-xl disabled:opacity-50"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryBar({ summary }: { summary?: HealthCheckSummary | null }) {
  const healthy = summary?.healthy ?? 0;
  const degraded = summary?.degraded ?? 0;
  const down = summary?.down ?? 0;
  const certMismatch = summary?.cert_mismatch ?? 0;
  const unknown = summary?.unknown ?? 0;

  const items = [
    { label: 'Healthy', count: healthy, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 },
    { label: 'Degraded', count: degraded, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: AlertTriangle },
    { label: 'Down', count: down, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', icon: XCircle },
    { label: 'Cert Mismatch', count: certMismatch, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', icon: AlertOctagon },
    { label: 'Unknown', count: unknown, color: 'text-slate-400', bg: 'bg-surface-muted border-surface-border', icon: HelpCircle },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {items.map(item => {
        const Icon = item.icon;
        return (
          <div key={item.label} className={`p-4 rounded-2xl border ${item.bg} flex items-center justify-between shadow-sm`}>
            <div>
              <div className="text-[11px] font-semibold text-ink-muted">{item.label}</div>
              <div className={`text-2xl font-bold font-mono mt-1 ${item.color}`}>{item.count}</div>
            </div>
            <Icon className={`w-5 h-5 ${item.color}`} />
          </div>
        );
      })}
    </div>
  );
}

export default function HealthMonitorPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['health-checks', statusFilter],
    queryFn: () => listHealthChecks({ status: statusFilter, page: 1, per_page: 100 }),
    refetchInterval: 30000,
  });

  const summaryQuery = useQuery({
    queryKey: ['health-checks-summary'],
    queryFn: () => getHealthCheckSummary(),
    refetchInterval: 30000,
  });

  const healthCheckInvalidates = [['health-checks'], ['health-checks-summary']];

  const createMutation = useTrackedMutation({
    mutationFn: createHealthCheck,
    invalidates: healthCheckInvalidates,
    onSuccess: () => {
      setShowCreate(false);
    },
  });

  const deleteMutation = useTrackedMutation({
    mutationFn: deleteHealthCheck,
    invalidates: healthCheckInvalidates,
  });

  const acknowledgeMutation = useTrackedMutation({
    mutationFn: acknowledgeHealthCheck,
    invalidates: healthCheckInvalidates,
  });

  const columns: Column<EndpointHealthCheck>[] = [
    {
      key: 'endpoint',
      label: 'Endpoint',
      render: (row) => {
        const errMsg = row.failure_reason || (row as unknown as Record<string, string>).last_error;
        return (
          <div>
            <div className="font-bold text-sm text-ink font-mono">{row.endpoint}</div>
            {errMsg && (
              <div className="text-[11px] text-red-400 font-mono truncate max-w-xs" title={errMsg}>
                {errMsg}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'response_time_ms',
      label: 'Response Time (ms)',
      render: (row) => (
        <span className="font-mono text-xs text-emerald-400 font-bold">
          {row.response_time_ms ? `${row.response_time_ms}ms` : '—'}
        </span>
      ),
    },
    {
      key: 'last_checked_at',
      label: 'Last Checked',
      render: (row) => (
        <span className="font-mono text-xs text-ink-muted">
          {row.last_checked_at ? formatDateTime(row.last_checked_at) : '—'}
        </span>
      ),
    },
    {
      key: 'last_transition_at',
      label: 'Last Transition',
      render: (row) => (
        <span className="font-mono text-xs text-ink-muted">
          {row.last_transition_at ? formatDateTime(row.last_transition_at) : '—'}
        </span>
      ),
    },
    {
      key: 'acknowledged',
      label: 'Acknowledged',
      render: (row) => (
        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${row.acknowledged ? 'bg-emerald-500/15 text-emerald-400' : 'text-ink-faint'}`}>
          {row.acknowledged ? '✓ Yes' : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2 justify-end">
          {!row.acknowledged && row.status !== 'healthy' && (
            <button
              onClick={() => acknowledgeMutation.mutate(row.id)}
              className="px-2.5 py-1 text-xs text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg transition-colors font-semibold flex items-center gap-1"
              disabled={acknowledgeMutation.isPending}
            >
              <Check className="w-3 h-3" />
              <span>Acknowledge</span>
            </button>
          )}
          <button
            onClick={() => deleteMutation.mutate(row.id)}
            className="p-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
            disabled={deleteMutation.isPending}
            title="Delete Check"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const checks = data?.data || [];

  return (
    <>
      <PageHeader
        title="Health Monitor"
        subtitle="Theo dõi sức khỏe các điểm TLS Endpoint và trạng thái gia hạn chứng chỉ"
        action={
          <button
            onClick={() => setShowCreate(true)}
            className="btn btn-primary text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Health Check</span>
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Metric Summary Bar */}
        <SummaryBar summary={summaryQuery.data} />

        {/* Filter Bar */}
        <div className="flex items-center justify-between bg-surface p-4 rounded-2xl border border-surface-border shadow-sm">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-ink">Lọc theo trạng thái:</span>
            <select
              value={statusFilter || ''}
              onChange={e => setStatusFilter(e.target.value || undefined)}
              className="bg-surface-muted border border-surface-border rounded-xl px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-emerald-400"
            >
              <option value="">All Statuses</option>
              <option value="healthy">Healthy</option>
              <option value="degraded">Degraded</option>
              <option value="down">Down</option>
              <option value="cert_mismatch">Cert Mismatch</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-surface rounded-2xl border border-surface-border shadow-sm overflow-hidden">
          {error ? (
            <ErrorState error={error as Error} onRetry={refetch} />
          ) : (
            <DataTable<EndpointHealthCheck>
              columns={columns}
              data={checks}
              isLoading={isLoading}
              keyField="id"
              emptyMessage="No health checks configured"
            />
          )}
        </div>
      </div>

      {showCreate && (
        <CreateHealthCheckModal
          onClose={() => setShowCreate(false)}
          onCreate={data => createMutation.mutate(data)}
        />
      )}
    </>
  );
}
