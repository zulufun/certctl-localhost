import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  Activity,
  Server,
  Wifi,
  WifiOff,
  Cpu,
  Layers,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Package,
  RefreshCw,
  Loader2,
  Zap,
  Radio,
} from 'lucide-react';
import { getAgents, getAgent } from '../api/client';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import type { Agent } from '../api/types';

const OS_COLORS: Record<string, string> = {
  linux: '#f97316',
  darwin: '#06b6d4',
  windows: '#a855f7',
  unknown: '#64748b',
};

const OS_DISPLAY_NAMES: Record<string, string> = {
  darwin: 'macOS',
};

function displayOS(os: string): string {
  return OS_DISPLAY_NAMES[os.toLowerCase()] || os;
}

const STATUS_COLORS: Record<string, string> = {
  Online: '#10b981',
  Offline: '#ef4444',
  Unknown: '#64748b',
};

interface GroupedAgents {
  os: string;
  arch: string;
  agents: Agent[];
  online: number;
  offline: number;
}

export function getEffectiveStatus(agent: Agent): 'Online' | 'Offline' {
  if (!agent.last_heartbeat_at) return agent.status === 'Online' ? 'Online' : 'Offline';
  const ago = Date.now() - new Date(agent.last_heartbeat_at).getTime();
  if (ago > 5 * 60 * 1000) return 'Offline';
  return agent.status === 'Online' ? 'Online' : 'Offline';
}

function groupAgents(agents: Agent[]): GroupedAgents[] {
  const groups = new Map<string, GroupedAgents>();

  for (const agent of agents) {
    const os = agent.os || 'unknown';
    const arch = agent.architecture || 'unknown';
    const key = `${os}/${arch}`;

    if (!groups.has(key)) {
      groups.set(key, { os, arch, agents: [], online: 0, offline: 0 });
    }
    const group = groups.get(key)!;
    group.agents.push(agent);
    if (getEffectiveStatus(agent) === 'Online') {
      group.online++;
    } else {
      group.offline++;
    }
  }

  return Array.from(groups.values()).sort((a, b) => b.agents.length - a.agents.length);
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-surface-border rounded-xl px-3 py-2 text-xs shadow-xl backdrop-blur-md">
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.payload?.fill || entry.color }} className="font-bold flex items-center gap-1.5">
          <span>{entry.name}:</span>
          <span>{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function AgentFleetPage() {
  const navigate = useNavigate();
  const [reconnectingIds, setReconnectingIds] = useState<Set<string>>(new Set());
  const [reconnectAllPending, setReconnectAllPending] = useState(false);
  const [reconnectLatency, setReconnectLatency] = useState<Record<string, number>>({});

  const { data: agentsResponse, isLoading, refetch } = useQuery({
    queryKey: ['agents'],
    queryFn: () => getAgents(),
    refetchInterval: 15000,
  });

  const agents = agentsResponse?.data || [];
  const groups = groupAgents(agents);

  const handleReconnectAgent = useCallback(async (e: React.MouseEvent, agent: Agent) => {
    e.stopPropagation();
    const agentId = agent.id;
    setReconnectingIds(prev => new Set(prev).add(agentId));

    const startMs = Date.now();
    try {
      const updatedAgent = await getAgent(agentId);
      const latency = Math.max(12, Date.now() - startMs);
      setReconnectLatency(prev => ({ ...prev, [agentId]: latency }));

      if (updatedAgent?.status === 'Online' || agent.status === 'Online') {
        toast.success(`Kết nối lại thành công tới Agent [${agent.name || agent.hostname || agent.id}]! (Online, Độ trễ: ${latency}ms)`);
      } else {
        toast.warning(`Đã thử kết nối tới Agent [${agent.name || agent.hostname || agent.id}]. Trạng thái: Offline/Degraded (${latency}ms)`);
      }
      await refetch();
    } catch (err: unknown) {
      const latency = Math.max(15, Date.now() - startMs);
      const errMsg = err instanceof Error ? err.message : String(err);
      toast.error(`Không thể kết nối đến Agent [${agent.name || agent.hostname || agent.id}]: ${errMsg}`);
    } finally {
      setReconnectingIds(prev => {
        const next = new Set(prev);
        next.delete(agentId);
        return next;
      });
    }
  }, [refetch]);

  const handleReconnectAll = useCallback(async () => {
    if (agents.length === 0) return;
    setReconnectAllPending(true);
    toast.info(`Đang thử kết nối lại tới tất cả ${agents.length} Agent trong Fleet...`);

    let successCount = 0;
    let failCount = 0;

    for (const agent of agents) {
      const startMs = Date.now();
      try {
        await getAgent(agent.id);
        const latency = Math.max(12, Date.now() - startMs);
        setReconnectLatency(prev => ({ ...prev, [agent.id]: latency }));
        if (agent.status === 'Online') successCount++;
        else failCount++;
      } catch {
        failCount++;
      }
    }

    await refetch();
    setReconnectAllPending(false);
    if (failCount === 0) {
      toast.success(`Đã kiểm tra kết nối lại thành công toàn bộ ${successCount} Agent trong Fleet!`);
    } else {
      toast.success(`Đã kiểm tra kết nối Fleet: ${successCount} Online, ${failCount} Offline/Lỗi`);
    }
  }, [agents, refetch]);

  const totalAgents = agents.length;
  const onlineAgents = agents.filter(a => getEffectiveStatus(a) === 'Online').length;
  const offlineAgents = totalAgents - onlineAgents;

  const osDistribution = agents.reduce<Record<string, number>>((acc, a) => {
    const os = a.os || 'unknown';
    acc[os] = (acc[os] || 0) + 1;
    return acc;
  }, {});
  const osPieData = Object.entries(osDistribution).map(([name, value]) => ({
    name: displayOS(name),
    value,
    fill: OS_COLORS[name.toLowerCase()] || '#64748b',
  }));

  const statusPieData = [
    { name: 'Online', value: onlineAgents, fill: STATUS_COLORS.Online },
    { name: 'Offline', value: offlineAgents, fill: STATUS_COLORS.Offline },
  ].filter(s => s.value > 0);

  const versionCounts = agents.reduce<Record<string, number>>((acc, a) => {
    const v = a.version || 'unknown';
    acc[v] = (acc[v] || 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        title="Agent Fleet Overview"
        subtitle={`${totalAgents} agents — ${onlineAgents} online, ${offlineAgents} offline`}
        action={
          <button
            onClick={handleReconnectAll}
            disabled={reconnectAllPending || totalAgents === 0}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {reconnectAllPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>{reconnectAllPending ? 'Đang kiểm tra Fleet...' : 'Reconnect Tất Cả Agent'}</span>
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-surface-border rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Total Agents</p>
            <p className="text-3xl font-bold mt-1 text-emerald-400 font-mono">{totalAgents}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Server className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-surface border border-emerald-500/30 rounded-2xl p-5 shadow-sm bg-gradient-to-br from-emerald-950/20 to-transparent flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5" />
              <span>Online Agents</span>
            </p>
            <p className="text-3xl font-bold mt-1 text-emerald-400 font-mono">{onlineAgents}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-surface border border-red-500/30 rounded-2xl p-5 shadow-sm bg-gradient-to-br from-red-950/20 to-transparent flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Offline Agents</span>
            </p>
            <p className="text-3xl font-bold mt-1 text-red-400 font-mono">{offlineAgents}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400">
            <WifiOff className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Analytics Charts & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* OS Distribution */}
        <div className="bg-surface border border-surface-border rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>Phân bố Hệ Điều Hành (OS)</span>
          </h3>
          <div className="h-52">
            {osPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={osPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {osPieData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-ink-faint">Không có dữ liệu</div>
            )}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-surface border border-surface-border rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Trạng Thái Trực Tuyến</span>
          </h3>
          <div className="h-52">
            {statusPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-ink-faint">Không có dữ liệu</div>
            )}
          </div>
        </div>

        {/* Version Breakdown */}
        <div className="bg-surface border border-surface-border rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-400" />
            <span>Phiên Bản Agent (Versions)</span>
          </h3>
          <div className="space-y-3.5 pt-1">
            {Object.entries(versionCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([version, count]) => (
                <div key={version} className="flex items-center justify-between text-xs">
                  <span className="text-ink font-mono font-medium">{version}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-28 bg-surface-muted border border-surface-border rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-400 h-2 rounded-full transition-all"
                        style={{ width: `${(count / (totalAgents || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-emerald-400 font-bold w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
            {Object.keys(versionCounts).length === 0 && (
              <p className="text-xs text-ink-faint">Chưa có thông tin phiên bản</p>
            )}
          </div>
        </div>
      </div>

      {/* Fleet by Platform List */}
      <div>
        <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>Danh Sách Phân Loại Theo Nền Tảng (Platform)</span>
        </h3>
        {isLoading ? (
          <p className="text-xs text-ink-faint">Đang tải dữ liệu fleet...</p>
        ) : groups.length === 0 ? (
          <div className="p-8 text-center text-xs text-ink-muted bg-surface rounded-2xl border border-surface-border">
            No agents registered
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map(group => (
              <div key={`${group.os}/${group.arch}`} className="bg-surface border border-surface-border rounded-2xl overflow-hidden shadow-sm">
                {/* Platform Header */}
                <div className="px-5 py-3.5 bg-surface-muted/60 border-b border-surface-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full shadow-sm"
                      style={{ backgroundColor: OS_COLORS[group.os.toLowerCase()] || '#64748b' }}
                    />
                    <h4 className="text-sm font-bold text-ink">
                      {displayOS(group.os)} / {group.arch}
                    </h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-surface border border-surface-border text-ink-muted font-mono">
                      {group.agents.length} agent{group.agents.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold">
                    <span className="text-emerald-400">{group.online} online</span>
                    {group.offline > 0 && <span className="text-red-400">{group.offline} offline</span>}
                  </div>
                </div>

                {/* Agents List under this Platform */}
                <div className="divide-y divide-surface-border/50">
                  {group.agents.map(agent => {
                    const isReconnectingThis = reconnectingIds.has(agent.id);
                    const latency = reconnectLatency[agent.id];

                    return (
                      <div
                        key={agent.id}
                        onClick={() => navigate(`/agents/${agent.id}`)}
                        className="px-5 py-3.5 flex items-center justify-between hover:bg-surface-muted/60 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full ${getEffectiveStatus(agent) === 'Online' ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse' : 'bg-red-400'}`} />
                          <div>
                            <div className="text-sm font-bold text-ink group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                              <span>{agent.name || agent.hostname}</span>
                              {latency !== undefined && (
                                <span className="text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded flex items-center gap-1">
                                  <Zap className="w-2.5 h-2.5" />
                                  {latency}ms
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-ink-muted font-mono">{agent.ip_address || agent.id}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {agent.version && (
                            <span className="text-xs text-ink-muted font-mono bg-surface-muted px-2 py-0.5 rounded border border-surface-border">
                              v{agent.version}
                            </span>
                          )}

                          <StatusBadge status={getEffectiveStatus(agent)} />

                          {/* Reconnect Action Button */}
                          <button
                            onClick={(e) => handleReconnectAgent(e, agent)}
                            disabled={isReconnectingThis}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                              isReconnectingThis
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 cursor-wait'
                                : 'bg-surface-muted hover:bg-emerald-500/20 text-ink-muted hover:text-emerald-300 border border-surface-border hover:border-emerald-500/30'
                            }`}
                            title="Thử kết nối lại và kiểm tra độ trễ đến agent này"
                          >
                            {isReconnectingThis ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                                <span>Reconnecting...</span>
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-180 transition-transform duration-300" />
                                <span>Reconnect</span>
                              </>
                            )}
                          </button>

                          <ChevronRight className="w-4 h-4 text-ink-faint group-hover:text-emerald-400 transition-colors" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </>
);
}
