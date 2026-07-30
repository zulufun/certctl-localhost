import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Shield,
  Plus,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Code2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  Layers,
  Activity,
} from 'lucide-react';
import { useTrackedMutation } from '../hooks/useTrackedMutation';
import { getPolicies, updatePolicy, deletePolicy, createPolicy } from '../api/client';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import type { Column } from '../components/DataTable';
import ErrorState from '../components/ErrorState';
import { formatDateTime } from '../api/utils';
import {
  POLICY_TYPES,
  POLICY_SEVERITIES,
  type PolicyRule,
  type PolicyType,
  type PolicySeverity,
} from '../api/types';

const severityStyles: Record<PolicySeverity, string> = {
  Warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Error: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  Critical: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const severityDots: Record<PolicySeverity, string> = {
  Warning: 'bg-amber-400',
  Error: 'bg-orange-400',
  Critical: 'bg-red-400',
};

function humanize(s: string): string {
  return s.replace(/([A-Z])/g, ' $1').trim();
}

interface CreatePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isLoading: boolean;
  error: string | null;
}

function CreatePolicyModal({ isOpen, onClose, onSuccess, isLoading, error }: CreatePolicyModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<PolicyType>(POLICY_TYPES[0]);
  const [severity, setSeverity] = useState<PolicySeverity>('Warning');
  const [configStr, setConfigStr] = useState('{}');
  const [enabled, setEnabled] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const config = JSON.parse(configStr);
    await createPolicy({ name: name.trim(), type, severity, config, enabled });
    setName('');
    setType(POLICY_TYPES[0]);
    setSeverity('Warning');
    setConfigStr('{}');
    setEnabled(true);
    onSuccess();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-surface border border-surface-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between pb-3 border-b border-surface-border">
          <div className="flex items-center gap-2 font-bold text-sm text-ink">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Tạo Quy Tắc Chính Sách Mới</span>
          </div>
          <button onClick={onClose} className="text-ink-muted hover:text-ink text-xs p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink mb-1">Tên Quy Tắc (Name) *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-emerald-400"
              placeholder="Ví dụ: Key Length Enforcement"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Loại Quy Tắc (Type) *</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as PolicyType)}
                className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-emerald-400"
              >
                {POLICY_TYPES.map(t => (
                  <option key={t} value={t}>{humanize(t)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Mức Độ (Severity) *</label>
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value as PolicySeverity)}
                className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-emerald-400"
              >
                {POLICY_SEVERITIES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">Cấu Hình Cấu Trúc JSON (Config)</label>
            <textarea
              value={configStr}
              onChange={e => setConfigStr(e.target.value)}
              className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-ink font-mono focus:outline-none focus:border-emerald-400"
              placeholder='{"min_bits": 2048}'
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="enabled"
              checked={enabled}
              onChange={e => setEnabled(e.target.checked)}
              className="w-4 h-4 rounded border-surface-border accent-emerald-500"
            />
            <label htmlFor="enabled" className="text-xs text-ink font-medium cursor-pointer">Kích hoạt quy tắc ngay sau khi tạo (Enabled)</label>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost text-xs px-4 py-2 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary text-xs font-semibold px-4 py-2 rounded-xl disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Policy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PoliciesPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['policies'],
    queryFn: () => getPolicies(),
  });

  const toggleMutation = useTrackedMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) => updatePolicy(id, { enabled }),
    invalidates: [['policies']],
  });

  const deleteMutation = useTrackedMutation({
    mutationFn: deletePolicy,
    invalidates: [['policies']],
  });

  const createMutation = useTrackedMutation({
    mutationFn: createPolicy,
    invalidates: [['policies']],
    onSuccess: () => {
      setShowCreate(false);
    },
  });

  const policies = data?.data || [];
  const enabledCount = policies.filter(p => p.enabled).length;
  const bySeverity = policies.reduce<Record<string, number>>((acc, p) => {
    acc[p.severity] = (acc[p.severity] || 0) + 1;
    return acc;
  }, {});

  const columns: Column<PolicyRule>[] = [
    {
      key: 'name',
      label: 'Rule Name',
      render: (p) => (
        <div>
          <div className="font-bold text-sm text-ink">{p.name}</div>
          <div className="text-[11px] text-ink-faint font-mono">{p.id}</div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (p) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-muted border border-surface-border text-ink-muted">
          <FileCheck className="w-3 h-3 text-emerald-400" />
          <span>{humanize(p.type)}</span>
        </span>
      ),
    },
    {
      key: 'severity',
      label: 'Severity',
      render: (p) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${severityStyles[p.severity] || 'bg-surface-muted text-ink-muted border-surface-border'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${severityDots[p.severity] || 'bg-gray-400'}`} />
          <span>{p.severity}</span>
        </span>
      ),
    },
    {
      key: 'config',
      label: 'Config (JSON)',
      render: (p) => {
        if (!p.config || Object.keys(p.config).length === 0) return <span className="text-ink-faint text-xs">&mdash;</span>;
        return (
          <span className="text-xs text-ink-muted font-mono bg-surface-muted/60 px-2 py-1 rounded border border-surface-border truncate max-w-xs block" title={JSON.stringify(p.config, null, 2)}>
            {JSON.stringify(p.config).slice(0, 45)}
          </span>
        );
      },
    },
    {
      key: 'enabled',
      label: 'Status',
      render: (p) => (
        <button
          onClick={(e) => { e.stopPropagation(); toggleMutation.mutate({ id: p.id, enabled: !p.enabled }); }}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
            p.enabled
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
              : 'bg-surface-muted text-ink-muted border border-surface-border hover:bg-surface-hover'
          }`}
        >
          {p.enabled ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4 text-ink-faint" />}
          <span>{p.enabled ? 'Enabled' : 'Disabled'}</span>
        </button>
      ),
    },
    { key: 'created', label: 'Created At', render: (p) => <span className="text-xs text-ink-muted font-mono">{formatDateTime(p.created_at)}</span> },
    {
      key: 'actions',
      label: '',
      render: (p) => (
        <div className="flex justify-end">
          <button
            onClick={(e) => { e.stopPropagation(); if (confirm(`Delete policy ${p.name}?`)) deleteMutation.mutate(p.id); }}
            className="p-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-1"
            title="Delete Policy"
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
        title="Policies"
        subtitle={data ? `${data.total} compliance rules configured` : undefined}
        action={
          <button onClick={() => setShowCreate(true)} className="btn btn-primary text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            <span>+ New Policy</span>
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-surface p-4 rounded-2xl border border-surface-border flex items-center justify-between shadow-sm">
            <div>
              <div className="text-xs font-semibold text-ink-muted flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Tổng Quy Tắc Policies</span>
              </div>
              <div className="text-2xl font-bold text-ink mt-1 font-mono">{policies.length}</div>
            </div>
            <div className="p-3 rounded-xl bg-surface-muted border border-surface-border text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-surface p-4 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 to-transparent flex items-center justify-between shadow-sm">
            <div>
              <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Quy Tắc Đang Kích Hoạt</span>
              </div>
              <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">{enabledCount} / {policies.length}</div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-surface p-4 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-950/20 to-transparent flex items-center justify-between shadow-sm">
            <div>
              <div className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Phân Bộ Theo Mức Độ</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                {Object.entries(bySeverity).map(([sev, count]) => (
                  <span key={sev} className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold border ${severityStyles[sev as PolicySeverity] || 'bg-surface-muted text-ink'}`}>
                    {sev}: {count}
                  </span>
                ))}
                {Object.keys(bySeverity).length === 0 && <span className="text-xs text-ink-muted">Chưa có</span>}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-surface rounded-2xl border border-surface-border shadow-sm overflow-hidden">
          {error ? (
            <ErrorState error={error as Error} onRetry={() => refetch()} />
          ) : (
            <DataTable columns={columns} data={policies} isLoading={isLoading} emptyMessage="No policy rules" />
          )}
        </div>
      </div>

      <CreatePolicyModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['policies'] });
          setShowCreate(false);
        }}
        isLoading={createMutation.isPending}
        error={createMutation.error ? (createMutation.error as Error).message : null}
      />
    </>
  );
}
