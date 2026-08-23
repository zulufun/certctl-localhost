import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Users,
  Building,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  FileText,
  Copy,
  Check,
  Shield,
  Layers,
} from 'lucide-react';

import { useTrackedMutation } from '../hooks/useTrackedMutation';
import { getTeams, deleteTeam, createTeam, updateTeam } from '../api/client';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import type { Column } from '../components/DataTable';
import ErrorState from '../components/ErrorState';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatDateTime } from '../api/utils';
import type { Team } from '../api/types';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isLoading: boolean;
  error: string | null;
}

function CreateTeamModal({ isOpen, onClose, onSuccess, isLoading, error }: CreateTeamModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createTeam({
      name: name.trim(),
      description: description.trim(),
    });
    setName('');
    setDescription('');
    onSuccess();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-surface border border-surface-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-surface-border/60 pb-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-ink">Create Team</h2>
            <p className="text-xs text-ink-muted">Add a new operational team or organization unit.</p>
          </div>
        </div>

        {error && <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">Team Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-surface-border rounded-lg px-3.5 py-2 text-sm text-ink focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              placeholder="e.g., Platform Engineering"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-surface-border rounded-lg px-3.5 py-2 text-sm text-ink focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              placeholder="Optional team responsibilities or scope"
              rows={3}
            />
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
              {isLoading ? 'Creating...' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface EditTeamModalProps {
  team: Team | null;
  onClose: () => void;
  onSuccess: () => void;
  isLoading: boolean;
  error: string | null;
}

function EditTeamModal({ team, onClose, onSuccess, isLoading, error }: EditTeamModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (team) {
      setName(team.name);
      setDescription(team.description || '');
    }
  }, [team]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team || !name.trim()) return;
    await updateTeam(team.id, { name: name.trim(), description: description.trim() });
    onSuccess();
  };

  if (!team) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-surface border border-surface-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-surface-border/60 pb-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Pencil className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-ink">Edit Team</h2>
            <p className="text-xs text-ink-muted font-mono">{team.id}</p>
          </div>
        </div>

        {error && <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">Team Name *</label>
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
              rows={3}
              className="w-full bg-white border border-surface-border rounded-lg px-3.5 py-2 text-sm text-ink focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
            />
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

export default function TeamsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Team | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['teams'],
    queryFn: () => getTeams(),
  });

  const deleteMutation = useTrackedMutation({
    mutationFn: deleteTeam,
    invalidates: [['teams']],
    onSuccess: () => toast.success('Team deleted'),
    onError: (err: Error) => toast.error(`Delete failed: ${err.message}`),
  });

  const createMutation = useTrackedMutation({
    mutationFn: createTeam,
    invalidates: [['teams']],
    onSuccess: () => {
      setShowCreate(false);
    },
  });

  const updateMutation = useTrackedMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Team> }) => updateTeam(id, data),
    invalidates: [['teams']],
    onSuccess: () => {
      setEditingTeam(null);
    },
  });

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success('Team ID copied');
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const columns: Column<Team>[] = [
    {
      key: 'name',
      label: 'Team',
      render: (t) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 font-bold text-xs flex items-center justify-center border border-purple-200/60 shrink-0 shadow-xs">
            <Building className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="font-semibold text-ink">{t.name}</div>
            <div className="text-xs text-ink-muted font-mono flex items-center gap-1.5 mt-0.5">
              <span>{t.id}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(t.id);
                }}
                className="text-ink-faint hover:text-brand-500 transition-colors"
                title="Copy ID"
              >
                {copiedId === t.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (t) =>
        t.description ? (
          <div className="flex items-center gap-1.5 text-sm text-ink max-w-md">
            <FileText className="w-3.5 h-3.5 text-ink-faint shrink-0" />
            <span className="truncate">{t.description}</span>
          </div>
        ) : (
          <span className="text-ink-faint text-sm">—</span>
        ),
    },
    {
      key: 'created',
      label: 'Created',
      render: (t) => (
        <span className="text-xs text-ink-muted flex items-center gap-1.5 font-mono">
          <Calendar className="w-3.5 h-3.5 text-ink-faint" />
          {formatDateTime(t.created_at)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (t) => (
        <div className="flex gap-2 justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingTeam(t);
            }}
            className="px-2.5 py-1 rounded-md text-xs font-medium text-brand-600 hover:text-brand-700 hover:bg-brand-50 border border-brand-200/50 transition-colors flex items-center gap-1"
          >
            <Pencil className="w-3 h-3" /> Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setConfirmDelete(t);
            }}
            className="px-2.5 py-1 rounded-md text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        </div>
      ),
    },
  ];

  const totalTeams = data?.total || 0;
  const describedTeams = data?.data?.filter((t) => !!t.description).length || 0;

  return (
    <>
      <PageHeader
        title="Teams"
        subtitle={data ? `${data.total} operational teams` : undefined}
        action={
          <button onClick={() => setShowCreate(true)} className="btn btn-primary shadow-md shadow-brand-500/20 text-xs">
            <Plus className="w-4 h-4" /> New Team
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Metric Overview Cards Header */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-surface border border-surface-border rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-ink">{totalTeams}</div>
              <div className="text-xs font-medium text-ink-muted">Total Active Teams</div>
            </div>
          </div>

          <div className="bg-surface border border-surface-border rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-ink">{describedTeams}</div>
              <div className="text-xs font-medium text-ink-muted">Teams with Scope Description</div>
            </div>
          </div>

          <div className="bg-surface border border-surface-border rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-ink">{totalTeams > 0 ? 'Active' : '0'}</div>
              <div className="text-xs font-medium text-ink-muted">Access Control Active</div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-surface border border-surface-border rounded-xl shadow-sm overflow-hidden">
          {error ? (
            <ErrorState error={error as Error} onRetry={() => refetch()} />
          ) : (
            <DataTable columns={columns} data={data?.data || []} isLoading={isLoading} emptyMessage="No teams configured" />
          )}
        </div>
      </div>

      <CreateTeamModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['teams'] });
          setShowCreate(false);
        }}
        isLoading={createMutation.isPending}
        error={createMutation.error ? (createMutation.error as Error).message : null}
      />
      <EditTeamModal
        team={editingTeam}
        onClose={() => setEditingTeam(null)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['teams'] });
          setEditingTeam(null);
        }}
        isLoading={updateMutation.isPending}
        error={updateMutation.error ? (updateMutation.error as Error).message : null}
      />
      <ConfirmDialog
        open={confirmDelete !== null}
        title="Delete team"
        message={confirmDelete ? `Delete team ${confirmDelete.name}? This action cannot be undone.` : ''}
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
