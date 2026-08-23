import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ShieldCheck,
  Shield,
  Key,
  Globe,
  Plus,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Sparkles,
  Zap,
  Building,
  CheckCircle2,
  Users,
} from 'lucide-react';

import {
  listOIDCProviders,
  createOIDCProvider,
  type OIDCProvider,
  type OIDCProviderRequest,
} from '../../api/client';
import { useAuthMe } from '../../hooks/useAuthMe';
import PageHeader from '../../components/PageHeader';
import ErrorState from '../../components/ErrorState';
import OIDCTestConnectionPanel from './OIDCTestConnectionPanel';
import { formatDate } from '../../api/utils';

export function validateEmailDomain(input: string): string {
  if (!input) return 'Empty entry';
  if (input !== input.trim()) return 'Leading or trailing whitespace';
  if (input !== input.toLowerCase()) return 'Must be all lowercase';
  if (input.includes('@')) return 'Entries are domains, not email addresses — drop the "@" and the local part';
  if (input.includes(' ') || /\s/.test(input)) return 'No whitespace';
  if (input.includes('*')) return 'No wildcards — list each subdomain explicitly';
  if (!input.includes('.')) return 'Must be a fully-qualified domain (e.g. acme.com)';
  return '';
}

interface OIDCPreset {
  id: string;
  name: string;
  badge: string;
  color: string;
  description: string;
  form: Partial<OIDCProviderRequest>;
}

const OIDC_PRESETS: OIDCPreset[] = [
  {
    id: 'keycloak',
    name: 'Keycloak IAM',
    badge: '🗝️ Keycloak',
    color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    description: 'Cấu hình chuẩn Keycloak Realm OIDC',
    form: {
      name: 'Keycloak Production',
      issuer_url: 'https://keycloak.example.com/realms/main',
      client_id: 'certctl-sso-client',
      client_secret: 'keycloak-secret-2026',
      redirect_uri: 'https://certctl.example.com/auth/oidc/callback',
      groups_claim_path: 'groups',
      groups_claim_format: 'string-array',
      fetch_userinfo: false,
      scopes: ['openid', 'profile', 'email', 'roles'],
      allowed_email_domains: ['example.com'],
    },
  },
  {
    id: 'okta',
    name: 'Okta Enterprise',
    badge: '🛡️ Okta',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
    description: 'Cấu hình Okta Identity Platform với groups claim',
    form: {
      name: 'Okta SSO',
      issuer_url: 'https://company.okta.com/oauth2/default',
      client_id: 'certctl-okta-app',
      client_secret: 'okta-secret-2026',
      redirect_uri: 'https://certctl.example.com/auth/oidc/callback',
      groups_claim_path: 'groups',
      groups_claim_format: 'string-array',
      fetch_userinfo: true,
      scopes: ['openid', 'profile', 'email', 'groups'],
      allowed_email_domains: ['company.com'],
    },
  },
  {
    id: 'entra',
    name: 'Microsoft Entra ID',
    badge: '🔷 Entra ID',
    color: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100',
    description: 'Azure AD / Entra ID v2.0 Tenant OIDC',
    form: {
      name: 'Microsoft Entra ID',
      issuer_url: 'https://login.microsoftonline.com/common/v2.0',
      client_id: '00000000-0000-0000-0000-000000000000',
      client_secret: 'entra-secret-2026',
      redirect_uri: 'https://certctl.example.com/auth/oidc/callback',
      groups_claim_path: 'roles',
      groups_claim_format: 'string-array',
      fetch_userinfo: false,
      scopes: ['openid', 'profile', 'email'],
      allowed_email_domains: ['bqp.vn', 'gov.vn'],
    },
  },
  {
    id: 'authentik',
    name: 'Authentik / Custom',
    badge: '⚡ Authentik',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
    description: 'Self-hosted Authentik hoặc Provider OIDC tùy chỉnh',
    form: {
      name: 'Authentik SSO Provider',
      issuer_url: 'https://authentik.example.com/application/o/certctl/',
      client_id: 'certctl-authentik-client',
      client_secret: 'authentik-secret-2026',
      redirect_uri: 'https://certctl.example.com/auth/oidc/callback',
      groups_claim_path: 'ak_groups',
      groups_claim_format: 'string-array',
      fetch_userinfo: false,
      scopes: ['openid', 'profile', 'email'],
      allowed_email_domains: [],
    },
  },
];

interface CreateProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialPreset?: OIDCPreset | null;
}

function CreateProviderModal({ isOpen, onClose, onSuccess, initialPreset }: CreateProviderModalProps) {
  const [form, setForm] = useState<OIDCProviderRequest>({
    name: initialPreset?.form.name || '',
    issuer_url: initialPreset?.form.issuer_url || '',
    client_id: initialPreset?.form.client_id || '',
    client_secret: initialPreset?.form.client_secret || '',
    redirect_uri: initialPreset?.form.redirect_uri || '',
    groups_claim_path: initialPreset?.form.groups_claim_path || 'groups',
    groups_claim_format: initialPreset?.form.groups_claim_format || 'string-array',
    fetch_userinfo: initialPreset?.form.fetch_userinfo || false,
    scopes: initialPreset?.form.scopes || ['openid', 'profile', 'email'],
    allowed_email_domains: initialPreset?.form.allowed_email_domains || [],
    iat_window_seconds: 300,
    jwks_cache_ttl_seconds: 3600,
  });

  const [emailDomainInput, setEmailDomainInput] = useState('');
  const [emailDomainErr, setEmailDomainErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  if (!isOpen) return null;

  const applyPreset = (preset: OIDCPreset) => {
    setForm((prev) => ({
      ...prev,
      ...preset.form,
    }));
    setDirty(true);
    toast.success(`Nạp mẫu cấu hình ${preset.name} thành công`);
  };

  const update = <K extends keyof OIDCProviderRequest>(k: K, v: OIDCProviderRequest[K]) => {
    setForm((prev) => ({ ...prev, [k]: v }));
    setDirty(true);
  };

  const addEmailDomain = () => {
    const trimmed = emailDomainInput.trim().toLowerCase();
    setEmailDomainErr(null);
    const v = validateEmailDomain(trimmed);
    if (v !== '') {
      setEmailDomainErr(v);
      return;
    }
    const current = form.allowed_email_domains || [];
    if (current.includes(trimmed)) {
      setEmailDomainErr('Already in the list');
      return;
    }
    update('allowed_email_domains', [...current, trimmed]);
    setEmailDomainInput('');
  };

  const removeEmailDomain = (d: string) => {
    update(
      'allowed_email_domains',
      (form.allowed_email_domains || []).filter((x) => x !== d),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.issuer_url.trim() || !form.client_id.trim() || !form.client_secret) return;
    setSubmitting(true);
    setError(null);
    try {
      await createOIDCProvider(form);
      setDirty(false);
      toast.success('Đã cấu hình nhà cung cấp OIDC thành công');
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (dirty && !window.confirm('Discard unsaved changes?')) return;
    setDirty(false);
    setError(null);
    setEmailDomainInput('');
    setEmailDomainErr(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div
        className="bg-surface border border-surface-border rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto space-y-4"
        onClick={(e) => e.stopPropagation()}
        data-testid="create-oidc-provider-modal"
      >
        <div className="flex items-center gap-3 border-b border-surface-border/60 pb-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-ink">Configure OIDC provider</h2>
            <p className="text-xs text-ink-muted">Set up single sign-on (SSO) authentication for your organization.</p>
          </div>
        </div>

        {/* Preset Quick Fill Cards */}
        <div className="bg-surface-muted/40 p-3.5 rounded-xl border border-surface-border/60 space-y-2">
          <div className="text-xs font-semibold text-ink-muted flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Quick Presets (Nạp mẫu cấu hình nhanh):</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {OIDC_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`text-xs px-2.5 py-1.5 rounded-lg border font-semibold transition-all ${preset.color}`}
              >
                {preset.badge}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium" data-testid="create-oidc-provider-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">Display name *</label>
            <input
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="e.g., Keycloak Production SSO"
              className="w-full px-3.5 py-2 text-sm border border-surface-border rounded-lg bg-white text-ink focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              required
              data-testid="oidc-provider-name-input"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">Issuer URL *</label>
            <input
              type="url"
              value={form.issuer_url}
              onChange={(e) => update('issuer_url', e.target.value)}
              placeholder="https://idp.example.com/realm/main"
              className="w-full px-3.5 py-2 text-sm border border-surface-border rounded-lg bg-white text-ink focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-mono"
              required
              data-testid="oidc-provider-issuer-url-input"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">Client ID *</label>
              <input
                value={form.client_id}
                onChange={(e) => update('client_id', e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-surface-border rounded-lg bg-white text-ink focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-mono"
                required
                data-testid="oidc-provider-client-id-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">Client secret *</label>
              <input
                type="password"
                value={form.client_secret}
                onChange={(e) => update('client_secret', e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-surface-border rounded-lg bg-white text-ink focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-mono"
                required
                data-testid="oidc-provider-client-secret-input"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">Redirect URI *</label>
            <input
              type="url"
              value={form.redirect_uri}
              onChange={(e) => update('redirect_uri', e.target.value)}
              placeholder="https://certctl.example.com/auth/oidc/callback"
              className="w-full px-3.5 py-2 text-sm border border-surface-border rounded-lg bg-white text-ink focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-mono"
              required
              data-testid="oidc-provider-redirect-uri-input"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">Groups claim path</label>
              <input
                value={form.groups_claim_path}
                onChange={(e) => update('groups_claim_path', e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-surface-border rounded-lg bg-white text-ink focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-mono"
                data-testid="oidc-provider-groups-claim-path-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">Groups claim format</label>
              <select
                value={form.groups_claim_format}
                onChange={(e) => update('groups_claim_format', e.target.value as any)}
                className="w-full px-3.5 py-2 text-sm border border-surface-border rounded-lg bg-white text-ink focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-mono"
                data-testid="oidc-provider-groups-claim-format-select"
              >
                <option value="string-array">string-array</option>
                <option value="json-path">json-path</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs font-semibold text-ink cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={form.fetch_userinfo || false}
              onChange={(e) => update('fetch_userinfo', e.target.checked)}
              className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500"
              data-testid="oidc-provider-fetch-userinfo-checkbox"
            />
            <span>Fetch groups from userinfo endpoint when ID token claim is empty</span>
          </label>

          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">Allowed email domains (optional)</label>
            <p className="text-[11px] text-ink-muted mb-2">
              When non-empty, only users whose email domain matches one of these entries can log in.
            </p>
            {(form.allowed_email_domains || []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2" data-testid="oidc-create-allowed-email-domains-chips">
                {(form.allowed_email_domains || []).map((d) => (
                  <span
                    key={d}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-brand-50 text-brand-700 border border-brand-200 rounded-md font-mono font-medium"
                    data-testid={`oidc-create-allowed-email-domain-chip-${d}`}
                  >
                    {d}
                    <button
                      type="button"
                      onClick={() => removeEmailDomain(d)}
                      className="text-brand-500 hover:text-rose-600 font-bold leading-none"
                      aria-label={`Remove ${d}`}
                      data-testid={`oidc-create-allowed-email-domain-chip-remove-${d}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={emailDomainInput}
                onChange={(e) => {
                  setEmailDomainInput(e.target.value);
                  if (emailDomainErr) setEmailDomainErr(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addEmailDomain();
                  }
                }}
                placeholder="e.g., company.com"
                className="flex-1 px-3.5 py-1.5 text-sm border border-surface-border rounded-lg bg-white text-ink font-mono focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                data-testid="oidc-create-allowed-email-domains-input"
              />
              <button
                type="button"
                onClick={addEmailDomain}
                className="px-3.5 py-1.5 text-xs font-semibold border border-surface-border rounded-lg bg-white hover:bg-surface-muted text-ink transition-colors"
                data-testid="oidc-create-allowed-email-domains-add"
              >
                Add
              </button>
            </div>
            {emailDomainErr && (
              <p className="mt-1 text-xs text-rose-700 font-medium" data-testid="oidc-create-allowed-email-domains-error">
                {emailDomainErr}
              </p>
            )}
          </div>

          <OIDCTestConnectionPanel issuerURL={form.issuer_url} clientID={form.client_id} scopes={form.scopes || []} testIDSuffix="create" />

          <div className="flex justify-end gap-2.5 pt-3">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-ghost text-xs border border-surface-border hover:bg-surface-muted"
              data-testid="create-oidc-provider-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary text-xs shadow-md disabled:opacity-50"
              data-testid="create-oidc-provider-submit"
            >
              {submitting ? 'Creating…' : 'Create provider'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function OIDCProvidersPage() {
  const { hasPerm } = useAuthMe();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [activePreset, setActivePreset] = useState<OIDCPreset | null>(null);

  const canList = hasPerm('auth.oidc.list');
  const canCreate = hasPerm('auth.oidc.create');

  const { data, isLoading, error } = useQuery({
    queryKey: ['oidc-providers'],
    queryFn: listOIDCProviders,
    enabled: canList,
  });

  const handleOpenPreset = (preset: OIDCPreset) => {
    setActivePreset(preset);
    setShowCreate(true);
  };

  if (!canList) {
    return (
      <div className="p-8">
        <PageHeader title="OIDC providers" subtitle="Identity provider configuration" />
        <ErrorState error={new Error('You need the auth.oidc.list permission to view OIDC providers. Ask an administrator to grant the permission to your role.')} />
      </div>
    );
  }

  const totalProviders = data?.providers?.length || 0;

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="OIDC providers"
        subtitle="Identity provider single sign-on (SSO) configuration"
        action={
          canCreate && (
            <button
              onClick={() => {
                setActivePreset(null);
                setShowCreate(true);
              }}
              className="btn btn-primary shadow-md shadow-brand-500/20 text-xs flex items-center gap-1.5"
              data-testid="oidc-providers-create-button"
            >
              <Plus className="w-4 h-4" /> Configure provider
            </button>
          )
        }
      />

      {/* Preset Quick Actions Banner */}
      <div className="bg-surface border border-surface-border rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-ink">Mẫu cấu hình OIDC phổ biến (Presets)</h3>
          </div>
          <span className="text-xs text-ink-muted">Bấm chọn để nạp nhanh mẫu cấu hình SSO</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {OIDC_PRESETS.map((preset) => (
            <div
              key={preset.id}
              onClick={() => canCreate && handleOpenPreset(preset)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-2xs hover:shadow-sm flex flex-col justify-between space-y-2 ${preset.color}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">{preset.badge}</span>
                <Plus className="w-3.5 h-3.5 opacity-70" />
              </div>
              <p className="text-[11px] opacity-80 line-clamp-2">{preset.description}</p>
            </div>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="text-sm text-ink-muted py-6 flex items-center gap-2" data-testid="oidc-providers-loading">
          <ShieldCheck className="w-4 h-4 text-brand-500 animate-pulse" /> Loading providers…
        </div>
      )}
      {error && <ErrorState error={error instanceof Error ? error : new Error(String(error))} />}

      {data && data.providers.length === 0 && (
        <div className="bg-surface border border-surface-border rounded-xl p-8 text-center shadow-sm space-y-4" data-testid="oidc-providers-empty">
          <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-ink">Chưa có nhà cung cấp OIDC</h3>
            <p className="text-ink-muted text-xs max-w-md mx-auto">
              Chưa tìm thấy cấu hình Single Sign-On (SSO).{' '}
              {canCreate ? 'Bạn có thể chọn bấm "Configure provider" hoặc click một trong các mẫu Keycloak / Okta / Entra ID ở trên để tạo mẫu nhanh.' : 'Hãy liên hệ Quản trị viên để cấu hình.'}
            </p>
          </div>
        </div>
      )}

      {data && data.providers.length > 0 && (
        <div className="bg-surface border border-surface-border rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted/60 border-b border-surface-border">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-ink">Name</th>
                <th className="text-left px-5 py-3 font-semibold text-ink">Issuer URL</th>
                <th className="text-left px-5 py-3 font-semibold text-ink">Client ID</th>
                <th className="text-left px-5 py-3 font-semibold text-ink">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/60">
              {data.providers.map((p: OIDCProvider) => (
                <tr key={p.id} className="hover:bg-surface-muted/30 transition-colors" data-testid={`oidc-provider-row-${p.id}`}>
                  <td className="px-5 py-3.5">
                    <Link
                      to={`/auth/oidc/providers/${encodeURIComponent(p.id)}`}
                      className="font-semibold text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-1.5"
                      data-testid={`oidc-provider-link-${p.id}`}
                    >
                      <Shield className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-ink-muted font-mono text-xs max-w-xs truncate">{p.issuer_url}</td>
                  <td className="px-5 py-3.5 text-ink-muted font-mono text-xs">{p.client_id}</td>
                  <td className="px-5 py-3.5 text-ink-muted text-xs font-mono">{formatDate(p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreateProviderModal
        isOpen={showCreate}
        initialPreset={activePreset}
        onClose={() => {
          setShowCreate(false);
          setActivePreset(null);
        }}
        onSuccess={() => {
          setShowCreate(false);
          setActivePreset(null);
          queryClient.invalidateQueries({ queryKey: ['oidc-providers'] });
        }}
      />
    </div>
  );
}
