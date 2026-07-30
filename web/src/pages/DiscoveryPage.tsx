import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Compass,
  Search,
  Filter,
  Layers,
  Shield,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Key,
  Globe,
  Folder,
  History,
  Sparkles,
  Link as LinkIcon,
  EyeOff,
} from 'lucide-react';
import { useTrackedMutation } from '../hooks/useTrackedMutation';
import {
  getDiscoveredCertificates,
  getDiscoverySummary,
  getDiscoveryScans,
  claimDiscoveredCertificate,
  dismissDiscoveredCertificate,
  getAgents,
} from '../api/client';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import type { Column } from '../components/DataTable';
import ErrorState from '../components/ErrorState';
import { formatDateTime } from '../api/utils';
import type { DiscoveredCertificate, DiscoveryScan } from '../api/types';

function sourceTypeBadge(agentId: string): { label: string; style: string; icon: typeof Globe } {
  switch (agentId) {
    case 'server-scanner':
      return { label: 'Network', style: 'bg-blue-500/15 text-blue-400 border-blue-500/30', icon: Globe };
    default:
      return { label: 'Filesystem', style: 'bg-surface-muted text-ink-muted border-surface-border', icon: Folder };
  }
}

function ClaimModal({ cert, onClose, onClaim }: { cert: DiscoveredCertificate; onClose: () => void; onClaim: (managedCertId: string) => void }) {
  const [managedCertId, setManagedCertId] = useState('');
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-surface border border-surface-border rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between pb-3 border-b border-surface-border">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <LinkIcon className="w-4 h-4" />
            <span>Liên Kết Chứng Chỉ (Claim)</span>
          </div>
          <button onClick={onClose} className="text-ink-muted hover:text-ink text-xs">✕</button>
        </div>

        <p className="text-xs text-ink-muted">
          Gắn kết chứng chỉ phát hiện <span className="font-mono font-bold text-ink">{cert.common_name}</span> vào một chứng chỉ quản lý hệ thống.
        </p>

        <div>
          <label className="block text-xs font-medium text-ink mb-1">Managed Certificate ID *</label>
          <input
            type="text"
            value={managedCertId}
            onChange={e => setManagedCertId(e.target.value)}
            placeholder="Ví dụ: mc-api-prod"
            className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-ink font-mono focus:outline-none focus:border-emerald-400"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="btn btn-ghost text-xs">
            Hủy
          </button>
          <button
            onClick={() => onClaim(managedCertId)}
            disabled={!managedCertId.trim()}
            className="btn btn-primary text-xs font-semibold px-4 py-2 rounded-xl disabled:opacity-50"
          >
            Claim Certificate
          </button>
        </div>
      </div>
    </div>
  );
}

function ScanHistoryPanel({ scans }: { scans: DiscoveryScan[] }) {
  if (scans.length === 0) return <p className="text-xs text-ink-muted py-4 text-center">Chưa có lịch sử quét nào</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left font-semibold text-ink-muted border-b border-surface-border bg-surface-muted/50">
            <th className="px-4 py-2">Agent ID</th>
            <th className="px-4 py-2">Thư Mục Quét</th>
            <th className="px-4 py-2">Tìm Thấy</th>
            <th className="px-4 py-2">Mới Phát Hiện</th>
            <th className="px-4 py-2">Lỗi</th>
            <th className="px-4 py-2">Thời Gian Quét</th>
            <th className="px-4 py-2">Khởi Tạo</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-border/50">
          {scans.map(s => (
            <tr key={s.id} className="hover:bg-surface-muted/60 transition-colors">
              <td className="px-4 py-2 font-mono text-ink-muted">{s.agent_id}</td>
              <td className="px-4 py-2 text-ink-muted max-w-xs truncate">{s.directories?.join(', ') || '—'}</td>
              <td className="px-4 py-2 font-bold text-ink">{s.certificates_found}</td>
              <td className="px-4 py-2 font-bold text-emerald-400">{s.certificates_new}</td>
              <td className="px-4 py-2">{s.errors_count > 0 ? <span className="text-red-400 font-bold">{s.errors_count}</span> : '0'}</td>
              <td className="px-4 py-2 text-ink-muted font-mono">{s.scan_duration_ms}ms</td>
              <td className="px-4 py-2 text-ink-muted font-mono">{formatDateTime(s.started_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DiscoveryPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [agentFilter, setAgentFilter] = useState('');
  const [claimingCert, setClaimingCert] = useState<DiscoveredCertificate | null>(null);
  const [showScans, setShowScans] = useState(false);

  const params: Record<string, string> = {};
  if (statusFilter) params.status = statusFilter;
  if (agentFilter) params.agent_id = agentFilter;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['discovered-certificates', params],
    queryFn: () => getDiscoveredCertificates(params),
    refetchInterval: 30000,
  });

  const { data: summary } = useQuery({
    queryKey: ['discovery-summary'],
    queryFn: getDiscoverySummary,
    refetchInterval: 30000,
  });

  const { data: scansData } = useQuery({
    queryKey: ['discovery-scans'],
    queryFn: () => getDiscoveryScans(),
    refetchInterval: (query) => {
      const scans = (query.state.data?.data ?? []) as DiscoveryScan[];
      const anyInFlight = scans.some((s) => !s.completed_at);
      return anyInFlight ? 2500 : 30000;
    },
  });

  const inFlightScans = (scansData?.data ?? []).filter((s) => !s.completed_at);

  const { data: agentsData } = useQuery({
    queryKey: ['agents-for-filter'],
    queryFn: () => getAgents({ per_page: '200' }),
  });

  const queryClient = useQueryClient();
  type DiscSnapshot = {
    prev?: { data: DiscoveredCertificate[]; total: number } | undefined;
  };

  const claimMutation = useTrackedMutation<unknown, Error, { id: string; managedCertId: string }, DiscSnapshot>({
    mutationFn: ({ id, managedCertId }) =>
      claimDiscoveredCertificate(id, managedCertId),
    invalidates: [['discovered-certificates'], ['discovery-summary']],
    onMutate: async ({ id }): Promise<DiscSnapshot> => {
      await queryClient.cancelQueries({ queryKey: ['discovered-certificates'] });
      const prev = queryClient.getQueryData(['discovered-certificates']) as DiscSnapshot['prev'];
      if (prev) {
        queryClient.setQueryData(['discovered-certificates'], {
          ...prev,
          data: prev.data.map((c) => (c.id === id ? { ...c, status: 'Managed' as const } : c)),
        });
      }
      return { prev };
    },
    onError: (err, _vars, snap) => {
      if (snap?.prev) queryClient.setQueryData(['discovered-certificates'], snap.prev);
      toast.error(`Claim failed: ${err.message}`);
    },
    onSuccess: () => {
      toast.success('Certificate claimed');
      setClaimingCert(null);
    },
  });

  const dismissMutation = useTrackedMutation<unknown, Error, string, DiscSnapshot>({
    mutationFn: dismissDiscoveredCertificate,
    invalidates: [['discovered-certificates'], ['discovery-summary']],
    onMutate: async (id): Promise<DiscSnapshot> => {
      await queryClient.cancelQueries({ queryKey: ['discovered-certificates'] });
      const prev = queryClient.getQueryData(['discovered-certificates']) as DiscSnapshot['prev'];
      if (prev) {
        queryClient.setQueryData(['discovered-certificates'], {
          ...prev,
          data: prev.data.map((c) => (c.id === id ? { ...c, status: 'Dismissed' as const } : c)),
        });
      }
      return { prev };
    },
    onError: (err, _id, snap) => {
      if (snap?.prev) queryClient.setQueryData(['discovered-certificates'], snap.prev);
      toast.error(`Dismiss failed: ${err.message}`);
    },
    onSuccess: () => toast.success('Discovery dismissed'),
  });

  const formatExpiry = (notAfter?: string) => {
    if (!notAfter) return '—';
    const d = new Date(notAfter);
    const now = new Date();
    const days = Math.floor((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) return <span className="text-red-400 font-bold">Hết hạn {Math.abs(days)}d trước</span>;
    if (days < 30) return <span className="text-amber-400 font-bold">Còn {days}d</span>;
    return <span className="text-ink-muted">{days}d left</span>;
  };

  const discoveryStatusStyle: Record<string, string> = {
    Unmanaged: 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30',
    Managed: 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    Dismissed: 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-muted text-ink-muted border border-surface-border',
  };

  const columns: Column<DiscoveredCertificate>[] = [
    {
      key: 'common_name',
      label: 'Common Name (CN)',
      render: (c) => (
        <div>
          <div className="font-bold text-sm text-ink">{c.common_name || '(no CN)'}</div>
          {c.sans?.length > 0 && (
            <div className="text-xs text-ink-muted truncate max-w-[220px]" title={c.sans.join(', ')}>
              SANs: {c.sans.slice(0, 2).join(', ')}{c.sans.length > 2 ? ` +${c.sans.length - 2}` : ''}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Trạng Thái',
      render: (c) => <span className={discoveryStatusStyle[c.status] || 'badge badge-neutral'}>{c.status}</span>,
    },
    {
      key: 'source',
      label: 'Nguồn Nguồn Phát Hiện',
      render: (c) => {
        const badge = sourceTypeBadge(c.agent_id);
        const Icon = badge.icon;
        return (
          <div>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${badge.style}`}>
              <Icon className="w-3 h-3" />
              <span>{badge.label}</span>
            </span>
            <div className="text-[11px] text-ink-faint font-mono truncate max-w-[200px] mt-1" title={c.source_path}>{c.source_path}</div>
          </div>
        );
      },
    },
    {
      key: 'issuer',
      label: 'Nhà Cấp Phát (Issuer)',
      render: (c) => <span className="text-xs text-ink-muted truncate max-w-[160px] block" title={c.issuer_dn}>{c.issuer_dn?.split(',')[0] || '—'}</span>,
    },
    {
      key: 'expiry',
      label: 'Hạn Sử Dụng',
      render: (c) => <span className="text-xs font-mono">{formatExpiry(c.not_after)}</span>,
    },
    {
      key: 'key_info',
      label: 'Thuật Toán Khóa',
      render: (c) => (
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-mono text-ink-muted">{c.key_algorithm}{c.key_size ? ` ${c.key_size}` : ''}</span>
          {c.is_ca && (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">CA</span>
          )}
        </div>
      ),
    },
    {
      key: 'fingerprint',
      label: 'Vân Tay SHA-256',
      render: (c) => <span className="font-mono text-[11px] text-ink-faint">{c.fingerprint_sha256?.substring(0, 16)}...</span>,
    },
    {
      key: 'actions',
      label: '',
      render: (c) => (
        c.status === 'Unmanaged' ? (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); setClaimingCert(c); }}
              className="px-2.5 py-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg transition-colors flex items-center gap-1"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Claim</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); dismissMutation.mutate(c.id); }}
              disabled={dismissMutation.isPending}
              className="px-2 py-1 text-xs font-medium text-ink-muted hover:text-ink transition-colors flex items-center gap-1"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Dismiss</span>
            </button>
          </div>
        ) : null
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Certificate Discovery"
        subtitle={data ? `${data.total} discovered certificates` : undefined}
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* In-flight Scan Banner */}
        {inFlightScans.length > 0 && (
          <div
            className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-300 shadow-sm"
            role="status"
            aria-live="polite"
            data-testid="discovery-inflight-panel"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <span className="text-xs font-bold text-amber-300">
                {inFlightScans.length} tiến trình quét đang chạy (in progress)
              </span>
              <span className="text-[11px] text-amber-400/70 font-mono">
                Auto-refreshing every 2.5s
              </span>
            </div>
            <ul className="space-y-1">
              {inFlightScans.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center gap-3 text-xs text-amber-200 font-mono"
                  data-testid={`discovery-inflight-row-${s.id}`}
                >
                  <span className="font-bold">{s.agent_id}</span>
                  <span>·</span>
                  <span>
                    {s.directories?.length || 0} {s.directories?.length === 1 ? 'directory' : 'directories'}
                  </span>
                  <span>·</span>
                  <span>
                    Bắt đầu: {formatDateTime(s.started_at)}
                  </span>
                  <span>·</span>
                  <span className="font-bold text-amber-300">
                    {s.certificates_found} tìm thấy
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Summary Stats Overview Bar */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface p-4 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-950/20 to-transparent flex items-center justify-between shadow-sm">
              <div>
                <div className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Unmanaged (Chưa Quản Lý)</span>
                </div>
                <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">{summary.Unmanaged || 0}</div>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-surface p-4 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 to-transparent flex items-center justify-between shadow-sm">
              <div>
                <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Managed (Đã Quản Lý)</span>
                </div>
                <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">{summary.Managed || 0}</div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-surface p-4 rounded-2xl border border-surface-border flex items-center justify-between shadow-sm">
              <div>
                <div className="text-xs font-semibold text-ink-muted flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Dismissed (Đã Bỏ Qua)</span>
                </div>
                <div className="text-2xl font-bold text-ink mt-1 font-mono">{summary.Dismissed || 0}</div>
              </div>
              <button
                onClick={() => setShowScans(!showScans)}
                className="btn btn-ghost text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-surface-border"
              >
                <History className="w-3.5 h-3.5 text-emerald-400" />
                <span>{showScans ? 'Ẩn' : 'Xem'} Lịch Sử Quét</span>
              </button>
            </div>
          </div>
        )}

        {/* Scan history collapsible */}
        {showScans && (
          <div className="bg-surface border border-surface-border rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-semibold text-ink uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-4 h-4 text-emerald-400" />
              <span>Lịch Sử Tiến Trình Quét Gần Đây (Recent Scans)</span>
            </h3>
            <ScanHistoryPanel scans={scansData?.data || []} />
          </div>
        )}

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-surface p-4 rounded-2xl border border-surface-border shadow-sm">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-ink">Lọc chứng chỉ:</span>
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-surface-muted border border-surface-border rounded-xl px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-emerald-400"
          >
            <option value="">All statuses</option>
            <option value="Unmanaged">Unmanaged</option>
            <option value="Managed">Managed</option>
            <option value="Dismissed">Dismissed</option>
          </select>

          <select
            value={agentFilter}
            onChange={e => setAgentFilter(e.target.value)}
            className="bg-surface-muted border border-surface-border rounded-xl px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-emerald-400"
          >
            <option value="">All agents</option>
            {agentsData?.data?.map(a => (
              <option key={a.id} value={a.id}>{a.name || a.id}</option>
            ))}
          </select>
        </div>

        {/* Table Container */}
        <div className="bg-surface rounded-2xl border border-surface-border shadow-sm overflow-hidden">
          {error ? (
            <ErrorState error={error as Error} onRetry={() => refetch()} />
          ) : (
            <DataTable
              columns={columns}
              data={data?.data || []}
              isLoading={isLoading}
              emptyMessage="No discovered certificates. Agents will report findings once discovery scanning is configured."
            />
          )}
        </div>
      </div>

      {claimingCert && (
        <ClaimModal
          cert={claimingCert}
          onClose={() => setClaimingCert(null)}
          onClaim={(managedCertId) => claimMutation.mutate({ id: claimingCert.id, managedCertId })}
        />
      )}
    </>
  );
}
