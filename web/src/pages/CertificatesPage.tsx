import { Fragment, useState } from 'react';
import { Transition } from '@headlessui/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTrackedMutation } from '../hooks/useTrackedMutation';
import { useListParams } from '../hooks/useListParams';
import { useNavigate } from 'react-router-dom';
import { getCertificates, createCertificate, getOwners, getTeams, getRenewalPolicies, getProfiles, getIssuers, bulkRevokeCertificates, bulkRenewCertificates, bulkReassignCertificates } from '../api/client';
import { useAuth } from '../components/AuthProvider';
import { REVOCATION_REASONS } from '../api/types';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import type { Column } from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import ErrorState from '../components/ErrorState';
import { formatDate, daysUntil, expiryColor } from '../api/utils';
import type { Certificate } from '../api/types';
import { getManagedDomains, type DomainRecord } from '../api/domains';
import DomainSelector from '../components/DomainSelector';
import { Zap, Sparkles } from 'lucide-react';

interface QuickPreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  form: {
    name: string;
    common_name: string;
    sans: string;
    environment: 'production' | 'staging' | 'internal' | 'development';
    tags: string;
  };
}

const PRESETS: QuickPreset[] = [
  {
    id: 'nginx-web',
    name: 'Nginx Web Server',
    badge: '🚀 Prod Web',
    description: 'Cấu hình chuẩn Web Nginx với SANs IP & Tag phân loại',
    form: {
      name: 'Cert - Nginx Web Server',
      common_name: 'ubuntu.nginx.bqp',
      sans: '10.1.0.12, 10.1.0.13',
      environment: 'production',
      tags: 'app=nginx, tier=web-frontend',
    },
  },
  {
    id: 'internal-api',
    name: 'Internal API Gateway',
    badge: '🛡️ Internal API',
    description: 'Cấu hình cổng API nội bộ BQP mạng băng rộng',
    form: {
      name: 'Cert - API Gateway Internal',
      common_name: 'api.example.com',
      sans: '10.1.0.50, api-v2.example.com',
      environment: 'internal',
      tags: 'app=api-gateway, tier=backend',
    },
  },
  {
    id: 'microservice-dev',
    name: 'Short-Lived Microservice',
    badge: '⚡ Dev Service',
    description: 'Dịch vụ vi mô ngắn hạn kiểm thử local',
    form: {
      name: 'Cert - Local Microservice',
      common_name: 'internal.bqp.vn',
      sans: '127.0.0.1, 10.1.0.50',
      environment: 'development',
      tags: 'app=microservice, ttl=short',
    },
  },
];

function CreateCertificateModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    name: '',
    id: '',
    common_name: '',
    sans: '',
    environment: 'production',
    issuer_id: '',
    certificate_profile_id: '',
    owner_id: '',
    team_id: '',
    renewal_policy_id: '',
    tags: '',
  });
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [error, setError] = useState('');

  const { data: profilesResp } = useQuery({
    queryKey: ['profiles', { per_page: 100 }],
    queryFn: () => getProfiles({ per_page: '100' }),
  });
  const { data: issuersResp } = useQuery({
    queryKey: ['issuers', { per_page: 100 }],
    queryFn: () => getIssuers({ per_page: '100' }),
  });
  const { data: ownersResp } = useQuery({
    queryKey: ['owners', { per_page: 100 }],
    queryFn: () => getOwners({ per_page: '100' }),
  });
  const { data: teamsResp } = useQuery({
    queryKey: ['teams', { per_page: 100 }],
    queryFn: () => getTeams({ per_page: '100' }),
  });
  const { data: policiesResp } = useQuery({
    queryKey: ['renewal-policies', 'form'],
    queryFn: () => getRenewalPolicies(1, 500),
  });
  const profiles = profilesResp?.data || [];
  const issuers = issuersResp?.data || [];
  const owners = ownersResp?.data || [];
  const teams = teamsResp?.data || [];
  const policies = policiesResp?.data || [];

  const handleSelectPreset = (preset: QuickPreset) => {
    setSelectedPresetId(preset.id);
    setForm(f => ({
      ...f,
      name: preset.form.name,
      common_name: preset.form.common_name,
      sans: preset.form.sans,
      environment: preset.form.environment,
      tags: preset.form.tags,
      issuer_id: f.issuer_id || (issuers[0]?.id ?? ''),
      owner_id: f.owner_id || (owners[0]?.id ?? ''),
      team_id: f.team_id || (teams[0]?.id ?? ''),
      renewal_policy_id: f.renewal_policy_id || (policies[0]?.id ?? ''),
      certificate_profile_id: f.certificate_profile_id || (profiles[0]?.id ?? ''),
    }));
  };

  // Find associated IP suggestion for selected domain
  const managedDomains = getManagedDomains();
  const currentDomainObj = managedDomains.find(d => d.name === form.common_name);
  const suggestedIPs = currentDomainObj?.associated_ips;

  const handleAppendSuggestedIP = (ipStr: string) => {
    const ips = ipStr.split(',').map(s => s.trim()).filter(Boolean);
    setForm(f => {
      const current = f.sans ? f.sans.split(',').map(s => s.trim()).filter(Boolean) : [];
      ips.forEach(ip => {
        if (!current.includes(ip)) current.push(ip);
      });
      return { ...f, sans: current.join(', ') };
    });
  };

  const selectedProfile = profiles.find(p => p.id === form.certificate_profile_id);
  const ttlLabel = selectedProfile
    ? selectedProfile.max_ttl_seconds < 3600
      ? `${Math.round(selectedProfile.max_ttl_seconds / 60)}m`
      : selectedProfile.max_ttl_seconds < 86400
        ? `${Math.round(selectedProfile.max_ttl_seconds / 3600)}h`
        : `${Math.round(selectedProfile.max_ttl_seconds / 86400)}d`
    : null;

  const profileEkus = selectedProfile?.allowed_ekus ?? [];
  const profileShortLived = selectedProfile?.allow_short_lived === true;

  const mutation = useTrackedMutation({
    mutationFn: () => {
      const payload: Record<string, unknown> = { ...form };
      if (form.sans.trim()) {
        payload.sans = form.sans.split(',').map(s => s.trim()).filter(Boolean);
      } else {
        delete payload.sans;
      }
      if (form.tags.trim()) {
        const tags: Record<string, string> = {};
        form.tags.split(',').forEach(pair => {
          const [k, ...v] = pair.split('=');
          if (k?.trim()) tags[k.trim()] = v.join('=').trim();
        });
        payload.tags = tags;
      } else {
        delete payload.tags;
      }
      return createCertificate(payload);
    },
    invalidates: [['certificates']],
    onSuccess: () => onSuccess(),
    onError: (err: Error) => setError(err.message),
  });

  const inputClass = "w-full bg-white border border-surface-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400/20";
  const selectClass = "w-full bg-white border border-surface-border rounded-xl px-3 py-2 text-xs text-ink";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-surface border border-surface-border rounded-2xl p-6 w-full max-w-xl shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-surface-border">
          <h2 className="text-base font-bold text-ink flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Cấp Phát Chứng Chỉ Mới</span>
          </h2>
          <button onClick={onClose} className="text-xs text-ink-muted hover:text-ink">✕</button>
        </div>

        {/* --- OPTION CHỌN NHANH (PRESETS) --- */}
        <div className="mb-5 bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>Option Chọn Nhanh (Preset Templates):</span>
            </span>
            <span className="text-[10px] text-emerald-300/80 font-normal">Tự động điền đầy đủ form mẫu</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map((p) => {
              const isSelected = selectedPresetId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-md'
                      : 'bg-surface/60 border-surface-border text-ink-muted hover:border-emerald-500/50 hover:text-ink'
                  }`}
                >
                  <div className="text-[11px] font-bold text-emerald-300 mb-0.5">{p.badge}</div>
                  <div className="text-[10px] text-ink-faint leading-tight line-clamp-2">{p.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-3 py-2 text-xs mb-4">{error}</div>}

        <div className="space-y-3 text-xs">
          <div>
            <label className="text-xs font-semibold text-ink block mb-1">Tên Chứng Chỉ (Name) *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className={inputClass}
              placeholder="e.g. API Production Cert" />
          </div>

          <div>
            <label className="text-xs font-semibold text-ink block mb-1">Mã Định Danh (ID - Tùy chọn)</label>
            <input value={form.id} onChange={e => setForm(f => ({ ...f, id: e.target.value }))}
              className={inputClass}
              placeholder="mc-api-prod (tự sinh nếu để trống)" />
          </div>

          {/* Common Name with Searchable DomainSelector */}
          <div>
            <DomainSelector
              label="Tên Miền Chính (Common Name) *"
              value={form.common_name}
              onChange={(domainName) => {
                setForm(f => ({ ...f, common_name: domainName }));
              }}
              placeholder="Chọn từ danh sách Domain hoặc gõ tìm kiếm..."
            />
            <input
              value={form.common_name}
              onChange={e => setForm(f => ({ ...f, common_name: e.target.value }))}
              className={`${inputClass} mt-1`}
              placeholder="Hoặc gõ miền trực tiếp: api.example.com"
            />
          </div>

          {/* IP Auto-Suggestion Badge */}
          {suggestedIPs && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2 flex items-center justify-between text-xs text-emerald-300">
              <span className="flex items-center gap-1">
                💡 <b>IP gợi ý cho Domain &quot;{form.common_name}&quot;:</b> {suggestedIPs}
              </span>
              <button
                type="button"
                onClick={() => handleAppendSuggestedIP(suggestedIPs)}
                className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-400/50 rounded-lg font-bold text-[11px] text-white transition-colors"
              >
                + Chèn vào SANs
              </button>
            </div>
          )}

          {/* SANs Field */}
          <div>
            <DomainSelector
              label="Tên Miền Phụ & SANs (Subject Alternative Names)"
              value=""
              onChange={(domainName) => {
                setForm(f => {
                  const current = f.sans ? f.sans.split(',').map(s => s.trim()).filter(Boolean) : [];
                  if (!current.includes(domainName)) current.push(domainName);
                  return { ...f, sans: current.join(', ') };
                });
              }}
              placeholder="+ Chọn thêm từ danh sách Domain..."
            />
            <input
              value={form.sans}
              onChange={e => setForm(f => ({ ...f, sans: e.target.value }))}
              className={`${inputClass} mt-1`}
              placeholder="api.example.com, 10.1.0.12, 10.1.0.13 (phân cách bằng dấu phẩy)"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-ink-muted block mb-1">Issuer *</label>
              <select value={form.issuer_id} onChange={e => setForm(f => ({ ...f, issuer_id: e.target.value }))}
                className={selectClass}>
                <option value="">Select issuer...</option>
                {issuers.map(i => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-ink-muted block mb-1">
                Profile {ttlLabel && <span className="text-brand-400 font-medium">(TTL: {ttlLabel})</span>}
              </label>
              <select data-testid="cert-form-profile" value={form.certificate_profile_id} onChange={e => setForm(f => ({ ...f, certificate_profile_id: e.target.value }))}
                className={selectClass}>
                <option value="">Select profile...</option>
                {profiles.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}{p.max_ttl_seconds ? ` (${p.max_ttl_seconds < 3600 ? `${Math.round(p.max_ttl_seconds / 60)}m` : p.max_ttl_seconds < 86400 ? `${Math.round(p.max_ttl_seconds / 3600)}h` : `${Math.round(p.max_ttl_seconds / 86400)}d`})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* 2026-05-05 parity-defaults-cleanup (P3-4 + P3-5): surface the
              selected profile's load-bearing defaults (allow_short_lived,
              allowed_ekus) inline so the operator sees what they're
              picking. Hidden until a profile is chosen (avoids visual
              noise for the empty state). */}
          {selectedProfile && (
            <div data-testid="cert-form-profile-detail" className="bg-surface-muted border border-surface-border rounded px-3 py-2 text-xs text-ink-muted">
              <div className="font-medium text-ink mb-1">Profile contract</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <div>
                  <span className="text-ink-faint">EKUs: </span>
                  {profileEkus.length === 0 ? (
                    <span className="italic">none restricted</span>
                  ) : (
                    profileEkus.join(', ')
                  )}
                </div>
                <div>
                  <span className="text-ink-faint">Short-lived (TTL &lt; 1h): </span>
                  <span className={profileShortLived ? 'text-brand-400 font-medium' : ''}>
                    {profileShortLived ? 'allowed' : 'not allowed'}
                  </span>
                </div>
              </div>
              <p className="text-ink-faint mt-1">
                EKUs and short-lived eligibility are profile-level. To change them, edit the profile or pick a different one — they are not per-cert toggles.
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-ink-muted block mb-1">Environment</label>
              <select data-testid="cert-form-environment" value={form.environment} onChange={e => setForm(f => ({ ...f, environment: e.target.value }))}
                className={selectClass}>
                <option value="production">Production</option>
                <option value="staging">Staging</option>
                <option value="development">Development</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-ink-muted block mb-1">Policy *</label>
              <select value={form.renewal_policy_id} onChange={e => setForm(f => ({ ...f, renewal_policy_id: e.target.value }))}
                className={selectClass}>
                <option value="">Select policy...</option>
                {policies.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-ink-muted block mb-1">Owner *</label>
              <select value={form.owner_id} onChange={e => setForm(f => ({ ...f, owner_id: e.target.value }))}
                className={selectClass}>
                <option value="">Select owner...</option>
                {owners.map(o => (
                  <option key={o.id} value={o.id}>{o.name} ({o.email})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-ink-muted block mb-1">Team *</label>
              <select value={form.team_id} onChange={e => setForm(f => ({ ...f, team_id: e.target.value }))}
                className={selectClass}>
                <option value="">Select team...</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-ink-muted block mb-1">Tags</label>
            <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              className={inputClass}
              placeholder="env=prod, team=platform, app=api" />
            <p className="text-xs text-ink-faint mt-0.5">Comma-separated key=value pairs</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="btn btn-ghost text-sm">Cancel</button>
          <button
            onClick={() => mutation.mutate()}
            disabled={
              !form.name ||
              !form.common_name ||
              !form.issuer_id ||
              !form.owner_id ||
              !form.team_id ||
              !form.renewal_policy_id ||
              mutation.isPending
            }
            className="btn btn-primary text-sm disabled:opacity-50"
          >
            {mutation.isPending ? 'Đang tạo...' : 'Tạo chứng chỉ'}
          </button>
        </div>
      </div>
    </div>
  );
}

function BulkRevokeModal({ ids, onClose, onSuccess }: { ids: string[]; onClose: () => void; onSuccess: () => void }) {
  const [reason, setReason] = useState('unspecified');
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ total_matched: number; total_revoked: number; total_skipped: number; total_failed: number; errors?: { certificate_id: string; error: string }[] } | null>(null);

  const handleRevoke = async () => {
    setRunning(true);
    setError('');
    try {
      const res = await bulkRevokeCertificates({ reason, certificate_ids: ids });
      setResult(res);
      if (res.total_failed === 0) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk revocation failed');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-surface border border-surface-border rounded p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-red-700 mb-2">Bulk Revoke</h2>
        <p className="text-sm text-ink-muted mb-4">
          Revoke {ids.length} certificate{ids.length > 1 ? 's' : ''}. This cannot be undone.
        </p>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded px-3 py-2 text-sm mb-3">{error}</div>}
        {result && (
          <div className="mb-3 bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm">
            <div className="grid grid-cols-2 gap-1">
              <span className="text-ink-muted">Matched:</span><span className="font-medium">{result.total_matched}</span>
              <span className="text-ink-muted">Revoked:</span><span className="font-medium text-red-600">{result.total_revoked}</span>
              <span className="text-ink-muted">Skipped:</span><span className="font-medium text-yellow-600">{result.total_skipped}</span>
              <span className="text-ink-muted">Failed:</span><span className="font-medium text-red-700">{result.total_failed}</span>
            </div>
            {result.errors && result.errors.length > 0 && (
              <div className="mt-2 text-xs text-red-600">
                {result.errors.map((e, i) => <div key={i}>{e.certificate_id}: {e.error}</div>)}
              </div>
            )}
          </div>
        )}
        <label className="text-xs text-ink-muted block mb-2">Revocation Reason (RFC 5280)</label>
        <select value={reason} onChange={e => setReason(e.target.value)}
          className="w-full bg-white border border-surface-border rounded px-3 py-2 text-sm text-ink mb-4"
          disabled={running || result !== null}
        >
          {REVOCATION_REASONS.map(r => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn btn-ghost text-sm">{result ? 'Close' : 'Cancel'}</button>
          {!result && (
            <button onClick={handleRevoke} disabled={running}
              className="btn text-sm bg-red-600 hover:bg-red-500 text-white disabled:opacity-50">
              {running ? 'Revoking...' : `Revoke ${ids.length} Certificates`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function BulkReassignModal({ ids, onClose, onSuccess }: { ids: string[]; onClose: () => void; onSuccess: () => void }) {
  const [ownerId, setOwnerId] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);

  const { data: owners } = useQuery({
    queryKey: ['owners'],
    queryFn: () => getOwners(),
  });

  // L-2 closure (cat-l-8a1fb258a38a): pre-L-2 this looped
  // `await updateCertificate(id, { owner_id })` over the selection
  // (N HTTP round-trips). Post-L-2 it's a single POST to
  // /api/v1/certificates/bulk-reassign. The CI guardrail in
  // .github/workflows/ci.yml (`Forbidden client-side bulk-action loop
  // regression guard (L-1)`) catches reintroduction of the loop shape.
  const handleReassign = async () => {
    if (!ownerId) return;
    setRunning(true);
    setError('');
    setProgress(0);
    try {
      const result = await bulkReassignCertificates({
        certificate_ids: ids,
        owner_id: ownerId,
      });
      setProgress(result.total_reassigned);
      if (result.total_failed > 0) {
        const first = result.errors?.[0];
        setError(
          `${result.total_failed} of ${result.total_matched} failed${
            first ? `: ${first.certificate_id} — ${first.error}` : ''
          }`
        );
      } else {
        onSuccess();
      }
    } catch (err) {
      setError(`Bulk reassignment failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-surface border border-surface-border rounded p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-ink mb-2">Reassign Owner</h2>
        <p className="text-sm text-ink-muted mb-4">
          Reassign {ids.length} certificate{ids.length > 1 ? 's' : ''} to a new owner.
        </p>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded px-3 py-2 text-sm mb-3">{error}</div>}
        {running && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-ink-muted mb-1">
              <span>Progress</span>
              <span>{progress}/{ids.length}</span>
            </div>
            <div className="w-full bg-surface-border rounded-full h-2">
              <div className="bg-brand-400 h-2 rounded-full transition-all" style={{ width: `${(progress / ids.length) * 100}%` }} />
            </div>
          </div>
        )}
        <label className="text-xs text-ink-muted block mb-2">New Owner</label>
        <select value={ownerId} onChange={e => setOwnerId(e.target.value)}
          className="w-full bg-white border border-surface-border rounded px-3 py-2 text-sm text-ink mb-4"
          disabled={running}
        >
          <option value="">Select owner...</option>
          {owners?.data?.map(o => (
            <option key={o.id} value={o.id}>{o.name} ({o.email})</option>
          ))}
        </select>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn btn-ghost text-sm" disabled={running}>Cancel</button>
          <button onClick={handleReassign} disabled={running || !ownerId}
            className="btn btn-primary text-sm disabled:opacity-50">
            {running ? `Reassigning (${progress}/${ids.length})...` : `Reassign ${ids.length} Certificates`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CertificatesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // M-003: bulk revocation is admin-only. The backend rejects non-admin callers
  // with 403, but we also hide the button in the GUI to avoid a misleading
  // affordance. Authoritative gate remains server-side.
  const { admin } = useAuth();
  // M-029 Pass 2 (Audit M-010): filter / sort / pagination state migrated
  // from 9 local useState hooks to useListParams — URL-resident state is
  // deep-linkable, browser-back-correct, and the hook auto-resets page
  // to 1 on filter / sort / pageSize change (preserving the F-1 contract
  // that previously had to be hand-rolled at every onChange site).
  //
  // F-1 closure (cat-e-610251c8f72d) preserved: the 8 operator-facing
  // filters (status / environment / issuer_id / owner_id / profile_id /
  // team_id / expires_before / sort) all flow through filters[] with
  // their existing keys. Default page size stays at 50 to match the
  // pre-migration F-1 baseline (the hook's global default is 25, but
  // the page-level default takes precedence).
  const { params: listParams, setPage, setPageSize, setFilter } = useListParams({ pageSize: 50 });
  const statusFilter = listParams.filters.status ?? '';
  const envFilter = listParams.filters.environment ?? '';
  const issuerFilter = listParams.filters.issuer_id ?? '';
  const ownerFilter = listParams.filters.owner_id ?? '';
  const profileFilter = listParams.filters.profile_id ?? '';
  const teamFilter = listParams.filters.team_id ?? '';
  const expiresBefore = listParams.filters.expires_before ?? '';
  const sortBy = listParams.filters.sort ?? '';
  const page = listParams.page;
  const perPage = listParams.pageSize;
  const [showCreate, setShowCreate] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkRevoke, setShowBulkRevoke] = useState(false);
  const [showBulkReassign, setShowBulkReassign] = useState(false);
  const [bulkRenewProgress, setBulkRenewProgress] = useState<{ done: number; total: number; running: boolean } | null>(null);

  // Phase 2 P-H1 closure: queryKey now matches CreateCertificateModal's
  // upstream calls byte-for-byte (`[name, { per_page: 100 }]`). TanStack
  // v5 serializes the key on insert + comparison; identical serialization
  // means the modal + filter share one cache slot. Pre-Phase-2 these
  // were 4 independent fetches that returned the same data.
  const { data: issuersData } = useQuery({
    queryKey: ['issuers', { per_page: 100 }],
    queryFn: () => getIssuers({ per_page: '100' }),
  });
  const { data: ownersData } = useQuery({
    queryKey: ['owners', { per_page: 100 }],
    queryFn: () => getOwners({ per_page: '100' }),
  });
  const { data: profilesData } = useQuery({
    queryKey: ['profiles', { per_page: 100 }],
    queryFn: () => getProfiles({ per_page: '100' }),
  });
  // F-1 closure: hydrate the team filter dropdown.
  const { data: teamsFilterData } = useQuery({
    queryKey: ['teams', { per_page: 100 }],
    queryFn: () => getTeams({ per_page: '100' }),
  });

  const params: Record<string, string> = {};
  if (statusFilter)  params.status         = statusFilter;
  if (envFilter)     params.environment    = envFilter;
  if (issuerFilter)  params.issuer_id      = issuerFilter;
  if (ownerFilter)   params.owner_id       = ownerFilter;
  if (profileFilter) params.profile_id     = profileFilter;
  if (teamFilter)    params.team_id        = teamFilter;
  if (expiresBefore) params.expires_before = expiresBefore;
  if (sortBy)        params.sort           = sortBy;
  // Pagination (F-1) — re-fetch on page / per_page change.
  params.page     = String(page);
  params.per_page = String(perPage);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['certificates', params],
    queryFn: () => getCertificates(params),
    refetchInterval: 30000,
  });

  // L-1 closure (cat-l-fa0c1ac07ab5): pre-L-1 this looped
  // `await triggerRenewal(ids[i])` over the selection (N HTTP round-
  // trips × ~50–200ms each = 5–20s wedge for 100 selected certs).
  // Post-L-1 it's a single POST to /api/v1/certificates/bulk-renew;
  // the server resolves the criteria, applies status filters
  // (RenewalInProgress/Revoked/Archived/Expired all silent-skip), and
  // enqueues N renewal jobs server-side, returning a per-cert
  // {certificate_id, job_id} envelope. CI guardrail at
  // .github/workflows/ci.yml catches loop-shape regression.
  const handleBulkRenewal = async () => {
    const ids = Array.from(selectedIds);
    setBulkRenewProgress({ done: 0, total: ids.length, running: true });
    try {
      const result = await bulkRenewCertificates({ certificate_ids: ids });
      setBulkRenewProgress({
        done: result.total_enqueued,
        total: result.total_matched,
        running: false,
      });
      // UX-L5 closure (Phase 1): post-action toast with a "View jobs"
      // action that deep-links to the Jobs page filtered to the
      // certificate IDs we just renewed. The audit's missing
      // "what just happened" affordance — operators can now jump
      // straight to the resulting jobs.
      if (result.total_enqueued > 0) {
        toast.success(
          `Triggered renewal for ${result.total_enqueued} certificate${result.total_enqueued > 1 ? 's' : ''}`,
          {
            action: {
              label: `View ${result.total_enqueued} jobs`,
              onClick: () =>
                navigate(`/jobs?certificate_ids=${ids.join(',')}`),
            },
            duration: 8000,
          },
        );
      }
    } catch (err) {
      // surface as a "0 of N" terminal state — no retries.
      setBulkRenewProgress({ done: 0, total: ids.length, running: false });
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Bulk renewal failed: ${msg}`);
    }
    queryClient.invalidateQueries({ queryKey: ['certificates'] });
    setSelectedIds(new Set());
    setTimeout(() => setBulkRenewProgress(null), 5000);
  };

  const columns: Column<Certificate>[] = [
    {
      key: 'name',
      label: 'Chứng chỉ',
      render: (c) => (
        <div>
          <div className="font-medium text-ink">{c.common_name}</div>
          <div className="text-xs text-ink-faint mt-0.5">{c.id}</div>
        </div>
      ),
    },
    { key: 'status', label: 'Trạng thái', render: (c) => <StatusBadge status={c.status} /> },
    {
      key: 'expires',
      label: 'Hết hạn',
      render: (c) => {
        const days = daysUntil(c.expires_at);
        return (
          <div>
            <div className={expiryColor(days)}>{formatDate(c.expires_at)}</div>
            <div className="text-xs text-ink-faint">{days <= 0 ? 'Expired' : `${days} days`}</div>
          </div>
        );
      },
    },
    { key: 'last_renewal', label: 'Gia hạn lần cuối', render: (c) => <span className="text-xs text-ink-muted">{c.last_renewal_at ? formatDate(c.last_renewal_at) : '—'}</span> },
    { key: 'last_deploy', label: 'Triển khai lần cuối', render: (c) => <span className="text-xs text-ink-muted">{c.last_deployment_at ? formatDate(c.last_deployment_at) : '—'}</span> },
    { key: 'issuer', label: 'Nhà cấp phát', render: (c) => <span className="text-ink-muted text-xs">{c.issuer_id}</span> },
    { key: 'owner', label: 'Chủ sở hữu', render: (c) => <span className="text-ink-muted text-xs">{c.owner_id}</span> },
  ];

  const selectedArray = Array.from(selectedIds);
  const hasSelection = selectedArray.length > 0;

  return (
    <>
      <PageHeader
        title="Chứng chỉ"
        subtitle={data ? `${data.total} chứng chỉ` : undefined}
        action={
          <button onClick={() => setShowCreate(true)} className="btn btn-primary text-xs">
            + New Certificate
          </button>
        }
      />

      {/* Bulk Action Bar — UX-L5 (Phase 1): Headless UI <Transition>
          wraps the slide-in/out so the bar doesn't snap when selection
          flips. Transition respects prefers-reduced-motion via the
          global @media block in index.css. */}
      <Transition
        show={hasSelection}
        as={Fragment}
        enter="transition-all duration-200 ease-out"
        enterFrom="opacity-0 -translate-y-2"
        enterTo="opacity-100 translate-y-0"
        leave="transition-all duration-150 ease-in"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 -translate-y-2"
      >
        <div className="px-6 py-3 bg-brand-50 border-b border-brand-200 flex items-center justify-between">
          <span className="text-sm text-brand-600 font-medium">{selectedArray.length} selected</span>
          <div className="flex gap-2">
            <button onClick={handleBulkRenewal} disabled={bulkRenewProgress?.running}
              className="btn btn-primary text-xs disabled:opacity-50">
              {bulkRenewProgress?.running
                ? `Renewing (${bulkRenewProgress.done}/${bulkRenewProgress.total})...`
                : 'Trigger Renewal'}
            </button>
            {admin && (
              <button onClick={() => setShowBulkRevoke(true)}
                className="btn btn-ghost text-xs text-amber-400 hover:text-amber-300 border border-amber-600/50">
                Revoke
              </button>
            )}
            <button onClick={() => setShowBulkReassign(true)}
              className="btn btn-ghost text-xs text-brand-400 hover:text-brand-300 border border-brand-600/50">
              Reassign Owner
            </button>
            <button onClick={() => setSelectedIds(new Set())}
              className="btn btn-ghost text-xs text-ink-muted">
              Clear
            </button>
          </div>
        </div>
      </Transition>

      {/* Bulk Renewal Success */}
      {bulkRenewProgress && !bulkRenewProgress.running && (
        <div className="px-6 py-2 bg-emerald-50 border-b border-emerald-200">
          <span className="text-sm text-emerald-700">
            Triggered renewal for {bulkRenewProgress.done} certificate{bulkRenewProgress.done > 1 ? 's' : ''}.
          </span>
        </div>
      )}

      <div className="px-6 py-3 flex gap-3 border-b border-surface-border/50">
        <select
          value={statusFilter}
          onChange={e => setFilter('status', e.target.value)}
          className="bg-white border border-surface-border rounded px-3 py-1.5 text-sm text-ink"
        >
          <option value="">All statuses</option>
          <option value="Active">Active</option>
          <option value="Expiring">Expiring</option>
          <option value="Expired">Expired</option>
          <option value="Revoked">Revoked</option>
          <option value="RenewalInProgress">Renewal In Progress</option>
          <option value="Archived">Archived</option>
        </select>
        <select
          value={envFilter}
          onChange={e => setFilter('environment', e.target.value)}
          className="bg-white border border-surface-border rounded px-3 py-1.5 text-sm text-ink"
        >
          <option value="">All environments</option>
          <option value="production">Production</option>
          <option value="staging">Staging</option>
          <option value="development">Development</option>
        </select>
        <select
          value={issuerFilter}
          onChange={e => setFilter('issuer_id', e.target.value)}
          className="bg-white border border-surface-border rounded px-3 py-1.5 text-sm text-ink"
        >
          <option value="">All issuers</option>
          {issuersData?.data?.map(i => (
            <option key={i.id} value={i.id}>{i.name}</option>
          ))}
        </select>
        <select
          value={ownerFilter}
          onChange={e => setFilter('owner_id', e.target.value)}
          className="bg-white border border-surface-border rounded px-3 py-1.5 text-sm text-ink"
        >
          <option value="">All owners</option>
          {ownersData?.data?.map(o => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>
        <select
          value={profileFilter}
          onChange={e => setFilter('profile_id', e.target.value)}
          className="bg-white border border-surface-border rounded px-3 py-1.5 text-sm text-ink"
        >
          <option value="">All profiles</option>
          {profilesData?.data?.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        {/* F-1 closure (cat-e-610251c8f72d): team / expires_before / sort */}
        <select
          value={teamFilter}
          onChange={e => setFilter('team_id', e.target.value)}
          className="bg-white border border-surface-border rounded px-3 py-1.5 text-sm text-ink"
        >
          <option value="">All teams</option>
          {teamsFilterData?.data?.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <input
          type="date"
          value={expiresBefore}
          onChange={e => setFilter('expires_before', e.target.value)}
          title="Expires before (drives the 'expiring in N days' workflow)"
          className="bg-white border border-surface-border rounded px-3 py-1.5 text-sm text-ink"
        />
        <select
          value={sortBy}
          onChange={e => setFilter('sort', e.target.value)}
          title="Sort order"
          className="bg-white border border-surface-border rounded px-3 py-1.5 text-sm text-ink"
        >
          <option value="">Default sort</option>
          <option value="notAfter">Expires soonest</option>
          <option value="-notAfter">Expires latest</option>
          <option value="createdAt">Created earliest</option>
          <option value="-createdAt">Created latest</option>
        </select>
      </div>
      <div className="flex-1 overflow-y-auto">
        {error ? (
          <ErrorState error={error as Error} onRetry={() => refetch()} />
        ) : (
          <DataTable
            columns={columns}
            data={data?.data || []}
            isLoading={isLoading}
            onRowClick={(c) => navigate(`/certificates/${c.id}`)}
            emptyMessage="No certificates found"
            selectable
            selectedKeys={selectedIds}
            onSelectionChange={setSelectedIds}
            pagination={{
              page,
              perPage,
              total: data?.total ?? 0,
              onPageChange: setPage,
              // useListParams.setPageSize auto-drops the page param from
              // the URL (page resets to 1 implicitly), preserving the
              // F-1 contract without a manual setPage(1) call.
              onPerPageChange: setPageSize,
            }}
          />
        )}
      </div>
      {showCreate && (
        <CreateCertificateModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => {
            setShowCreate(false);
            queryClient.invalidateQueries({ queryKey: ['certificates'] });
          }}
        />
      )}
      {showBulkRevoke && (
        <BulkRevokeModal
          ids={selectedArray}
          onClose={() => setShowBulkRevoke(false)}
          onSuccess={() => {
            setShowBulkRevoke(false);
            setSelectedIds(new Set());
            queryClient.invalidateQueries({ queryKey: ['certificates'] });
          }}
        />
      )}
      {showBulkReassign && (
        <BulkReassignModal
          ids={selectedArray}
          onClose={() => setShowBulkReassign(false)}
          onSuccess={() => {
            setShowBulkReassign(false);
            setSelectedIds(new Set());
            queryClient.invalidateQueries({ queryKey: ['certificates'] });
          }}
        />
      )}
    </>
  );
}
