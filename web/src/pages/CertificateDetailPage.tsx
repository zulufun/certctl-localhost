import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  Key,
  Calendar,
  Clock,
  Globe,
  History,
  Sliders,
  Download,
  UploadCloud,
  RefreshCw,
  Archive,
  ArrowLeft,
  Copy,
  Check,
  Cpu,
  User,
  Users,
  Building,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Lock,
  Layers,
  Tag,
  FileText,
  Mail,
  Sparkles,
  Plus,
} from 'lucide-react';

import { useTrackedMutation } from '../hooks/useTrackedMutation';
import {
  getCertificate,
  getCertificateVersions,
  triggerRenewal,
  triggerDeployment,
  archiveCertificate,
  revokeCertificate,
  updateCertificate,
  getTargets,
  getJobs,
  getRenewalPolicies,
  getProfiles,
  getProfile,
  downloadCertificatePEM,
  exportCertificatePKCS12,
  getOCSPStatus,
  fetchCRL,
  getAdminCRLCache,
} from '../api/client';
import { REVOCATION_REASONS } from '../api/types';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import ErrorState from '../components/ErrorState';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth } from '../components/AuthProvider';
import { formatDate, formatDateTime, daysUntil, timeAgo } from '../api/utils';
import type { Job, CRLCacheRow } from '../api/types';

function copyToClipboard(text: string, label = 'Copied to clipboard') {
  navigator.clipboard.writeText(text);
  toast.success(label);
}

function InfoRow({
  icon: Icon,
  label,
  value,
  editable,
  onEdit,
  copyable,
  copyValue,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  editable?: boolean;
  onEdit?: () => void;
  copyable?: boolean;
  copyValue?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (copyValue || typeof value === 'string') {
      copyToClipboard(copyValue || (value as string), `${label} copied`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-surface-border/60 group hover:bg-surface-muted/30 px-2 rounded-lg transition-colors">
      <div className="flex items-center gap-2.5 min-w-0">
        {Icon && <Icon className="w-4 h-4 text-ink-muted shrink-0" />}
        <span className="text-sm font-medium text-ink-muted">{label}</span>
      </div>
      <div className="flex items-center gap-2 min-w-0">
        <div className="text-sm font-medium text-ink truncate">{value}</div>
        {copyable && (
          <button
            type="button"
            onClick={handleCopy}
            title={`Copy ${label}`}
            className="p-1 rounded text-ink-muted hover:text-brand-500 hover:bg-brand-50 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        )}
        {editable && onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold text-brand-500 hover:text-brand-600 px-2 py-0.5 rounded bg-brand-50"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
}

// Timeline step component for deployment status
function TimelineStep({
  label,
  status,
  time,
  isLast,
}: {
  label: string;
  status: 'completed' | 'active' | 'pending' | 'failed';
  time?: string;
  isLast?: boolean;
}) {
  const dotStyles = {
    completed: 'bg-emerald-500 ring-emerald-200 shadow-emerald-500/20',
    active: 'bg-brand-500 ring-brand-200 animate-pulse shadow-brand-500/30',
    pending: 'bg-slate-300 dark:bg-slate-700 ring-surface-border',
    failed: 'bg-rose-500 ring-rose-200 shadow-rose-500/20',
  };
  const lineStyles = {
    completed: 'bg-emerald-400',
    active: 'bg-brand-300',
    pending: 'bg-surface-border',
    failed: 'bg-rose-300',
  };
  const textStyles = {
    completed: 'text-emerald-700 font-semibold',
    active: 'text-brand-600 font-semibold',
    pending: 'text-ink-muted font-normal',
    failed: 'text-rose-700 font-semibold',
  };

  const getStepIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-3.5 h-3.5 text-white" />;
      case 'failed':
        return <AlertCircle className="w-3.5 h-3.5 text-white" />;
      case 'active':
        return <RefreshCw className="w-3.5 h-3.5 text-white animate-spin" />;
      default:
        return <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />;
    }
  };

  return (
    <div className="flex items-start gap-3.5 relative flex-1">
      <div className="flex flex-col items-center">
        <div className={`w-6 h-6 rounded-full ring-4 flex items-center justify-center shadow-sm ${dotStyles[status]} flex-shrink-0 z-10 transition-all`}>
          {getStepIcon()}
        </div>
        {!isLast && <div className={`w-0.5 h-10 mt-1 ${lineStyles[status]}`} />}
      </div>
      <div className="pb-6">
        <div className={`text-sm ${textStyles[status]}`}>{label}</div>
        {time && <div className="text-xs text-ink-muted mt-0.5 font-mono">{time}</div>}
      </div>
    </div>
  );
}

function DeploymentTimeline({
  certId,
  certStatus,
  createdAt,
  issuedAt,
}: {
  certId: string;
  certStatus: string;
  createdAt: string;
  issuedAt?: string;
}) {
  const { data: jobsData } = useQuery({
    queryKey: ['jobs', { certificate_id: certId }],
    queryFn: () => getJobs({ certificate_id: certId }),
  });

  const jobs = jobsData?.data || [];
  const issuanceJobs = jobs.filter((j: Job) => j.type === 'Issuance' || j.type === 'Renewal');
  const deployJobs = jobs.filter((j: Job) => j.type === 'Deployment');
  const latestIssuance = issuanceJobs[0];
  const latestDeploy = deployJobs[0];

  const getRequestedStatus = () => 'completed' as const;
  const getRequestedTime = () => formatDateTime(createdAt);

  const getIssuedStatus = () => {
    if (issuedAt) return 'completed' as const;
    if (latestIssuance?.status === 'Running' || latestIssuance?.status === 'AwaitingCSR' || latestIssuance?.status === 'AwaitingApproval') return 'active' as const;
    if (latestIssuance?.status === 'Failed') return 'failed' as const;
    return 'pending' as const;
  };
  const getIssuedTime = () => {
    if (issuedAt) return formatDateTime(issuedAt);
    if (latestIssuance) return `${latestIssuance.status} — ${timeAgo(latestIssuance.created_at)}`;
    return undefined;
  };

  const getDeployStatus = () => {
    if (!issuedAt) return 'pending' as const;
    if (latestDeploy?.status === 'Completed') return 'completed' as const;
    if (latestDeploy?.status === 'Running') return 'active' as const;
    if (latestDeploy?.status === 'Failed') return 'failed' as const;
    if (latestDeploy?.status === 'Pending') return 'active' as const;
    return 'pending' as const;
  };
  const getDeployTime = () => {
    if (latestDeploy?.status === 'Completed') return formatDateTime(latestDeploy.completed_at);
    if (latestDeploy) return `${latestDeploy.status} — ${timeAgo(latestDeploy.created_at)}`;
    return undefined;
  };

  const getVerifiedStatus = () => {
    if (!latestDeploy || latestDeploy.status !== 'Completed') return 'pending' as const;
    if (latestDeploy.verification_status === 'success') return 'completed' as const;
    if (latestDeploy.verification_status === 'failed') return 'failed' as const;
    if (latestDeploy.verification_status === 'skipped') return 'completed' as const;
    if (latestDeploy.verification_status === 'pending') return 'active' as const;
    return 'pending' as const;
  };
  const getVerifiedTime = () => {
    if (!latestDeploy || latestDeploy.status !== 'Completed') return undefined;
    if (latestDeploy.verification_status === 'success' && latestDeploy.verified_at) {
      return `Verified ${formatDateTime(latestDeploy.verified_at)}`;
    }
    if (latestDeploy.verification_status === 'failed') {
      return latestDeploy.verification_error || 'Verification failed';
    }
    if (latestDeploy.verification_status === 'skipped') return 'Skipped (best-effort)';
    if (latestDeploy.verification_status === 'pending') return 'Awaiting verification';
    return undefined;
  };

  const getActiveStatus = () => {
    if (certStatus === 'Active') return 'completed' as const;
    if (certStatus === 'Revoked') return 'failed' as const;
    if (certStatus === 'Expired') return 'failed' as const;
    if (latestDeploy?.status === 'Completed') return 'completed' as const;
    return 'pending' as const;
  };
  const getActiveTime = () => {
    if (certStatus === 'Revoked') return 'Revoked';
    if (certStatus === 'Expired') return 'Expired';
    if (certStatus === 'Active') return 'Currently active';
    return undefined;
  };

  const showVerificationStep = latestDeploy?.status === 'Completed' && latestDeploy?.verification_status;

  return (
    <div className="bg-surface border border-surface-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
          <History className="w-4 h-4 text-brand-500" />
          Lifecycle Timeline
        </h3>
        <span className="text-xs px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 font-medium border border-brand-200/50">
          Automated Track
        </span>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
        <TimelineStep label="Requested" status={getRequestedStatus()} time={getRequestedTime()} />
        <TimelineStep label="Issued" status={getIssuedStatus()} time={getIssuedTime()} />
        <TimelineStep label="Deploying" status={getDeployStatus()} time={getDeployTime()} />
        {showVerificationStep && (
          <TimelineStep label="Verified" status={getVerifiedStatus()} time={getVerifiedTime()} />
        )}
        <TimelineStep
          label={certStatus === 'Revoked' ? 'Revoked' : certStatus === 'Expired' ? 'Expired' : 'Active'}
          status={getActiveStatus()}
          time={getActiveTime()}
          isLast
        />
      </div>
    </div>
  );
}

function RevocationEndpointsCard({ issuerId, serialNumber }: { issuerId: string; serialNumber?: string }) {
  const { admin } = useAuth();
  const [crlState, setCrlState] = useState<{ status: 'idle' | 'loading' | 'ok' | 'err'; msg?: string }>({ status: 'idle' });
  const [ocspState, setOcspState] = useState<{ status: 'idle' | 'loading' | 'ok' | 'err'; msg?: string }>({ status: 'idle' });

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const crlURL = `${origin}/.well-known/pki/crl/${issuerId}`;
  const ocspURL = `${origin}/.well-known/pki/ocsp/${issuerId}`;

  const { data: cacheData } = useQuery({
    queryKey: ['admin-crl-cache'],
    queryFn: () => getAdminCRLCache(),
    enabled: admin,
    refetchInterval: 60_000,
    retry: false,
  });

  const issuerRow: CRLCacheRow | undefined = cacheData?.cache_rows?.find((r) => r.issuer_id === issuerId);

  const handleTestCRL = async () => {
    setCrlState({ status: 'loading' });
    try {
      const r = await fetchCRL(issuerId);
      setCrlState({ status: 'ok', msg: `OK — ${r.byteLength.toLocaleString()} bytes (${r.contentType || 'no content-type'})` });
    } catch (e) {
      setCrlState({ status: 'err', msg: e instanceof Error ? e.message : 'Fetch failed' });
    }
  };

  const handleCheckOCSP = async () => {
    if (!serialNumber) {
      setOcspState({ status: 'err', msg: 'Serial number unavailable — cert has not been issued yet.' });
      return;
    }
    setOcspState({ status: 'loading' });
    try {
      const buf = await getOCSPStatus(issuerId, serialNumber);
      setOcspState({ status: 'ok', msg: `OCSP response received — ${buf.byteLength.toLocaleString()} bytes (DER)` });
    } catch (e) {
      setOcspState({ status: 'err', msg: e instanceof Error ? e.message : 'OCSP request failed' });
    }
  };

  return (
    <div className="bg-surface border border-surface-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-semibold text-ink">Revocation Endpoints</h3>
        </div>
        {admin &&
          (issuerRow ? (
            issuerRow.cache_present ? (
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                  issuerRow.is_stale ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
                title={`CRL #${issuerRow.crl_number ?? '—'} — generated ${
                  issuerRow.generated_at ? formatDateTime(issuerRow.generated_at) : '—'
                }, next update ${issuerRow.next_update ? formatDateTime(issuerRow.next_update) : '—'}`}
              >
                {issuerRow.is_stale ? 'Cache stale' : 'Cache fresh'}
                {issuerRow.generated_at ? ` · ${timeAgo(issuerRow.generated_at)}` : ''}
              </span>
            ) : (
              <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-slate-100 text-ink-muted border border-surface-border">
                Not yet generated
              </span>
            )
          ) : null)}
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-surface-muted/40 rounded-lg border border-surface-border/60">
          <div className="text-xs font-semibold text-ink-muted mb-1.5 flex items-center justify-between">
            <span>CRL Distribution Point (RFC 5280 §4.2.1.13)</span>
            <button
              onClick={() => copyToClipboard(crlURL, 'CRL URL copied')}
              className="text-brand-500 hover:text-brand-600 text-xs font-medium flex items-center gap-1"
            >
              <Copy className="w-3 h-3" /> Copy URL
            </button>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <code className="font-mono text-xs bg-white border border-surface-border px-3 py-2 rounded-md text-ink flex-1 break-all select-all">
              {crlURL}
            </code>
            <button
              onClick={handleTestCRL}
              disabled={crlState.status === 'loading'}
              className="text-xs px-3.5 py-2 rounded-md font-medium border border-brand-300 text-brand-600 hover:bg-brand-50 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
            >
              {crlState.status === 'loading' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
              {crlState.status === 'loading' ? 'Fetching…' : 'Test CRL fetch'}
            </button>
          </div>
          {crlState.status === 'ok' && <div className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />{crlState.msg}</div>}
          {crlState.status === 'err' && <div className="text-xs text-rose-600 font-medium mt-2 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{crlState.msg}</div>}
        </div>

        <div className="p-4 bg-surface-muted/40 rounded-lg border border-surface-border/60">
          <div className="text-xs font-semibold text-ink-muted mb-1.5 flex items-center justify-between">
            <span>OCSP Responder (RFC 6960 §A.1)</span>
            <button
              onClick={() => copyToClipboard(ocspURL, 'OCSP URL copied')}
              className="text-brand-500 hover:text-brand-600 text-xs font-medium flex items-center gap-1"
            >
              <Copy className="w-3 h-3" /> Copy URL
            </button>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <code className="font-mono text-xs bg-white border border-surface-border px-3 py-2 rounded-md text-ink flex-1 break-all select-all">
              {ocspURL}
            </code>
            <button
              onClick={handleCheckOCSP}
              disabled={ocspState.status === 'loading' || !serialNumber}
              title={!serialNumber ? 'Serial number unavailable — cert not yet issued' : ''}
              className="text-xs px-3.5 py-2 rounded-md font-medium border border-brand-300 text-brand-600 hover:bg-brand-50 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
            >
              {ocspState.status === 'loading' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              {ocspState.status === 'loading' ? 'Checking…' : 'Check OCSP status'}
            </button>
          </div>
          {ocspState.status === 'ok' && <div className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />{ocspState.msg}</div>}
          {ocspState.status === 'err' && <div className="text-xs text-rose-600 font-medium mt-2 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{ocspState.msg}</div>}
          {!serialNumber && ocspState.status === 'idle' && (
            <div className="text-xs text-ink-muted mt-2 italic">Serial number unavailable — issue the cert first.</div>
          )}
        </div>
      </div>

      <p className="text-xs text-ink-muted mt-4 bg-amber-50/50 border border-amber-200/50 p-3 rounded-lg flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <span>
          Both endpoints run unauthenticated under <code className="font-mono text-ink">/.well-known/pki/</code> per RFC 8615 so relying parties can validate revocation without API keys. The CRL is pre-generated by the scheduler (configurable via <code className="font-mono text-ink">CERTCTL_CRL_GENERATION_INTERVAL</code>); OCSP is signed by the per-issuer responder cert (RFC 6960 §2.6).
        </span>
      </p>
    </div>
  );
}

function InlinePolicyEditor({
  certId,
  currentPolicyId,
  currentProfileId,
}: {
  certId: string;
  currentPolicyId: string;
  currentProfileId: string;
}) {
  const [editing, setEditing] = useState(false);
  const [policyId, setPolicyId] = useState(currentPolicyId);
  const [profileId, setProfileId] = useState(currentProfileId);

  const { data: policies } = useQuery({
    queryKey: ['renewal-policies'],
    queryFn: () => getRenewalPolicies(1, 500),
    enabled: editing,
  });

  const { data: profiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => getProfiles(),
    enabled: editing,
  });

  const saveMutation = useTrackedMutation({
    mutationFn: () =>
      updateCertificate(certId, {
        renewal_policy_id: policyId,
        certificate_profile_id: profileId,
      }),
    invalidates: [['certificate', certId]],
    onSuccess: () => {
      setEditing(false);
    },
  });

  if (!editing) {
    return (
      <div className="bg-surface border border-surface-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
            <Sliders className="w-4 h-4 text-brand-500" />
            Policy & Profile
          </h3>
          <button
            onClick={() => setEditing(true)}
            className="text-xs font-semibold text-brand-500 hover:text-brand-600 px-3 py-1.5 rounded-lg bg-brand-50 border border-brand-200/60 transition-colors"
          >
            Edit
          </button>
        </div>
        <InfoRow label="Renewal Policy" value={currentPolicyId || '—'} />
        <InfoRow label="Certificate Profile" value={currentProfileId || '—'} />
      </div>
    );
  }

  return (
    <div className="bg-surface border-2 border-brand-400 rounded-xl p-6 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-brand-600 flex items-center gap-2">
          <Sliders className="w-4 h-4" />
          Edit Policy & Profile
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditing(false);
              setPolicyId(currentPolicyId);
              setProfileId(currentProfileId);
            }}
            className="text-xs font-medium px-3 py-1.5 rounded-md border border-surface-border text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="text-xs font-semibold px-3.5 py-1.5 rounded-md bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 shadow-sm transition-colors"
          >
            {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
      {saveMutation.isError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-lg px-4 py-2.5 text-sm mb-4">
          {saveMutation.error instanceof Error ? saveMutation.error.message : 'Failed to save'}
        </div>
      )}
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-ink-muted block mb-1.5">Renewal Policy</label>
          <select
            value={policyId}
            onChange={(e) => setPolicyId(e.target.value)}
            className="w-full bg-white border border-surface-border rounded-lg px-3.5 py-2 text-sm text-ink focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
          >
            <option value="">None</option>
            {policies?.data?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.renewal_window_days}d window)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-ink-muted block mb-1.5">Certificate Profile</label>
          <select
            value={profileId}
            onChange={(e) => setProfileId(e.target.value)}
            className="w-full bg-white border border-surface-border rounded-lg px-3.5 py-2 text-sm text-ink focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
          >
            <option value="">None</option>
            {profiles?.data?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — max TTL {p.max_ttl_seconds ? `${Math.round(p.max_ttl_seconds / 86400)}d` : '∞'}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

const VALID_TABS = ['overview', 'policy', 'revocation', 'versions'] as const;
type Tab = (typeof VALID_TABS)[number];

function tabFromHash(hash: string): Tab {
  const h = hash.replace(/^#/, '');
  return (VALID_TABS as readonly string[]).includes(h) ? (h as Tab) : 'overview';
}

export default function CertificateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [showDeploy, setShowDeploy] = useState(false);
  const [deployTargetId, setDeployTargetId] = useState('');
  const [showRevoke, setShowRevoke] = useState(false);
  const [revokeReason, setRevokeReason] = useState('unspecified');
  const [showExport, setShowExport] = useState(false);
  const [pkcs12Password, setPkcs12Password] = useState('');
  const [exporting, setExporting] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);

  const [tab, setTabState] = useState<Tab>(() => tabFromHash(location.hash));
  useEffect(() => {
    setTabState(tabFromHash(location.hash));
  }, [location.hash]);
  const setTab = (next: Tab) => {
    navigate({ pathname: location.pathname, hash: '#' + next });
  };

  const { data: cert, isLoading, error, refetch } = useQuery({
    queryKey: ['certificate', id],
    queryFn: () => getCertificate(id!),
    enabled: !!id,
  });

  const { data: versions } = useQuery({
    queryKey: ['certificate-versions', id],
    queryFn: () => getCertificateVersions(id!),
    enabled: !!id,
  });

  const { data: targets } = useQuery({
    queryKey: ['targets'],
    queryFn: () => getTargets(),
    enabled: showDeploy,
  });

  const { data: profile } = useQuery({
    queryKey: ['profile', cert?.certificate_profile_id],
    queryFn: () => getProfile(cert!.certificate_profile_id),
    enabled: !!cert?.certificate_profile_id,
  });

  const renewMutation = useTrackedMutation({
    mutationFn: () => triggerRenewal(id!),
    invalidates: [['certificate', id], ['certificates']],
  });

  const deployMutation = useTrackedMutation({
    mutationFn: () => triggerDeployment(id!, deployTargetId),
    invalidates: [['certificate', id]],
    onSuccess: () => {
      setShowDeploy(false);
      setDeployTargetId('');
    },
  });

  type ArchiveSnapshot = { prev?: { status?: string } | undefined };
  const archiveMutation = useTrackedMutation<unknown, Error, void, ArchiveSnapshot>({
    mutationFn: () => archiveCertificate(id!),
    invalidates: [['certificates']],
    onMutate: async (): Promise<ArchiveSnapshot> => {
      await queryClient.cancelQueries({ queryKey: ['certificate', id] });
      const prev = queryClient.getQueryData(['certificate', id]) as ArchiveSnapshot['prev'];
      if (prev) {
        queryClient.setQueryData(['certificate', id], { ...prev, status: 'Archived' });
      }
      return { prev };
    },
    onError: (err, _vars, snap) => {
      if (snap?.prev) queryClient.setQueryData(['certificate', id], snap.prev);
      toast.error(`Archive failed: ${err.message}`);
    },
    onSuccess: () => {
      toast.success('Certificate archived');
      navigate('/certificates');
    },
  });

  const revokeMutation = useTrackedMutation({
    mutationFn: () => revokeCertificate(id!, revokeReason),
    invalidates: [['certificate', id], ['certificates']],
    onSuccess: () => {
      setShowRevoke(false);
      setRevokeReason('unspecified');
    },
  });

  const handleExportPEM = async () => {
    setExporting(true);
    try {
      const blob = await downloadCertificatePEM(id!);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cert?.common_name || id}.pem`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Exported PEM certificate');
    } catch (err) {
      toast.error(`Export failed: ${err instanceof Error ? err.message : err}`);
    } finally {
      setExporting(false);
    }
  };

  const handleExportPKCS12 = async () => {
    setExporting(true);
    try {
      const blob = await exportCertificatePKCS12(id!, pkcs12Password);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cert?.common_name || id}.p12`;
      a.click();
      URL.revokeObjectURL(url);
      setShowExport(false);
      setPkcs12Password('');
      toast.success('Exported PKCS#12 bundle');
    } catch (err) {
      toast.error(`Export failed: ${err instanceof Error ? err.message : err}`);
    } finally {
      setExporting(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <PageHeader title="Certificate" />
        <div className="flex items-center justify-center flex-1 text-slate-400 py-16">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 text-brand-500 animate-spin" />
            <span className="text-sm font-medium">Loading certificate details...</span>
          </div>
        </div>
      </>
    );
  }

  if (error || !cert) {
    return (
      <>
        <PageHeader title="Certificate" />
        <ErrorState error={(error as Error) || new Error('Not found')} onRetry={() => refetch()} />
      </>
    );
  }

  const latestVersion = versions?.data?.[0];
  const serialNumber = latestVersion?.serial_number;
  const fingerprintSha256 = latestVersion?.fingerprint_sha256;
  const issuedAt = latestVersion?.not_before;
  const keyAlgorithm = latestVersion?.key_algorithm;
  const keySize = latestVersion?.key_size;

  const days = daysUntil(cert.expires_at);
  const isRevoked = cert.status === 'Revoked';
  const isArchived = cert.status === 'Archived';
  const canRevoke = !isRevoked && !isArchived;

  // Calculate validity progress %
  const totalDays = cert.created_at && cert.expires_at ? Math.max(1, Math.round((new Date(cert.expires_at).getTime() - new Date(cert.created_at).getTime()) / 86400000)) : 90;
  const elapsedDays = Math.max(0, totalDays - days);
  const validityProgress = Math.min(100, Math.max(0, Math.round((elapsedDays / totalDays) * 100)));

  const getStatusColor = () => {
    if (isRevoked || isArchived || cert.status === 'Expired') return 'text-rose-600 bg-rose-50 border-rose-200';
    if (days <= 30) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  };

  const tabIcons: Record<Tab, React.ComponentType<{ className?: string }>> = {
    overview: ShieldCheck,
    policy: Sliders,
    revocation: ShieldAlert,
    versions: Layers,
  };

  return (
    <>
      <PageHeader
        title={cert.common_name}
        subtitle={cert.id}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => navigate('/certificates')} className="btn btn-ghost text-xs border border-surface-border hover:bg-surface-muted">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <button
              onClick={handleExportPEM}
              disabled={exporting}
              className="btn btn-ghost text-xs border border-surface-border hover:bg-surface-muted disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-brand-500" />
              {exporting ? 'Exporting...' : 'Export PEM'}
            </button>
            <button
              onClick={() => setShowExport(true)}
              className="btn btn-ghost text-xs border border-surface-border hover:bg-surface-muted"
            >
              <Key className="w-3.5 h-3.5 text-purple-500" /> Export PKCS#12
            </button>
            <button
              onClick={() => setShowDeploy(true)}
              disabled={isArchived || isRevoked}
              className="btn btn-ghost text-xs border border-surface-border hover:bg-surface-muted disabled:opacity-50"
            >
              <UploadCloud className="w-3.5 h-3.5 text-blue-500" /> Deploy
            </button>
            <button
              onClick={() => renewMutation.mutate()}
              disabled={renewMutation.isPending || isArchived || isRevoked || cert.status === 'RenewalInProgress'}
              className="btn btn-primary text-xs shadow-md shadow-brand-500/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${renewMutation.isPending ? 'animate-spin' : ''}`} />
              {renewMutation.isPending ? 'Renewing...' : 'Trigger Renewal'}
            </button>
            {canRevoke && (
              <button
                onClick={() => setShowRevoke(true)}
                className="btn btn-ghost text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 border border-amber-300"
              >
                <AlertTriangle className="w-3.5 h-3.5" /> Revoke
              </button>
            )}
            {!isArchived && (
              <button
                onClick={() => setConfirmArchive(true)}
                disabled={archiveMutation.isPending}
                className="btn btn-ghost text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 disabled:opacity-50"
              >
                <Archive className="w-3.5 h-3.5" /> {archiveMutation.isPending ? 'Archiving...' : 'Archive'}
              </button>
            )}
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Revoked Notice Banner */}
        {isRevoked && (
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-between gap-4 shadow-sm animate-in fade-in duration-150">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-rose-300">Chứng Chỉ Này Đã Bị Thu Hồi (Revoked)</div>
                <p className="text-rose-200/80 mt-0.5 leading-relaxed">
                  Theo tiêu chuẩn bảo mật PKI (RFC 5280), chứng chỉ đã bị thu hồi <strong>không thể thực hiện Gia hạn (Renew)</strong> trực tiếp để tránh rủi ro lộ khóa. Để tiếp tục sử dụng cho ứng dụng, vui lòng thực hiện <strong>Cấp Mới Chứng Chỉ (Issue New Cert)</strong>.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/certificates')}
              className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs shrink-0 transition-colors flex items-center gap-1.5 shadow-md shadow-rose-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Cấp Mới Chứng Chỉ</span>
            </button>
          </div>
        )}

        {/* Hero Card Summary Header */}
        <div className="bg-surface border border-surface-border rounded-xl p-6 shadow-sm bg-gradient-to-r from-surface via-surface to-surface-muted/30 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-500 shrink-0 shadow-inner">
                {isRevoked ? <ShieldAlert className="w-6 h-6 text-rose-500" /> : <Lock className="w-6 h-6 text-brand-500" />}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-xl font-bold text-ink tracking-tight">{cert.common_name}</h1>
                  <StatusBadge status={cert.status} />
                  {cert.environment && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-surface-border">
                      {cert.environment}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-ink-muted flex-wrap font-mono pt-1">
                  <span className="flex items-center gap-1 hover:text-ink cursor-pointer" onClick={() => copyToClipboard(cert.id, 'ID copied')}>
                    ID: {cert.id} <Copy className="w-3 h-3 text-ink-muted" />
                  </span>
                  <span>•</span>
                  <span>Issuer: <span className="font-semibold text-ink">{cert.issuer_id}</span></span>
                  {keyAlgorithm && (
                    <>
                      <span>•</span>
                      <span>Key: <span className="font-semibold text-ink">{keyAlgorithm} {keySize ? `(${keySize}-bit)` : ''}</span></span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Expiry Gauge Widget */}
            <div className="bg-white dark:bg-surface-dark border border-surface-border rounded-lg p-4 min-w-[280px] shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-ink-muted flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-brand-500" /> Validity Remaining
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getStatusColor()}`}>
                  {days <= 0 ? 'Expired' : `${days} days`}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-1.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    days <= 0 || isRevoked ? 'bg-rose-500' : days <= 30 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${100 - validityProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-ink-muted font-mono">
                <span>Issued: {formatDate(issuedAt)}</span>
                <span>Expires: {formatDate(cert.expires_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div
          className="flex gap-2 border-b border-surface-border -mx-6 px-6 bg-surface/50 sticky top-0 z-20 backdrop-blur-md pt-2"
          role="tablist"
          aria-label="Certificate detail sections"
          data-testid="certificate-detail-tabs"
        >
          {VALID_TABS.map((t) => {
            const label = t.charAt(0).toUpperCase() + t.slice(1);
            const isActive = tab === t;
            const Icon = tabIcons[t];
            return (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`cert-detail-tabpanel-${t}`}
                id={`cert-detail-tab-${t}`}
                data-testid={`cert-detail-tab-${t}`}
                onClick={() => setTab(t)}
                className={
                  'px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all flex items-center gap-2 rounded-t-lg ' +
                  (isActive
                    ? 'border-brand-500 text-brand-600 bg-brand-50/50 dark:bg-brand-950/20'
                    : 'border-transparent text-ink-muted hover:text-ink hover:bg-surface-muted/50')
                }
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-500' : 'text-ink-muted'}`} />
                {label}
              </button>
            );
          })}
        </div>

        {/* Banners for mutations */}
        {renewMutation.isSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 text-sm flex items-center gap-3 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <div className="font-semibold">Renewal Triggered Successfully</div>
              <div className="text-xs text-emerald-700">A new renewal job has been queued and dispatched.</div>
            </div>
          </div>
        )}
        {renewMutation.isError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl px-4 py-3 text-sm flex items-center gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <div className="font-semibold">Failed to Trigger Renewal</div>
              <div className="text-xs text-rose-700">{renewMutation.error instanceof Error ? renewMutation.error.message : 'Unknown error'}</div>
            </div>
          </div>
        )}
        {deployMutation.isSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 text-sm flex items-center gap-3 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <div className="font-semibold">Deployment Triggered</div>
              <div className="text-xs text-emerald-700">A deployment job has been dispatched to the target.</div>
            </div>
          </div>
        )}
        {deployMutation.isError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl px-4 py-3 text-sm flex items-center gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <div className="font-semibold">Failed to Deploy</div>
              <div className="text-xs text-rose-700">{deployMutation.error instanceof Error ? deployMutation.error.message : 'Unknown error'}</div>
            </div>
          </div>
        )}
        {archiveMutation.isError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl px-4 py-3 text-sm flex items-center gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <div className="font-semibold">Failed to Archive</div>
              <div className="text-xs text-rose-700">{archiveMutation.error instanceof Error ? archiveMutation.error.message : 'Unknown error'}</div>
            </div>
          </div>
        )}
        {revokeMutation.isSuccess && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm flex items-center gap-3 shadow-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <div className="font-semibold">Certificate Revoked</div>
              <div className="text-xs text-amber-700">Certificate has been revoked and published to the CRL.</div>
            </div>
          </div>
        )}
        {revokeMutation.isError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl px-4 py-3 text-sm flex items-center gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <div className="font-semibold">Failed to Revoke</div>
              <div className="text-xs text-rose-700">{revokeMutation.error instanceof Error ? revokeMutation.error.message : 'Unknown error'}</div>
            </div>
          </div>
        )}

        {/* ── Overview tab panel ─────────────────────────────────── */}
        {tab === 'overview' && (
          <div role="tabpanel" id="cert-detail-tabpanel-overview" aria-labelledby="cert-detail-tab-overview" className="space-y-6">
            {/* Revocation Banner */}
            {isRevoked && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-rose-800">Certificate Revoked</div>
                    <div className="text-xs text-rose-700 mt-0.5">
                      Reason: {REVOCATION_REASONS.find((r) => r.value === cert.revocation_reason)?.label || cert.revocation_reason || 'Unspecified'}
                      {cert.revoked_at && <> &middot; Revoked on {formatDateTime(cert.revoked_at)}</>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Deployment Status Timeline */}
            <DeploymentTimeline certId={id!} certStatus={cert.status} createdAt={cert.created_at} issuedAt={issuedAt} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Certificate Info Card */}
              <div className="bg-surface border border-surface-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-brand-500" />
                  Certificate Details
                </h3>
                <div className="space-y-1">
                  <InfoRow icon={ShieldCheck} label="Status" value={<StatusBadge status={cert.status} />} />
                  <InfoRow icon={Globe} label="Common Name" value={cert.common_name} copyable copyValue={cert.common_name} />
                  <InfoRow
                    icon={Globe}
                    label="SANs"
                    value={
                      cert.sans?.length ? (
                        <div className="flex flex-wrap gap-1 max-w-xs justify-end">
                          {cert.sans.map((san) => {
                            const isEmail = san.includes('@');
                            return (
                              <span
                                key={san}
                                className={`text-xs px-2 py-0.5 rounded-md font-mono border ${
                                  isEmail ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-slate-50 text-slate-700 border-slate-200'
                                }`}
                              >
                                {isEmail && <Mail className="w-3 h-3 inline mr-1 text-purple-500" />}
                                {san}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        '—'
                      )
                    }
                  />
                  <InfoRow icon={Key} label="Serial Number" value={serialNumber || '—'} copyable copyValue={serialNumber} />
                  <InfoRow
                    icon={FileText}
                    label="Fingerprint"
                    value={
                      fingerprintSha256 ? (
                        <span className="font-mono text-xs text-ink-muted bg-surface-muted px-2 py-1 rounded border border-surface-border">
                          {fingerprintSha256.slice(0, 24)}...
                        </span>
                      ) : (
                        '—'
                      )
                    }
                    copyable
                    copyValue={fingerprintSha256}
                  />
                  <InfoRow icon={Cpu} label="Key Algorithm" value={keyAlgorithm || '—'} />
                  <InfoRow icon={Cpu} label="Key Size" value={keySize != null ? `${keySize} bits` : '—'} />
                  {profile?.allowed_ekus && profile.allowed_ekus.length > 0 && (
                    <InfoRow
                      icon={Sparkles}
                      label="Extended Key Usage"
                      value={
                        <div className="flex flex-wrap gap-1">
                          {profile.allowed_ekus.map((eku) => {
                            const ekuStyles: Record<string, string> = {
                              serverAuth: 'bg-blue-50 text-blue-700 border-blue-200',
                              clientAuth: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                              emailProtection: 'bg-purple-50 text-purple-700 border-purple-200',
                              codeSigning: 'bg-amber-50 text-amber-700 border-amber-200',
                              timeStamping: 'bg-teal-50 text-teal-700 border-teal-200',
                            };
                            const ekuLabels: Record<string, string> = {
                              serverAuth: 'TLS Server',
                              clientAuth: 'TLS Client',
                              emailProtection: 'S/MIME',
                              codeSigning: 'Code Signing',
                              timeStamping: 'Timestamping',
                            };
                            return (
                              <span
                                key={eku}
                                className={`text-xs px-2 py-0.5 rounded-md font-medium border ${
                                  ekuStyles[eku] || 'bg-slate-50 text-slate-700 border-slate-200'
                                }`}
                              >
                                {ekuLabels[eku] || eku}
                              </span>
                            );
                          })}
                        </div>
                      }
                    />
                  )}
                </div>
              </div>

              {/* Lifecycle & Scope Card */}
              <div className="bg-surface border border-surface-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-500" />
                  Lifecycle
                </h3>
                <div className="space-y-1">
                  <InfoRow icon={Calendar} label="Issued" value={formatDate(issuedAt)} />
                  <InfoRow
                    icon={Clock}
                    label="Expires"
                    value={
                      <span className={`font-semibold ${isRevoked ? 'text-rose-600 line-through' : days <= 30 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {formatDate(cert.expires_at)} ({days <= 0 ? 'expired' : `${days} days left`})
                      </span>
                    }
                  />
                  <InfoRow icon={Building} label="Environment" value={cert.environment || '—'} />
                  <InfoRow icon={Shield} label="Issuer" value={cert.issuer_id} />
                  <InfoRow icon={User} label="Owner" value={cert.owner_id} />
                  <InfoRow icon={Users} label="Team" value={cert.team_id} />
                  {isRevoked && (
                    <>
                      <InfoRow
                        icon={AlertTriangle}
                        label="Revoked At"
                        value={<span className="text-rose-600 font-semibold">{cert.revoked_at ? formatDateTime(cert.revoked_at) : '—'}</span>}
                      />
                      <InfoRow
                        icon={ShieldAlert}
                        label="Revocation Reason"
                        value={
                          <span className="text-rose-600 font-semibold">
                            {REVOCATION_REASONS.find((r) => r.value === cert.revocation_reason)?.label || cert.revocation_reason || '—'}
                          </span>
                        }
                      />
                    </>
                  )}
                  <InfoRow icon={Clock} label="Created" value={formatDateTime(cert.created_at)} />
                  <InfoRow icon={RefreshCw} label="Updated" value={formatDateTime(cert.updated_at)} />
                </div>
              </div>
            </div>

            {/* Tags Card */}
            {cert.tags && Object.keys(cert.tags).length > 0 && (
              <div className="bg-surface border border-surface-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-brand-500" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(cert.tags).map(([k, v]) => (
                    <span
                      key={k}
                      className="px-3 py-1 bg-surface-muted border border-surface-border text-ink-muted rounded-lg text-xs font-mono font-medium shadow-2xs flex items-center gap-1.5"
                    >
                      <span className="text-brand-500 font-bold">{k}:</span>
                      <span>{v}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Policy tab panel ──────────────────────────────────── */}
        {tab === 'policy' && (
          <div role="tabpanel" id="cert-detail-tabpanel-policy" aria-labelledby="cert-detail-tab-policy" className="space-y-6">
            <InlinePolicyEditor certId={id!} currentPolicyId={cert.renewal_policy_id || ''} currentProfileId={cert.certificate_profile_id || ''} />
          </div>
        )}

        {/* ── Revocation tab panel ──────────────────────────────── */}
        {tab === 'revocation' && (
          <div role="tabpanel" id="cert-detail-tabpanel-revocation" aria-labelledby="cert-detail-tab-revocation" className="space-y-6">
            <RevocationEndpointsCard issuerId={cert.issuer_id} serialNumber={serialNumber} />
          </div>
        )}

        {/* ── Versions tab panel ────────────────────────────────── */}
        {tab === 'versions' && (
          <div role="tabpanel" id="cert-detail-tabpanel-versions" aria-labelledby="cert-detail-tab-versions" className="space-y-6">
            {/* Version History Card */}
            <div className="bg-surface border border-surface-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-500" />
                  Version History {versions?.data?.length ? `(${versions.data.length})` : ''}
                </h3>
              </div>
              {!versions?.data?.length ? (
                <p className="text-sm text-ink-muted py-6 text-center italic">No versions recorded yet</p>
              ) : (
                <div className="space-y-3">
                  {versions.data.map((v, idx) => (
                    <div
                      key={v.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-surface-muted/30 border border-surface-border/60 rounded-xl gap-3 hover:bg-surface-muted/60 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-ink">Version {versions.data.length - idx}</span>
                          {idx === 0 && (
                            <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-ink-muted font-mono flex items-center gap-1.5 select-all">
                          <Key className="w-3 h-3" /> {v.serial_number}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-xs font-semibold text-ink">
                            {formatDate(v.not_before)} — {formatDate(v.not_after)}
                          </div>
                          <div className="text-[11px] text-ink-muted mt-0.5">{formatDateTime(v.created_at)}</div>
                        </div>
                        {idx > 0 && cert?.status !== 'Archived' && cert?.status !== 'Revoked' && (
                          <button
                            onClick={() => setShowDeploy(true)}
                            className="text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                            title="Redeploy this version to targets"
                          >
                            <RefreshCw className="w-3 h-3" /> Rollback
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Deploy Modal */}
      {showDeploy && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDeploy(false)}>
          <div
            className="bg-surface border border-surface-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-surface-border/60 pb-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-ink">Deploy Certificate</h2>
                <p className="text-xs text-ink-muted">Select a target server to push certificate and key.</p>
              </div>
            </div>
            {deployMutation.isError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-lg px-3 py-2 text-xs">
                {deployMutation.error instanceof Error ? deployMutation.error.message : 'Unknown error'}
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-ink-muted block mb-1.5">Target Machine / Service</label>
              <select
                value={deployTargetId}
                onChange={(e) => setDeployTargetId(e.target.value)}
                className="w-full bg-white border border-surface-border rounded-lg px-3.5 py-2.5 text-sm text-ink focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              >
                <option value="">Choose a deployment target...</option>
                {targets?.data?.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.type})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <button onClick={() => setShowDeploy(false)} className="btn btn-ghost text-xs">
                Cancel
              </button>
              <button
                onClick={() => deployMutation.mutate()}
                disabled={!deployTargetId || deployMutation.isPending}
                className="btn btn-primary text-xs shadow-md shadow-brand-500/20 disabled:opacity-50"
              >
                {deployMutation.isPending ? 'Deploying...' : 'Deploy Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PKCS#12 Export Modal */}
      {showExport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowExport(false)}>
          <div
            className="bg-surface border border-surface-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-surface-border/60 pb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-ink">Export PKCS#12 (.p12)</h2>
                <p className="text-xs text-ink-muted">Downloads a .p12 archive containing the certificate chain.</p>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-ink-muted block mb-1.5">Bundle Encryption Password (optional)</label>
              <input
                type="password"
                value={pkcs12Password}
                onChange={(e) => setPkcs12Password(e.target.value)}
                placeholder="Leave empty for unencrypted bundle"
                className="w-full bg-white border border-surface-border rounded-lg px-3.5 py-2.5 text-sm text-ink focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              />
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => {
                  setShowExport(false);
                  setPkcs12Password('');
                }}
                className="btn btn-ghost text-xs"
              >
                Cancel
              </button>
              <button onClick={handleExportPKCS12} disabled={exporting} className="btn btn-primary text-xs shadow-md disabled:opacity-50">
                {exporting ? 'Exporting...' : 'Download .p12'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke Modal */}
      {showRevoke && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowRevoke(false)}>
          <div
            className="bg-surface border border-surface-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-surface-border/60 pb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-rose-700">Revoke Certificate</h2>
                <p className="text-xs text-ink-muted">Added to CRL & marked permanently revoked.</p>
              </div>
            </div>
            {revokeMutation.isError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-lg px-3 py-2 text-xs">
                {revokeMutation.error instanceof Error ? revokeMutation.error.message : 'Unknown error'}
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-ink-muted block mb-1.5">Revocation Reason (RFC 5280)</label>
              <select
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                className="w-full bg-white border border-surface-border rounded-lg px-3.5 py-2.5 text-sm text-ink focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              >
                {REVOCATION_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => {
                  setShowRevoke(false);
                  setRevokeReason('unspecified');
                }}
                className="btn btn-ghost text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => revokeMutation.mutate()}
                disabled={revokeMutation.isPending}
                className="btn text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-md disabled:opacity-50 font-semibold"
              >
                {revokeMutation.isPending ? 'Revoking...' : 'Confirm Revocation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Archive Dialog */}
      <ConfirmDialog
        open={confirmArchive}
        title="Archive this certificate"
        message={`This action cannot be undone. The certificate (${cert?.common_name || id}) will be moved to the archive bucket and removed from active inventory.`}
        confirmLabel="Archive"
        cancelLabel="Cancel"
        destructive
        typedConfirmation="archive"
        onConfirm={() => {
          archiveMutation.mutate();
          setConfirmArchive(false);
        }}
        onCancel={() => setConfirmArchive(false)}
      />
    </>
  );
}
