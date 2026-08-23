import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Layers,
  Server,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Cpu,
  Globe,
  Tag,
  Filter,
} from 'lucide-react';

import { useTrackedMutation } from '../hooks/useTrackedMutation';
import { getAgentGroups, deleteAgentGroup, createAgentGroup, updateAgentGroup } from '../api/client';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import type { Column } from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import ErrorState from '../components/ErrorState';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatDateTime } from '../api/utils';
import type { AgentGroup } from '../api/types';

interface CreateAgentGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isLoading: boolean;
  error: string | null;
}

function CreateAgentGroupModal({ isOpen, onClose, onSuccess, isLoading, error }: CreateAgentGroupModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [matchOs, setMatchOs] = useState('');
  const [matchArch, setMatchArch] = useState('');
  const [matchIpCidr, setMatchIpCidr] = useState('');
  const [matchVersion, setMatchVersion] = useState('');
  const [enabled, setEnabled] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createAgentGroup({
      name: name.trim(),
      description: description.trim(),
      match_os: matchOs.trim() || undefined,
      match_architecture: matchArch.trim() || undefined,
      match_ip_cidr: matchIpCidr.trim() || undefined,
      match_version: matchVersion.trim() || undefined,
      enabled,
    });
    setName('');
    setDescription('');
    setMatchOs('');
    setMatchArch('');
    setMatchIpCidr('');
    setMatchVersion('');
    setEnabled(true);
    onSuccess();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-surface border border-surface-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-surface-border/60 pb-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-ink">Create Agent Group</h2>
            <p className="text-xs text-ink-muted">Define automated matching criteria for fleet agents.</p>
          </div>
        </div>

        {error && <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">Group Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-surface-border rounded-lg px-3.5 py-2 text-sm text-ink focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              placeholder="e.g., Production Linux Servers"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-surface-border rounded-lg px-3.5 py-2 text-sm text-ink focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              placeholder="Optional description"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">Match OS</label>
              <input
                value={matchOs}
                onChange={(e) => setMatchOs(e.target.value)}
                className="w-full bg-white border border-surface-border rounded-lg px-3 py-2 text-sm text-ink focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-mono"
                placeholder="linux"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">Match Arch</label>
              <input
                value={matchArch}
                onChange={(e) => setMatchArch(e.target.value)}
                className="w-full bg-white border border-surface-border rounded-lg px-3 py-2 text-sm text-ink focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-mono"
                placeholder="amd64"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">Match IP CIDR</label>
              <input
                value={matchIpCidr}
                onChange={(e) => setMatchIpCidr(e.target.value)}
                className="w-full bg-white border border-surface-border rounded-lg px-3 py-2 text-sm text-ink focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-mono"
                placeholder="10.0.0.0/8"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">Match Version</label>
              <input
                value={matchVersion}
                onChange={(e) => setMatchVersion(e.target.value)}
                className="w-full bg-white border border-surface-border rounded-lg px-3 py-2 text-sm text-ink focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-mono"
                placeholder="2.0.*"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="enabled"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500"
            />
            <label htmlFor="enabled" className="text-xs font-semibold text-ink cursor-pointer">
              Enabled (Active group evaluation)
            </label>
          </div>
          <div className="flex gap-3 pt-3">
            <button type="button" onClick={onClose} className="flex-1 btn btn-ghost text-xs border border-surface-border hover:bg-surface-muted">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="flex-1 btn btn-primary text-xs shadow-md disabled:opacity-50">
              {isLoading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface EditAgentGroupModalProps {
  group: AgentGroup | null;
  onClose: () => void;
  onSuccess: () => void;
  isLoading: boolean;
  error: string | null;
}

function EditAgentGroupModal({ group, onClose, onSuccess, isLoading, error }: EditAgentGroupModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [matchOs, setMatchOs] = useState('');
  const [matchArch, setMatchArch] = useState('');
  const [matchIpCidr, setMatchIpCidr] = useState('');
  const [matchVersion, setMatchVersion] = useState('');
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (group) {
      setName(group.name);
      setDescription(group.description || '');
      setMatchOs(group.match_os || '');
      setMatchArch(group.match_architecture || '');
      setMatchIpCidr(group.match_ip_cidr || '');
      setMatchVersion(group.match_version || '');
      setEnabled(group.enabled);
    }
  }, [group]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group || !name.trim()) return;
    await updateAgentGroup(group.id, {
      name: name.trim(),
      description: description.trim(),
      match_os: matchOs.trim(),
      match_architecture: matchArch.trim(),
      match_ip_cidr: matchIpCidr.trim(),
      match_version: matchVersion.trim(),
      enabled,
    });
    onSuccess();
  };

  if (!group) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-surface border border-surface-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-surface-border/60 pb-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Pencil className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-ink">Edit Agent Group</h2>
            <p className="text-xs text-ink-muted font-mono">{group.id}</p>
          </div>
        </div>

        {error && <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">Group Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-white border border-surface-border rounded-lg px-3.5 py-2 text-sm text-ink focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-white border border-surface-border rounded-lg px-3.5 py-2 text-sm text-ink focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">Match OS</label>
              <input
                value={matchOs}
                onChange={(e) => setMatchOs(e.target.value)}
                placeholder="linux"
                className="w-full bg-white border border-surface-border rounded-lg px-3 py-2 text-sm text-ink focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">Match Arch</label>
              <input
                value={matchArch}
                onChange={(e) => setMatchArch(e.target.value)}
                placeholder="amd64"
                className="w-full bg-white border border-surface-border rounded-lg px-3 py-2 text-sm text-ink focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-mono"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">Match IP CIDR</label>
              <input
                value={matchIpCidr}
                onChange={(e) => setMatchIpCidr(e.target.value)}
                placeholder="10.0.0.0/24"
                className="w-full bg-white border border-surface-border rounded-lg px-3 py-2 text-sm text-ink focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">Match Version</label>
              <input
                value={matchVersion}
                onChange={(e) => setMatchVersion(e.target.value)}
                placeholder="v2.0.x"
                className="w-full bg-white border border-surface-border rounded-lg px-3 py-2 text-sm text-ink focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-mono"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="edit-enabled"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500"
            />
            <label htmlFor="edit-enabled" className="text-xs font-semibold text-ink cursor-pointer">
              Enabled (Active group evaluation)
            </label>
          </div>
          <div className="flex gap-3 pt-3">
            <button type="button" onClick={onClose} className="flex-1 btn btn-ghost text-xs border border-surface-border hover:bg-surface-muted">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="flex-1 btn btn-primary text-xs shadow-md disabled:opacity-50">
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AgentGroupsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editingGroup, setEditingGroup] = useState<AgentGroup | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AgentGroup | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['agent-groups'],
    queryFn: () => getAgentGroups(),
  });

  const deleteMutation = useTrackedMutation({
    mutationFn: deleteAgentGroup,
    invalidates: [['agent-groups']],
    onSuccess: () => toast.success('Agent group deleted'),
    onError: (err: Error) => toast.error(`Delete failed: ${err.message}`),
  });

  const createMutation = useTrackedMutation({
    mutationFn: createAgentGroup,
    invalidates: [['agent-groups']],
    onSuccess: () => {
      setShowCreate(false);
    },
  });

  const updateMutation = useTrackedMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AgentGroup> }) => updateAgentGroup(id, data),
    invalidates: [['agent-groups']],
    onSuccess: () => {
      setEditingGroup(null);
    },
  });

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success('Group ID copied');
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const columns: Column<AgentGroup>[] = [
    {
      key: 'name',
      label: 'Group',
      render: (g) => (
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center border border-blue-200/60 shrink-0 shadow-xs mt-0.5">
            <Server className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="font-semibold text-ink">{g.name}</div>
            <div className="text-xs text-ink-muted font-mono flex items-center gap-1.5 mt-0.5">
              <span>{g.id}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(g.id);
                }}
                className="text-ink-faint hover:text-brand-500 transition-colors"
                title="Copy ID"
              >
                {copiedId === g.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            {g.description && <div className="text-xs text-ink-muted mt-1 max-w-xs truncate">{g.description}</div>}
          </div>
        </div>
      ),
    },
    {
      key: 'criteria',
      label: 'Match Criteria',
      render: (g) => {
        const criteria: { label: string; icon: React.ComponentType<{ className?: string }>; style: string }[] = [];
        if (g.match_os) criteria.push({ label: `OS: ${g.match_os}`, icon: Cpu, style: 'bg-blue-50 text-blue-700 border-blue-200' });
        if (g.match_architecture) criteria.push({ label: `Arch: ${g.match_architecture}`, icon: Cpu, style: 'bg-purple-50 text-purple-700 border-purple-200' });
        if (g.match_ip_cidr) criteria.push({ label: `IP: ${g.match_ip_cidr}`, icon: Globe, style: 'bg-emerald-50 text-emerald-700 border-emerald-200' });
        if (g.match_version) criteria.push({ label: `Ver: ${g.match_version}`, icon: Tag, style: 'bg-amber-50 text-amber-700 border-amber-200' });

        return criteria.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {criteria.map((c, i) => {
              const Icon = c.icon;
              return (
                <span key={i} className={`text-xs px-2.5 py-1 rounded-md font-mono font-medium border flex items-center gap-1 ${c.style}`}>
                  <Icon className="w-3 h-3 opacity-70" />
                  {c.label}
                </span>
              );
            })}
          </div>
        ) : (
          <span className="text-xs text-ink-faint italic bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-surface-border inline-block">
            Manual assignment only
          </span>
        );
      },
    },
    {
      key: 'enabled',
      label: 'Status',
      render: (g) => <StatusBadge status={g.enabled ? 'active' : 'disabled'} />,
    },
    {
      key: 'created',
      label: 'Created',
      render: (g) => (
        <span className="text-xs text-ink-muted flex items-center gap-1.5 font-mono">
          <Calendar className="w-3.5 h-3.5 text-ink-faint" />
          {formatDateTime(g.created_at)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (g) => (
        <div className="flex gap-2 justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingGroup(g);
            }}
            className="px-2.5 py-1 rounded-md text-xs font-medium text-brand-600 hover:text-brand-700 hover:bg-brand-50 border border-brand-200/50 transition-colors flex items-center gap-1"
          >
            <Pencil className="w-3 h-3" /> Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setConfirmDelete(g);
            }}
            className="px-2.5 py-1 rounded-md text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        </div>
      ),
    },
  ];

  const totalGroups = data?.total || 0;
  const activeGroups = data?.data?.filter((g) => g.enabled).length || 0;
  const autoMatchGroups = data?.data?.filter((g) => !!(g.match_os || g.match_architecture || g.match_ip_cidr || g.match_version)).length || 0;

  return (
    <>
      <PageHeader
        title="Agent Groups"
        subtitle={data ? `${data.total} groups configured` : undefined}
        action={
          <button onClick={() => setShowCreate(true)} className="btn btn-primary shadow-md shadow-brand-500/20 text-xs">
            <Plus className="w-4 h-4" /> New Group
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Metric Summary Cards Header */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-surface border border-surface-border rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-ink">{totalGroups}</div>
              <div className="text-xs font-medium text-ink-muted">Total Agent Groups</div>
            </div>
          </div>

          <div className="bg-surface border border-surface-border rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-ink">{activeGroups}</div>
              <div className="text-xs font-medium text-ink-muted">Active / Enabled Groups</div>
            </div>
          </div>

          <div className="bg-surface border border-surface-border rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-ink">{autoMatchGroups}</div>
              <div className="text-xs font-medium text-ink-muted">Automated Match Rules</div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-surface border border-surface-border rounded-xl shadow-sm overflow-hidden">
          {error ? (
            <ErrorState error={error as Error} onRetry={() => refetch()} />
          ) : (
            <DataTable columns={columns} data={data?.data || []} isLoading={isLoading} emptyMessage="No agent groups configured" />
          )}
        </div>
      </div>

      <CreateAgentGroupModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['agent-groups'] });
          setShowCreate(false);
        }}
        isLoading={createMutation.isPending}
        error={createMutation.error ? (createMutation.error as Error).message : null}
      />
      <EditAgentGroupModal
        group={editingGroup}
        onClose={() => setEditingGroup(null)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['agent-groups'] });
          setEditingGroup(null);
        }}
        isLoading={updateMutation.isPending}
        error={updateMutation.error ? (updateMutation.error as Error).message : null}
      />
      <ConfirmDialog
        open={confirmDelete !== null}
        title="Delete agent group"
        message={
          confirmDelete
            ? `Delete group ${confirmDelete.name}? This will remove the group definition; agents currently in the group will fall back to default assignment.`
            : ''
        }
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (confirmDelete) deleteMutation.mutate(confirmDelete.id);
          setConfirmDelete(null);
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </>
  );
}
