import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Shield,
  Plus,
  Lock,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Key,
} from 'lucide-react';
import { authListRoles, authCreateRole, type AuthRole } from '../../api/client';
import { useAuthMe } from '../../hooks/useAuthMe';
import PageHeader from '../../components/PageHeader';
import ErrorState from '../../components/ErrorState';
import { STALE_TIME } from '../../api/queryConstants';

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function CreateRoleModal({ isOpen, onClose, onSuccess }: CreateRoleModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await authCreateRole({ name: name.trim(), description: description.trim() });
      setName('');
      setDescription('');
      setDirty(false);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (dirty && !window.confirm('Discard unsaved changes?')) return;
    setName('');
    setDescription('');
    setDirty(false);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div
        className="bg-surface border border-surface-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4"
        onClick={e => e.stopPropagation()}
        data-testid="create-role-modal"
      >
        <div className="flex items-center justify-between pb-3 border-b border-surface-border">
          <h2 className="text-base font-bold text-ink flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span>Tạo Vai Trò RBAC (Role) Mới</span>
          </h2>
          <button onClick={handleClose} className="text-ink-muted hover:text-ink text-xs">✕</button>
        </div>

        {error && (
          <div
            className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400"
            data-testid="create-role-error"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Tên Vai Trò (Role Name) *</label>
            <input
              value={name}
              onChange={e => {
                setName(e.target.value);
                setDirty(true);
              }}
              className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-sm text-ink focus:outline-none focus:border-emerald-400"
              placeholder="Ví dụ: release-manager"
              required
              data-testid="create-role-name"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Mô Tả Vai Trò</label>
            <textarea
              value={description}
              onChange={e => {
                setDescription(e.target.value);
                setDirty(true);
              }}
              className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-emerald-400"
              rows={3}
              placeholder="Quyền hạn được cấp cho vai trò này..."
              data-testid="create-role-description"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-ghost text-xs flex-1"
              data-testid="create-role-cancel"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="btn btn-primary text-xs font-semibold flex-1 rounded-xl disabled:opacity-50"
              data-testid="create-role-submit"
            >
              {submitting ? 'Đang tạo…' : 'Tạo Role Mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RolesPage() {
  const me = useAuthMe();
  const qc = useQueryClient();
  const rolesQuery = useQuery<AuthRole[], Error>({
    queryKey: ['auth', 'roles'],
    queryFn: authListRoles,
    staleTime: STALE_TIME.REFERENCE,
  });

  const [createOpen, setCreateOpen] = useState(false);

  const canCreate = me.hasPerm('auth.role.create') || me.isAdmin();

  if (rolesQuery.isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <PageHeader title="Roles" subtitle="Loading…" />
      </div>
    );
  }

  if (rolesQuery.error) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <PageHeader title="Roles" />
        <ErrorState
          error={rolesQuery.error}
          onRetry={() => qc.invalidateQueries({ queryKey: ['auth', 'roles'] })}
        />
      </div>
    );
  }

  const roles = rolesQuery.data ?? [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6" data-testid="roles-page">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-5 rounded-2xl border border-surface-border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink flex items-center gap-2">
              Quản Lý Vai Trò (Roles RBAC)
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold font-mono">
                {roles.length} roles
              </span>
            </h1>
            <p className="text-xs text-ink-muted mt-0.5">
              Phân quyền truy cập hệ thống theo mô hình RBAC — Mỗi API key & Tài khoản sở hữu 1 hoặc nhiều roles
            </p>
          </div>
        </div>

        {canCreate && (
          <button
            className="btn btn-primary text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/10"
            onClick={() => setCreateOpen(true)}
            data-testid="roles-create-button"
          >
            <Plus className="w-4 h-4" />
            <span>Create role</span>
          </button>
        )}
      </div>

      {/* Roles List */}
      {roles.length === 0 ? (
        <div
          className="bg-surface border border-surface-border rounded-2xl p-8 text-center text-xs text-ink-muted shadow-sm"
          data-testid="roles-empty"
        >
          No roles. Bundle 1 seeds 7 default roles on first migration; if this list is empty,
          the migration may not have applied. Check `migrations/000029_rbac.up.sql`.
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-surface-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="roles-table">
              <thead>
                <tr className="border-b border-surface-border bg-surface-muted text-xs font-semibold text-ink-muted uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Role ID</th>
                  <th className="text-left px-4 py-3">Tên Vai Trò (Role Name)</th>
                  <th className="text-left px-4 py-3">Mô Tả Chức Năng</th>
                  <th className="text-right px-4 py-3">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/50">
                {roles.map(role => (
                  <tr key={role.id} className="transition-colors hover:bg-surface-muted/60">
                    <td className="px-4 py-3 font-mono text-xs text-ink-faint">
                      <code className="bg-surface-muted px-2 py-0.5 rounded border border-surface-border">
                        {role.id}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/auth/roles/${role.id}`}
                        className="font-bold text-ink hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                        data-testid={`roles-link-${role.id}`}
                      >
                        <Lock className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{role.name}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-muted">
                      {role.description || <span className="text-ink-faint italic">Không có mô tả</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/auth/roles/${role.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        <span>Chi tiết & Phân quyền</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <CreateRoleModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => {
          setCreateOpen(false);
          qc.invalidateQueries({ queryKey: ['auth', 'roles'] });
        }}
      />
    </div>
  );
}
