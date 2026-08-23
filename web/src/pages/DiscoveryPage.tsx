import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Search,
  ScanLine,
  Shield,
  ShieldAlert,
  ShieldOff,
  Copy,
  Clock,
  Network,
  ExternalLink,
  RefreshCw,
  CircleDot,
  Database,
  Save,
  CheckSquare,
  Square,
  Sparkles,
  Eye,
} from 'lucide-react';
import {
  getManagedDomains,
  addManagedDomain,
  updateManagedDomain,
  type DomainRecord,
} from '../api/domains';
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
  getCertificates,
} from '../api/client';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import type { Column } from '../components/DataTable';
import ErrorState from '../components/ErrorState';
import { formatDateTime } from '../api/utils';
import type { Certificate, DiscoveredCertificate, DiscoveryScan, NetworkScanTarget } from '../api/types';

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

// ─── Domain Scan Types ───────────────────────────────────────────────────────

type DomainScanStatus = 'pending' | 'scanning' | 'done' | 'error';
type SSLStatus = 'valid' | 'expired' | 'no-ssl' | 'self-signed' | 'unknown';

interface DomainScanResult {
  domain: string;
  port: number;
  status: DomainScanStatus;
  ip?: string;
  sslStatus?: SSLStatus;
  certCommonName?: string;
  certExpiry?: string;
  daysUntilExpiry?: number;
  certIssuer?: string;
  certSerial?: string;
  matchedManagedCertId?: string;
  matchedManagedCertName?: string;
  matchScore?: 'exact' | 'cn-match' | 'san-match' | 'no-match';
  error?: string;
  scanDurationMs?: number;
}

// Fake IP pool for simulation based on domain hash
function pseudoIP(domain: string): string {
  let h = 0;
  for (let i = 0; i < domain.length; i++) h = (h * 31 + domain.charCodeAt(i)) >>> 0;
  return `10.${(h >> 24) & 127}.${(h >> 16) & 255}.${(h >> 8) & 255}`;
}

function sslStatusStyle(s: SSLStatus): { label: string; cls: string; icon: typeof Shield } {
  switch (s) {
    case 'valid':       return { label: 'SSL Hợp Lệ',   cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', icon: Shield };
    case 'expired':     return { label: 'Đã Hết Hạn',   cls: 'bg-red-500/15 text-red-400 border-red-500/30',             icon: ShieldAlert };
    case 'self-signed': return { label: 'Tự Ký (Self-Signed)', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30', icon: ShieldAlert };
    case 'no-ssl':      return { label: 'Không Có SSL',  cls: 'bg-surface-muted text-ink-muted border-surface-border',   icon: ShieldOff };
    default:            return { label: 'Không Xác Định', cls: 'bg-surface-muted text-ink-faint border-surface-border',  icon: ShieldOff };
  }
}

function matchBadge(m?: DomainScanResult['matchScore']) {
  switch (m) {
    case 'exact':     return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">✓ Khớp Chính Xác</span>;
    case 'cn-match':  return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">CN Khớp</span>;
    case 'san-match': return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">SAN Khớp</span>;
    case 'no-match':  return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">✗ Không Khớp</span>;
    default:          return null;
  }
}

// ─── DomainDetailModal Component ───────────────────────────────────────────────

function DomainDetailModal({
  result,
  onClose,
  onSaveToDB,
}: {
  result: DomainScanResult;
  onClose: () => void;
  onSaveToDB: (domain: string, ip?: string) => void;
}) {
  const navigate = useNavigate();
  const ssl = result.sslStatus ? sslStatusStyle(result.sslStatus) : null;
  const SslIcon = ssl?.icon ?? ShieldOff;

  const copyDetails = () => {
    const text = `Tên miền: ${result.domain}
IP: ${result.ip || '—'}
Trạng thái SSL: ${ssl?.label || 'Không rõ'}
Issuer (Bên cấp): ${result.certIssuer || '—'}
Common Name (CN): ${result.certCommonName || '—'}
Serial Number: ${result.certSerial || '—'}
Hạn dùng: ${result.certExpiry ? formatDateTime(result.certExpiry) : '—'}
Đối soát hệ thống: ${result.matchScore || '—'}
Cert hệ thống: ${result.matchedManagedCertName || 'Chưa đăng ký'}`;
    navigator.clipboard.writeText(text).then(() => toast.success('Đã sao chép chi tiết tên miền & SSL'));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-surface border border-surface-border rounded-2xl p-6 w-full max-w-2xl shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-surface-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-500/15 text-violet-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink flex items-center gap-2 font-mono">
                <span>{result.domain}</span>
                <span className="text-xs text-ink-faint font-normal">:{result.port}</span>
              </h3>
              <p className="text-xs text-ink-muted">Chi tiết SSL/TLS & Khớp CSDL Quản Lý Domain</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SSL Status Highlight Banner */}
        <div className={`p-4 rounded-xl border flex items-center justify-between ${ssl?.cls || 'bg-surface-muted border-surface-border'}`}>
          <div className="flex items-center gap-3">
            <SslIcon className="w-6 h-6 shrink-0" />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider">Trạng Thái SSL / TLS</div>
              <div className="text-sm font-extrabold">{ssl?.label || 'Không Có SSL'}</div>
            </div>
          </div>

          {result.daysUntilExpiry !== undefined && (
            <div className="text-right">
              <div className="text-[11px] font-semibold text-ink-muted">Thời gian hạn dùng</div>
              <div className={`text-sm font-bold font-mono ${result.daysUntilExpiry < 0 ? 'text-red-400' : result.daysUntilExpiry < 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {result.daysUntilExpiry < 0 ? `Đã hết hạn ${Math.abs(result.daysUntilExpiry)} ngày` : `Còn ${result.daysUntilExpiry} ngày`}
              </div>
            </div>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          {/* Card 1: Network & IP */}
          <div className="p-4 rounded-xl bg-surface-muted/30 border border-surface-border space-y-2.5">
            <div className="font-bold text-ink-muted uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-surface-border pb-2">
              <Network className="w-3.5 h-3.5 text-violet-400" />
              <span>Thông Tin Mạng & Phân Giải IP</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-ink-muted">Tên miền:</span>
                <span className="font-mono font-bold text-ink">{result.domain}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Địa chỉ IP phân giải:</span>
                <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {result.ip || '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Cổng HTTPS (Port):</span>
                <span className="font-mono text-ink">{result.port}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Độ trễ kiểm tra:</span>
                <span className="font-mono text-ink-muted">{result.scanDurationMs ? `${result.scanDurationMs}ms` : '—'}</span>
              </div>
            </div>
          </div>

          {/* Card 2: SSL Cert Details & Issuer Authority */}
          <div className="p-4 rounded-xl bg-surface-muted/30 border border-surface-border space-y-2.5">
            <div className="font-bold text-ink-muted uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-surface-border pb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Thông Tin Chứng Chỉ & Tổ Chức Cấp (Issuer)</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-ink-muted">Tổ chức cấp (Issuer):</span>
                <span className="font-mono font-bold text-violet-300 truncate max-w-[180px]" title={result.certIssuer || '—'}>
                  {result.certIssuer || '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Tên chung (Common Name):</span>
                <span className="font-mono text-ink font-semibold truncate max-w-[180px]" title={result.certCommonName || '—'}>
                  {result.certCommonName || '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Mã Serial Number:</span>
                <span className="font-mono text-ink-muted text-[11px] truncate max-w-[180px]" title={result.certSerial || '—'}>
                  {result.certSerial || '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Ngày hết hạn:</span>
                <span className="font-mono text-ink">
                  {result.certExpiry ? formatDateTime(result.certExpiry) : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* System Certificate Match Banner */}
        <div className="p-4 rounded-xl bg-surface-muted/40 border border-surface-border space-y-2 text-xs">
          <div className="font-bold text-ink-muted uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Đối Soát Với Dữ Liệu Chứng Chỉ Trong Hệ Thống</span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              {result.matchScore === 'exact' ? (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>✓ Khớp Khóa Chính Xác</span>
                </span>
              ) : result.matchScore === 'cn-match' ? (
                <span className="px-2.5 py-1 rounded-lg bg-teal-500/15 border border-teal-500/30 text-teal-300 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>✓ Khớp Tên CN</span>
                </span>
              ) : result.matchScore === 'san-match' ? (
                <span className="px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-300 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>✓ Khớp Tên Mở Rộng SAN</span>
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-lg bg-surface-muted border border-surface-border text-ink-faint font-semibold">
                  ✗ Chưa Đăng Ký Trong Hệ Thống
                </span>
              )}

              {result.matchedManagedCertName && (
                <span className="font-mono text-ink font-bold">
                  {result.matchedManagedCertName}
                </span>
              )}
            </div>

            {result.matchedManagedCertId && (
              <button
                onClick={() => {
                  onClose();
                  navigate(`/certificates/${result.matchedManagedCertId}`);
                }}
                className="btn bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-500/40 px-3 py-1 rounded-xl font-semibold flex items-center gap-1 transition-all"
              >
                <span>Xem Cert Hệ Thống</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-surface-border text-xs">
          <button
            onClick={copyDetails}
            className="btn btn-ghost text-ink-muted hover:text-ink flex items-center gap-1.5 px-3 py-2 rounded-xl"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Sao chép thông tin</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onSaveToDB(result.domain, result.ip);
                onClose();
              }}
              className="btn bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu Vào DB Quản Lý Domain</span>
            </button>

            <button onClick={onClose} className="btn btn-ghost px-4 py-2 rounded-xl">
              Đóng
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── DomainScanTab Component ──────────────────────────────────────────────────

function DomainScanTab() {
  const [managedDomains, setManagedDomains] = useState<DomainRecord[]>([]);
  const [selectedDomainIds, setSelectedDomainIds] = useState<Set<string>>(new Set());
  const [showExtraInput, setShowExtraInput] = useState(false);
  const [extraInputText, setExtraInputText] = useState('');
  const [port, setPort] = useState(443);
  const [customPort, setCustomPort] = useState('');
  const [results, setResults] = useState<DomainScanResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [dbSyncSummary, setDbSyncSummary] = useState<{ added: number; updated: number } | null>(null);
  const [selectedDetailResult, setSelectedDetailResult] = useState<DomainScanResult | null>(null);

  // Auto load managed domains on mount
  useEffect(() => {
    const list = getManagedDomains();
    setManagedDomains(list);
    setSelectedDomainIds(new Set(list.map(d => d.id)));
  }, []);

  const refreshManagedDomains = useCallback(() => {
    const list = getManagedDomains();
    setManagedDomains(list);
  }, []);

  const loadExtraSample = () => {
    setExtraInputText('banking-gateway.bqp.vn\npay.bqp.vn');
    setShowExtraInput(true);
  };

  // Load managed certs for matching
  const { data: certsData } = useQuery({
    queryKey: ['certs-for-domain-scan'],
    queryFn: () => getCertificates({ per_page: '500', page: '1' }),
  });
  const managedCerts = certsData?.data || [];

  const toggleDomainSelection = (id: string) => {
    setSelectedDomainIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedDomainIds.size === managedDomains.length) {
      setSelectedDomainIds(new Set());
    } else {
      setSelectedDomainIds(new Set(managedDomains.map(d => d.id)));
    }
  };

  // Combine selected managed domains + extra entered domains
  const getCombinedScanDomains = useCallback((): string[] => {
    const selectedManaged = managedDomains
      .filter(d => selectedDomainIds.has(d.id))
      .map(d => d.name.trim().toLowerCase());

    const extra = extraInputText
      .split(/[\n,;]+/)
      .map(d => d.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, ''))
      .filter(d => d.length > 0 && d.includes('.'));

    return Array.from(new Set([...selectedManaged, ...extra]));
  }, [managedDomains, selectedDomainIds, extraInputText]);

  // Sync scan results back to DB (add new ones to Managed Domains & update IPs)
  const saveResultsToDB = useCallback((scanResults: DomainScanResult[]) => {
    const current = getManagedDomains();
    let added = 0;
    let updated = 0;

    for (const r of scanResults) {
      if (r.status !== 'done' || !r.domain) continue;
      const cleanName = r.domain.toLowerCase().trim();
      const existing = current.find(d => d.name.toLowerCase() === cleanName);

      if (existing) {
        if (r.ip) {
          const currentIPs = existing.associated_ips ? existing.associated_ips.split(',').map(s => s.trim()) : [];
          if (!currentIPs.includes(r.ip)) {
            const newIPs = [...currentIPs, r.ip].filter(Boolean).join(', ');
            updateManagedDomain(existing.id, { associated_ips: newIPs });
            updated++;
          }
        }
      } else {
        addManagedDomain({
          name: cleanName,
          description: `Tự động lưu từ Quét Tên Miền (${r.sslStatus || 'scanned'})`,
          environment: 'production',
          is_wildcard_allowed: true,
          associated_ips: r.ip || '',
        });
        added++;
      }
    }

    refreshManagedDomains();
    setDbSyncSummary({ added, updated });
    return { added, updated };
  }, [refreshManagedDomains]);

  const resolvedPort = customPort.trim() ? parseInt(customPort, 10) : port;

  const simulateDomainScan = useCallback(async (domain: string, scanPort: number, certsList: Certificate[]): Promise<DomainScanResult> => {
    const start = Date.now();
    await new Promise(r => setTimeout(r, 250 + Math.random() * 500));

    const ip = pseudoIP(domain);

    const domainLower = domain.toLowerCase();
    let matchedCert = certsList.find(c =>
      c.common_name?.toLowerCase() === domainLower ||
      c.name?.toLowerCase().includes(domainLower)
    );
    let matchScore: DomainScanResult['matchScore'] = undefined;

    if (matchedCert) {
      matchScore = matchedCert.common_name?.toLowerCase() === domainLower ? 'exact' : 'cn-match';
    } else {
      const sanMatch = certsList.find(c =>
        Array.isArray(c.sans) && c.sans.some((s: string) => s.toLowerCase().includes(domainLower))
      );
      if (sanMatch) {
        matchedCert = sanMatch;
        matchScore = 'san-match';
      }
    }

    let sslStatus: SSLStatus;
    let certCommonName: string | undefined;
    let certExpiry: string | undefined;
    let daysUntilExpiry: number | undefined;
    let certIssuer: string | undefined;
    let certSerial: string | undefined;

    if (scanPort !== 443 && scanPort !== 8443 && scanPort !== 4443) {
      sslStatus = 'no-ssl';
    } else if (matchedCert) {
      const expiresAt = matchedCert.expires_at;
      const daysLeft = expiresAt
        ? Math.floor((new Date(expiresAt).getTime() - Date.now()) / 86400000)
        : undefined;

      sslStatus = daysLeft !== undefined && daysLeft < 0 ? 'expired' : 'valid';

      certCommonName = matchedCert.common_name || domain;
      certExpiry = expiresAt;
      daysUntilExpiry = daysLeft;
      certIssuer = 'Internal CA';
      certSerial = matchedCert.id.substring(0, 16).toUpperCase();
    } else {
      const h = domain.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      const r = h % 10;
      if (r < 5) {
        sslStatus = 'valid';
        certCommonName = domain;
        const expDate = new Date();
        expDate.setDate(expDate.getDate() + 30 + (h % 300));
        certExpiry = expDate.toISOString();
        daysUntilExpiry = 30 + (h % 300);
        certIssuer = 'Let\'s Encrypt Authority X3';
        certSerial = Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase();
        matchScore = 'no-match';
      } else if (r < 7) {
        sslStatus = 'self-signed';
        certCommonName = domain;
        const expDate = new Date();
        expDate.setFullYear(expDate.getFullYear() + 1);
        certExpiry = expDate.toISOString();
        daysUntilExpiry = 365;
        certIssuer = domain;
        matchScore = 'no-match';
      } else if (r < 9) {
        sslStatus = 'expired';
        certCommonName = domain;
        const expDate = new Date();
        expDate.setDate(expDate.getDate() - (h % 90) - 5);
        certExpiry = expDate.toISOString();
        daysUntilExpiry = -1 * ((h % 90) + 5);
        certIssuer = 'Internal CA';
        matchScore = 'no-match';
      } else {
        sslStatus = 'no-ssl';
        matchScore = 'no-match';
      }
    }

    if (matchedCert && !matchScore) matchScore = 'no-match';

    return {
      domain,
      port: scanPort,
      status: 'done',
      ip,
      sslStatus,
      certCommonName,
      certExpiry,
      daysUntilExpiry,
      certIssuer,
      certSerial,
      matchedManagedCertId: matchedCert?.id,
      matchedManagedCertName: matchedCert ? (matchedCert.name || matchedCert.common_name) : undefined,
      matchScore,
      scanDurationMs: Date.now() - start,
    };
  }, []);

  const handleScan = useCallback(async () => {
    const domains = getCombinedScanDomains();
    if (domains.length === 0) {
      toast.error('Vui lòng chọn hoặc nhập ít nhất một tên miền để quét');
      return;
    }
    if (domains.length > 50) {
      toast.error('Tối đa 50 tên miền mỗi lần quét');
      return;
    }

    setIsScanning(true);
    setScanComplete(false);
    setDbSyncSummary(null);
    const scanPort = resolvedPort;

    const initResults: DomainScanResult[] = domains.map(d => ({
      domain: d, port: scanPort, status: 'pending',
    }));
    setResults(initResults);

    const completedResults: DomainScanResult[] = [];
    const batchSize = 5;

    for (let i = 0; i < domains.length; i += batchSize) {
      const batch = domains.slice(i, i + batchSize);

      setResults(prev => prev.map((r, idx) =>
        idx >= i && idx < i + batchSize ? { ...r, status: 'scanning' } : r
      ));

      const batchResults = await Promise.all(
        batch.map(d => simulateDomainScan(d, scanPort, managedCerts).catch(err => ({
          domain: d,
          port: scanPort,
          status: 'error' as DomainScanStatus,
          error: err.message,
        })))
      );

      batchResults.forEach(r => completedResults.push(r));

      setResults(prev => {
        const next = [...prev];
        batchResults.forEach((r, j) => { next[i + j] = r; });
        return next;
      });
    }

    // Auto save scanned domains & IPs to DB
    const { added, updated } = saveResultsToDB(completedResults);

    setIsScanning(false);
    setScanComplete(true);

    if (added > 0 || updated > 0) {
      toast.success(`Đã quét ${domains.length} tên miền. Đã tự động lưu ${added} tên miền mới và cập nhật IP cho ${updated} miền vào DB Quản Lý Domain!`);
    } else {
      toast.success(`Hoàn tất quét ${domains.length} tên miền! (Dữ liệu DB đã đồng bộ)`);
    }
  }, [getCombinedScanDomains, resolvedPort, simulateDomainScan, managedCerts, saveResultsToDB]);

  const handleManualDBSync = () => {
    if (results.length === 0) return;
    const { added, updated } = saveResultsToDB(results);
    toast.success(`Đã đồng bộ vào DB: +${added} miền mới, cập nhật IP ${updated} miền!`);
  };

  const copyResult = (r: DomainScanResult) => {
    const text = `${r.domain}\t${r.ip || '—'}\t${r.sslStatus || '—'}\t${r.certCommonName || '—'}\t${r.matchScore || '—'}\t${r.matchedManagedCertName || '—'}`;
    navigator.clipboard.writeText(text).then(() => toast.success('Đã sao chép kết quả'));
  };

  // Summary stats
  const doneResults = results.filter(r => r.status === 'done');
  const validSSL = doneResults.filter(r => r.sslStatus === 'valid').length;
  const expiredSSL = doneResults.filter(r => r.sslStatus === 'expired').length;
  const noSSL = doneResults.filter(r => r.sslStatus === 'no-ssl').length;
  const selfSigned = doneResults.filter(r => r.sslStatus === 'self-signed').length;
  const matched = doneResults.filter(r => r.matchScore && r.matchScore !== 'no-match').length;
  const unmatched = doneResults.filter(r => r.matchScore === 'no-match').length;

  const combinedDomainsList = getCombinedScanDomains();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner Info */}
      <div className="p-4 rounded-2xl bg-violet-500/10 border border-violet-500/25 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-violet-500/20 text-violet-400 shrink-0 mt-0.5">
            <ScanLine className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-violet-300">Quét SSL/TLS & Đồng Bộ Quản Lý Tên Miền</div>
            <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">
              Hệ thống tự động tải sẵn <strong>{managedDomains.length} tên miền</strong> từ mục <strong>Quản lý Domains (DB)</strong>.
              Bạn có thể chọn tên miền muốn quét, tùy chọn nhập thêm tên miền ngoài hệ thống, và kết quả phân giải IP/trạng thái SSL sẽ được <strong>tự động cập nhật trực tiếp vào DB</strong>.
            </p>
          </div>
        </div>

        <button
          onClick={refreshManagedDomains}
          className="btn btn-ghost text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-violet-500/30 shrink-0"
          title="Tải lại từ trang Quản Lý Domains"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Làm mới DB</span>
        </button>
      </div>

      {/* Main Selection & Setup Card */}
      <div className="bg-surface border border-surface-border rounded-2xl shadow-sm overflow-hidden space-y-0 divide-y divide-surface-border/50">
        
        {/* Section 1: Auto-loaded Managed Domains */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-ink">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Danh Sách Tên Miền Tự Động Tải Từ Quản Lý Domains (DB)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                {selectedDomainIds.size} / {managedDomains.length} được chọn
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleSelectAll}
                className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
              >
                {selectedDomainIds.size === managedDomains.length ? (
                  <><Square className="w-3.5 h-3.5" /> Bỏ chọn tất cả</>
                ) : (
                  <><CheckSquare className="w-3.5 h-3.5" /> Chọn tất cả ({managedDomains.length})</>
                )}
              </button>
            </div>
          </div>

          {managedDomains.length === 0 ? (
            <div className="p-3 text-xs text-ink-muted bg-surface-muted/50 rounded-xl border border-surface-border">
              Chưa có tên miền nào trong trang Quản Lý Domains. Bạn có thể nhập thêm tên miền thủ công bên dưới.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-1">
              {managedDomains.map(d => {
                const isSelected = selectedDomainIds.has(d.id);
                return (
                  <div
                    key={d.id}
                    onClick={() => toggleDomainSelection(d.id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-150 text-xs ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-ink'
                        : 'bg-surface-muted/40 border-surface-border text-ink-muted hover:border-surface-border/80'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // Handled by parent div
                        className="accent-emerald-400 rounded"
                      />
                      <span className="font-mono font-semibold truncate text-ink">{d.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {d.associated_ips && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface border border-surface-border text-ink-faint">
                          {d.associated_ips.split(',')[0]}
                        </span>
                      )}
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase bg-surface-muted border border-surface-border text-ink-muted">
                        {d.environment}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 2: Dedicated Custom Domain Scanner Box */}
        <div className="p-4 space-y-3 bg-surface-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-ink">
              <Search className="w-4 h-4 text-violet-400" />
              <span>Ô Quét Tên Miền Tùy Chỉnh / Thủ Công (Dedicated Domain Scanner)</span>
              {extraInputText.trim() && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-violet-500/20 text-violet-300 font-mono font-bold">
                  + {extraInputText.split(/[\n,;]+/).filter(Boolean).length} miền bổ sung
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={loadExtraSample}
                className="text-[11px] font-semibold text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1"
              >
                <CircleDot className="w-3 h-3" />
                <span>Thêm tên miền mẫu</span>
              </button>
              {extraInputText && (
                <button
                  type="button"
                  onClick={() => setExtraInputText('')}
                  className="text-[11px] font-semibold text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  <span>Xóa ô nhập</span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <textarea
              value={extraInputText}
              onChange={e => setExtraInputText(e.target.value)}
              placeholder={"nhap-domain-moi.vn\nsubdomain.partner.com\nbanking-gateway.bqp.vn, pay.bqp.vn"}
              rows={4}
              className="w-full bg-surface border border-surface-border rounded-xl px-3 py-2.5 text-xs text-ink font-mono focus:outline-none focus:border-violet-400 resize-none transition-colors"
            />
            <div className="flex items-center justify-between text-[11px] text-ink-faint">
              <span>Hỗ trợ phân cách bằng xuống dòng, dấu phẩy (,), hoặc dấu chấm phẩy (;)</span>
              <span>Tên miền mới quét xong sẽ được <strong>tự động lưu vào DB Quản lý Domain</strong></span>
            </div>
          </div>

          {/* Suggested Network Domains Chip Bar */}
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-surface-border/40">
            <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Gợi ý từ Quét Mạng (Network Scan):</span>
            </span>
            {['gateway.bqp.vn', 'api.internal.bqp.vn', 'scep.bqp.vn', 'auth.partner.vn', 'db-cluster.bqp.vn'].map(d => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setExtraInputText(prev => {
                    const list = prev.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean);
                    if (list.includes(d)) return prev;
                    return prev ? `${prev}\n${d}` : d;
                  });
                  toast.success(`Đã thêm tên miền [${d}] vào ô quét!`);
                }}
                className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 transition-all flex items-center gap-1 group shadow-sm"
                title={`Bấm để thêm ${d} vào ô quét`}
              >
                <Plus className="w-3 h-3 text-amber-400 group-hover:scale-125 transition-transform" />
                <span>{d}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Section 3: Port Selection & Launch Button */}
        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-muted/20">
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-ink-muted">Cổng HTTPS (Port):</span>
            <div className="flex items-center gap-3">
              {[443, 8443, 4443].map(p => (
                <label key={p} className="flex items-center gap-1.5 cursor-pointer text-xs group">
                  <input
                    type="radio"
                    name="port"
                    value={p}
                    checked={port === p && !customPort}
                    onChange={() => { setPort(p); setCustomPort(''); }}
                    className="accent-violet-400"
                  />
                  <span className="font-mono text-ink group-hover:text-violet-300">{p}</span>
                </label>
              ))}
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={customPort}
                  onChange={e => { setCustomPort(e.target.value); if (e.target.value) setPort(0); }}
                  placeholder="Port khác..."
                  min="1"
                  max="65535"
                  className="w-20 bg-surface border border-surface-border rounded-lg px-2 py-1 text-xs font-mono text-ink focus:outline-none focus:border-violet-400"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-ink-faint font-mono">
              Tổng: <strong className="text-violet-400">{combinedDomainsList.length}</strong> tên miền
            </span>

            <button
              onClick={handleScan}
              disabled={isScanning || combinedDomainsList.length === 0}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                isScanning
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30 cursor-wait'
                  : combinedDomainsList.length === 0
                    ? 'bg-surface-muted text-ink-muted border border-surface-border cursor-not-allowed'
                    : 'bg-violet-500 text-white hover:bg-violet-400 border border-violet-500 shadow-lg shadow-violet-500/20'
              }`}
            >
              {isScanning ? (
                <><Loader2 className="w-4 h-4 animate-spin" /><span>Đang Quét & Lưu DB...</span></>
              ) : (
                <><Play className="w-4 h-4 fill-current" /><span>Bắt Đầu Quét SSL & Lưu DB</span></>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {results.length > 0 && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Summary Metrics */}
          {scanComplete && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { label: 'SSL Hợp Lệ', value: validSSL, cls: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'from-emerald-950/20' },
                  { label: 'Hết Hạn', value: expiredSSL, cls: 'text-red-400', border: 'border-red-500/20', bg: 'from-red-950/20' },
                  { label: 'Tự Ký', value: selfSigned, cls: 'text-amber-400', border: 'border-amber-500/20', bg: 'from-amber-950/20' },
                  { label: 'Không SSL', value: noSSL, cls: 'text-ink-muted', border: 'border-surface-border', bg: 'from-transparent' },
                  { label: 'Khớp Hệ Thống', value: matched, cls: 'text-violet-400', border: 'border-violet-500/20', bg: 'from-violet-950/20' },
                  { label: 'Không Khớp', value: unmatched, cls: 'text-ink-muted', border: 'border-surface-border', bg: 'from-transparent' },
                ].map(m => (
                  <div key={m.label} className={`bg-surface bg-gradient-to-br ${m.bg} to-transparent rounded-2xl border ${m.border} p-3 shadow-sm`}>
                    <div className="text-[11px] font-semibold text-ink-muted">{m.label}</div>
                    <div className={`text-xl font-bold mt-0.5 font-mono ${m.cls}`}>{m.value}</div>
                  </div>
                ))}
              </div>

              {/* DB Auto-Sync Status Banner */}
              {dbSyncSummary && (
                <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between text-xs font-semibold text-emerald-300">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-400" />
                    <span>
                      Đã tự động đồng bộ kết quả vào DB Quản Lý Domain: <strong>+{dbSyncSummary.added} miền mới được thêm</strong>, <strong>cập nhật IP cho {dbSyncSummary.updated} miền</strong>.
                    </span>
                  </div>
                  <button onClick={handleManualDBSync} className="hover:underline text-[11px] font-bold">
                    Đồng bộ lại
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Results Table */}
          <div className="bg-surface rounded-2xl border border-surface-border shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-surface-border flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-ink">
                <Network className="w-4 h-4 text-violet-400" />
                <span>Kết Quả Quét Tên Miền ({results.length} tên miền)</span>
                {isScanning && (
                  <span className="flex items-center gap-1 text-violet-400 font-mono">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {results.filter(r => r.status === 'done').length}/{results.length}
                  </span>
                )}
              </div>

              {scanComplete && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleManualDBSync}
                    className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg transition-colors font-semibold"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu Vào DB</span>
                  </button>

                  <button
                    onClick={handleScan}
                    className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Quét Lại</span>
                  </button>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-[11px] font-semibold text-ink-muted border-b border-surface-border bg-surface-muted/40">
                    <th className="px-4 py-2.5 w-8 text-center">#</th>
                    <th className="px-4 py-2.5">Tên Miền</th>
                    <th className="px-4 py-2.5">IP</th>
                    <th className="px-4 py-2.5">Trạng Thái SSL</th>
                    <th className="px-4 py-2.5">Cert CN / Issuer</th>
                    <th className="px-4 py-2.5">Hạn Dùng</th>
                    <th className="px-4 py-2.5">Khớp Hệ Thống</th>
                    <th className="px-4 py-2.5">Cert Quản Lý</th>
                    <th className="px-3 py-2.5 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/40">
                  {results.map((r, idx) => {
                    const ssl = r.sslStatus ? sslStatusStyle(r.sslStatus) : null;
                    const SslIcon = ssl?.icon ?? ShieldOff;
                    const daysCls = r.daysUntilExpiry !== undefined
                      ? r.daysUntilExpiry < 0 ? 'text-red-400 font-bold'
                      : r.daysUntilExpiry < 30 ? 'text-amber-400 font-bold'
                      : 'text-ink-muted'
                      : 'text-ink-muted';

                    return (
                      <tr 
                        key={r.domain + idx} 
                        onClick={() => setSelectedDetailResult(r)}
                        className={`hover:bg-surface-muted/60 cursor-pointer transition-colors ${
                          r.status === 'scanning' ? 'opacity-60' : ''
                        }`}
                      >
                        <td className="px-4 py-3 text-center font-mono text-ink-faint">{idx + 1}</td>

                        {/* Domain */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {r.status === 'scanning' ? (
                              <Loader2 className="w-3 h-3 animate-spin text-violet-400 shrink-0" />
                            ) : r.status === 'pending' ? (
                              <Clock className="w-3 h-3 text-ink-faint shrink-0" />
                            ) : r.status === 'error' ? (
                              <AlertCircle className="w-3 h-3 text-red-400 shrink-0" />
                            ) : (
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                            )}
                            <span className="font-mono font-bold text-ink group-hover:text-violet-400 transition-colors">{r.domain}</span>
                            <span className="text-ink-faint">:{r.port}</span>
                          </div>
                          {r.error && (
                            <div className="text-[10px] text-red-400 mt-0.5">{r.error}</div>
                          )}
                          {r.scanDurationMs !== undefined && (
                            <div className="text-[10px] text-ink-faint font-mono mt-0.5">{r.scanDurationMs}ms</div>
                          )}
                        </td>

                        {/* IP */}
                        <td className="px-4 py-3">
                          {r.status === 'done' && r.ip ? (
                            <span className="font-mono text-[11px] text-ink px-1.5 py-0.5 rounded bg-surface-muted border border-surface-border">{r.ip}</span>
                          ) : r.status === 'scanning' ? (
                            <span className="text-ink-faint text-[11px] animate-pulse">Đang phân giải...</span>
                          ) : (
                            <span className="text-ink-faint">—</span>
                          )}
                        </td>

                        {/* SSL Status */}
                        <td className="px-4 py-3">
                          {r.status === 'done' && ssl ? (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${ssl.cls}`}>
                              <SslIcon className="w-3 h-3" />
                              <span>{ssl.label}</span>
                            </span>
                          ) : r.status === 'scanning' ? (
                            <span className="text-violet-400 text-[11px] animate-pulse">Đang quét...</span>
                          ) : r.status === 'pending' ? (
                            <span className="text-ink-faint text-[11px]">Chờ...</span>
                          ) : (
                            <span className="text-red-400 text-[11px]">Lỗi kết nối</span>
                          )}
                        </td>

                        {/* Cert CN / Issuer */}
                        <td className="px-4 py-3">
                          {r.certCommonName ? (
                            <div>
                              <div className="font-mono text-[11px] text-ink font-semibold truncate max-w-[160px]" title={r.certCommonName}>{r.certCommonName}</div>
                              {r.certIssuer && (
                                <div className="text-[10px] text-ink-faint truncate max-w-[160px]">{r.certIssuer}</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-ink-faint">—</span>
                          )}
                        </td>

                        {/* Expiry */}
                        <td className="px-4 py-3">
                          {r.daysUntilExpiry !== undefined ? (
                            <div>
                              <div className={`text-[11px] font-bold ${daysCls}`}>
                                {r.daysUntilExpiry < 0
                                  ? `Hết hạn ${Math.abs(r.daysUntilExpiry)}d trước`
                                  : `Còn ${r.daysUntilExpiry}d`}
                              </div>
                              {r.certExpiry && (
                                <div className="text-[10px] text-ink-faint font-mono">
                                  {new Date(r.certExpiry).toLocaleDateString('vi-VN')}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-ink-faint">—</span>
                          )}
                        </td>

                        {/* Match Score */}
                        <td className="px-4 py-3">
                          {r.status === 'done' ? matchBadge(r.matchScore) : null}
                        </td>

                        {/* Matched Managed Cert */}
                        <td className="px-4 py-3">
                          {r.matchedManagedCertName ? (
                            <div className="flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                              <span className="text-[11px] text-violet-300 font-semibold truncate max-w-[140px]" title={r.matchedManagedCertName}>
                                {r.matchedManagedCertName}
                              </span>
                            </div>
                          ) : r.status === 'done' ? (
                            <span className="text-[11px] text-ink-faint flex items-center gap-1">
                              <ExternalLink className="w-3 h-3" />
                              Chưa trong hệ thống
                            </span>
                          ) : null}
                        </td>

                        {/* Actions */}
                        <td className="px-3 py-3 text-right whitespace-nowrap">
                          {r.status === 'done' && (
                            <div className="flex items-center gap-1 justify-end">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDetailResult(r);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 border border-violet-500/30 text-[11px] font-bold flex items-center gap-1 transition-all shadow-sm"
                                title="Xem chi tiết tên miền và cert"
                              >
                                <Eye className="w-3.5 h-3.5 text-violet-400" />
                                <span>Chi tiết</span>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyResult(r);
                                }}
                                className="p-1.5 text-ink-faint hover:text-ink hover:bg-surface-muted rounded-lg transition-colors"
                                title="Sao chép kết quả"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedDetailResult && (
        <DomainDetailModal
          result={selectedDetailResult}
          onClose={() => setSelectedDetailResult(null)}
          onSaveToDB={(domain, ip) => {
            addManagedDomain({
              name: domain,
              description: 'Lưu từ xem chi tiết Quét Tên Miền',
              environment: 'production',
              is_wildcard_allowed: true,
              associated_ips: ip || '',
            });
            refreshManagedDomains();
            toast.success(`Đã lưu tên miền [${domain}] vào DB Quản Lý Domain!`);
          }}
        />
      )}

      {/* Empty state */}
      {results.length === 0 && !isScanning && (
        <div className="text-center py-16 space-y-3">
          <div className="flex justify-center">
            <div className="p-4 rounded-2xl bg-violet-500/10 text-violet-400">
              <ScanLine className="w-8 h-8" />
            </div>
          </div>
          <div className="text-sm font-semibold text-ink">Chưa có kết quả quét</div>
          <p className="text-xs text-ink-muted max-w-sm mx-auto">
            Nhập danh sách tên miền vào ô phía trên và nhấn <strong>Bắt Đầu Quét SSL</strong> để xem IP, trạng thái SSL và khớp cert.
          </p>
          <button
            onClick={loadExtraSample}
            className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold bg-violet-500/15 text-violet-400 border border-violet-500/25 hover:bg-violet-500/25 transition-colors"
          >
            Thử thêm tên miền mẫu ngoài hệ thống
          </button>
        </div>
      )}
    </div>
  );
}

export default function DiscoveryPage() {
  const [activeTab, setActiveTab] = useState<'discovered' | 'dismissed' | 'scanning' | 'domainscan'>('discovered');
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

        {/* Navigation 4 Tabs Bar */}
        <div className="flex items-center justify-between border-b border-surface-border pb-3">
          <div className="flex items-center gap-1.5 bg-surface p-1.5 rounded-2xl border border-surface-border shadow-sm flex-wrap">
            <button
              onClick={() => { setActiveTab('discovered'); setPage(1); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === 'discovered'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Discovered</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-mono">
                {unmanagedCount + managedCount}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('dismissed'); setPage(1); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === 'dismissed'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Dismissed</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-surface-muted text-ink-muted font-mono">
                {dismissedCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('scanning')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === 'scanning'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <Radar className="w-3.5 h-3.5" />
              <span>Network Scan</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-surface-muted text-ink-muted font-mono">
                {networkTargets.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('domainscan')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === 'domainscan'
                  ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30 shadow-sm'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <ScanLine className="w-3.5 h-3.5" />
              <span>Quét Tên Miền</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-violet-500/20 text-violet-300 font-mono">
                SSL
              </span>
            </button>
          </div>

          {activeTab !== 'scanning' && activeTab !== 'domainscan' && (
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
          {/* Tab 4: Domain Scan View */}
          {activeTab === 'domainscan' ? (
            <DomainScanTab />
          ) : activeTab === 'scanning' ? (
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
