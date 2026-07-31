import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Globe,
  Plus,
  Play,
  Trash2,
  X,
  Activity,
  CheckCircle2,
  Clock,
  Radio,
  Pencil,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useTrackedMutation } from '../hooks/useTrackedMutation';
import {
  getNetworkScanTargets,
  createNetworkScanTarget,
  updateNetworkScanTarget,
  deleteNetworkScanTarget,
  triggerNetworkScan,
  probeSCEPServer,
  listSCEPProbes,
} from '../api/client';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import type { Column } from '../components/DataTable';
import ErrorState from '../components/ErrorState';
import { formatDateTime } from '../api/utils';
import type { NetworkScanTarget, SCEPProbeResult } from '../api/types';

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-surface border border-surface-border rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
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

export default function NetworkScanPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [editingTarget, setEditingTarget] = useState<NetworkScanTarget | null>(null);
  const [activeScanningId, setActiveScanningId] = useState<string | null>(null);
  const [scanStatusMessage, setScanStatusMessage] = useState<{
    type: 'info' | 'success' | 'error';
    text: string;
  } | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['network-scan-targets'],
    queryFn: () => getNetworkScanTargets(),
    refetchInterval: 30000,
  });

  const scanTargetInvalidates = [['network-scan-targets']];

  const createMutation = useTrackedMutation({
    mutationFn: createNetworkScanTarget,
    invalidates: scanTargetInvalidates,
    onSuccess: () => {
      setShowCreate(false);
    },
  });

  const updateMutation = useTrackedMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NetworkScanTarget> }) =>
      updateNetworkScanTarget(id, data),
    invalidates: scanTargetInvalidates,
    onSuccess: () => {
      setEditingTarget(null);
    },
  });

  const deleteMutation = useTrackedMutation({
    mutationFn: deleteNetworkScanTarget,
    invalidates: scanTargetInvalidates,
  });

  const toggleMutation = useTrackedMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      updateNetworkScanTarget(id, { enabled }),
    invalidates: scanTargetInvalidates,
  });

  const scanMutation = useTrackedMutation({
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
    scanMutation.mutate(t.id);
  };

  const targets = data?.data || [];
  const enabledCount = targets.filter(t => t.enabled).length;

  const columns: Column<NetworkScanTarget>[] = [
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
          onClick={(e) => { e.stopPropagation(); toggleMutation.mutate({ id: t.id, enabled: !t.enabled }); }}
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
        const isScanningThis = activeScanningId === t.id || (scanMutation.isPending && scanMutation.variables === t.id);
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
              onClick={(e) => { e.stopPropagation(); setEditingTarget(t); }}
              className="p-1.5 text-xs text-ink-muted hover:text-emerald-400 hover:bg-surface-muted rounded-lg transition-colors"
              title="Sửa thông tin target"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(t.id); }}
              disabled={deleteMutation.isPending}
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
        title="Network Scanning"
        subtitle={data ? `${data.total} network scan targets configured` : undefined}
        action={
          <button
            onClick={() => setShowCreate(true)}
            className="btn btn-primary text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Target</span>
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Status Alert Notification Banner */}
        {scanStatusMessage && (
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-medium ${
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
              <div className="text-2xl font-bold text-ink mt-1 font-mono">{targets.length}</div>
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
              <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">{enabledCount} / {targets.length}</div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-surface p-4 rounded-2xl border border-surface-border flex items-center justify-between shadow-sm">
            <div>
              <div className="text-xs font-semibold text-ink-muted flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-amber-400" />
                <span>Công Cụ Thử Nghiệm SCEP Probe</span>
              </div>
              <div className="text-xs text-ink-muted mt-1">Kiểm tra tính sẵn sàng RFC 8894</div>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Radio className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-surface rounded-2xl border border-surface-border shadow-sm overflow-hidden">
          {error ? (
            <ErrorState error={error as Error} onRetry={() => refetch()} />
          ) : (
            <DataTable
              columns={columns}
              data={targets}
              isLoading={isLoading}
              emptyMessage="No scan targets configured. Create one to start discovering certificates on your network."
            />
          )}
        </div>

        {/* SCEP Probe Section */}
        <SCEPProbeSection />
      </div>

      {showCreate && (
        <ScanTargetModal
          onClose={() => setShowCreate(false)}
          onSubmit={(d) => createMutation.mutate(d)}
        />
      )}

      {editingTarget && (
        <ScanTargetModal
          target={editingTarget}
          onClose={() => setEditingTarget(null)}
          onSubmit={(d) => updateMutation.mutate({ id: editingTarget.id, data: d })}
        />
      )}
    </>
  );
}

function SCEPProbeSection() {
  const [url, setUrl] = useState('');
  const [latestResult, setLatestResult] = useState<SCEPProbeResult | null>(null);
  const [probeError, setProbeError] = useState<string | undefined>(undefined);

  const historyQuery = useQuery({
    queryKey: ['scep-probes'],
    queryFn: listSCEPProbes,
    refetchInterval: 60_000,
  });

  const probeMutation = useTrackedMutation<SCEPProbeResult, Error, string>({
    mutationFn: (target: string) => probeSCEPServer(target),
    invalidates: [['scep-probes']],
    onSuccess: (result) => {
      setLatestResult(result);
      setProbeError(undefined);
    },
    onError: (err: Error) => {
      setLatestResult(null);
      setProbeError(err.message);
    },
  });

  const handleProbe = () => {
    if (!url.trim()) {
      setProbeError('Enter a SCEP server URL');
      return;
    }
    setProbeError(undefined);
    probeMutation.mutate(url.trim());
  };

  return (
    <section className="bg-surface border border-surface-border rounded-2xl p-6 shadow-sm space-y-4" data-testid="scep-probe-section">
      <header className="flex items-center justify-between pb-3 border-b border-surface-border">
        <div>
          <h2 className="text-base font-bold text-ink flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400" />
            <span>SCEP Server Probe</span>
          </h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Thử nghiệm và kiểm tra năng lực SCEP Server (RFC 8894 GetCACaps + GetCACert). Phục vụ đánh giá tiền di chuyển từ EJBCA / NDES.
          </p>
        </div>
      </header>

      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://scep.example.com/scep"
            className="flex-1 bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs font-mono text-ink focus:outline-none focus:border-emerald-400"
            data-testid="scep-probe-url-input"
            disabled={probeMutation.isPending}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleProbe();
            }}
          />
          <button
            type="button"
            onClick={handleProbe}
            disabled={probeMutation.isPending}
            className="btn btn-primary text-xs font-semibold px-4 py-2 rounded-xl disabled:opacity-50 flex items-center gap-1.5"
            data-testid="scep-probe-submit"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{probeMutation.isPending ? 'Probing…' : 'Probe'}</span>
          </button>
        </div>

        {probeError && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400 font-mono" data-testid="scep-probe-error">
            {probeError}
          </div>
        )}

        {latestResult && <SCEPProbeResultPanel result={latestResult} />}
      </div>

      <SCEPProbeHistoryTable
        probes={historyQuery.data?.probes ?? []}
        isLoading={historyQuery.isLoading}
      />
    </section>
  );
}

function SCEPProbeResultPanel({ result }: { result: SCEPProbeResult }) {
  const tone = result.error
    ? 'bg-red-500/10 border-red-500/30 text-red-400'
    : result.reachable
      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
      : 'bg-amber-500/10 border-amber-500/30 text-amber-300';

  return (
    <div className={`rounded-xl border p-4 text-xs space-y-3 ${tone}`} data-testid="scep-probe-result-panel">
      <div className="flex items-center justify-between border-b border-current/20 pb-2">
        <strong className="text-sm font-mono font-bold">{result.target_url}</strong>
        <span className="font-mono text-[11px]">{formatDateTime(result.probed_at)} · {result.probe_duration_ms}ms</span>
      </div>

      {result.error && (
        <p className="font-mono text-xs">Error: {result.error}</p>
      )}

      {result.reachable && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5" data-testid="scep-probe-cap-badges">
            <CapBadge label="RFC 8894" supported={result.supports_rfc8894} />
            <CapBadge label="AES" supported={result.supports_aes} />
            <CapBadge label="POST" supported={result.supports_post_operation} />
            <CapBadge label="Renewal" supported={result.supports_renewal} />
            <CapBadge label="SHA-256" supported={result.supports_sha256} />
            <CapBadge label="SHA-512" supported={result.supports_sha512} />
          </div>

          {result.ca_cert_subject && (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-black/20 rounded-lg text-xs font-mono">
              <div><span className="font-semibold text-current">CA cert subject:</span> {result.ca_cert_subject}</div>
              <div><span className="font-semibold text-current">Issuer:</span> {result.ca_cert_issuer}</div>
              <div><span className="font-semibold text-current">Algorithm:</span> {result.ca_cert_algorithm || '(unknown)'}</div>
              <div><span className="font-semibold text-current">Chain length:</span> {result.ca_cert_chain_length}</div>
              <div className="sm:col-span-2">
                <span className="font-semibold text-current">Expires:</span>{' '}
                {result.ca_cert_not_after ? formatDateTime(result.ca_cert_not_after) : '(unknown)'}{' '}
                {result.ca_cert_expired ? (
                  <span className="text-red-400 font-bold">(EXPIRED)</span>
                ) : (
                  <span>({result.ca_cert_days_to_expiry}d remaining)</span>
                )}
              </div>
            </dl>
          )}

          {result.advertised_caps && result.advertised_caps.length > 0 && (
            <p className="text-[11px] font-mono">
              Raw caps: <code>{result.advertised_caps.join(', ')}</code>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function CapBadge({ label, supported }: { label: string; supported: boolean }) {
  return (
    <span
      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border font-mono ${
        supported ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-surface-muted text-ink-muted border-surface-border'
      }`}
      data-testid={`scep-probe-cap-${label.toLowerCase().replace(/\W/g, '-')}`}
    >
      {label} {supported ? '✓' : '✗'}
    </span>
  );
}

function SCEPProbeHistoryTable({ probes, isLoading }: { probes: SCEPProbeResult[]; isLoading: boolean }) {
  if (isLoading) {
    return <p className="text-xs text-ink-muted">Loading probe history…</p>;
  }
  if (probes.length === 0) {
    return <p className="text-xs text-ink-muted text-center py-4">No SCEP probes yet — probe a URL above to start.</p>;
  }

  return (
    <div className="pt-2" data-testid="scep-probe-history-table">
      <h3 className="text-xs font-bold text-ink uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-emerald-400" />
        <span>Lịch Sử Thử Nghiệm SCEP Probe Gần Đây</span>
      </h3>
      <div className="overflow-x-auto rounded-xl border border-surface-border">
        <table className="w-full text-xs">
          <thead className="bg-surface-muted text-ink-muted uppercase text-[10px] tracking-wider border-b border-surface-border">
            <tr>
              <th className="text-left py-2 px-3">When</th>
              <th className="text-left py-2 px-3">Target URL</th>
              <th className="text-left py-2 px-3">Reachable</th>
              <th className="text-left py-2 px-3">RFC 8894</th>
              <th className="text-left py-2 px-3">CA Expiry</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {probes.map((p) => (
              <tr key={p.id} className="hover:bg-surface-muted/40 transition-colors">
                <td className="py-2 px-3 font-mono text-ink-muted">{formatDateTime(p.probed_at)}</td>
                <td className="py-2 px-3 font-mono text-ink font-bold break-all">{p.target_url}</td>
                <td className="py-2 px-3 font-bold">
                  {p.reachable ? (
                    <span className="text-emerald-400">Yes</span>
                  ) : (
                    <span className="text-red-400">No</span>
                  )}
                </td>
                <td className="py-2 px-3 font-mono">{p.supports_rfc8894 ? '✓' : '✗'}</td>
                <td className="py-2 px-3 font-mono">
                  {p.ca_cert_expired ? (
                    <span className="text-red-400 font-bold">EXPIRED</span>
                  ) : p.ca_cert_subject ? (
                    `${p.ca_cert_days_to_expiry}d`
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
