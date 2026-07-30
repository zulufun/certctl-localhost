import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useSearchParams } from 'react-router-dom';
import {
  Server,
  Activity,
  Shield,
  RefreshCw,
  Lock,
  FileCheck,
  CheckCircle2,
} from 'lucide-react';
import {
  getAdminESTProfiles,
  reloadAdminESTTrust,
  getAuditEvents,
} from '../api/client';
import PageHeader from '../components/PageHeader';
import ModalDialog from '../components/ModalDialog';
import ErrorState from '../components/ErrorState';
import { useAuth } from '../components/AuthProvider';
import { useTrackedMutation } from '../hooks/useTrackedMutation';
import { formatDateTime } from '../api/utils';
import type {
  ESTStatsSnapshot,
  ESTTrustAnchorInfo,
  AuditEvent,
} from '../api/types';

const COUNTER_LABEL_ORDER = [
  'success_simpleenroll',
  'success_simplereenroll',
  'success_serverkeygen',
  'auth_failed_basic',
  'auth_failed_mtls',
  'auth_failed_channel_binding',
  'csr_invalid',
  'csr_policy_violation',
  'csr_signature_mismatch',
  'rate_limited',
  'issuer_error',
  'internal_error',
] as const;

const COUNTER_PRESENTATION: Record<string, { label: string; tone: 'good' | 'warn' | 'bad' }> = {
  success_simpleenroll: { label: 'Enrollments', tone: 'good' },
  success_simplereenroll: { label: 'Re-enrollments', tone: 'good' },
  success_serverkeygen: { label: 'Server-keygen', tone: 'good' },
  auth_failed_basic: { label: 'Auth failed (Basic)', tone: 'warn' },
  auth_failed_mtls: { label: 'Auth failed (mTLS)', tone: 'warn' },
  auth_failed_channel_binding: { label: 'Channel-binding mismatch', tone: 'bad' },
  csr_invalid: { label: 'CSR invalid', tone: 'warn' },
  csr_policy_violation: { label: 'CSR policy violation', tone: 'warn' },
  csr_signature_mismatch: { label: 'CSR signature mismatch', tone: 'bad' },
  rate_limited: { label: 'Rate-limited', tone: 'warn' },
  issuer_error: { label: 'Issuer error', tone: 'bad' },
  internal_error: { label: 'Internal error', tone: 'bad' },
};

const TONE_CLASS: Record<'good' | 'warn' | 'bad', string> = {
  good: 'text-emerald-400 font-bold',
  warn: 'text-amber-400 font-bold',
  bad: 'text-red-400 font-bold',
};

type TabId = 'profiles' | 'activity' | 'trust';
type ActivityFilter = 'all' | 'enroll' | 'reenroll' | 'serverkeygen' | 'authfail';

const TAB_LABELS: Record<TabId, string> = {
  profiles: 'Profiles',
  activity: 'Recent Activity',
  trust: 'Trust Bundle',
};

const EST_AUDIT_ACTIONS = [
  'est_simple_enroll',
  'est_simple_reenroll',
  'est_server_keygen',
  'est_auth_failed',
] as const;

function expiryBadge(days: number | null, expired: boolean): { text: string; tone: 'good' | 'warn' | 'bad' } {
  if (expired) return { text: 'EXPIRED', tone: 'bad' };
  if (days === null) return { text: 'Not loaded', tone: 'warn' };
  if (days < 7) return { text: `${days}d remaining`, tone: 'bad' };
  if (days < 30) return { text: `${days}d remaining (rotate soon)`, tone: 'warn' };
  return { text: `${days}d remaining`, tone: 'good' };
}

function badgeClass(tone: 'good' | 'warn' | 'bad'): string {
  if (tone === 'good') return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
  if (tone === 'warn') return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
  return 'bg-red-500/15 text-red-400 border border-red-500/30';
}

function pillClass(active: boolean): string {
  return active
    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    : 'bg-surface-muted text-ink-muted border-surface-border';
}

function soonestExpiryDays(anchors?: ESTTrustAnchorInfo[]): number | null {
  if (!anchors || anchors.length === 0) return null;
  let min = Number.POSITIVE_INFINITY;
  for (const a of anchors) {
    if (a.expired) return -1;
    if (a.days_to_expiry < min) min = a.days_to_expiry;
  }
  return min === Number.POSITIVE_INFINITY ? null : min;
}

interface ProfilesTabProps {
  profiles: ESTStatsSnapshot[];
  isLoading: boolean;
  onRequestReload: (profile: ESTStatsSnapshot) => void;
}

function ProfilesTab({ profiles, isLoading, onRequestReload }: ProfilesTabProps) {
  if (isLoading) {
    return <p className="text-xs text-ink-muted py-6">Loading profiles…</p>;
  }
  if (profiles.length === 0) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-xs text-amber-300">
        No EST profiles are configured. Set <code>CERTCTL_EST_ENABLED=true</code> and either the
        legacy single-profile env vars or <code>CERTCTL_EST_PROFILES=...</code> with the indexed
        per-profile family to register at least one endpoint.
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {profiles.map(p => (
        <ProfileSummaryCard
          key={p.path_id || '(root)'}
          profile={p}
          onRequestReload={onRequestReload}
        />
      ))}
    </div>
  );
}

interface ProfileSummaryCardProps {
  profile: ESTStatsSnapshot;
  onRequestReload: (profile: ESTStatsSnapshot) => void;
}

function ProfileSummaryCard({ profile, onRequestReload }: ProfileSummaryCardProps) {
  const pathLabel = profile.path_id || '(legacy /.well-known/est root)';
  const trustDays = soonestExpiryDays(profile.trust_anchors);
  const trustExpired = (profile.trust_anchors ?? []).some(a => a.expired);
  const trustBadge = profile.mtls_enabled
    ? expiryBadge(trustDays, trustExpired)
    : null;

  return (
    <section
      className="bg-surface border border-surface-border rounded-2xl p-5 shadow-sm space-y-4"
      data-testid={`est-profile-summary-${profile.path_id}`}
    >
      <header className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-ink flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" />
            <span>{pathLabel}</span>
          </h3>
          <p className="text-xs text-ink-muted mt-0.5">
            Issuer: <span className="font-mono text-ink">{profile.issuer_id}</span>
            {profile.profile_id && (
              <>
                {' '}· Profile: <code className="font-mono">{profile.profile_id}</code>
              </>
            )}
          </p>
        </div>
        {trustBadge && (
          <span
            className={`text-xs px-3 py-1 rounded-full font-semibold ${badgeClass(trustBadge.tone)}`}
            data-testid={`est-trust-expiry-badge-${profile.path_id}`}
          >
            mTLS trust: {trustBadge.text}
          </span>
        )}
      </header>

      <div className="flex flex-wrap gap-2" data-testid={`est-profile-badges-${profile.path_id}`}>
        <span className={`text-xs uppercase tracking-wide px-2.5 py-0.5 rounded-full border font-semibold ${pillClass(profile.mtls_enabled)}`}>
          mTLS {profile.mtls_enabled ? 'enabled' : 'disabled'}
        </span>
        <span className={`text-xs uppercase tracking-wide px-2.5 py-0.5 rounded-full border font-semibold ${pillClass(profile.basic_auth_configured)}`}>
          HTTP Basic {profile.basic_auth_configured ? 'configured' : 'not set'}
        </span>
        <span className={`text-xs uppercase tracking-wide px-2.5 py-0.5 rounded-full border font-semibold ${pillClass(profile.server_keygen_enabled)}`}>
          Server-keygen {profile.server_keygen_enabled ? 'enabled' : 'disabled'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5" data-testid={`est-profile-counters-${profile.path_id}`}>
        {COUNTER_LABEL_ORDER.map(label => {
          const presentation = COUNTER_PRESENTATION[label];
          const value = profile.counters?.[label] ?? 0;
          return (
            <div key={label} className="bg-surface-muted/60 border border-surface-border rounded-xl p-3" data-testid={`est-counter-${profile.path_id}-${label}`}>
              <div className="text-[10px] text-ink-muted uppercase tracking-wider font-semibold">{presentation.label}</div>
              <div className={`text-xl font-bold font-mono mt-0.5 ${TONE_CLASS[presentation.tone]}`}>{value}</div>
            </div>
          );
        })}
      </div>

      {profile.mtls_enabled && profile.trust_anchor_path && (
        <p className="text-xs text-ink-muted font-mono bg-surface-muted/30 p-2.5 rounded-xl border border-surface-border truncate">
          Trust bundle: {profile.trust_anchor_path}
        </p>
      )}

      {profile.mtls_enabled && (
        <div className="pt-2 border-t border-surface-border flex justify-end">
          <button
            type="button"
            onClick={() => onRequestReload(profile)}
            className="btn btn-ghost text-xs font-semibold px-3 py-1.5 rounded-xl border border-surface-border"
            data-testid={`est-reload-trust-${profile.path_id}`}
          >
            Reload trust anchor
          </button>
        </div>
      )}
    </section>
  );
}

interface ConfirmReloadModalProps {
  profile: ESTStatsSnapshot;
  onCancel: () => void;
  onConfirm: () => void;
  pending: boolean;
  errorMessage?: string;
}

function ConfirmReloadModal({ profile, onCancel, onConfirm, pending, errorMessage }: ConfirmReloadModalProps) {
  const pathLabel = profile.path_id || '(legacy /.well-known/est root)';
  return (
    <ModalDialog
      open={true}
      title="Reload EST mTLS trust anchor"
      onClose={pending ? () => {} : onCancel}
      footer={
        <>
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            data-testid="est-reload-cancel"
            className="btn btn-ghost text-xs px-4 py-2 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            data-testid="est-reload-confirm"
            className="btn btn-primary text-xs font-semibold px-4 py-2 rounded-xl disabled:opacity-50"
          >
            {pending ? 'Reloading…' : 'Reload trust anchor'}
          </button>
        </>
      }
    >
      <p className="text-xs text-ink-muted mb-3 leading-relaxed">
        This re-reads <code className="text-xs font-mono text-ink">{profile.trust_anchor_path}</code> from disk and atomically
        swaps the trust pool for EST profile <strong>{pathLabel}</strong>. Equivalent to sending
        <code className="text-xs font-mono"> SIGHUP </code> to the server.
      </p>
      {errorMessage && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400" data-testid="est-reload-error">
          {errorMessage}
        </div>
      )}
    </ModalDialog>
  );
}

interface ActivityTabProps {
  events: AuditEvent[];
  isLoading: boolean;
  filter: ActivityFilter;
  setFilter: (f: ActivityFilter) => void;
}

function activityMatches(filter: ActivityFilter, e: AuditEvent): boolean {
  if (filter === 'all') return true;
  if (filter === 'enroll') return e.action === 'est_simple_enroll';
  if (filter === 'reenroll') return e.action === 'est_simple_reenroll';
  if (filter === 'serverkeygen') return e.action === 'est_server_keygen';
  if (filter === 'authfail') return e.action === 'est_auth_failed';
  return false;
}

const ACTIVITY_FILTERS: { id: ActivityFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'enroll', label: 'Enrollment' },
  { id: 'reenroll', label: 'Re-enrollment' },
  { id: 'serverkeygen', label: 'Server-keygen' },
  { id: 'authfail', label: 'Auth failure' },
];

function ActivityTab({ events, isLoading, filter, setFilter }: ActivityTabProps) {
  const filtered = useMemo(() => events.filter(e => activityMatches(filter, e)), [events, filter]);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" data-testid="est-activity-filters">
        {ACTIVITY_FILTERS.map(f => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            data-testid={`est-activity-filter-${f.id}`}
            aria-pressed={filter === f.id}
            className={`text-xs px-3.5 py-1 rounded-full font-semibold border transition-all ${
              filter === f.id
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-sm'
                : 'bg-surface-muted text-ink-muted border-surface-border hover:bg-surface-hover'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      {isLoading && <p className="text-xs text-ink-muted">Loading audit events…</p>}
      {!isLoading && filtered.length === 0 && (
        <p className="text-xs text-ink-muted text-center py-6">No events match the selected filter.</p>
      )}
      {!isLoading && filtered.length > 0 && (
        <div className="bg-surface border border-surface-border rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-xs" data-testid="est-activity-table">
            <thead className="bg-surface-muted/50 text-ink-muted text-[10px] uppercase tracking-wider border-b border-surface-border">
              <tr>
                <th className="text-left px-4 py-2.5">Timestamp</th>
                <th className="text-left px-3 py-2.5">Action</th>
                <th className="text-left px-3 py-2.5">Subject</th>
                <th className="text-left px-3 py-2.5">Resource</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50">
              {filtered.slice(0, 100).map((e, i) => (
                <tr key={`${e.timestamp}-${i}`} className="hover:bg-surface-muted/40 transition-colors">
                  <td className="px-4 py-2 font-mono text-ink-muted">{formatDateTime(e.timestamp)}</td>
                  <td className="px-3 py-2 font-mono font-semibold text-emerald-400">{e.action}</td>
                  <td className="px-3 py-2 text-ink-muted">{e.actor || '—'}</td>
                  <td className="px-3 py-2 text-ink-muted font-mono">{e.resource_id || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

interface TrustBundleTabProps {
  profiles: ESTStatsSnapshot[];
}

function TrustBundleTab({ profiles }: TrustBundleTabProps) {
  const mtlsProfiles = profiles.filter(p => p.mtls_enabled && p.trust_anchors && p.trust_anchors.length > 0);
  if (mtlsProfiles.length === 0) {
    return (
      <div className="rounded-2xl border border-surface-border bg-surface-muted p-5 text-xs text-ink-muted">
        No EST profiles have mTLS enabled. The Trust Bundle tab is only relevant when at least one
        profile carries an <code>MTLS_CLIENT_CA_TRUST_BUNDLE_PATH</code>.
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {mtlsProfiles.map(p => (
        <section
          key={p.path_id || '(root)'}
          className="bg-surface border border-surface-border rounded-2xl p-5 shadow-sm space-y-3"
          data-testid={`est-trust-card-${p.path_id}`}
        >
          <header className="flex items-center justify-between">
            <h3 className="text-base font-bold text-ink flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>{p.path_id || '(legacy root)'}</span>
            </h3>
            <span className="text-xs font-mono text-ink-muted">{p.trust_anchor_path}</span>
          </header>
          <div className="overflow-x-auto rounded-xl border border-surface-border">
            <table className="w-full text-xs">
              <thead className="bg-surface-muted text-ink-muted text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="text-left px-3 py-2">Subject</th>
                  <th className="text-left px-3 py-2">Not Before</th>
                  <th className="text-left px-3 py-2">Not After</th>
                  <th className="text-left px-3 py-2">Days Remaining</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {(p.trust_anchors ?? []).map(a => (
                  <tr key={`${p.path_id}-${a.subject}-${a.not_after}`}>
                    <td className="px-3 py-2 font-mono text-ink">{a.subject}</td>
                    <td className="px-3 py-2 font-mono text-ink-muted">{formatDateTime(a.not_before)}</td>
                    <td className="px-3 py-2 font-mono text-ink-muted">{formatDateTime(a.not_after)}</td>
                    <td className={`px-3 py-2 font-bold ${a.expired ? 'text-red-400' : a.days_to_expiry < 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {a.expired ? 'EXPIRED' : `${a.days_to_expiry}d`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}

function pickInitialTab(searchParams: URLSearchParams): TabId {
  const fromQuery = searchParams.get('tab');
  if (fromQuery === 'activity' || fromQuery === 'trust') return fromQuery;
  return 'profiles';
}

export default function ESTAdminPage() {
  const auth = useAuth();
  const adminAccess = !auth.authRequired || auth.admin;
  const [searchParams, setSearchParams] = useSearchParams();
  const _location = useLocation();
  void _location;

  const [activeTab, setActiveTab] = useState<TabId>(() => pickInitialTab(searchParams));
  const [reloadTarget, setReloadTarget] = useState<ESTStatsSnapshot | null>(null);
  const [reloadError, setReloadError] = useState<string | undefined>(undefined);
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all');

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (activeTab === 'profiles') {
      next.delete('tab');
    } else {
      next.set('tab', activeTab);
    }
    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
  }, [activeTab, searchParams, setSearchParams]);

  const profilesQuery = useQuery({
    queryKey: ['admin', 'est', 'profiles'],
    queryFn: getAdminESTProfiles,
    enabled: adminAccess,
    refetchInterval: 30_000,
  });

  const auditQueries = EST_AUDIT_ACTIONS.map(action =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      queryKey: ['audit', { action }],
      queryFn: () => getAuditEvents({ action }),
      enabled: adminAccess && activeTab === 'activity',
      refetchInterval: 60_000,
    }),
  );
  const allAuditEvents: AuditEvent[] = useMemo(() => {
    const merged: AuditEvent[] = [];
    for (const q of auditQueries) {
      if (q.data?.data) merged.push(...q.data.data);
    }
    return merged.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auditQueries.map(q => q.dataUpdatedAt).join('|')]);
  const auditLoading = auditQueries.some(q => q.isLoading);

  const reloadMutation = useTrackedMutation<
    Awaited<ReturnType<typeof reloadAdminESTTrust>>,
    Error,
    string
  >({
    mutationFn: (pathID: string) => reloadAdminESTTrust(pathID),
    invalidates: [['admin', 'est', 'profiles']],
    onSuccess: () => {
      setReloadTarget(null);
      setReloadError(undefined);
    },
    onError: (err: Error) => {
      setReloadError(err.message);
    },
  });

  if (auth.authRequired && !auth.admin) {
    return (
      <>
        <PageHeader title="EST Administration" subtitle="Admin-only observability surface" />
        <div className="p-6">
          <ErrorState
            error={
              new Error(
                'Admin access required: this page exposes per-profile mTLS trust-anchor expiries, auth-mode posture, per-status enrollment counters, and an admin-only reload action. Sign in with an admin-tagged API key to view it.',
              )
            }
          />
        </div>
      </>
    );
  }

  const profiles = profilesQuery.data?.profiles ?? [];

  return (
    <>
      <PageHeader
        title="EST Administration"
        subtitle={`${profiles.length} EST profile${profiles.length === 1 ? '' : 's'} configured · per-profile observability + recent activity + trust-bundle viewer`}
        action={
          <button
            type="button"
            onClick={() => {
              void profilesQuery.refetch();
            }}
            className="btn btn-ghost text-xs font-semibold px-3 py-2 rounded-xl border border-surface-border flex items-center gap-1.5"
            data-testid="est-refresh-stats-button"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Refresh now</span>
          </button>
        }
      />

      <div className="border-b border-surface-border bg-surface px-6">
        <nav className="flex gap-2 -mb-px" data-testid="est-admin-tabs">
          {(['profiles', 'activity', 'trust'] as TabId[]).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTab(t)}
              className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === t
                  ? 'border-emerald-400 text-emerald-400 font-bold'
                  : 'border-transparent text-ink-muted hover:text-ink hover:border-surface-border'
              }`}
              data-testid={`est-tab-${t}`}
              aria-pressed={activeTab === t}
            >
              {t === 'profiles' && <Server className="w-3.5 h-3.5" />}
              {t === 'activity' && <Activity className="w-3.5 h-3.5" />}
              {t === 'trust' && <Shield className="w-3.5 h-3.5" />}
              <span>{TAB_LABELS[t]}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {profilesQuery.error && activeTab === 'profiles' && (
          <ErrorState error={profilesQuery.error as Error} onRetry={() => profilesQuery.refetch()} />
        )}

        {activeTab === 'profiles' && !profilesQuery.error && (
          <ProfilesTab
            profiles={profiles}
            isLoading={profilesQuery.isLoading}
            onRequestReload={profile => {
              setReloadError(undefined);
              setReloadTarget(profile);
            }}
          />
        )}

        {activeTab === 'activity' && (
          <ActivityTab
            events={allAuditEvents}
            isLoading={auditLoading}
            filter={activityFilter}
            setFilter={setActivityFilter}
          />
        )}

        {activeTab === 'trust' && <TrustBundleTab profiles={profiles} />}
      </div>

      {reloadTarget && (
        <ConfirmReloadModal
          profile={reloadTarget}
          onCancel={() => {
            setReloadTarget(null);
            setReloadError(undefined);
          }}
          onConfirm={() => reloadMutation.mutate(reloadTarget.path_id)}
          pending={reloadMutation.isPending}
          errorMessage={reloadError}
        />
      )}
    </>
  );
}
