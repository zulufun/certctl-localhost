import { useState } from 'react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Compass,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Globe,
  Folder,
  History,
  Link as LinkIcon,
  EyeOff,
  Trash2,
  Radar,
  Plus,
  Play,
  Pencil,
  Loader2,
  AlertCircle,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useTrackedMutation } from '../hooks/useTrackedMutation';
import { useListParams } from '../hooks/useListParams';
import {
  getDiscoveredCertificates,
  getDiscoverySummary,
  getDiscoveryScans,
  claimDiscoveredCertificate,
  dismissDiscoveredCertificate,
  getAgents,
  getNetworkScanTargets,
  createNetworkScanTarget,
  updateNetworkScanTarget,
  deleteNetworkScanTarget,
  triggerNetworkScan,
} from '../api/client';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import type { Column } from '../components/DataTable';
import ErrorState from '../components/ErrorState';
import { formatDateTime } from '../api/utils';
import type { DiscoveredCertificate, DiscoveryScan, NetworkScanTarget } from '../api/types';

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-200" onClick={onClose}>
      <div className="bg-surface border border-surface-border rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150" onClick={e => e.stopPropagation()}>
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

function ScanTargetModal({
  target,
  onClose,
  onSubmit,
}: {
  target?: NetworkScanTarget | null;
  onClose: () => void;
  onSubmit: (data: Partial<NetworkScanTarget>) => void;
}) {
  const [name, setName] = useState(target?.name || '');
  const [cidrs, setCidrs] = useState(target?.cidrs?.join('\n') || '');
  const [ports, setPorts] = useState(target?.ports?.join(',') || '443');
  const [interval, setInterval] = useState(String(target?.scan_interval_hours || 6));
  const [timeout, setTimeout] = useState(String(target?.timeout_ms || 5000));

  const handleSubmit = () => {
    const cidrList = cidrs.split('\n').map(s => s.trim()).filter(Boolean);
    const portList = ports.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    onSubmit({
      name,
      cidrs: cidrList,
      ports: portList,
      scan_interval_hours: parseInt(interval, 10),
      timeout_ms: parseInt(timeout, 10),
      enabled: target ? target.enabled : true,
    });
  };

  const isEdit = Boolean(target);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-200" onClick={onClose}>
      <div className="bg-surface border border-surface-border rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between pb-3 border-b border-surface-border">
          <div className="flex items-center gap-2 font-bold text-sm text-ink">
            {isEdit ? <Pencil className="w-4 h-4 text-emerald-400" /> : <Globe className="w-4 h-4 text-emerald-400" />}
            <span>{isEdit ? 'Chỉnh Sửa Mục Tiêu Quét Mạng' : 'Tạo Mục Tiêu Quét Mạng Mới'}</span>
          </div>
          <button onClick={onClose} className="text-ink-muted hover:text-ink text-xs p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-ink mb-1">Tên Mục Tiêu (Name) *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Production DMZ"
              className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="block font-semibold text-ink mb-1">Dải Mạng CIDR (Mỗi dải một dòng) *</label>
            <textarea
              value={cidrs}
              onChange={e => setCidrs(e.target.value)}
              placeholder={"10.0.1.0/24\n10.0.2.0/24\n192.168.1.100/32"}
              className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-ink font-mono focus:outline-none focus:border-emerald-400"
              rows={3}
            />
            <p className="text-[11px] text-ink-faint mt-1">Maximum /20 per CIDR (4096 IPs)</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-ink mb-1">Cổng (Ports)</label>
              <input
                type="text"
                value={ports}
                onChange={e => setPorts(e.target.value)}
                placeholder="443,8443"
                className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-ink font-mono focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="block font-semibold text-ink mb-1">Tần Suất (hrs)</label>
              <input
                type="number"
                value={interval}
                onChange={e => setInterval(e.target.value)}
                min="1"
                className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="block font-semibold text-ink mb-1">Timeout (ms)</label>
              <input
                type="number"
                value={timeout}
                onChange={e => setTimeout(e.target.value)}
                min="1000"
                step="1000"
                className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-surface-border">
          <button onClick={onClose} className="btn btn-ghost text-xs px-4 py-2 rounded-xl">
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || !cidrs.trim()}
            className="btn btn-primary text-xs font-semibold px-4 py-2 rounded-xl disabled:opacity-50"
          >
            {isEdit ? 'Lưu Thay Đổi' : 'Tạo Target'}
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
  const [activeTab, setActiveTab] = useState<'discovered' | 'dismissed' | 'scanning'>('discovered');
  const [statusFilter, setStatusFilter] = useState('');
  const [agentFilter, setAgentFilter] = useState('');
  const [claimingCert, setClaimingCert] = useState<DiscoveredCertificate | null>(null);
  const [showScans, setShowScans] = useState(false);
  const [dismissingId, setDismissingId] = useState<string | null>(null);

  // List params & pagination
  const { params: listParams, setPage, setPageSize } = useListParams({ pageSize: 50 });
  const page = listParams.page;
  const perPage = listParams.pageSize;

  // Network scanning state
  const [showCreateScanTarget, setShowCreateScanTarget] = useState(false);
  const [editingScanTarget, setEditingScanTarget] = useState<NetworkScanTarget | null>(null);
  const [activeScanningId, setActiveScanningId] = useState<string | null>(null);
  const [scanStatusMessage, setScanStatusMessage] = useState<{
    type: 'info' | 'success' | 'error';
    text: string;
  } | null>(null);

  // Effective status query param
  const effectiveStatus = activeTab === 'dismissed' ? 'Dismissed' : statusFilter;

  const queryParams: Record<string, string> = {
    page: String(page),
    per_page: String(perPage),
  };
  if (effectiveStatus) queryParams.status = effectiveStatus;
  if (agentFilter) queryParams.agent_id = agentFilter;

  // Smooth data transitions via keepPreviousData
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['discovered-certificates', queryParams],
    queryFn: () => getDiscoveredCertificates(queryParams),
    placeholderData: keepPreviousData,
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

  // Network scan targets query
  const { data: networkTargetsData, isLoading: networkTargetsLoading, isFetching: networkTargetsFetching, error: networkTargetsErr, refetch: refetchNetworkTargets } = useQuery({
    queryKey: ['network-scan-targets'],
    queryFn: () => getNetworkScanTargets(),
    placeholderData: keepPreviousData,
    refetchInterval: 30000,
    enabled: activeTab === 'scanning',
  });

  const scanTargetInvalidates = [['network-scan-targets']];

  const createScanTargetMutation = useTrackedMutation({
    mutationFn: createNetworkScanTarget,
    invalidates: scanTargetInvalidates,
    onSuccess: () => {
      setShowCreateScanTarget(false);
    },
  });

  const updateScanTargetMutation = useTrackedMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NetworkScanTarget> }) =>
      updateNetworkScanTarget(id, data),
    invalidates: scanTargetInvalidates,
    onSuccess: () => {
      setEditingScanTarget(null);
    },
  });

  const deleteScanTargetMutation = useTrackedMutation({
    mutationFn: deleteNetworkScanTarget,
    invalidates: scanTargetInvalidates,
  });

  const toggleScanTargetMutation = useTrackedMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      updateNetworkScanTarget(id, { enabled }),
    invalidates: scanTargetInvalidates,
  });

  const triggerScanMutation = useTrackedMutation({
    mutationFn: triggerNetworkScan,
    invalidates: scanTargetInvalidates,
    onSuccess: (res, id) => {
      setActiveScanningId(null);
      setScanStatusMessage({
        type: 'success',
        text: res?.message || `Đã kích hoạt quét dải mạng thành công cho mục tiêu #${id}!`,
      });
    },
    onError: (err) => {
      setActiveScanningId(null);
      setScanStatusMessage({
        type: 'error',
        text: `Lỗi khi kích hoạt quét dải mạng: ${err.message}`,
      });
    },
  });

  const handleTriggerScan = (t: NetworkScanTarget) => {
    setActiveScanningId(t.id);
    setScanStatusMessage({
      type: 'info',
      text: `Đang tiến hành quét dải mạng "${t.name}" (${t.cidrs?.join(', ')})...`,
    });
    triggerScanMutation.mutate(t.id);
  };

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
      setDismissingId(id);
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
      setDismissingId(null);
      if (snap?.prev) queryClient.setQueryData(['discovered-certificates'], snap.prev);
      toast.error(`Dismiss failed: ${err.message}`);
    },
    onSuccess: () => {
      setDismissingId(null);
      toast.success('Đã chuyển chứng chỉ sang danh sách Bỏ Qua (Dismissed)');
    },
  });

  const handleDeleteRecord = (cert: DiscoveredCertificate) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bản ghi chứng chỉ "${cert.common_name || cert.id}" khỏi hệ thống?`)) return;
    dismissMutation.mutate(cert.id);
  };

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

  const currentCerts = [...(data?.data || [])].sort((a, b) => {
    if (a.status === 'Dismissed' && b.status !== 'Dismissed') return 1;
    if (a.status !== 'Dismissed' && b.status === 'Dismissed') return -1;
    return 0;
  });
  const totalCertsCount = data?.total ?? 0;

  // Case-insensitive & fallback metric calculation
  const summaryObj = summary as Record<string, number> | undefined;
  const isFiltered = Boolean(agentFilter || statusFilter);

  // If filtered or status matches, prefer query total for accuracy
  const unmanagedCount = isFiltered && statusFilter === 'Unmanaged'
    ? totalCertsCount
    : (summaryObj?.Unmanaged ?? summaryObj?.unmanaged ?? (activeTab === 'discovered' ? totalCertsCount : 0));

  const managedCount = isFiltered && statusFilter === 'Managed'
    ? totalCertsCount
    : (summaryObj?.Managed ?? summaryObj?.managed ?? 0);

  const dismissedCount = activeTab === 'dismissed'
    ? totalCertsCount
    : (summaryObj?.Dismissed ?? summaryObj?.dismissed ?? 0);

  const networkTargets = networkTargetsData?.data || [];
  const enabledNetworkTargetsCount = networkTargets.filter(t => t.enabled).length;

  const discoveryColumns: Column<DiscoveredCertificate>[] = [
    {
      key: 'stt',
      label: 'STT',
      render: (_c, idx) => <span className="font-mono text-xs font-semibold text-ink-muted">{(page - 1) * perPage + idx + 1}</span>,
      className: 'w-12 text-center',
    },
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
      label: 'Nguồn Phát Hiện',
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
      label: 'SHA-256',
      render: (c) => <span className="font-mono text-[11px] text-ink-faint">{c.fingerprint_sha256?.substring(0, 16)}...</span>,
    },
    {
      key: 'actions',
      label: '',
      render: (c) => {
        const isDismissingThis = dismissingId === c.id || (dismissMutation.isPending && dismissMutation.variables === c.id);
        return (
          <div className="flex items-center justify-end gap-2">
            {c.status === 'Unmanaged' && (
              <button
                onClick={(e) => { e.stopPropagation(); setClaimingCert(c); }}
                className="px-2.5 py-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg transition-colors flex items-center gap-1"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Claim</span>
              </button>
            )}

            {c.status !== 'Dismissed' && (
              <button
                onClick={(e) => { e.stopPropagation(); dismissMutation.mutate(c.id); }}
                disabled={isDismissingThis}
                className="px-2 py-1 text-xs font-medium text-ink-muted hover:text-amber-400 transition-colors flex items-center gap-1"
                title="Chuyển sang danh sách Dismissed"
              >
                {isDismissingThis ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5" />
                )}
                <span>{isDismissingThis ? 'Dismissing…' : 'Dismiss'}</span>
              </button>
            )}

            <button
              onClick={(e) => { e.stopPropagation(); handleDeleteRecord(c); }}
              disabled={dismissMutation.isPending}
              className="p-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Xóa bản ghi khỏi danh sách"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      },
    },
  ];

  const networkScanColumns: Column<NetworkScanTarget>[] = [
    {
      key: 'stt',
      label: 'STT',
      render: (_t, idx) => <span className="font-mono text-xs font-semibold text-ink-muted">{idx + 1}</span>,
      className: 'w-12 text-center',
    },
    {
      key: 'name',
      label: 'Target Name',
      render: (t) => (
        <div>
          <div className="font-bold text-sm text-ink">{t.name}</div>
          <div className="font-mono text-[11px] text-ink-faint">{t.id}</div>
        </div>
      ),
    },
    {
      key: 'cidrs',
      label: 'CIDR Ranges',
      render: (t) => (
        <div className="flex flex-wrap gap-1 font-mono text-xs">
          {t.cidrs?.slice(0, 2).map(c => (
            <span key={c} className="px-2 py-0.5 rounded bg-surface-muted text-ink border border-surface-border text-[11px]">
              {c}
            </span>
          ))}
          {(t.cidrs?.length || 0) > 2 && (
            <span className="px-1.5 py-0.5 rounded bg-surface-muted text-ink-muted text-[10px]">
              +{t.cidrs.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'ports',
      label: 'Ports',
      render: (t) => (
        <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-muted/50 border border-surface-border text-emerald-400 font-bold">
          {t.ports?.join(', ')}
        </span>
      ),
    },
    {
      key: 'interval',
      label: 'Interval',
      render: (t) => <span className="text-xs text-ink-muted font-semibold">{t.scan_interval_hours}h</span>,
    },
    {
      key: 'last_scan',
      label: 'Last Scan Output',
      render: (t) => (
        <div>
          <div className="text-xs text-ink-muted font-mono">{t.last_scan_at ? formatDateTime(t.last_scan_at) : 'Never'}</div>
          {t.last_scan_certs_found != null && (
            <div className="text-[11px] font-bold text-emerald-400">{t.last_scan_certs_found} certs found</div>
          )}
        </div>
      ),
    },
    {
      key: 'enabled',
      label: 'Status',
      render: (t) => (
        <button
          onClick={(e) => { e.stopPropagation(); toggleScanTargetMutation.mutate({ id: t.id, enabled: !t.enabled }); }}
          className={`relative w-9 h-5 rounded-full transition-colors ${t.enabled ? 'bg-emerald-500' : 'bg-surface-border'}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${t.enabled ? 'translate-x-4' : ''}`} />
        </button>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (t) => {
        const isScanningThis = activeScanningId === t.id || (triggerScanMutation.isPending && triggerScanMutation.variables === t.id);
        return (
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={(e) => { e.stopPropagation(); handleTriggerScan(t); }}
              disabled={isScanningThis}
              className={`px-2.5 py-1 text-xs rounded-lg transition-all font-semibold flex items-center gap-1.5 ${
                isScanningThis
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-wait'
                  : 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20'
              }`}
            >
              {isScanningThis ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span>Scanning…</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-current" />
                  <span>Scan Now</span>
                </>
              )}
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); setEditingScanTarget(t); }}
              className="p-1.5 text-xs text-ink-muted hover:text-emerald-400 hover:bg-surface-muted rounded-lg transition-colors"
              title="Sửa thông tin target"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); deleteScanTargetMutation.mutate(t.id); }}
              disabled={deleteScanTargetMutation.isPending}
              className="p-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Delete Target"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="Certificate Discovery"
        subtitle={
          activeTab === 'scanning'
            ? `${networkTargets.length} network scan targets`
            : data
              ? `${totalCertsCount} discovered certificates`
              : undefined
        }
        action={
          activeTab === 'scanning' ? (
            <button
              onClick={() => setShowCreateScanTarget(true)}
              className="btn btn-primary text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all duration-150"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Target</span>
            </button>
          ) : undefined
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* In-flight Scan Banner */}
        {inFlightScans.length > 0 && activeTab !== 'scanning' && (
          <div
            className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-300 shadow-sm transition-all duration-300"
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

        {/* Navigation 3 Tabs Bar */}
        <div className="flex items-center justify-between border-b border-surface-border pb-3">
          <div className="flex items-center gap-2 bg-surface p-1.5 rounded-2xl border border-surface-border shadow-sm">
            <button
              onClick={() => { setActiveTab('discovered'); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'discovered'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Discovered Certificates</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-mono">
                {unmanagedCount + managedCount}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('dismissed'); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'dismissed'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <EyeOff className="w-4 h-4" />
              <span>Dismissed Certificates</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-surface-muted text-ink-muted font-mono">
                {dismissedCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('scanning')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'scanning'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <Radar className="w-4 h-4" />
              <span>Network Scanning</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-surface-muted text-ink-muted font-mono">
                {networkTargets.length}
              </span>
            </button>
          </div>

          {activeTab !== 'scanning' && (
            <button
              onClick={() => setShowScans(!showScans)}
              className="btn btn-ghost text-xs flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-surface-border transition-all duration-200"
            >
              <History className="w-4 h-4 text-emerald-400" />
              <span>{showScans ? 'Ẩn Lịch Sử Quét' : 'Xem Lịch Sử Quét'}</span>
            </button>
          )}
        </div>

        {/* Dynamic Transition Container for Tab Content */}
        <div className="transition-opacity duration-200 ease-in-out">
          {/* Tab 3: Network Scanning View */}
          {activeTab === 'scanning' ? (
            <div className="space-y-6">
              {/* Status Alert Notification Banner */}
              {scanStatusMessage && (
                <div
                  className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-medium transition-all duration-200 ${
                    scanStatusMessage.type === 'info'
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                      : scanStatusMessage.type === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {scanStatusMessage.type === 'info' && <Loader2 className="w-4 h-4 animate-spin text-blue-400" />}
                    {scanStatusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {scanStatusMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
                    <span>{scanStatusMessage.text}</span>
                  </div>
                  <button
                    onClick={() => setScanStatusMessage(null)}
                    className="text-ink-muted hover:text-ink p-1 rounded hover:bg-surface-muted"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Metric Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-surface p-4 rounded-2xl border border-surface-border flex items-center justify-between shadow-sm">
                  <div>
                    <div className="text-xs font-semibold text-ink-muted flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-emerald-400" />
                      <span>Tổng Dải Mạng Scanning</span>
                    </div>
                    <div className="text-2xl font-bold text-ink mt-1 font-mono">{networkTargets.length}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-muted border border-surface-border text-emerald-400">
                    <Globe className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-surface p-4 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 to-transparent flex items-center justify-between shadow-sm">
                  <div>
                    <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Dải Mạng Đang Kích Hoạt</span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">{enabledNetworkTargetsCount} / {networkTargets.length}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-surface p-4 rounded-2xl border border-surface-border flex items-center justify-between shadow-sm">
                  <div>
                    <div className="text-xs font-semibold text-ink-muted flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-400" />
                      <span>Tự Động Quét Mạng (Auto Scan)</span>
                    </div>
                    <div className="text-xs text-ink-muted mt-1">Chu kỳ mặc định: 6 giờ / lượt</div>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Radar className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Table Container with smooth fetching state */}
              <div className={`bg-surface rounded-2xl border border-surface-border shadow-sm overflow-hidden transition-opacity duration-200 ${networkTargetsFetching ? 'opacity-70' : 'opacity-100'}`}>
                {networkTargetsErr ? (
                  <ErrorState error={networkTargetsErr as Error} onRetry={() => refetchNetworkTargets()} />
                ) : (
                  <DataTable
                    columns={networkScanColumns}
                    data={networkTargets}
                    isLoading={networkTargetsLoading && !networkTargetsData}
                    emptyMessage="No scan targets configured. Create one to start discovering certificates on your network."
                  />
                )}
              </div>
            </div>
          ) : (
            /* Tabs 1 & 2: Discovered & Dismissed Certificates View */
            <div className="space-y-6">
              {/* Summary Stats Overview Bar */}
              {activeTab === 'discovered' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-surface p-4 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-950/20 to-transparent flex items-center justify-between shadow-sm">
                    <div>
                      <div className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Unmanaged (Chưa Quản Lý)</span>
                      </div>
                      <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">{unmanagedCount}</div>
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
                      <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">{managedCount}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>

                  <div
                    onClick={() => { setActiveTab('dismissed'); setPage(1); }}
                    className="bg-surface p-4 rounded-2xl border border-surface-border flex items-center justify-between shadow-sm cursor-pointer hover:border-emerald-500/40 transition-colors"
                  >
                    <div>
                      <div className="text-xs font-semibold text-ink-muted flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Dismissed (Đã Bỏ Qua)</span>
                      </div>
                      <div className="text-2xl font-bold text-ink mt-1 font-mono">{dismissedCount}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-muted text-ink-muted border border-surface-border">
                      <EyeOff className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              )}

              {/* Scan history collapsible */}
              {showScans && (
                <div className="bg-surface border border-surface-border rounded-2xl p-5 shadow-sm space-y-3 animate-in fade-in duration-200">
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

                {activeTab === 'discovered' && (
                  <select
                    value={statusFilter}
                    onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                    className="bg-surface-muted border border-surface-border rounded-xl px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-emerald-400"
                  >
                    <option value="">All statuses</option>
                    <option value="Unmanaged">Unmanaged</option>
                    <option value="Managed">Managed</option>
                  </select>
                )}

                <select
                  value={agentFilter}
                  onChange={e => { setAgentFilter(e.target.value); setPage(1); }}
                  className="bg-surface-muted border border-surface-border rounded-xl px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-emerald-400"
                >
                  <option value="">All agents</option>
                  {agentsData?.data?.map(a => (
                    <option key={a.id} value={a.id}>{a.name || a.id}</option>
                  ))}
                </select>

                {isFetching && (
                  <div className="ml-auto flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating…</span>
                  </div>
                )}
              </div>

              {/* Table Container with smooth fetching opacity */}
              <div className={`bg-surface rounded-2xl border border-surface-border shadow-sm overflow-hidden transition-opacity duration-200 ${isFetching ? 'opacity-85' : 'opacity-100'}`}>
                {error ? (
                  <ErrorState error={error as Error} onRetry={() => refetch()} />
                ) : (
                  <DataTable
                    columns={discoveryColumns}
                    data={currentCerts}
                    isLoading={isLoading && !data}
                    emptyMessage={
                      activeTab === 'discovered'
                        ? 'No discovered certificates. Agents will report findings once discovery scanning is configured.'
                        : 'No dismissed certificates.'
                    }
                    pagination={{
                      page,
                      perPage,
                      total: totalCertsCount,
                      onPageChange: setPage,
                    }}
                  />
                )}
              </div>
            </div>
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

      {showCreateScanTarget && (
        <ScanTargetModal
          onClose={() => setShowCreateScanTarget(false)}
          onSubmit={(d) => createScanTargetMutation.mutate(d)}
        />
      )}

      {editingScanTarget && (
        <ScanTargetModal
          target={editingScanTarget}
          onClose={() => setEditingScanTarget(null)}
          onSubmit={(d) => updateScanTargetMutation.mutate({ id: editingScanTarget.id, data: d })}
        />
      )}
    </>
  );
}
