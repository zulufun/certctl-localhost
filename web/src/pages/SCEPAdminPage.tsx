import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useSearchParams } from 'react-router-dom';
import {
  Server,
  ShieldCheck,
  Activity,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight,
  Shield,
  Clock,
  Key,
} from 'lucide-react';
import {
  getAdminSCEPIntuneStats,
  getAdminSCEPProfiles,
  reloadAdminSCEPIntuneTrust,
  getAuditEvents,
} from '../api/client';
import PageHeader from '../components/PageHeader';
import ModalDialog from '../components/ModalDialog';
import ErrorState from '../components/ErrorState';
import { useAuth } from '../components/AuthProvider';
import { useTrackedMutation } from '../hooks/useTrackedMutation';
import { formatDateTime } from '../api/utils';
import type {
  IntuneStatsSnapshot,
  IntuneTrustAnchorInfo,
  AuditEvent,
  SCEPProfileStatsSnapshot,
} from '../api/types';

const COUNTER_LABEL_ORDER = [
  'success',
  'signature_invalid',
  'expired',
  'not_yet_valid',
  'wrong_audience',
  'replay',
  'rate_limited',
  'claim_mismatch',
  'compliance_failed',
  'malformed',
  'unknown_version',
] as const;

const COUNTER_PRESENTATION: Record<string, { label: string; tone: 'good' | 'warn' | 'bad' }> = {
  success: { label: 'Success', tone: 'good' },
  signature_invalid: { label: 'Signature invalid', tone: 'bad' },
  expired: { label: 'Expired', tone: 'warn' },
  not_yet_valid: { label: 'Not yet valid', tone: 'warn' },
  wrong_audience: { label: 'Wrong audience', tone: 'bad' },
  replay: { label: 'Replay', tone: 'bad' },
  rate_limited: { label: 'Rate-limited', tone: 'warn' },
  claim_mismatch: { label: 'Claim mismatch', tone: 'bad' },
  compliance_failed: { label: 'Compliance failed', tone: 'warn' },
  malformed: { label: 'Malformed', tone: 'bad' },
  unknown_version: { label: 'Unknown version', tone: 'warn' },
};

const TONE_CLASS: Record<'good' | 'warn' | 'bad', string> = {
  good: 'text-emerald-400 font-bold',
  warn: 'text-amber-400 font-bold',
  bad: 'text-red-400 font-bold',
};

type TabId = 'profiles' | 'intune' | 'activity';
type ActivityFilter = 'all' | 'initial' | 'renewal' | 'intune' | 'static';

const TAB_LABELS: Record<TabId, string> = {
  profiles: 'Profiles',
  intune: 'Intune Monitoring',
  activity: 'Recent Activity',
};

const SCEP_AUDIT_ACTIONS = [
  'scep_pkcsreq',
  'scep_renewalreq',
  'scep_pkcsreq_intune',
  'scep_renewalreq_intune',
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

function soonestExpiryDays(anchors?: IntuneTrustAnchorInfo[]): number | null {
  if (!anchors || anchors.length === 0) return null;
  let min = Number.POSITIVE_INFINITY;
  for (const a of anchors) {
    if (a.expired) return -1;
    if (a.days_to_expiry < min) min = a.days_to_expiry;
  }
  return min === Number.POSITIVE_INFINITY ? null : min;
}

interface ProfilesTabProps {
  profiles: SCEPProfileStatsSnapshot[];
  isLoading: boolean;
  onViewIntuneDetails: (pathID: string) => void;
}

function ProfilesTab({ profiles, isLoading, onViewIntuneDetails }: ProfilesTabProps) {
  if (isLoading) {
    return <p className="text-xs text-ink-muted py-6">Loading profiles…</p>;
  }
  if (profiles.length === 0) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-xs text-amber-300">
        No SCEP profiles are configured. Set <code>CERTCTL_SCEP_ENABLED=true</code> and either the
        legacy single-profile env vars or <code>CERTCTL_SCEP_PROFILES=...</code> with the indexed
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
          onViewIntuneDetails={onViewIntuneDetails}
        />
      ))}
    </div>
  );
}

interface ProfileSummaryCardProps {
  profile: SCEPProfileStatsSnapshot;
  onViewIntuneDetails: (pathID: string) => void;
}

function ProfileSummaryCard({ profile, onViewIntuneDetails }: ProfileSummaryCardProps) {
  const pathLabel = profile.path_id || '(legacy /scep root)';
  const intuneEnabled = !!profile.intune;
  const raBadge = expiryBadge(
    profile.ra_cert_subject ? profile.ra_cert_days_to_expiry : null,
    profile.ra_cert_expired,
  );

  return (
    <section
      className="bg-surface border border-surface-border rounded-2xl p-5 shadow-sm space-y-4"
      data-testid={`profile-summary-${profile.path_id}`}
    >
      <header className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-ink flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" />
            <span>{pathLabel}</span>
          </h3>
          <p className="text-xs text-ink-muted mt-0.5">Issuer ID: <span className="font-mono text-ink">{profile.issuer_id}</span></p>
        </div>
        <span
          className={`text-xs px-3 py-1 rounded-full font-semibold ${badgeClass(raBadge.tone)}`}
          data-testid={`ra-expiry-badge-${profile.path_id}`}
        >
          RA cert: {raBadge.text}
        </span>
      </header>

      <div className="flex flex-wrap gap-2" data-testid={`profile-badges-${profile.path_id}`}>
        <span className={`text-xs uppercase tracking-wide px-2.5 py-0.5 rounded-full border font-semibold ${pillClass(profile.challenge_password_set)}`}>
          Challenge password{profile.challenge_password_set ? ' set' : ' MISSING'}
        </span>
        <span className={`text-xs uppercase tracking-wide px-2.5 py-0.5 rounded-full border font-semibold ${pillClass(profile.mtls_enabled)}`}>
          mTLS {profile.mtls_enabled ? 'enabled' : 'disabled'}
        </span>
        <span className={`text-xs uppercase tracking-wide px-2.5 py-0.5 rounded-full border font-semibold ${pillClass(intuneEnabled)}`}>
          Intune {intuneEnabled ? 'enabled' : 'disabled'}
        </span>
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-ink-muted bg-surface-muted/50 p-4 rounded-xl border border-surface-border">
        <div>
          <dt className="font-semibold text-ink">RA Cert Subject</dt>
          <dd className="font-mono text-[11px] text-ink-faint truncate" title={profile.ra_cert_subject}>{profile.ra_cert_subject || '(not loaded)'}</dd>
        </div>
        {profile.ra_cert_not_after && (
          <div>
            <dt className="font-semibold text-ink">RA Cert Expires</dt>
            <dd className="font-mono">{formatDateTime(profile.ra_cert_not_after)}</dd>
          </div>
        )}
        {profile.mtls_enabled && profile.mtls_trust_bundle_path && (
          <div>
            <dt className="font-semibold text-ink">mTLS Trust Bundle</dt>
            <dd className="font-mono text-[11px] truncate">{profile.mtls_trust_bundle_path}</dd>
          </div>
        )}
      </dl>

      {intuneEnabled && (
        <div className="pt-2 border-t border-surface-border flex justify-end">
          <button
            type="button"
            onClick={() => onViewIntuneDetails(profile.path_id)}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 group"
            data-testid={`view-intune-details-${profile.path_id}`}
          >
            <span>View Intune details</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      )}
    </section>
  );
}

interface ConfirmReloadModalProps {
  profile: IntuneStatsSnapshot;
  onCancel: () => void;
  onConfirm: () => void;
  pending: boolean;
  errorMessage?: string;
}

function ConfirmReloadModal({ profile, onCancel, onConfirm, pending, errorMessage }: ConfirmReloadModalProps) {
  const pathLabel = profile.path_id || '(legacy /scep root)';
  return (
    <ModalDialog
      open={true}
      title="Reload Intune trust anchor"
      onClose={pending ? () => {} : onCancel}
      footer={
        <>
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="btn btn-ghost text-xs px-4 py-2 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="btn btn-primary text-xs font-semibold px-4 py-2 rounded-xl disabled:opacity-50"
          >
            {pending ? 'Reloading…' : 'Reload trust anchor'}
          </button>
        </>
      }
    >
      <p className="text-xs text-ink-muted mb-3 leading-relaxed">
        This re-reads <code className="text-xs font-mono text-ink">{profile.trust_anchor_path}</code> from disk and atomically
        swaps the trust pool for SCEP profile <strong>{pathLabel}</strong>. Equivalent to sending
        <code className="text-xs font-mono"> SIGHUP </code> to the server. If the new file fails to parse, the
        previous trust pool stays in place.
      </p>
      {errorMessage && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
          {errorMessage}
        </div>
      )}
    </ModalDialog>
  );
}

interface IntuneTabProps {
  profiles: IntuneStatsSnapshot[];
  isLoading: boolean;
  onRequestReload: (profile: IntuneStatsSnapshot) => void;
  highlightPathID: string | null;
  events: AuditEvent[];
  eventsLoading: boolean;
}

function IntuneTab({ profiles, isLoading, onRequestReload, highlightPathID, events, eventsLoading }: IntuneTabProps) {
  if (isLoading) {
    return <p className="text-xs text-ink-muted py-6">Loading Intune monitoring data…</p>;
  }
  const intuneProfiles = profiles.filter(p => p.enabled);
  return (
    <div className="space-y-6">
      {intuneProfiles.length === 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-300">
          No SCEP profile has Intune enabled. Set
          <code className="mx-1">CERTCTL_SCEP_PROFILE_&lt;NAME&gt;_INTUNE_ENABLED=true</code>
          plus the matching trust-anchor path env var, then restart the server.
        </div>
      )}
      {intuneProfiles.map(p => (
        <IntuneProfileCard
          key={p.path_id || '(root)'}
          profile={p}
          onRequestReload={onRequestReload}
          highlighted={highlightPathID === p.path_id}
        />
      ))}

      <section className="bg-surface border border-surface-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-surface-border bg-surface-muted/30">
          <h3 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Recent Intune-dispatched enrollments (last 50)</span>
          </h3>
          <p className="text-[11px] text-ink-muted mt-1 font-mono">
            Filtered to action=scep_pkcsreq_intune + action=scep_renewalreq_intune. Refreshes every 60s.
          </p>
        </div>
        {eventsLoading ? (
          <p className="text-xs text-ink-muted p-4">Loading audit log…</p>
        ) : (
          <RecentEventsTable events={events.slice(0, 50)} testID="intune-failures-table" emptyMessage="No recent Intune-dispatched enrollment events. Counters stay at zero until the first device hits a SCEP profile with Intune enabled." />
        )}
      </section>
    </div>
  );
}

interface IntuneProfileCardProps {
  profile: IntuneStatsSnapshot;
  onRequestReload: (profile: IntuneStatsSnapshot) => void;
  highlighted: boolean;
}

function IntuneProfileCard({ profile, onRequestReload, highlighted }: IntuneProfileCardProps) {
  const pathLabel = profile.path_id || '(legacy /scep root)';
  const days = soonestExpiryDays(profile.trust_anchors);
  const badge = expiryBadge(days, days !== null && days < 0);
  const cardClass = highlighted
    ? 'bg-surface border-2 border-emerald-400 rounded-2xl p-5 shadow-lg space-y-4'
    : 'bg-surface border border-surface-border rounded-2xl p-5 shadow-sm space-y-4';

  return (
    <section className={cardClass} data-testid={`profile-card-${profile.path_id}`}>
      <header className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-ink flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{pathLabel}</span>
          </h3>
          <p className="text-xs text-ink-muted mt-0.5">
            Issuer: <span className="font-mono text-ink">{profile.issuer_id}</span>
            {profile.audience && <> · Audience: <code className="font-mono">{profile.audience}</code></>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`text-xs px-3 py-1 rounded-full font-semibold ${badgeClass(badge.tone)}`}
            data-testid={`expiry-badge-${profile.path_id}`}
          >
            Trust anchor: {badge.text}
          </span>
          <button
            type="button"
            onClick={() => onRequestReload(profile)}
            className="btn btn-ghost text-xs font-semibold px-3 py-1.5 rounded-xl border border-surface-border"
            data-testid={`reload-button-${profile.path_id}`}
          >
            Reload trust
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {COUNTER_LABEL_ORDER.map(label => {
          const value = profile.counters?.[label] ?? 0;
          const presentation = COUNTER_PRESENTATION[label];
          return (
            <div key={label} className="bg-surface-muted/60 border border-surface-border rounded-xl p-3">
              <div className={`text-xl font-bold font-mono ${TONE_CLASS[presentation.tone]}`} data-testid={`counter-${profile.path_id}-${label}`}>
                {value}
              </div>
              <div className="text-[10px] text-ink-muted uppercase tracking-wider font-semibold mt-0.5">{presentation.label}</div>
            </div>
          );
        })}
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-ink-muted bg-surface-muted/30 p-3 rounded-xl border border-surface-border">
        <div>
          <dt className="font-semibold text-ink">Replay Cache Size</dt>
          <dd className="font-mono">{profile.replay_cache_size}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">Per-device Rate Limit</dt>
          <dd>{profile.rate_limit_disabled ? 'Disabled' : 'Active'}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">Trust Anchors</dt>
          <dd className="font-mono">{profile.trust_anchors?.length ?? 0}</dd>
        </div>
      </dl>

      {profile.trust_anchors && profile.trust_anchors.length > 0 && (
        <details className="text-xs text-ink-muted">
          <summary className="cursor-pointer font-semibold text-ink hover:text-emerald-400 transition-colors">Trust Anchor Details</summary>
          <div className="mt-2 overflow-x-auto rounded-xl border border-surface-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-muted text-ink-muted uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2 px-3">Subject</th>
                  <th className="py-2 px-3">Not After</th>
                  <th className="py-2 px-3">Days To Expiry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {profile.trust_anchors.map(a => (
                  <tr key={`${profile.path_id}-${a.subject}-${a.not_after}`}>
                    <td className="py-2 px-3 font-mono text-ink">{a.subject || '(empty CN)'}</td>
                    <td className="py-2 px-3 font-mono">{formatDateTime(a.not_after)}</td>
                    <td className={`py-2 px-3 font-bold ${a.expired ? 'text-red-400' : 'text-emerald-400'}`}>
                      {a.expired ? 'EXPIRED' : a.days_to_expiry}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </section>
  );
}

interface ActivityTabProps {
  events: AuditEvent[];
  isLoading: boolean;
  filter: ActivityFilter;
  setFilter: (f: ActivityFilter) => void;
}

function activityFilterMatches(filter: ActivityFilter, action: string): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'initial':
      return action === 'scep_pkcsreq' || action === 'scep_pkcsreq_intune';
    case 'renewal':
      return action === 'scep_renewalreq' || action === 'scep_renewalreq_intune';
    case 'intune':
      return action === 'scep_pkcsreq_intune' || action === 'scep_renewalreq_intune';
    case 'static':
      return action === 'scep_pkcsreq' || action === 'scep_renewalreq';
  }
}

function ActivityTab({ events, isLoading, filter, setFilter }: ActivityTabProps) {
  const filtered = events.filter(e => activityFilterMatches(filter, e.action));
  return (
    <section className="bg-surface border border-surface-border rounded-2xl shadow-sm overflow-hidden" data-testid="activity-tab">
      <div className="p-4 border-b border-surface-border bg-surface-muted/30 space-y-3">
        <h3 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>SCEP enrollment audit log (last 100)</span>
        </h3>
        <p className="text-[11px] text-ink-muted font-mono">
          Merged across scep_pkcsreq + scep_renewalreq + scep_pkcsreq_intune + scep_renewalreq_intune. Refreshes every 60s.
        </p>
        <div className="flex flex-wrap gap-2" data-testid="activity-filter-chips">
          {(['all', 'initial', 'renewal', 'intune', 'static'] as const).map(f => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1 rounded-full font-semibold border transition-all ${
                filter === f
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-sm'
                  : 'bg-surface-muted text-ink-muted border-surface-border hover:bg-surface-hover'
              }`}
              data-testid={`activity-filter-${f}`}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>
      {isLoading ? (
        <p className="text-xs text-ink-muted p-4">Loading audit log…</p>
      ) : (
        <RecentEventsTable
          events={filtered.slice(0, 100)}
          testID="activity-events-table"
          emptyMessage={
            events.length === 0
              ? 'No SCEP enrollment events recorded yet.'
              : 'No events match the current filter — try a different chip.'
          }
        />
      )}
    </section>
  );
}

interface RecentEventsTableProps {
  events: AuditEvent[];
  testID: string;
  emptyMessage: string;
}

function RecentEventsTable({ events, testID, emptyMessage }: RecentEventsTableProps) {
  if (events.length === 0) {
    return <p className="text-xs text-ink-muted p-4 text-center">{emptyMessage}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs" data-testid={testID}>
        <thead className="bg-surface-muted/50 text-ink-muted uppercase text-[10px] tracking-wider border-b border-surface-border">
          <tr>
            <th className="py-2.5 px-4 text-left">Timestamp</th>
            <th className="py-2.5 px-3 text-left">Action</th>
            <th className="py-2.5 px-3 text-left">Resource</th>
            <th className="py-2.5 px-4 text-left">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-border/50">
          {events.map(e => (
            <tr key={e.id} className="hover:bg-surface-muted/40 transition-colors">
              <td className="py-2 px-4 font-mono text-ink-muted">{formatDateTime(e.timestamp)}</td>
              <td className="py-2 px-3 font-mono font-semibold text-emerald-400">{e.action}</td>
              <td className="py-2 px-3 text-ink-muted">{e.resource_type} · <code className="text-xs text-ink font-mono">{e.resource_id}</code></td>
              <td className="py-2 px-4 text-[11px] text-ink-muted font-mono max-w-xs truncate">
                {e.details ? Object.entries(e.details).map(([k, v]) => `${k}=${typeof v === 'object' ? JSON.stringify(v) : String(v)}`).join(' · ') : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function pickInitialTab(searchParams: URLSearchParams, pathname: string): TabId {
  const fromQuery = searchParams.get('tab');
  if (fromQuery === 'intune' || fromQuery === 'activity') return fromQuery;
  if (pathname.endsWith('/scep/intune')) return 'intune';
  return 'profiles';
}

export default function SCEPAdminPage() {
  const auth = useAuth();
  const adminAccess = !auth.authRequired || auth.admin;
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<TabId>(() => pickInitialTab(searchParams, location.pathname));
  const [highlightPathID, setHighlightPathID] = useState<string | null>(searchParams.get('profile'));
  const [reloadTarget, setReloadTarget] = useState<IntuneStatsSnapshot | null>(null);
  const [reloadError, setReloadError] = useState<string | undefined>(undefined);
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all');

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (activeTab === 'profiles') {
      next.delete('tab');
    } else {
      next.set('tab', activeTab);
    }
    if (highlightPathID && activeTab === 'intune') {
      next.set('profile', highlightPathID);
    } else {
      next.delete('profile');
    }
    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
  }, [activeTab, highlightPathID, searchParams, setSearchParams]);

  const profilesQuery = useQuery({
    queryKey: ['admin', 'scep', 'profiles'],
    queryFn: getAdminSCEPProfiles,
    enabled: adminAccess,
    refetchInterval: 30_000,
  });

  const intuneStatsQuery = useQuery({
    queryKey: ['admin', 'scep', 'intune', 'stats'],
    queryFn: getAdminSCEPIntuneStats,
    enabled: adminAccess && activeTab === 'intune',
    refetchInterval: 30_000,
  });

  const auditQueries = SCEP_AUDIT_ACTIONS.map(action =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      queryKey: ['audit', { action }],
      queryFn: () => getAuditEvents({ action }),
      enabled: adminAccess && (activeTab === 'intune' || activeTab === 'activity'),
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
  const intuneOnlyEvents = useMemo(
    () =>
      allAuditEvents.filter(
        e => e.action === 'scep_pkcsreq_intune' || e.action === 'scep_renewalreq_intune',
      ),
    [allAuditEvents],
  );

  const reloadMutation = useTrackedMutation<
    Awaited<ReturnType<typeof reloadAdminSCEPIntuneTrust>>,
    Error,
    string
  >({
    mutationFn: (pathID: string) => reloadAdminSCEPIntuneTrust(pathID),
    invalidates: [
      ['admin', 'scep', 'intune', 'stats'],
      ['admin', 'scep', 'profiles'],
    ],
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
        <PageHeader title="SCEP Administration" subtitle="Admin-only observability surface" />
        <div className="p-6">
          <ErrorState
            error={new Error('Admin access required: this page exposes per-profile RA cert expiries, mTLS bundle paths, Intune trust anchor expiries, and an admin-only reload action. Sign in with an admin-tagged API key to view it.')}
          />
        </div>
      </>
    );
  }

  const profiles = profilesQuery.data?.profiles ?? [];
  const intuneProfiles = intuneStatsQuery.data?.profiles ?? [];

  const handleViewIntuneDetails = (pathID: string) => {
    setHighlightPathID(pathID);
    setActiveTab('intune');
  };

  return (
    <>
      <PageHeader
        title="SCEP Administration"
        subtitle={`${profiles.length} SCEP profile${profiles.length === 1 ? '' : 's'} configured · per-profile observability + Intune monitoring + recent activity`}
        action={
          <button
            type="button"
            onClick={() => {
              void profilesQuery.refetch();
              if (activeTab === 'intune') void intuneStatsQuery.refetch();
            }}
            className="btn btn-ghost text-xs font-semibold px-3 py-2 rounded-xl border border-surface-border flex items-center gap-1.5"
            data-testid="refresh-stats-button"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Refresh now</span>
          </button>
        }
      />

      <div className="border-b border-surface-border bg-surface px-6">
        <nav className="flex gap-2 -mb-px" data-testid="scep-admin-tabs">
          {(['profiles', 'intune', 'activity'] as TabId[]).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTab(t)}
              className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === t
                  ? 'border-emerald-400 text-emerald-400 font-bold'
                  : 'border-transparent text-ink-muted hover:text-ink hover:border-surface-border'
              }`}
              data-testid={`tab-${t}`}
              aria-pressed={activeTab === t}
            >
              {t === 'profiles' && <Server className="w-3.5 h-3.5" />}
              {t === 'intune' && <ShieldCheck className="w-3.5 h-3.5" />}
              {t === 'activity' && <Activity className="w-3.5 h-3.5" />}
              <span>{TAB_LABELS[t]}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {profilesQuery.error && activeTab === 'profiles' && (
          <ErrorState error={profilesQuery.error as Error} onRetry={() => profilesQuery.refetch()} />
        )}
        {intuneStatsQuery.error && activeTab === 'intune' && (
          <ErrorState error={intuneStatsQuery.error as Error} onRetry={() => intuneStatsQuery.refetch()} />
        )}

        {activeTab === 'profiles' && !profilesQuery.error && (
          <ProfilesTab
            profiles={profiles}
            isLoading={profilesQuery.isLoading}
            onViewIntuneDetails={handleViewIntuneDetails}
          />
        )}

        {activeTab === 'intune' && !intuneStatsQuery.error && (
          <IntuneTab
            profiles={intuneProfiles}
            isLoading={intuneStatsQuery.isLoading}
            onRequestReload={profile => {
              setReloadError(undefined);
              setReloadTarget(profile);
            }}
            highlightPathID={highlightPathID}
            events={intuneOnlyEvents}
            eventsLoading={auditLoading}
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
