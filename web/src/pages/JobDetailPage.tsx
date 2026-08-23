import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ExternalLink,
  ShieldCheck,
  Server,
  Globe,
  Clock,
  Activity,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ListTodo,
  ShieldAlert,
} from 'lucide-react';
import { getJob, getJobVerification, getAuditEvents } from '../api/client';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import ErrorState from '../components/ErrorState';
import { formatDateTime, timeAgo } from '../api/utils';

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-surface-border/50 last:border-0">
      <span className="text-xs font-semibold text-ink-muted">{label}</span>
      <div className="text-xs text-ink font-medium">{value}</div>
    </div>
  );
}

function DetailLinkBadge({
  to,
  id,
  type,
  icon: Icon,
  variant = 'violet',
}: {
  to: string;
  id: string;
  type: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'teal' | 'blue' | 'amber' | 'violet';
}) {
  const variantStyles = {
    teal: 'bg-teal-500/15 border-teal-500/40 text-teal-300 hover:bg-teal-500/25 hover:border-teal-500/60 hover:text-teal-200',
    blue: 'bg-blue-500/15 border-blue-500/40 text-blue-300 hover:bg-blue-500/25 hover:border-blue-500/60 hover:text-blue-200',
    amber: 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25 hover:border-amber-500/60 hover:text-amber-200',
    violet: 'bg-violet-500/15 border-violet-500/40 text-violet-300 hover:bg-violet-500/25 hover:border-violet-500/60 hover:text-violet-200',
  };

  const iconColors = {
    teal: 'text-teal-400',
    blue: 'text-blue-400',
    amber: 'text-amber-400',
    violet: 'text-violet-400',
  };

  return (
    <Link
      to={to}
      title={`Chuyển đến trang chi tiết ${type}: ${id}`}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border font-mono text-xs font-bold transition-all shadow-sm group hover:scale-[1.02] ${variantStyles[variant]}`}
    >
      <Icon className={`w-3.5 h-3.5 shrink-0 group-hover:scale-110 transition-transform ${iconColors[variant]}`} />
      <span className="underline underline-offset-2 decoration-white/30 group-hover:decoration-white/60">{id}</span>
      <ExternalLink className={`w-3.5 h-3.5 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-0.5 ${iconColors[variant]}`} />
    </Link>
  );
}

function VerificationBadge({ status }: { status?: string }) {
  if (!status) return <span className="text-xs text-ink-faint">—</span>;
  const styles: Record<string, string> = {
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    failed: 'bg-red-500/15 text-red-400 border-red-500/30',
    pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    skipped: 'bg-surface-muted text-ink-muted border-surface-border',
  };
  const labels: Record<string, string> = {
    success: 'Đã xác minh',
    failed: 'Thất bại',
    pending: 'Đang chờ',
    skipped: 'Bỏ qua',
  };
  return (
    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-mono border font-semibold ${styles[status] || 'bg-surface-muted text-ink-muted border-surface-border'}`}>
      {labels[status] || status}
    </span>
  );
}

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: job, isLoading, error, refetch } = useQuery({
    queryKey: ['job', id],
    queryFn: () => getJob(id!),
    enabled: !!id,
    refetchInterval: 10000,
  });

  const { data: verification } = useQuery({
    queryKey: ['job-verification', id],
    queryFn: () => getJobVerification(id!),
    enabled: !!id && job?.type === 'Deployment' && job?.status === 'Completed',
    retry: false,
  });

  const { data: auditData } = useQuery({
    queryKey: ['audit', { resource_id: id }],
    queryFn: () => getAuditEvents({ resource_id: id!, per_page: '10' }),
    enabled: !!id,
  });

  if (error) {
    return (
      <>
        <PageHeader title="Job Details" />
        <ErrorState error={error as Error} onRetry={() => refetch()} />
      </>
    );
  }

  if (isLoading || !job) {
    return (
      <>
        <PageHeader title="Job Details" />
        <div className="flex items-center justify-center py-20">
          <div className="text-xs text-ink-muted font-mono animate-pulse">Loading job detail...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={`Chi Tiết Tiến Trình ${job.id}`}
        subtitle={`Loại tiến trình: ${job.type}`}
      />

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        {/* Detail Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Job details */}
          <div className="bg-surface border border-surface-border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-2 border-b border-surface-border pb-3">
              <ListTodo className="w-4 h-4 text-emerald-400" />
              <span>Thông Tin Tiến Trình (Job Information)</span>
            </h3>

            <div className="space-y-1">
              <InfoRow label="Mã Tiến Trình (ID)" value={<span className="font-mono text-xs font-bold text-ink">{job.id}</span>} />
              <InfoRow label="Loại Tiến Trình (Type)" value={<span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-muted border border-surface-border text-ink font-semibold">{job.type}</span>} />
              <InfoRow label="Trạng Thái (Status)" value={<StatusBadge status={job.status} />} />
              
              {/* Linked Certificate Field with Prominent Visual Indicator */}
              <InfoRow
                label="Chứng Chỉ (Certificate)"
                value={
                  <DetailLinkBadge
                    to={`/certificates/${job.certificate_id}`}
                    id={job.certificate_id}
                    type="Chứng Chỉ"
                    icon={ShieldCheck}
                    variant="teal"
                  />
                }
              />

              {/* Linked Agent Field with Prominent Visual Indicator */}
              {job.agent_id && (
                <InfoRow
                  label="Agent Phụ Trách"
                  value={
                    <DetailLinkBadge
                      to={`/agents/${job.agent_id}`}
                      id={job.agent_id}
                      type="Agent"
                      icon={Server}
                      variant="blue"
                    />
                  }
                />
              )}

              {/* Linked Target Field with Prominent Visual Indicator */}
              {job.target_id && (
                <InfoRow
                  label="Mục Tiêu Triển Khai (Target)"
                  value={
                    <DetailLinkBadge
                      to={`/targets/${job.target_id}`}
                      id={job.target_id}
                      type="Target"
                      icon={Globe}
                      variant="amber"
                    />
                  }
                />
              )}

              <InfoRow label="Số Lần Thử (Attempts)" value={<span className="font-mono text-xs">{job.attempts} / {job.max_attempts}</span>} />

              {job.last_error && (
                <InfoRow
                  label="Ghi Chú Lỗi (Last Error)"
                  value={<span className="text-red-400 text-xs font-mono bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-lg block max-w-xs">{job.last_error}</span>}
                />
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-surface border border-surface-border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-2 border-b border-surface-border pb-3">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Thời Gian & Tiến Trình (Timeline)</span>
            </h3>

            <div className="space-y-1">
              <InfoRow label="Thời Gian Khởi Tạo" value={formatDateTime(job.created_at)} />
              <InfoRow label="Thời Gian Lên Lịch" value={formatDateTime(job.scheduled_at)} />
              {job.started_at && <InfoRow label="Thời Gian Bắt Đầu" value={formatDateTime(job.started_at)} />}
              {job.completed_at && <InfoRow label="Thời Gian Hoàn Tất" value={formatDateTime(job.completed_at)} />}
              {job.completed_at && job.started_at && (
                <InfoRow label="Tổng Thời Gian Thực Hiện" value={<span className="font-mono text-xs font-bold text-emerald-400">{timeAgo(job.started_at)}</span>} />
              )}
            </div>
          </div>
        </div>

        {/* Verification section — only for deployment jobs */}
        {job.type === 'Deployment' && (
          <div className="bg-surface border border-surface-border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-2 border-b border-surface-border pb-3">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Xác Minh Sau Triển Khai (Post-Deployment Verification)</span>
            </h3>
            {job.verification_status ? (
              <div className="space-y-1">
                <InfoRow label="Trạng Thái Xác Minh" value={<VerificationBadge status={job.verification_status} />} />
                {job.verified_at && <InfoRow label="Thời Gian Xác Minh" value={formatDateTime(job.verified_at)} />}
                {job.verification_fingerprint && (
                  <InfoRow label="Fingerprint Thực Tế" value={<span className="font-mono text-xs text-emerald-400 font-semibold">{job.verification_fingerprint}</span>} />
                )}
                {job.verification_error && (
                  <InfoRow label="Lỗi Xác Minh" value={<span className="text-red-400 text-xs font-mono">{job.verification_error}</span>} />
                )}
                {verification && verification.verified && (
                  <InfoRow label="Fingerprint Kỳ Vọng" value={<span className="font-mono text-xs text-ink-muted">{verification.expected_fingerprint}</span>} />
                )}
              </div>
            ) : (
              <div className="text-xs text-ink-faint py-4 text-center">
                {job.status === 'Completed' ? 'Chưa ghi nhận dữ liệu xác minh' : 'Tác vụ xác minh sẽ tự động chạy sau khi tiến trình hoàn thành'}
              </div>
            )}
          </div>
        )}

        {/* Audit trail */}
        {auditData && auditData.data.length > 0 && (
          <div className="bg-surface border border-surface-border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-2 border-b border-surface-border pb-3">
              <Activity className="w-4 h-4 text-violet-400" />
              <span>Nhật Ký Liên Quan (Related Audit Events)</span>
            </h3>
            <div className="space-y-2">
              {auditData.data.map(event => (
                <div key={event.id} className="flex items-center justify-between py-2 border-b border-surface-border/50 last:border-0 text-xs">
                  <div>
                    <span className="font-semibold text-ink font-mono">{event.action}</span>
                    <span className="text-ink-faint ml-2">bởi {event.actor}</span>
                  </div>
                  <span className="text-ink-muted font-mono">{formatDateTime(event.timestamp)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
