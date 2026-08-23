import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  UserCheck,
  User,
  Mail,
  Users,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Building,
  Shield,
  Copy,
  Check,
} from 'lucide-react';

import { useTrackedMutation } from '../hooks/useTrackedMutation';
import { getOwners, getTeams, deleteOwner, createOwner, updateOwner } from '../api/client';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import type { Column } from '../components/DataTable';
import ErrorState from '../components/ErrorState';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatDateTime } from '../api/utils';
import type { Owner, Team } from '../api/types';

interface CreateOwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isLoading: boolean;
  error: string | null;
  teamsData?: { data: Team[] };
}

function CreateOwnerModal({ isOpen, onClose, onSuccess, isLoading, error, teamsData }: CreateOwnerModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [teamId, setTeamId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    await createOwner({
      name: name.trim(),
      email: email.trim(),
      team_id: teamId || undefined,
    });
    setName('');
    setEmail('');
    setTeamId('');
    onSuccess();
  };

  if (!isOpen) return null;

  const teams = teamsData?.data || [];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-surface border border-surface-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-surface-border/60 pb-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-ink">Create Owner</h2>
            <p className="text-xs text-ink-muted">Add a new certificate owner or administrator.</p>
          </div>
        </div>

        {error && <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">Full Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-surface-border rounded-lg px-3.5 py-2 text-sm text-ink focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              placeholder="e.g., Alice Smith"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-surface-border rounded-lg px-3.5 py-2 text-sm text-ink focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              placeholder="alice@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">Assigned Team</label>
            <select
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              className="w-full bg-white border border-surface-border rounded-lg px-3.5 py-2 text-sm text-ink focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
            >
              <option value="">Unassigned</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn btn-ghost text-xs border border-surface-border hover:bg-surface-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 btn btn-primary text-xs shadow-md disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Owner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface EditOwnerModalProps {
  owner: Owner | null;
  onClose: () => void;
  onSuccess: () => void;
  isLoading: boolean;
  error: string | null;
  teamsData?: { data: Team[] };
}

function EditOwnerModal({ owner, onClose, onSuccess, isLoading, error, teamsData }: EditOwnerModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [teamId, setTeamId] = useState('');

  useEffect(() => {
    if (owner) {
      setName(owner.name);
      setEmail(owner.email);
      setTeamId(owner.team_id || '');
    }
  }, [owner]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!owner || !name.trim() || !email.trim()) return;
    await updateOwner(owner.id, {
      name: name.trim(),
      email: email.trim(),
      team_id: teamId || undefined,
    });
    onSuccess();
  };

  if (!owner) return null;
  const teams = teamsData?.data || [];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-surface border border-surface-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-surface-border/60 pb-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Pencil className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-ink">Edit Owner</h2>
            <p className="text-xs text-ink-muted font-mono">{owner.id}</p>
          </div>
        </div>

        {error && <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">Full Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-surface-border rounded-lg px-3.5 py-2 text-sm text-ink focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-surface-border rounded-lg px-3.5 py-2 text-sm text-ink focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">Assigned Team</label>
            <select
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              className="w-full bg-white border border-surface-border rounded-lg px-3.5 py-2 text-sm text-ink focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
            >
              <option value="">Unassigned</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
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

export default function OwnersPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['owners'],
    queryFn: () => getOwners(),
  });

  const { data: teamsData } = useQuery({
    queryKey: ['teams'],
    queryFn: () => getTeams(),
  });

  const [confirmDelete, setConfirmDelete] = useState<Owner | null>(null);

  const deleteMutation = useTrackedMutation({
    mutationFn: deleteOwner,
    invalidates: [['owners']],
    onSuccess: () => toast.success('Owner deleted'),
    onError: (err: Error) => toast.error(`Delete failed: ${err.message}`),
  });

  const createMutation = useTrackedMutation({
    mutationFn: createOwner,
    invalidates: [['owners']],
    onSuccess: () => {
      setShowCreate(false);
    },
  });

  const updateMutation = useTrackedMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Owner> }) => updateOwner(id, data),
    invalidates: [['owners']],
    onSuccess: () => {
      setEditingOwner(null);
    },
  });

  const teamMap = new Map<string, Team>();
  (teamsData?.data || []).forEach((t) => teamMap.set(t.id, t));

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success('Owner ID copied');
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const columns: Column<Owner>[] = [
    {
      key: 'name',
      label: 'Owner',
      render: (o) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-500/10 text-brand-600 font-bold text-xs flex items-center justify-center border border-brand-500/20 shrink-0 shadow-inner">
            {getInitials(o.name)}
          </div>
          <div>
            <div className="font-semibold text-ink flex items-center gap-2">
              {o.name}
            </div>
            <div className="text-xs text-ink-muted font-mono flex items-center gap-1.5 mt-0.5">
              <span>{o.id}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(o.id);
                }}
                className="text-ink-faint hover:text-brand-500 transition-colors"
                title="Copy ID"
              >
                {copiedId === o.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (o) =>
        o.email ? (
          <div className="flex items-center gap-1.5 text-sm text-ink font-medium">
            <Mail className="w-3.5 h-3.5 text-purple-500 shrink-0" />
            <span>{o.email}</span>
          </div>
        ) : (
          <span className="text-ink-faint text-sm">—</span>
        ),
    },
    {
      key: 'team',
      label: 'Team',
      render: (o) => {
        const team = teamMap.get(o.team_id);
        return team ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200/60">
            <Users className="w-3 h-3 text-brand-500" />
            {team.name}
          </span>
        ) : (
          <span className="text-ink-faint font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-surface-border">
            {o.team_id || 'Unassigned'}
          </span>
        );
      },
    },
    {
      key: 'created',
      label: 'Created',
      render: (o) => (
        <span className="text-xs text-ink-muted flex items-center gap-1.5 font-mono">
          <Calendar className="w-3.5 h-3.5 text-ink-faint" />
          {formatDateTime(o.created_at)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (o) => (
        <div className="flex gap-2 justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingOwner(o);
            }}
            className="px-2.5 py-1 rounded-md text-xs font-medium text-brand-600 hover:text-brand-700 hover:bg-brand-50 border border-brand-200/50 transition-colors flex items-center gap-1"
          >
            <Pencil className="w-3 h-3" /> Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setConfirmDelete(o);
            }}
            className="px-2.5 py-1 rounded-md text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        </div>
      ),
    },
  ];

  const totalOwners = data?.total || 0;
  const assignedOwners = data?.data?.filter((o) => !!o.team_id).length || 0;

  return (
    <>
      <PageHeader
        title="Owners"
        subtitle={data ? `${data.total} configured owners` : undefined}
        action={
          <button onClick={() => setShowCreate(true)} className="btn btn-primary shadow-md shadow-brand-500/20 text-xs">
            <Plus className="w-4 h-4" /> New Owner
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Metric Summary Cards Header */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-surface border border-surface-border rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-ink">{totalOwners}</div>
              <div className="text-xs font-medium text-ink-muted">Total Certificate Owners</div>
            </div>
          </div>

          <div className="bg-surface border border-surface-border rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-ink">{assignedOwners}</div>
              <div className="text-xs font-medium text-ink-muted">Assigned to Teams</div>
            </div>
          </div>

          <div className="bg-surface border border-surface-border rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-ink">{teamsData?.total || 0}</div>
              <div className="text-xs font-medium text-ink-muted">Available Teams</div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-surface border border-surface-border rounded-xl shadow-sm overflow-hidden">
          {error ? (
            <ErrorState error={error as Error} onRetry={() => refetch()} />
          ) : (
            <DataTable columns={columns} data={data?.data || []} isLoading={isLoading} emptyMessage="No owners configured" />
          )}
        </div>
      </div>

      <CreateOwnerModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['owners'] });
          setShowCreate(false);
        }}
        isLoading={createMutation.isPending}
        error={createMutation.error ? (createMutation.error as Error).message : null}
        teamsData={teamsData}
      />
      <EditOwnerModal
        owner={editingOwner}
        onClose={() => setEditingOwner(null)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['owners'] });
          setEditingOwner(null);
        }}
        isLoading={updateMutation.isPending}
        error={updateMutation.error ? (updateMutation.error as Error).message : null}
        teamsData={teamsData}
      />
      <ConfirmDialog
        open={confirmDelete !== null}
        title="Delete owner"
        message={confirmDelete ? `Delete owner ${confirmDelete.name}? This action cannot be undone.` : ''}
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
