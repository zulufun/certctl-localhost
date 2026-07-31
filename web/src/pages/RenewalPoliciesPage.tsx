import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  RotateCw,
  Plus,
  Zap,
  Clock,
  Bell,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useTrackedMutation } from '../hooks/useTrackedMutation';
import {
  getRenewalPolicies,
  createRenewalPolicy,
  updateRenewalPolicy,
  deleteRenewalPolicy,
} from '../api/client';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import type { Column } from '../components/DataTable';
import ErrorState from '../components/ErrorState';
import { formatDateTime } from '../api/utils';
import type { RenewalPolicy } from '../api/types';

interface PolicyFormFields {
  name: string;
  renewal_window_days: number;
  auto_renew: boolean;
  max_retries: number;
  retry_interval_seconds: number;
  alert_thresholds_days: number[];
}

function defaultFields(): PolicyFormFields {
  return {
    name: '',
    renewal_window_days: 30,
    auto_renew: true,
    max_retries: 3,
    retry_interval_seconds: 60,
    alert_thresholds_days: [30, 14, 7, 0],
  };
}

function policyToFields(p: RenewalPolicy): PolicyFormFields {
  return {
    name: p.name,
    renewal_window_days: p.renewal_window_days,
    auto_renew: p.auto_renew,
    max_retries: p.max_retries,
    retry_interval_seconds: p.retry_interval_seconds,
    alert_thresholds_days: p.alert_thresholds_days || [],
  };
}

interface PolicyFormModalProps {
  title: string;
  initial: PolicyFormFields;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (fields: PolicyFormFields) => void;
  isSaving: boolean;
  error: string | null;
}

function PolicyFormModal({ title, initial, isOpen, onClose, onSubmit, isSaving, error }: PolicyFormModalProps) {
  const [fields, setFields] = useState<PolicyFormFields>(initial);

  useEffect(() => {
    if (isOpen) setFields(initial);
  }, [isOpen, initial]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fields.name.trim()) return;
    onSubmit({ ...fields, name: fields.name.trim() });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-surface border border-surface-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between pb-3 border-b border-surface-border">
          <div className="flex items-center gap-2 font-bold text-sm text-ink">
            <RotateCw className="w-4 h-4 text-emerald-400" />
            <span>{title}</span>
          </div>
          <button onClick={onClose} className="text-ink-muted hover:text-ink text-xs p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink mb-1">Tên Chính Sách (Name) *</label>
            <input
              value={fields.name}
              onChange={e => setFields({ ...fields, name: e.target.value })}
              className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-emerald-400"
              placeholder="e.g., Standard 30-day"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Cửa Sổ Tự Đổi (Renewal Window - ngày)</label>
              <input
                type="number"
                value={fields.renewal_window_days}
                onChange={e => setFields({ ...fields, renewal_window_days: Number(e.target.value) })}
                className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-emerald-400"
                min={1}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Số Lần Thử Lại (Max Retries)</label>
              <input
                type="number"
                value={fields.max_retries}
                onChange={e => setFields({ ...fields, max_retries: Number(e.target.value) })}
                className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-emerald-400"
                min={0}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">Khoảng Thời Gian Thử Lại (Retry Interval - giây)</label>
            <input
              type="number"
              value={fields.retry_interval_seconds}
              onChange={e => setFields({ ...fields, retry_interval_seconds: Number(e.target.value) })}
              className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-emerald-400"
              min={0}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">Ngưỡng Cảnh Báo Sắp Hết Hạn (ngày, cách nhau dấu phẩy)</label>
            <input
              value={fields.alert_thresholds_days.join(', ')}
              onChange={e => {
                const parts = e.target.value
                  .split(',')
                  .map(s => Number(s.trim()))
                  .filter(n => !isNaN(n));
                setFields({ ...fields, alert_thresholds_days: parts });
              }}
              className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-ink font-mono focus:outline-none focus:border-emerald-400"
              placeholder="30, 14, 7, 0"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="auto_renew"
              checked={fields.auto_renew}
              onChange={e => setFields({ ...fields, auto_renew: e.target.checked })}
              className="w-4 h-4 rounded border-surface-border accent-emerald-500"
            />
            <label htmlFor="auto_renew" className="text-xs text-ink font-medium cursor-pointer">Tự động gia hạn chứng chỉ (Auto-renew)</label>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={onClose} className="btn btn-ghost text-xs px-4 py-2 rounded-xl">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="btn btn-primary text-xs font-semibold px-4 py-2 rounded-xl disabled:opacity-50">
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RenewalPoliciesPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<RenewalPolicy | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['renewal-policies'],
    queryFn: () => getRenewalPolicies(),
  });

  const createMutation = useTrackedMutation({
    mutationFn: createRenewalPolicy,
    invalidates: [['renewal-policies']],
    onSuccess: () => {
      setShowCreate(false);
    },
  });

  const updateMutation = useTrackedMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RenewalPolicy> }) => updateRenewalPolicy(id, data),
    invalidates: [['renewal-policies']],
    onSuccess: () => {
      setEditing(null);
    },
  });

  const deleteMutation = useTrackedMutation({
    mutationFn: deleteRenewalPolicy,
    invalidates: [['renewal-policies']],
    onSuccess: () => toast.success('Renewal policy deleted'),
    onError: (err: Error) => toast.error(`Delete failed: ${err.message}`),
  });

  const policies = data?.data || [];
  const autoRenewCount = policies.filter(p => p.auto_renew).length;

  const columns: Column<RenewalPolicy>[] = [
    {
      key: 'name',
      label: 'Policy',
      render: (p) => (
        <div>
          <div className="font-bold text-sm text-ink">{p.name}</div>
          <div className="text-[11px] text-ink-faint font-mono">{p.id}</div>
        </div>
      ),
    },
    {
      key: 'window',
      label: 'Renewal Window',
      render: (p) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-muted text-ink border border-surface-border">
          <Clock className="w-3 h-3 text-emerald-400" />
          <span>{p.renewal_window_days} days</span>
        </span>
      ),
    },
    {
      key: 'auto_renew',
      label: 'Auto Renew',
      render: (p) => (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
          p.auto_renew
            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
            : 'bg-surface-muted text-ink-muted border-surface-border'
        }`}>
          {p.auto_renew ? <Zap className="w-3 h-3 text-emerald-400" /> : null}
          <span>{p.auto_renew ? 'on' : 'manual'}</span>
        </span>
      ),
    },
    {
      key: 'retries',
      label: 'Retries & Interval',
      render: (p) => <span className="text-xs text-ink-muted font-mono">{p.max_retries}× / {p.retry_interval_seconds}s</span>,
    },
    {
      key: 'alerts',
      label: 'Alert Thresholds',
      render: (p) => (
        <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
          {(p.alert_thresholds_days || []).join(', ') || '—'}
        </span>
      ),
    },
    {
      key: 'created',
      label: 'Created At',
      render: (p) => <span className="text-xs text-ink-muted font-mono">{formatDateTime(p.created_at)}</span>,
    },
    {
      key: 'actions',
      label: '',
      render: (p) => (
        <div className="flex gap-2 justify-end">
          <button
            onClick={(e) => { e.stopPropagation(); setEditing(p); }}
            className="px-2 py-1 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors flex items-center gap-1 font-semibold"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Delete renewal policy ${p.name}?`)) deleteMutation.mutate(p.id);
            }}
            className="px-2 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Renewal Policies"
        subtitle={data ? `${data.total} renewal policy profiles configured` : undefined}
        action={
          <button onClick={() => setShowCreate(true)} className="btn btn-primary text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            <span>+ New Policy</span>
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-surface p-4 rounded-2xl border border-surface-border flex items-center justify-between shadow-sm">
            <div>
              <div className="text-xs font-semibold text-ink-muted flex items-center gap-1.5">
                <RotateCw className="w-4 h-4 text-emerald-400" />
                <span>Chính Sách Tự Đổi Chứng Chỉ</span>
              </div>
              <div className="text-2xl font-bold text-ink mt-1 font-mono">{policies.length}</div>
            </div>
            <div className="p-3 rounded-xl bg-surface-muted border border-surface-border text-emerald-400">
              <RotateCw className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-surface p-4 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 to-transparent flex items-center justify-between shadow-sm">
            <div>
              <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                <span>Chế Độ Auto-Renew (Tự Động)</span>
              </div>
              <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">{autoRenewCount} / {policies.length}</div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Zap className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-surface p-4 rounded-2xl border border-surface-border flex items-center justify-between shadow-sm">
            <div>
              <div className="text-xs font-semibold text-ink-muted flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-amber-400" />
                <span>Cảnh Báo & Thử Lại</span>
              </div>
              <div className="text-xs text-ink-muted mt-1">Cảnh báo tự động trước 30/14/7 ngày</div>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Bell className="w-5 h-5" />
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
              data={policies}
              isLoading={isLoading}
              emptyMessage="No renewal policies configured"
            />
          )}
        </div>
      </div>

      <PolicyFormModal
        title="Create Renewal Policy"
        initial={defaultFields()}
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={(fields) => createMutation.mutate(fields)}
        isSaving={createMutation.isPending}
        error={createMutation.error ? (createMutation.error as Error).message : null}
      />
      <PolicyFormModal
        title="Edit Renewal Policy"
        initial={editing ? policyToFields(editing) : defaultFields()}
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        onSubmit={(fields) => {
          if (!editing) return;
          updateMutation.mutate({ id: editing.id, data: fields });
        }}
        isSaving={updateMutation.isPending}
        error={updateMutation.error ? (updateMutation.error as Error).message : null}
      />
    </>
  );
}
