import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ScrollText,
  Download,
  Filter,
  X,
  ShieldAlert,
  FileText,
  HardDrive,
  Database,
  Sliders,
  Calculator,
  PieChart,
  Clock,
  Check,
  Sparkles,
} from 'lucide-react';
import { getAuditEvents } from '../api/client';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import type { Column } from '../components/DataTable';
import ErrorState from '../components/ErrorState';
import { formatDateTime } from '../api/utils';
import type { AuditEvent } from '../api/types';

const actionColors: Record<string, string> = {
  certificate_created: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  renewal_triggered: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  renewal_job_created: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  renewal_completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  deployment_completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  deployment_failed: 'bg-red-500/15 text-red-400 border-red-500/30',
  expiration_alert_sent: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  agent_registered: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  policy_violated: 'bg-red-500/15 text-red-400 border-red-500/30',
  certificate_revoked: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const RESOURCE_TYPES = ['', 'certificate', 'agent', 'job', 'notification', 'policy', 'target', 'issuer'];

const TIME_RANGES = [
  { label: 'Tất cả thời gian (All time)', value: '' },
  { label: '1 giờ qua (Last 1 hour)', value: '1h' },
  { label: '24 giờ qua (Last 24h)', value: '24h' },
  { label: '7 ngày qua (Last 7 days)', value: '7d' },
  { label: '30 ngày qua (Last 30 days)', value: '30d' },
  { label: '90 ngày qua (Last 90 days)', value: '90d' },
  { label: '180 ngày qua (6 tháng)', value: '180d' },
  { label: '365 ngày qua (1 năm)', value: '365d' },
];

const LIMIT_OPTIONS = [
  { label: '50 bản ghi', value: '50' },
  { label: '100 bản ghi', value: '100' },
  { label: '200 bản ghi (Mặc định)', value: '200' },
  { label: '500 bản ghi', value: '500' },
  { label: '1,000 bản ghi', value: '1000' },
  { label: '2,500 bản ghi', value: '2500' },
  { label: '5,000 bản ghi', value: '5000' },
  { label: '10,000 bản ghi', value: '10000' },
];

const CATEGORIES = [
  { label: 'All categories', value: '' },
  { label: 'Cert lifecycle', value: 'cert_lifecycle' },
  { label: 'Auth', value: 'auth' },
  { label: 'Config', value: 'config' },
];

// Utility: format bytes to human readable string
function formatBytes(bytes: number, decimals = 2): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportCSV(events: AuditEvent[]) {
  const headers = ['ID', 'Action', 'Actor', 'Actor Type', 'Resource Type', 'Resource ID', 'Details', 'Timestamp'];
  const rows = events.map((e) => [
    e.id,
    e.action,
    e.actor,
    e.actor_type,
    e.resource_type,
    e.resource_id,
    JSON.stringify(e.details || {}),
    e.timestamp,
  ]);
  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  downloadFile(csv, `audit-trail-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
}

function exportJSON(events: AuditEvent[]) {
  const json = JSON.stringify(events, null, 2);
  downloadFile(json, `audit-trail-${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
}

export default function AuditPage() {
  const [resourceType, setResourceType] = useState('');
  const [actorFilter, setActorFilter] = useState('');
  const [timeRange, setTimeRange] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [category, setCategory] = useState('');
  const [perPage, setPerPage] = useState('200');
  const [showEstimator, setShowEstimator] = useState(true);

  const params: Record<string, string> = {};
  if (resourceType) params.resource_type = resourceType;
  if (actorFilter) params.actor = actorFilter;
  if (actionFilter) params.action = actionFilter;
  if (category) params.category = category;
  if (perPage) params.per_page = perPage;

  if (timeRange) {
    let hours = 24;
    if (timeRange === '1h') hours = 1;
    else if (timeRange === '24h') hours = 24;
    else if (timeRange === '7d') hours = 168;
    else if (timeRange === '30d') hours = 720;
    else if (timeRange === '90d') hours = 2160;
    else if (timeRange === '180d') hours = 4320;
    else if (timeRange === '365d') hours = 8760;
    params.since = new Date(Date.now() - hours * 3600 * 1000).toISOString();
  }

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['audit', params],
    queryFn: () => getAuditEvents(params),
    refetchInterval: 30000,
  });

  const filtered = data?.data || [];
  const totalCount = data?.total ?? filtered.length;

  // Real-time Storage & Memory Estimation
  const actualJsonSize = useMemo(() => {
    if (!filtered.length) return 0;
    return new Blob([JSON.stringify(filtered)]).size;
  }, [filtered]);

  const avgBytesPerRecord = useMemo(() => {
    if (!filtered.length) return 320; // Default estimate per record: ~320 bytes
    return Math.round(actualJsonSize / filtered.length);
  }, [filtered, actualJsonSize]);

  const selectedLimitNumber = parseInt(perPage, 10) || 200;
  const estimatedStorageForLimit = selectedLimitNumber * avgBytesPerRecord;
  const estimatedCSVSize = Math.round(actualJsonSize * 0.75);

  const columns: Column<AuditEvent>[] = [
    {
      key: 'action',
      label: 'Hành Động (Action)',
      render: (e) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold border ${
            actionColors[e.action] || 'bg-surface-muted text-ink border-surface-border'
          }`}
        >
          {e.action.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'actor',
      label: 'Người Thực Hiện (Actor)',
      render: (e) => (
        <div>
          <div className="font-bold text-xs text-ink">{e.actor}</div>
          <div className="text-[10px] text-ink-faint font-mono">{e.actor_type}</div>
        </div>
      ),
    },
    {
      key: 'resource',
      label: 'Đối Tượng (Resource)',
      render: (e) => (
        <div>
          <div className="text-xs text-ink font-semibold">{e.resource_type}</div>
          <div className="text-[10px] text-ink-faint font-mono">{e.resource_id}</div>
        </div>
      ),
    },
    {
      key: 'details',
      label: 'Chi Tiết (Details)',
      render: (e) => {
        if (!e.details || Object.keys(e.details).length === 0) return <span className="text-ink-faint text-xs">&mdash;</span>;
        return (
          <span
            className="text-[11px] text-ink-muted font-mono bg-surface-muted/60 px-2 py-1 rounded border border-surface-border truncate max-w-xs block"
            title={JSON.stringify(e.details, null, 2)}
          >
            {JSON.stringify(e.details).slice(0, 60)}
          </span>
        );
      },
    },
    {
      key: 'time',
      label: 'Thời Gian',
      render: (e) => <span className="text-xs text-ink-muted font-mono">{formatDateTime(e.timestamp)}</span>,
    },
  ];

  const hasFilters = resourceType || actorFilter || timeRange || actionFilter || category || perPage !== '200';

  return (
    <>
      <PageHeader
        title="Audit Trail"
        subtitle={data ? `${totalCount} nhật ký hoạt động được ghi lại` : undefined}
        action={
          filtered.length > 0 ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => exportCSV(filtered)}
                className="btn btn-ghost text-xs font-semibold px-3 py-1.5 rounded-xl border border-surface-border flex items-center gap-1.5"
                title={`Xuất file CSV (~${formatBytes(estimatedCSVSize)})`}
              >
                <Download className="w-3.5 h-3.5 text-emerald-500" />
                <span>Export CSV ({formatBytes(estimatedCSVSize)})</span>
              </button>
              <button
                onClick={() => exportJSON(filtered)}
                className="btn btn-ghost text-xs font-semibold px-3 py-1.5 rounded-xl border border-surface-border flex items-center gap-1.5"
                title={`Xuất file JSON (~${formatBytes(actualJsonSize)})`}
              >
                <Download className="w-3.5 h-3.5 text-emerald-500" />
                <span>Export JSON ({formatBytes(actualJsonSize)})</span>
              </button>
            </div>
          ) : undefined
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Retention & Storage Estimation Control Panel */}
        <div className="bg-surface border border-surface-border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-surface-border/60 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <HardDrive className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-ink">Cấu hình Lưu trữ & Ước tính Dung lượng Nhật ký</h3>
                <p className="text-xs text-ink-muted">Tùy chỉnh số lượng bản ghi hiển thị và ước tính dung lượng đĩa dữ liệu lưu trữ.</p>
              </div>
            </div>
            <button
              onClick={() => setShowEstimator(!showEstimator)}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 px-2.5 py-1 rounded-lg border border-brand-200 hover:bg-brand-50 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{showEstimator ? 'Thu gọn' : 'Mở rộng'}</span>
            </button>
          </div>

          {showEstimator && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Stat 1: Display Limit Selection */}
              <div className="bg-surface-muted/40 p-3.5 rounded-xl border border-surface-border/60 space-y-1.5">
                <div className="text-xs font-semibold text-ink-muted flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-brand-500" />
                  <span>Giới hạn bản ghi (Per Page):</span>
                </div>
                <select
                  value={perPage}
                  onChange={(e) => setPerPage(e.target.value)}
                  className="w-full bg-white border border-surface-border rounded-lg px-3 py-1.5 text-xs text-ink font-semibold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                >
                  {LIMIT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="text-[11px] text-ink-muted">Ước tính tải: ~{formatBytes(estimatedStorageForLimit)}</div>
              </div>

              {/* Stat 2: Time Range Retention Selection */}
              <div className="bg-surface-muted/40 p-3.5 rounded-xl border border-surface-border/60 space-y-1.5">
                <div className="text-xs font-semibold text-ink-muted flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-500" />
                  <span>Khoảng thời gian lưu (Time Range):</span>
                </div>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="w-full bg-white border border-surface-border rounded-lg px-3 py-1.5 text-xs text-ink font-semibold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                >
                  {TIME_RANGES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <div className="text-[11px] text-ink-muted">{timeRange ? `Lọc theo thời gian ${timeRange}` : 'Không giới hạn thời gian'}</div>
              </div>

              {/* Stat 3: Actual Size Metric */}
              <div className="bg-surface-muted/40 p-3.5 rounded-xl border border-surface-border/60 space-y-1">
                <div className="text-xs font-semibold text-ink-muted flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Dung lượng thực tế (Loaded Size):</span>
                </div>
                <div className="text-lg font-bold text-ink font-mono">{formatBytes(actualJsonSize)}</div>
                <div className="text-[11px] text-ink-muted">{filtered.length} bản ghi hiện tại (~{avgBytesPerRecord} B/bản ghi)</div>
              </div>

              {/* Stat 4: Estimated Storage Projection */}
              <div className="bg-surface-muted/40 p-3.5 rounded-xl border border-surface-border/60 space-y-1">
                <div className="text-xs font-semibold text-ink-muted flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-amber-500" />
                  <span>Dung lượng lưu 1 tháng (Estimate):</span>
                </div>
                <div className="text-lg font-bold text-amber-600 font-mono">
                  ~{formatBytes(selectedLimitNumber * avgBytesPerRecord * 30)}
                </div>
                <div className="text-[11px] text-ink-muted">Dựa trên trung bình ~{selectedLimitNumber} log/ngày</div>
              </div>
            </div>
          )}
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-surface p-4 rounded-2xl border border-surface-border shadow-sm">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-semibold text-ink">Bộ lọc nhật ký:</span>
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-surface-muted border border-surface-border rounded-xl px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-emerald-500 font-medium"
            data-testid="audit-category-filter"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          <select
            value={resourceType}
            onChange={(e) => setResourceType(e.target.value)}
            className="bg-surface-muted border border-surface-border rounded-xl px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-emerald-500 font-medium"
          >
            <option value="">All resources</option>
            {RESOURCE_TYPES.filter(Boolean).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Filter by actor..."
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            className="bg-surface-muted border border-surface-border rounded-xl px-3 py-1.5 text-xs text-ink placeholder-ink-faint focus:outline-none focus:border-emerald-500 w-36 font-medium"
          />

          <input
            type="text"
            placeholder="Filter by action..."
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-surface-muted border border-surface-border rounded-xl px-3 py-1.5 text-xs text-ink placeholder-ink-faint focus:outline-none focus:border-emerald-500 w-36 font-medium"
          />

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-surface-muted border border-surface-border rounded-xl px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-emerald-500 font-medium"
          >
            {TIME_RANGES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>

          {hasFilters && (
            <button
              onClick={() => {
                setResourceType('');
                setActorFilter('');
                setTimeRange('');
                setActionFilter('');
                setCategory('');
                setPerPage('200');
              }}
              className="text-xs text-rose-500 hover:text-rose-600 font-semibold transition-colors flex items-center gap-1 ml-auto"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear filters</span>
            </button>
          )}
        </div>

        {/* Table Container */}
        <div className="bg-surface rounded-2xl border border-surface-border shadow-sm overflow-hidden">
          {error ? (
            <ErrorState error={error as Error} onRetry={() => refetch()} />
          ) : (
            <DataTable columns={columns} data={filtered} isLoading={isLoading} emptyMessage="No audit events" />
          )}
        </div>
      </div>
    </>
  );
}
