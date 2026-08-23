import React, { Fragment, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  FileDiff,
  FileCode,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Plus,
  Copy,
  Check,
} from 'lucide-react';

import {
  listApprovals,
  approveApproval,
  rejectApproval,
  type ApprovalRequest,
  type ApprovalState,
} from '../../api/client';
import { useAuthMe } from '../../hooks/useAuthMe';
import PageHeader from '../../components/PageHeader';
import Timestamp from '../../components/Timestamp';
import ErrorState from '../../components/ErrorState';
import { STALE_TIME } from '../../api/queryConstants';

// Exported for test reach
export function decodePayload(payload: string | undefined): unknown {
  if (!payload) return null;
  try {
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

// Sample Demo Approvals for Seeding/Testing
const MOCK_SAMPLE_APPROVALS: ApprovalRequest[] = [
  {
    id: 'ar-demo-001',
    kind: 'profile_edit',
    profile_id: 'prof-prod-tls',
    requested_by: 'alice.admin@bqp.vn',
    state: 'pending',
    payload: btoa(
      JSON.stringify({
        before: {
          name: 'Production TLS Profile',
          max_validity_days: 365,
          must_staple: false,
          requires_approval: true,
          allowed_domains: ['*.bqp.vn'],
        },
        after: {
          name: 'Production High-Security TLS Profile',
          max_validity_days: 90,
          must_staple: true,
          requires_approval: true,
          allowed_domains: ['*.bqp.vn', '*.gov.vn'],
        },
      })
    ),
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'ar-demo-002',
    kind: 'cert_issuance',
    profile_id: 'prof-api-gateway',
    certificate_id: 'mc-banking-01',
    job_id: 'job-issue-8821',
    requested_by: 'bob.dev@bqp.vn',
    state: 'pending',
    payload: btoa(
      JSON.stringify({
        subject_common_name: 'banking-gateway.bqp.vn',
        sans: ['banking-gateway.bqp.vn', 'pay.bqp.vn', 'api.internal.bqp.vn'],
        profile_id: 'prof-api-gateway',
        key_algorithm: 'ECDSA-P256',
        must_staple: true,
        validity_days: 90,
        requester_actor_id: 'bob.dev@bqp.vn',
      })
    ),
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'ar-demo-003',
    kind: 'profile_edit',
    profile_id: 'prof-internal-ca',
    requested_by: 'charlie.secops@bqp.vn',
    state: 'pending',
    payload: btoa(
      JSON.stringify({
        before: {
          name: 'Internal Sub-CA Profile',
          key_type: 'RSA-2048',
          organization: 'BQP Internal',
        },
        after: {
          name: 'Internal Sub-CA High Assurance',
          key_type: 'ECDSA-P384',
          organization: 'BQP Cryptographic Authority',
        },
      })
    ),
    created_at: new Date(Date.now() - 14400000).toISOString(),
    updated_at: new Date(Date.now() - 14400000).toISOString(),
  },
];

function PayloadPreview({ kind, payload }: { kind: string; payload: string | undefined }) {
  const decoded = decodePayload(payload);

  if (decoded === null && payload) {
    return (
      <div className="text-xs text-rose-700 bg-rose-50 p-3 rounded-lg border border-rose-200" data-testid="approval-payload-decode-error">
        Unable to decode payload (base64 / JSON parse failed). Raw value: <code className="break-all font-mono">{payload}</code>
      </div>
    );
  }

  if (decoded === null) {
    return (
      <div className="text-xs text-ink-muted italic p-2" data-testid="approval-payload-empty">
        No payload attached.
      </div>
    );
  }

  if (kind === 'profile_edit') {
    return <ProfileEditDiff payload={decoded} />;
  }
  if (kind === 'cert_issuance') {
    return <IssuanceRequestPreview payload={decoded} />;
  }

  return (
    <pre
      className="text-xs bg-slate-900 text-slate-100 p-3.5 rounded-xl overflow-x-auto font-mono border border-slate-800"
      data-testid="approval-payload-generic-json"
    >
      {JSON.stringify(decoded, null, 2)}
    </pre>
  );
}

function ProfileEditDiff({ payload }: { payload: unknown }) {
  const envelope = payload as { before?: Record<string, unknown>; after?: Record<string, unknown> };
  const before = envelope?.before ?? {};
  const after = envelope?.after ?? {};
  const allKeys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)])).sort();
  const changedKeys = allKeys.filter((k) => JSON.stringify(before[k]) !== JSON.stringify(after[k]));

  if (changedKeys.length === 0) {
    return (
      <div className="text-xs text-ink-muted italic p-2" data-testid="approval-profile-edit-no-changes">
        No field changes detected.
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-ink-muted flex items-center gap-1.5">
        <FileDiff className="w-3.5 h-3.5 text-amber-500" />
        <span>So sánh thay đổi cấu hình Profile (Before / After Diff):</span>
      </div>
      <table className="text-xs w-full border border-surface-border rounded-lg overflow-hidden" data-testid="approval-profile-edit-diff">
        <thead className="bg-surface-muted/80 text-ink-muted font-semibold">
          <tr>
            <th className="text-left px-3 py-2">Field</th>
            <th className="text-left px-3 py-2">Before (Hiện tại)</th>
            <th className="text-left px-3 py-2">After (Đề xuất mới)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-border">
          {changedKeys.map((k) => (
            <tr key={k} className="hover:bg-surface-muted/30 transition-colors" data-testid={`approval-profile-edit-row-${k}`}>
              <td className="px-3 py-2 font-mono font-semibold text-ink">
                <code>{k}</code>
              </td>
              <td className="px-3 py-2 font-mono break-all bg-rose-50/60 dark:bg-rose-950/20 text-rose-700">{renderValue(before[k])}</td>
              <td className="px-3 py-2 font-mono break-all bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-700">
                {renderValue(after[k])}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderValue(v: unknown) {
  if (v === undefined) {
    return <span className="text-ink-faint italic">(unset)</span>;
  }
  return JSON.stringify(v);
}

function IssuanceRequestPreview({ payload }: { payload: unknown }) {
  const p = payload as {
    subject_common_name?: string;
    common_name?: string;
    sans?: string[];
    profile_id?: string;
    key_algorithm?: string;
    must_staple?: boolean;
    validity_days?: number;
    requester_actor_id?: string;
  };
  const cn = p.subject_common_name ?? p.common_name ?? '—';
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-ink-muted flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
        <span>Thông tin yêu cầu cấp phát chứng chỉ:</span>
      </div>
      <div className="bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/60 rounded-xl p-3.5">
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-xs" data-testid="approval-cert-issuance-preview">
          <div>
            <dt className="text-ink-muted font-medium">Common Name</dt>
            <dd className="font-mono font-semibold text-brand-600 mt-0.5">{cn}</dd>
          </div>
          <div>
            <dt className="text-ink-muted font-medium">SANs</dt>
            <dd className="font-mono text-ink mt-0.5">{(p.sans ?? []).join(', ') || '—'}</dd>
          </div>
          <div>
            <dt className="text-ink-muted font-medium">Profile ID</dt>
            <dd className="font-mono text-ink mt-0.5">{p.profile_id ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-ink-muted font-medium">Key Algorithm</dt>
            <dd className="font-mono text-ink mt-0.5">{p.key_algorithm ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-ink-muted font-medium">Must-Staple</dt>
            <dd className="font-semibold text-ink mt-0.5">{p.must_staple === undefined ? '—' : p.must_staple ? 'Yes' : 'No'}</dd>
          </div>
          <div>
            <dt className="text-ink-muted font-medium">Validity (Days)</dt>
            <dd className="font-semibold text-ink mt-0.5">{p.validity_days ?? '—'}</dd>
          </div>
          {p.requester_actor_id && (
            <div className="col-span-2">
              <dt className="text-ink-muted font-medium">Requester (Actor)</dt>
              <dd className="font-mono text-ink mt-0.5">{p.requester_actor_id}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}

export default function ApprovalsPage() {
  const me = useAuthMe();
  const qc = useQueryClient();
  const [filterState, setFilterState] = useState<ApprovalState>('pending');

  const query = useQuery({
    queryKey: ['approvals', filterState],
    queryFn: () => listApprovals(filterState),
    staleTime: STALE_TIME.REAL_TIME,
    refetchInterval: 30_000,
  });

  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [expandedID, setExpandedID] = useState<string | null>(null);
  const [sampleApprovals, setSampleApprovals] = useState<ApprovalRequest[]>([]);

  const handleApprove = async (req: ApprovalRequest) => {
    const note = window.prompt('Approval note (Ghi chú phê duyệt):') ?? '';
    setBusy(req.id);
    setActionError(null);

    if (req.id.startsWith('ar-demo-')) {
      // Demo mock handler
      setTimeout(() => {
        setSampleApprovals((prev) => prev.filter((a) => a.id !== req.id));
        toast.success(`Đã phê duyệt yêu cầu ${req.id}`);
        setBusy(null);
      }, 500);
      return;
    }

    try {
      await approveApproval(req.id, note);
      toast.success(`Đã phê duyệt yêu cầu ${req.id}`);
      qc.invalidateQueries({ queryKey: ['approvals'] });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  };

  const handleReject = async (req: ApprovalRequest) => {
    const note = window.prompt('Reason for rejection (Lý do từ chối):') ?? '';
    if (!note) return;
    setBusy(req.id);
    setActionError(null);

    if (req.id.startsWith('ar-demo-')) {
      // Demo mock handler
      setTimeout(() => {
        setSampleApprovals((prev) => prev.filter((a) => a.id !== req.id));
        toast.error(`Đã từ chối yêu cầu ${req.id}`);
        setBusy(null);
      }, 500);
      return;
    }

    try {
      await rejectApproval(req.id, note);
      toast.error(`Đã từ chối yêu cầu ${req.id}`);
      qc.invalidateQueries({ queryKey: ['approvals'] });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  };

  const handleSeedSamples = () => {
    setSampleApprovals(MOCK_SAMPLE_APPROVALS);
    toast.success('Đã nạp 3 yêu cầu phê duyệt mẫu (Profile edit, Cert issuance, Revocation)');
  };

  if (query.isLoading) {
    return (
      <div className="p-8 space-y-4">
        <PageHeader title="Approvals queue" subtitle="Loading pending requests..." />
        <div className="h-64 bg-surface border border-surface-border rounded-xl animate-pulse" />
      </div>
    );
  }

  if (query.error) {
    return (
      <div className="p-8 space-y-4">
        <PageHeader title="Approvals" />
        <ErrorState error={query.error as Error} onRetry={() => qc.invalidateQueries({ queryKey: ['approvals'] })} />
      </div>
    );
  }

  const serverItems = query.data?.data ?? [];
  const items = [...serverItems, ...sampleApprovals];
  const myID = me.data?.actor_id ?? '';

  const pendingCount = items.filter((i) => i.state === 'pending').length;
  const profileEditCount = items.filter((i) => i.kind === 'profile_edit').length;
  const certIssuanceCount = items.filter((i) => i.kind === 'cert_issuance').length;

  return (
    <div className="p-8 space-y-6" data-testid="approvals-page">
      <PageHeader
        title="Approvals queue"
        subtitle="Hàng chờ phê duyệt theo nguyên tắc kiểm duyệt 2 người (Four-Eyes Principle). Người tạo yêu cầu không thể tự phê duyệt."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={handleSeedSamples}
              className="btn btn-secondary text-xs border border-surface-border hover:bg-surface-muted flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Tạo dữ liệu mẫu (Seed Samples)</span>
            </button>
            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value as ApprovalState)}
              className="bg-white border border-surface-border rounded-lg px-3 py-1.5 text-xs text-ink font-semibold focus:ring-2 focus:ring-brand-500/20 outline-none"
              data-testid="approvals-state-filter"
            >
              <option value="pending">Pending (Đang chờ)</option>
              <option value="approved">Approved (Đã duyệt)</option>
              <option value="rejected">Rejected (Đã từ chối)</option>
              <option value="expired">Expired (Đã hết hạn)</option>
            </select>
          </div>
        }
      />

      {/* Metric Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-surface-border rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-ink">{pendingCount}</div>
            <div className="text-xs font-medium text-ink-muted">Yêu cầu đang chờ duyệt (Pending)</div>
          </div>
        </div>

        <div className="bg-surface border border-surface-border rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-ink">{certIssuanceCount}</div>
            <div className="text-xs font-medium text-ink-muted">Cấp phát chứng chỉ (Cert Issuance)</div>
          </div>
        </div>

        <div className="bg-surface border border-surface-border rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <FileDiff className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-ink">{profileEditCount}</div>
            <div className="text-xs font-medium text-ink-muted">Chỉnh sửa Profile (Profile Edit)</div>
          </div>
        </div>
      </div>

      {actionError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-xl font-medium" data-testid="approvals-action-error">
          {actionError}
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-surface border border-surface-border rounded-2xl p-8 text-center shadow-sm space-y-3" data-testid="approvals-empty">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-ink">Không có yêu cầu phê duyệt ({filterState})</h3>
            <p className="text-xs text-ink-muted max-w-md mx-auto">
              Hàng chờ phê duyệt hiện đang trống. Bạn có thể bấm nút <b>"Tạo dữ liệu mẫu"</b> ở góc trên bên phải để tạo các mẫu phê duyệt thử nghiệm.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-surface border border-surface-border rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm" data-testid="approvals-table">
            <thead className="bg-surface-muted/60 text-xs uppercase tracking-wide text-ink-muted font-semibold border-b border-surface-border">
              <tr>
                <th className="text-left px-4 py-3">ID</th>
                <th className="text-left px-4 py-3">Loại (Kind)</th>
                <th className="text-left px-4 py-3">Profile</th>
                <th className="text-left px-4 py-3">Người yêu cầu (Requested by)</th>
                <th className="text-left px-4 py-3">Thời gian tạo</th>
                <th className="px-4 py-3 w-28 text-center">Payload</th>
                <th className="px-4 py-3 w-48 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/60">
              {items.map((req) => {
                const isMine = req.requested_by === myID;
                const isPending = req.state === 'pending';
                const isExpanded = expandedID === req.id;
                return (
                  <Fragment key={req.id}>
                    <tr className="hover:bg-surface-muted/30 transition-colors align-top" data-testid={`approvals-row-${req.id}`}>
                      <td className="px-4 py-3.5 font-mono text-xs font-semibold text-ink">{req.id}</td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-semibold border ${
                            req.kind === 'profile_edit'
                              ? 'bg-amber-100 text-amber-800 border-amber-200'
                              : 'bg-blue-100 text-blue-800 border-blue-200'
                          }`}
                        >
                          {req.kind}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-ink">{req.profile_id}</td>
                      <td className="px-4 py-3.5 text-xs text-ink font-medium">
                        {req.requested_by}
                        {isMine && <span className="ml-1.5 text-amber-600 font-bold">(bạn)</span>}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-ink-muted font-mono">
                        <Timestamp iso={req.created_at} />
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button
                          className="btn btn-ghost text-xs px-2.5 py-1 rounded-md border border-surface-border hover:bg-surface-muted font-semibold flex items-center gap-1 mx-auto"
                          onClick={() => setExpandedID(isExpanded ? null : req.id)}
                          data-testid={`approvals-preview-toggle-${req.id}`}
                          aria-expanded={isExpanded}
                        >
                          {isExpanded ? <EyeOff className="w-3 h-3 text-rose-500" /> : <Eye className="w-3 h-3 text-brand-500" />}
                          <span>{isExpanded ? 'Hide' : 'Preview'}</span>
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {isPending && !isMine && (
                          <div className="flex gap-1.5 justify-end">
                            <button
                              className="px-2.5 py-1 rounded-md text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors flex items-center gap-1"
                              onClick={() => handleApprove(req)}
                              disabled={busy === req.id}
                              data-testid={`approvals-approve-${req.id}`}
                            >
                              <CheckCircle2 className="w-3 h-3" /> Approve
                            </button>
                            <button
                              className="px-2.5 py-1 rounded-md text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1"
                              onClick={() => handleReject(req)}
                              disabled={busy === req.id}
                              data-testid={`approvals-reject-${req.id}`}
                            >
                              <XCircle className="w-3 h-3" /> Reject
                            </button>
                          </div>
                        )}
                        {isPending && isMine && (
                          <span
                            className="inline-flex items-center gap-1 text-xs text-ink-muted italic font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-surface-border"
                            data-testid={`approvals-self-locked-${req.id}`}
                          >
                            <Lock className="w-3 h-3 text-amber-500" /> self-approve blocked
                          </span>
                        )}
                        {!isPending && (
                          <span className="text-xs font-semibold text-ink-muted capitalize px-2.5 py-1 rounded-md bg-surface-muted border border-surface-border">
                            {req.state}
                          </span>
                        )}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="border-t border-surface-border bg-surface-muted/30" data-testid={`approvals-payload-preview-${req.id}`}>
                        <td colSpan={7} className="px-5 py-4">
                          <PayloadPreview kind={req.kind} payload={req.payload} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
