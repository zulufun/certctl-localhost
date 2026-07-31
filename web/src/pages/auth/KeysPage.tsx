import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  KeyRound,
  ShieldCheck,
  Plus,
  X,
  Search,
  Filter,
  UserCheck,
  Server,
  Lock,
  Calendar,
} from 'lucide-react';
import {
  authListKeys,
  authListRoles,
  authAssignKeyRole,
  authRevokeKeyRole,
  type AuthKeyEntry,
  type AuthRole,
} from '../../api/client';
import { useAuthMe } from '../../hooks/useAuthMe';
import PageHeader from '../../components/PageHeader';
import ErrorState from '../../components/ErrorState';
import ConfirmDialog from '../../components/ConfirmDialog';
import { STALE_TIME } from '../../api/queryConstants';

const DEMO_ANON = 'actor-demo-anon';

export default function KeysPage() {
  const me = useAuthMe();
  const qc = useQueryClient();

  const keysQuery = useQuery<AuthKeyEntry[], Error>({
    queryKey: ['auth', 'keys'],
    queryFn: authListKeys,
    staleTime: STALE_TIME.REAL_TIME,
  });
  const rolesQuery = useQuery<AuthRole[], Error>({
    queryKey: ['auth', 'roles'],
    queryFn: authListRoles,
    staleTime: STALE_TIME.REFERENCE,
  });

  const [assignTarget, setAssignTarget] = useState<AuthKeyEntry | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState<
    { entry: AuthKeyEntry; roleID: string } | null
  >(null);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const canAssign = me.hasPerm('auth.role.assign') || me.isAdmin();
  const canRevoke = me.hasPerm('auth.role.assign') || me.isAdmin();

  const handleRevoke = (entry: AuthKeyEntry, roleID: string) => {
    if (entry.actor_id === DEMO_ANON) return;
    setConfirmRevoke({ entry, roleID });
  };

  const performRevoke = async () => {
    if (!confirmRevoke) return;
    const { entry, roleID } = confirmRevoke;
    setConfirmRevoke(null);
    setBusy(true);
    setActionError(null);
    try {
      await authRevokeKeyRole(entry.actor_id, roleID);
      toast.success(`Đã thu hồi vai trò ${roleID} từ ${entry.actor_id}`);
      qc.invalidateQueries({ queryKey: ['auth', 'keys'] });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setActionError(msg);
      toast.error(`Lỗi khi thu hồi vai trò: ${msg}`);
    } finally {
      setBusy(false);
    }
  };

  if (keysQuery.isLoading) return <PageHeader title="API keys" subtitle="Loading…" />;
  if (keysQuery.error) {
    return (
      <div className="space-y-4">
        <PageHeader title="API keys" />
        <ErrorState
          error={keysQuery.error}
          onRetry={() => qc.invalidateQueries({ queryKey: ['auth', 'keys'] })}
        />
      </div>
    );
  }

  const keys = keysQuery.data ?? [];
  const totalRolesGranted = keys.reduce((acc, k) => acc + (k.role_ids?.length || 0), 0);
  const systemManagedCount = keys.filter(k => k.actor_id === DEMO_ANON).length;

  const filteredKeys = keys.filter(k => {
    const matchesSearch = k.actor_id.toLowerCase().includes(search.toLowerCase()) || k.actor_type.toLowerCase().includes(search.toLowerCase());
    const matchesType = !typeFilter || k.actor_type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex-1 overflow-y-auto space-y-6 p-6" data-testid="keys-page">
      <PageHeader
        title="Quản Lý API Keys"
        subtitle="Quản lý danh sách API Key, ủy quyền và phân bổ vai trò (roles & permissions) cho các tác nhân truy cập hệ thống."
      />

      {actionError && (
        <div
          className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-red-400 font-medium"
          data-testid="keys-action-error"
        >
          {actionError}
        </div>
      )}

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface p-4 rounded-2xl border border-surface-border flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs font-semibold text-ink-muted flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-emerald-400" />
              <span>Tổng Số API Keys</span>
            </div>
            <div className="text-2xl font-bold text-ink mt-1 font-mono">{keys.length}</div>
          </div>
          <div className="p-3 rounded-xl bg-surface-muted border border-surface-border text-emerald-400">
            <KeyRound className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface p-4 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 to-transparent flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Tổng Vai Trò Đã Phân Bổ</span>
            </div>
            <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">{totalRolesGranted}</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface p-4 rounded-2xl border border-surface-border flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs font-semibold text-ink-muted flex items-center gap-1.5">
              <Server className="w-4 h-4 text-blue-400" />
              <span>Tài Khoản Tự Quản Hệ Thống</span>
            </div>
            <div className="text-2xl font-bold text-blue-400 mt-1 font-mono">{systemManagedCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Server className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface p-4 rounded-2xl border border-surface-border shadow-sm">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm Actor ID hoặc Loại Actor..."
              className="w-full bg-surface-muted border border-surface-border rounded-xl pl-9 pr-3 py-1.5 text-xs text-ink focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-400" />
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="bg-surface-muted border border-surface-border rounded-xl px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-emerald-400"
            >
              <option value="">Tất cả loại Actor</option>
              <option value="APIKey">APIKey</option>
              <option value="Anonymous">Anonymous</option>
              <option value="User">User</option>
            </select>
          </div>
        </div>
      </div>

      {keys.length === 0 ? (
        <div
          className="bg-surface border border-surface-border rounded-2xl p-8 text-center text-xs text-ink-muted shadow-sm"
          data-testid="keys-empty"
        >
          No API keys with role grants yet. Configure CERTCTL_API_KEYS_NAMED or run the bootstrap flow to mint one.
        </div>
      ) : (
        <div className="bg-surface border border-surface-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs" data-testid="keys-table">
              <thead className="bg-surface-muted/70 text-[11px] font-semibold text-ink-muted uppercase tracking-wider border-b border-surface-border">
                <tr>
                  <th className="text-center px-4 py-3 w-12">STT</th>
                  <th className="text-left px-4 py-3">Actor ID (Khóa API)</th>
                  <th className="text-left px-4 py-3">Loại Actor</th>
                  <th className="text-left px-4 py-3">Danh Sách Vai Trò (Roles)</th>
                  <th className="text-right px-4 py-3 w-36">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/50">
                {filteredKeys.map((k, idx) => {
                  const isDemo = k.actor_id === DEMO_ANON;
                  return (
                    <tr key={k.actor_id} className="hover:bg-surface-muted/50 transition-colors align-middle">
                      <td className="px-4 py-3 text-center font-mono font-semibold text-ink-muted">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <KeyRound className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="font-mono font-bold text-ink text-xs">{k.actor_id}</span>
                          {isDemo && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              (system-managed)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-muted text-ink-muted border border-surface-border">
                          {k.actor_type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {k.role_ids.map(r => (
                            <span
                              key={r}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              data-testid={`keys-role-tag-${k.actor_id}-${r}`}
                            >
                              <ShieldCheck className="w-3 h-3 text-emerald-400" />
                              <span>{r}</span>
                              {canRevoke && !isDemo && (
                                <button
                                  className="text-emerald-400/60 hover:text-red-400 hover:bg-red-500/20 rounded p-0.5 transition-colors"
                                  onClick={() => handleRevoke(k, r)}
                                  disabled={busy}
                                  data-testid={`keys-revoke-${k.actor_id}-${r}`}
                                  title={`Thu hồi vai trò ${r}`}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {canAssign && !isDemo && (
                          <button
                            className="btn btn-ghost text-xs font-semibold px-3 py-1.5 rounded-xl text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5 ml-auto"
                            onClick={() => setAssignTarget(k)}
                            data-testid={`keys-assign-${k.actor_id}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Assign role</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {assignTarget && (
        <AssignRoleModal
          actor={assignTarget}
          roles={rolesQuery.data ?? []}
          onClose={() => setAssignTarget(null)}
          onSuccess={() => {
            setAssignTarget(null);
            qc.invalidateQueries({ queryKey: ['auth', 'keys'] });
          }}
        />
      )}

      <ConfirmDialog
        open={confirmRevoke !== null}
        title="Revoke role grant"
        message={
          confirmRevoke
            ? `Revoke ${confirmRevoke.roleID} from ${confirmRevoke.entry.actor_id}? The actor will lose every permission scoped to that role on the next request.`
            : ''
        }
        confirmLabel="Revoke"
        destructive
        onConfirm={performRevoke}
        onCancel={() => setConfirmRevoke(null)}
      />
    </div>
  );
}

interface AssignProps {
  actor: AuthKeyEntry;
  roles: AuthRole[];
  onClose: () => void;
  onSuccess: () => void;
}

function AssignRoleModal({ actor, roles, onClose, onSuccess }: AssignProps) {
  const [roleID, setRoleID] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scopeType, setScopeType] = useState<'global' | 'profile' | 'issuer'>('global');
  const [scopeID, setScopeID] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleID) return;
    if (scopeType !== 'global' && !scopeID.trim()) {
      setError(`scope_id is required when scope_type is ${scopeType}`);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const expiry = expiresAt ? `${expiresAt}:00Z` : undefined;
      await authAssignKeyRole(actor.actor_id, roleID, {
        scope_type: scopeType,
        scope_id: scopeType === 'global' ? undefined : scopeID.trim(),
        expires_at: expiry,
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-surface border border-surface-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4"
        onClick={e => e.stopPropagation()}
        data-testid="assign-role-modal"
      >
        <div className="flex items-center justify-between pb-3 border-b border-surface-border">
          <div className="flex items-center gap-2 font-bold text-sm text-ink">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Gán Vai Trò (Assign Role)</span>
          </div>
          <button onClick={onClose} className="text-ink-muted hover:text-ink text-xs p-1" data-testid="assign-role-cancel">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs text-ink-muted">
          Tác nhân: <span className="font-mono font-bold text-ink">{actor.actor_id}</span>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-ink mb-1">Chọn Vai Trò (Role) *</label>
            <select
              value={roleID}
              onChange={e => setRoleID(e.target.value)}
              className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-emerald-400"
              required
              data-testid="assign-role-select"
            >
              <option value="">Select a role…</option>
              {roles
                .filter(r => !actor.role_ids.includes(r.id))
                .map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.id})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-ink mb-1">Phạm Vi Áp Dụng (Scope)</label>
            <select
              value={scopeType}
              onChange={(e) => setScopeType(e.target.value as 'global' | 'profile' | 'issuer')}
              className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-emerald-400"
              data-testid="assign-role-scope-type"
            >
              <option value="global">Global (Toàn hệ thống - no scope)</option>
              <option value="profile">Per profile (Theo Hồ sơ cấu hình)</option>
              <option value="issuer">Per issuer (Theo Nhà cấp phát)</option>
            </select>
          </div>

          {scopeType !== 'global' && (
            <div>
              <label className="block font-semibold text-ink mb-1">
                Mã Phạm Vi ({scopeType}) *
              </label>
              <input
                type="text"
                value={scopeID}
                onChange={(e) => setScopeID(e.target.value)}
                placeholder={scopeType === 'profile' ? 'p-acme-corp' : 'iss-internal-pki'}
                className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-emerald-400"
                data-testid="assign-role-scope-id"
                required
              />
            </div>
          )}

          <div>
            <label className="block font-semibold text-ink mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Thời Gian Hết Hạn (Expires at - Optional UTC)</span>
            </label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-emerald-400"
              data-testid="assign-role-expires-at"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-surface-border">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost text-xs px-4 py-2 rounded-xl"
              data-testid="assign-role-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy || !roleID}
              className="btn btn-primary text-xs font-semibold px-4 py-2 rounded-xl disabled:opacity-50"
              data-testid="assign-role-submit"
            >
              {busy ? 'Assigning…' : 'Assign Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
