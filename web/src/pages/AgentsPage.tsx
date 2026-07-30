import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Server,
  Activity,
  Cpu,
  Globe,
  Wifi,
  WifiOff,
  AlertTriangle,
  Search,
  Power,
  ShieldCheck,
  Clock,
  Layers,
  Terminal,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { useTrackedMutation } from '../hooks/useTrackedMutation';
import {
  getAgents,
  listRetiredAgents,
  retireAgent,
  BlockedByDependenciesError,
} from '../api/client';
import ModalDialog from '../components/ModalDialog';
import DataTable from '../components/DataTable';
import type { Column } from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import ErrorState from '../components/ErrorState';
import { timeAgo } from '../api/utils';
import type { Agent, AgentDependencyCounts } from '../api/types';

function heartbeatStatus(lastHeartbeat: string | undefined): string {
  if (!lastHeartbeat) return 'Offline';
  const ago = Date.now() - new Date(lastHeartbeat).getTime();
  if (ago < 5 * 60 * 1000) return 'Online';
  if (ago < 15 * 60 * 1000) return 'Degraded';
  return 'Offline';
}

type TabKey = 'active' | 'retired';

type ModalMode =
  | { kind: 'closed' }
  | { kind: 'confirm'; agent: Agent; reason: string }
  | { kind: 'blocked'; agent: Agent; reason: string; counts: AgentDependencyCounts }
  | { kind: 'error'; agent: Agent; message: string };

export default function AgentsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>('active');
  const [modal, setModal] = useState<ModalMode>({ kind: 'closed' });
  const [search, setSearch] = useState('');

  const active = useQuery({
    queryKey: ['agents'],
    queryFn: () => getAgents(),
    refetchInterval: 15000,
    enabled: tab === 'active',
  });

  const retired = useQuery({
    queryKey: ['agents', 'retired'],
    queryFn: () => listRetiredAgents(),
    refetchInterval: 30000,
    enabled: tab === 'retired',
  });

  const mutation = useTrackedMutation({
    mutationFn: (input: { agent: Agent; force?: boolean; reason?: string }) =>
      retireAgent(input.agent.id, { force: input.force, reason: input.reason }),
    invalidates: [['agents'], ['agents', 'retired']],
    onSuccess: () => {
      setModal({ kind: 'closed' });
    },
  });

  const submitRetire = (force: boolean) => {
    if (modal.kind !== 'confirm' && modal.kind !== 'blocked') return;
    const { agent, reason } = modal;
    mutation.mutate(
      { agent, force, reason: reason || undefined },
      {
        onError: (err) => {
          if (err instanceof BlockedByDependenciesError) {
            setModal({
              kind: 'blocked',
              agent,
              reason,
              counts: err.counts ?? { active_targets: 0, active_certificates: 0, pending_jobs: 0 },
            });
            return;
          }
          setModal({
            kind: 'error',
            agent,
            message: err instanceof Error ? err.message : String(err),
          });
        },
      },
    );
  };

  const activeList = active.data?.data || [];
  const retiredList = retired.data?.data || [];

  const onlineCount = activeList.filter(a => (a.status || heartbeatStatus(a.last_heartbeat_at)) === 'Online').length;
  const offlineCount = activeList.filter(a => (a.status || heartbeatStatus(a.last_heartbeat_at)) === 'Offline').length;
  const degradedCount = activeList.length - onlineCount - offlineCount;

  const filteredActive = activeList.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    (a.hostname && a.hostname.toLowerCase().includes(search.toLowerCase())) ||
    (a.ip_address && a.ip_address.toLowerCase().includes(search.toLowerCase())) ||
    a.id.toLowerCase().includes(search.toLowerCase())
  );

  const filteredRetired = retiredList.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    (a.hostname && a.hostname.toLowerCase().includes(search.toLowerCase())) ||
    a.id.toLowerCase().includes(search.toLowerCase())
  );

  const activeColumns: Column<Agent>[] = [
    {
      key: 'name',
      label: 'Agent Name & ID',
      render: (a) => (
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-surface-muted border border-surface-border text-emerald-400 font-mono text-xs shadow-sm">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-ink text-sm hover:text-emerald-400 transition-colors">{a.name}</div>
            <div className="text-[11px] text-ink-faint font-mono">{a.id}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Trạng Thái',
      render: (a) => {
        const status = a.status || heartbeatStatus(a.last_heartbeat_at);
        return (
          <div className="flex items-center gap-2">
            <StatusBadge status={status} />
            {status === 'Online' && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            )}
          </div>
        );
      },
    },
    {
      key: 'hostname',
      label: 'Hostname',
      render: (a) => (
        <span className="text-xs text-ink font-mono bg-surface-muted px-2.5 py-1 rounded-lg border border-surface-border">
          {a.hostname || '—'}
        </span>
      ),
    },
    {
      key: 'os',
      label: 'OS / Architecture',
      render: (a) => (
        <div className="inline-flex items-center gap-1.5 text-xs text-ink-muted bg-surface-muted px-2 py-0.5 rounded border border-surface-border font-mono">
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span>{a.os && a.architecture ? `${a.os}/${a.architecture}` : a.os || '—'}</span>
        </div>
      ),
    },
    {
      key: 'ip',
      label: 'IP Address',
      render: (a) => <span className="text-xs text-ink-muted font-mono">{a.ip_address || '—'}</span>,
    },
    {
      key: 'version',
      label: 'Phiên Bản',
      render: (a) => (
        <span className="text-xs text-emerald-400 font-mono font-medium">
          {a.version ? `v${a.version}` : '—'}
        </span>
      ),
    },
    {
      key: 'heartbeat',
      label: 'Heartbeat Cuối',
      render: (a) => (
        <span className="text-xs text-ink-muted flex items-center gap-1">
          <Clock className="w-3 h-3 text-ink-faint" />
          {timeAgo(a.last_heartbeat_at)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (a) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setModal({ kind: 'confirm', agent: a, reason: '' });
          }}
          className="px-3 py-1 text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-colors flex items-center gap-1"
        >
          <Power className="w-3.5 h-3.5" />
          <span>Retire</span>
        </button>
      ),
    },
  ];

  const retiredColumns: Column<Agent>[] = [
    {
      key: 'name',
      label: 'Agent Name & ID',
      render: (a) => (
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-surface-muted border border-surface-border text-ink-muted font-mono text-xs">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-ink text-sm">{a.name}</div>
            <div className="text-[11px] text-ink-faint font-mono">{a.id}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'hostname',
      label: 'Hostname',
      render: (a) => <span className="text-xs text-ink-muted font-mono">{a.hostname || '—'}</span>,
    },
    {
      key: 'os',
      label: 'OS / Arch',
      render: (a) => (
        <span className="text-xs text-ink-muted font-mono">
          {a.os && a.architecture ? `${a.os}/${a.architecture}` : a.os || '—'}
        </span>
      ),
    },
    {
      key: 'retired_at',
      label: 'Thời Gian Retire',
      render: (a) => <span className="text-xs text-red-400 font-mono">{timeAgo(a.retired_at || '')}</span>,
    },
    {
      key: 'retired_reason',
      label: 'Lý Do Retire',
      render: (a) => (
        <span className="text-xs text-ink-muted italic">{a.retired_reason || <em>Khởi tạo mặc định</em>}</span>
      ),
    },
  ];

  const currentQuery = tab === 'active' ? active : retired;
  const currentData = tab === 'active' ? filteredActive : filteredRetired;
  const currentColumns = tab === 'active' ? activeColumns : retiredColumns;
  const emptyMessage = tab === 'active' ? 'Chưa có Agent nào được kết nối' : 'Chưa có Agent nào bị Retire';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-5 rounded-2xl border border-surface-border shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-ink flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-400" />
            Agent Fleet Management
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Quản lý và theo dõi trạng thái các máy chủ Agent thu thập & tự động triển khai chứng chỉ số
          </p>
        </div>

        {/* Quick Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm kiếm agent..."
            className="bg-surface-muted border border-surface-border rounded-xl pl-9 pr-3 py-1.5 text-xs text-ink focus:outline-none focus:border-emerald-400 w-64"
          />
        </div>
      </div>

      {/* Overview Metric Cards (For Active Tab) */}
      {tab === 'active' && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-surface p-4 rounded-xl border border-surface-border flex items-center justify-between shadow-sm">
            <div>
              <div className="text-xs text-ink-muted font-medium">Tổng Agent Đã Kết Nối</div>
              <div className="text-2xl font-bold text-ink mt-1">{activeList.length}</div>
            </div>
            <div className="p-3 rounded-xl bg-surface-muted text-emerald-400 border border-surface-border">
              <Server className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-surface p-4 rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 to-transparent flex items-center justify-between shadow-sm">
            <div>
              <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5" />
                <span>Trực Tuyến (Online)</span>
              </div>
              <div className="text-2xl font-bold text-emerald-400 mt-1">{onlineCount}</div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-surface p-4 rounded-xl border border-red-500/20 bg-gradient-to-br from-red-950/20 to-transparent flex items-center justify-between shadow-sm">
            <div>
              <div className="text-xs text-red-400 font-semibold flex items-center gap-1">
                <WifiOff className="w-3.5 h-3.5" />
                <span>Ngoại Tuyến (Offline)</span>
              </div>
              <div className="text-2xl font-bold text-red-400 mt-1">{offlineCount}</div>
            </div>
            <div className="p-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              <XCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-surface p-4 rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-950/20 to-transparent flex items-center justify-between shadow-sm">
            <div>
              <div className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Suy Giảm (Degraded)</span>
              </div>
              <div className="text-2xl font-bold text-amber-400 mt-1">{degradedCount}</div>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-surface-border pb-1">
        <button
          type="button"
          onClick={() => setTab('active')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${
            tab === 'active'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-ink-muted hover:text-ink bg-surface-muted/50 border border-surface-border'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Active Agent Fleet</span>
          {active.data && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${tab === 'active' ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-surface border border-surface-border'}`}>
              {active.data.total}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setTab('retired')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${
            tab === 'retired'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-ink-muted hover:text-ink bg-surface-muted/50 border border-surface-border'
          }`}
        >
          <Power className="w-4 h-4" />
          <span>Retired Agents</span>
          {retired.data && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${tab === 'retired' ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-surface border border-surface-border'}`}>
              {retired.data.total}
            </span>
          )}
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-surface rounded-2xl border border-surface-border shadow-sm overflow-hidden">
        {currentQuery.error ? (
          <ErrorState error={currentQuery.error as Error} onRetry={() => currentQuery.refetch()} />
        ) : (
          <DataTable
            columns={currentColumns}
            data={currentData}
            isLoading={currentQuery.isLoading}
            emptyMessage={emptyMessage}
            onRowClick={(a) => navigate(`/agents/${a.id}`)}
          />
        )}
      </div>

      {/* Retire Agent Modal */}
      {modal.kind !== 'closed' && (
        <RetireModal
          mode={modal}
          pending={mutation.isPending}
          onClose={() => setModal({ kind: 'closed' })}
          onReasonChange={(reason) => {
            if (modal.kind === 'confirm') setModal({ ...modal, reason });
            if (modal.kind === 'blocked') setModal({ ...modal, reason });
          }}
          onSoftRetire={() => submitRetire(false)}
          onForceRetire={() => submitRetire(true)}
        />
      )}
    </div>
  );
}

function RetireModal({
  mode,
  pending,
  onClose,
  onReasonChange,
  onSoftRetire,
  onForceRetire,
}: {
  mode: ModalMode;
  pending: boolean;
  onClose: () => void;
  onReasonChange: (reason: string) => void;
  onSoftRetire: () => void;
  onForceRetire: () => void;
}) {
  if (mode.kind === 'closed') return null;

  const title =
    mode.kind === 'confirm' ? 'Xác Nhận Retire Agent' :
    mode.kind === 'blocked' ? 'Không thể Retire — Có phụ thuộc đang hoạt động' :
    'Retire thất bại';

  return (
    <ModalDialog
      open={true}
      title={title}
      onClose={pending ? () => {} : onClose}
      maxWidth="lg"
      footer={
        mode.kind === 'confirm' ? (
          <>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost text-xs"
              disabled={pending}
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={onSoftRetire}
              disabled={pending}
              className="btn btn-danger text-xs font-semibold px-4 py-2 rounded-xl disabled:opacity-50"
            >
              {pending ? 'Đang Retire…' : 'Xác Nhận Retire'}
            </button>
          </>
        ) : mode.kind === 'blocked' ? (
          <>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost text-xs"
              disabled={pending}
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={onForceRetire}
              disabled={pending || !mode.reason.trim()}
              className="btn btn-danger text-xs font-semibold px-4 py-2 rounded-xl disabled:opacity-50"
            >
              {pending ? 'Đang Force-Retire…' : 'Bắt Buộc Force Retire'}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost text-xs"
          >
            Đóng
          </button>
        )
      }
    >
      {mode.kind === 'confirm' && (
        <div className="space-y-4">
          <p className="text-xs text-ink-muted leading-relaxed">
            Agent <span className="font-mono font-bold text-ink">{mode.agent.name}</span> ({mode.agent.id}) sẽ chuyển sang trạng thái Soft-Retired. Agent sẽ ngưng gửi heartbeat và xóa khỏi danh sách hoạt động.
          </p>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">
              Lý do Retire (không bắt buộc)
            </label>
            <input
              type="text"
              value={mode.reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder="Ví dụ: Thay thế máy chủ mới"
              className="w-full bg-surface border border-surface-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-emerald-400"
            />
          </div>
        </div>
      )}

      {mode.kind === 'blocked' && (
        <div className="space-y-4">
          <p className="text-xs text-red-400 font-medium">
            Agent <span className="font-mono font-bold text-ink">{mode.agent.name}</span> hiện đang có các phụ thuộc (Target / Certificate) gắn liền.
          </p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl border border-surface-border bg-surface-muted p-3">
              <dt className="text-xs text-ink-muted">Active Targets</dt>
              <dd className="mt-1 text-lg font-bold text-ink">{mode.counts.active_targets}</dd>
            </div>
            <div className="rounded-xl border border-surface-border bg-surface-muted p-3">
              <dt className="text-xs text-ink-muted">Active Certs</dt>
              <dd className="mt-1 text-lg font-bold text-ink">
                {mode.counts.active_certificates}
              </dd>
            </div>
            <div className="rounded-xl border border-surface-border bg-surface-muted p-3">
              <dt className="text-xs text-ink-muted">Pending Jobs</dt>
              <dd className="mt-1 text-lg font-bold text-ink">{mode.counts.pending_jobs}</dd>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">
              Lý do Force Retire <span className="text-red-400 font-bold">(Bắt buộc)</span>
            </label>
            <input
              type="text"
              value={mode.reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder="Ví dụ: Máy chủ ngắt kết nối vĩnh viễn"
              className="w-full bg-surface border border-surface-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-emerald-400"
            />
          </div>
        </div>
      )}

      {mode.kind === 'error' && (
        <p className="text-xs text-red-400 font-semibold">{mode.message}</p>
      )}
    </ModalDialog>
  );
}
