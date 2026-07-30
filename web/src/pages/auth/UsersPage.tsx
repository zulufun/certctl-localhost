import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  UserPlus,
  Search,
  Shield,
  Key,
  UserX,
  UserCheck,
  Lock,
  Mail,
  User as UserIcon,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  authListUsers,
  authDeactivateUser,
  authReactivateUser,
  authCreateUser,
  authUpdatePassword,
  type AuthUser,
} from '../../api/client';
import { useAuthMe } from '../../hooks/useAuthMe';
import { useAuth } from '../../components/AuthProvider';
import PageHeader from '../../components/PageHeader';
import ErrorState from '../../components/ErrorState';
import { STALE_TIME } from '../../api/queryConstants';
import { toast } from 'sonner';

export default function UsersPage() {
  const qc = useQueryClient();
  const { user: currentUser } = useAuth();
  const { isAdmin } = useAuthMe();
  const [providerFilter, setProviderFilter] = useState('');
  const [pending, setPending] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [changePwdId, setChangePwdId] = useState<string | null>(null);
  const [changePwdValue, setChangePwdValue] = useState('');

  const usersQuery = useQuery<AuthUser[], Error>({
    queryKey: ['auth', 'users', providerFilter],
    queryFn: () => authListUsers(providerFilter || undefined),
    staleTime: STALE_TIME.REAL_TIME,
  });

  async function deactivate(u: AuthUser) {
    if (!confirm(`Deactivate user ${u.email} (${u.id})?\n\n` +
      `This sets deactivated_at on the row and revokes every active session.\n` +
      `The row is preserved (audit trail) — a future login under the same OIDC subject will fail.`)) {
      return;
    }
    setPending(u.id);
    setErr(null);
    try {
      await authDeactivateUser(u.id);
      await qc.invalidateQueries({ queryKey: ['auth', 'users'] });
      toast.success(`Đã vô hiệu hóa tài khoản ${u.email}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setPending(null);
    }
  }

  async function reactivate(u: AuthUser) {
    if (!confirm(`Reactivate user ${u.email} (${u.id})?\n\n` +
      `This clears deactivated_at. The user can OIDC-login again. ` +
      `Previously-revoked sessions stay revoked.`)) {
      return;
    }
    setPending(u.id);
    setErr(null);
    try {
      await authReactivateUser(u.id);
      await qc.invalidateQueries({ queryKey: ['auth', 'users'] });
      toast.success(`Đã kích hoạt lại tài khoản ${u.email}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setPending(null);
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      await authCreateUser(newEmail, newName, newPassword);
      setShowCreate(false);
      setNewEmail('');
      setNewName('');
      setNewPassword('');
      await qc.invalidateQueries({ queryKey: ['auth', 'users'] });
      toast.success(`Đã tạo người dùng ${newEmail} thành công!`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  }

  async function handleChangePassword(id: string) {
    if (!changePwdValue) return;
    setErr(null);
    try {
      await authUpdatePassword(id, changePwdValue);
      setChangePwdId(null);
      setChangePwdValue('');
      toast.success('Đổi mật khẩu thành công!');
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  }

  const usersList = usersQuery.data || [];
  const activeCount = usersList.filter(u => !u.deactivated_at).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-5 rounded-2xl border border-surface-border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink flex items-center gap-2">
              Người Dùng System (Users)
              {usersQuery.data && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                  {activeCount} active
                </span>
              )}
            </h1>
            <p className="text-xs text-ink-muted mt-0.5">
              Quản lý danh sách tài khoản cục bộ & liên kết định danh (OIDC Keycloak / Okta)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="op-keycloak (để trống để xem tất cả)"
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="bg-surface-muted border border-surface-border rounded-xl pl-9 pr-3 py-1.5 text-xs text-ink focus:outline-none focus:border-emerald-400 w-64"
            />
          </div>

          {isAdmin() && (
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="btn btn-primary text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/10"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Tạo người dùng</span>
            </button>
          )}
        </div>
      </div>

      {/* Modal / Form Create User */}
      {showCreate && isAdmin() && (
        <div className="bg-surface border border-emerald-500/30 rounded-2xl p-5 shadow-xl transition-all">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-surface-border">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Tạo Người Dùng Cục Bộ Mới</span>
            </div>
            <button onClick={() => setShowCreate(false)} className="text-ink-muted hover:text-ink text-xs">
              ✕ Đóng
            </button>
          </div>

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-ink-muted block mb-1">Email *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="user@example.com"
                    required
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    className="w-full bg-surface-muted border border-surface-border rounded-xl pl-9 pr-3 py-2 text-sm text-ink focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-ink-muted block mb-1">Tên Hiển Thị *</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    required
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full bg-surface-muted border border-surface-border rounded-xl pl-9 pr-3 py-2 text-sm text-ink focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-ink-muted block mb-1">Mật Khẩu *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full bg-surface-muted border border-surface-border rounded-xl pl-9 pr-3 py-2 text-sm text-ink focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowCreate(false)} className="btn btn-ghost text-xs">
                Hủy
              </button>
              <button type="submit" className="btn btn-primary text-xs font-semibold px-4 py-2 rounded-xl">
                Tạo mới
              </button>
            </div>
          </form>
        </div>
      )}

      {err && <ErrorState message={err} />}
      {usersQuery.isLoading && (
        <div className="p-8 text-center text-ink-muted text-sm flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 animate-spin text-emerald-400" />
          <span>Loading users…</span>
        </div>
      )}
      {usersQuery.error && <ErrorState message={usersQuery.error.message} />}

      {/* Users Table */}
      {usersQuery.data && (
        <div className="bg-surface rounded-2xl border border-surface-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border bg-surface-muted text-xs font-semibold text-ink-muted uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Người Dùng / Email</th>
                  <th className="px-4 py-3 text-left">ID User</th>
                  <th className="px-4 py-3 text-left">OIDC Provider</th>
                  <th className="px-4 py-3 text-left">Đăng Nhập Cuối</th>
                  <th className="px-4 py-3 text-left">Trạng Thái</th>
                  <th className="px-4 py-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/50">
                {usersQuery.data.map((u) => {
                  const deactivated = Boolean(u.deactivated_at);
                  const isSelf = currentUser === u.id;
                  const initial = (u.display_name || u.email || 'U').charAt(0).toUpperCase();

                  return (
                    <tr
                      key={u.id}
                      className={`transition-colors hover:bg-surface-muted/60 ${
                        deactivated ? 'opacity-50 bg-red-950/10' : ''
                      }`}
                    >
                      {/* User Avatar + Email + Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 text-sm shadow-sm">
                            {initial}
                          </div>
                          <div>
                            <div className="font-semibold text-ink flex items-center gap-1.5">
                              <span>{u.display_name}</span>
                              {isSelf && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-ink-muted font-mono">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* ID */}
                      <td className="px-4 py-3">
                        <code className="text-xs font-mono text-ink-faint bg-surface-muted px-2 py-0.5 rounded border border-surface-border">
                          {u.id}
                        </code>
                      </td>

                      {/* Provider */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono bg-surface-muted border border-surface-border text-ink">
                          <Shield className="w-3 h-3 text-emerald-400" />
                          <code>{u.oidc_provider_id || 'local'}</code>
                        </span>
                      </td>

                      {/* Last Login */}
                      <td className="px-4 py-3 text-xs text-ink-muted font-mono">
                        {u.last_login_at || 'Chưa đăng nhập'}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        {deactivated ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/30">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Deactivated {u.deactivated_at}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Active</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isAdmin() && !deactivated && (
                            <button
                              type="button"
                              onClick={() => deactivate(u)}
                              disabled={pending === u.id}
                              className="px-2.5 py-1 text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors flex items-center gap-1"
                              aria-label="Deactivate"
                            >
                              <UserX className="w-3.5 h-3.5" />
                              <span>{pending === u.id ? 'Đang vô hiệu hóa…' : 'Vô hiệu hóa'}</span>
                            </button>
                          )}

                          {isAdmin() && deactivated && (
                            <button
                              type="button"
                              onClick={() => reactivate(u)}
                              disabled={pending === u.id}
                              className="px-2.5 py-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg transition-colors flex items-center gap-1"
                              aria-label="Reactivate"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>{pending === u.id ? 'Đang kích hoạt lại…' : 'Kích hoạt lại'}</span>
                            </button>
                          )}

                          {(isAdmin() || currentUser === u.id) && (
                            <>
                              {changePwdId === u.id ? (
                                <div className="flex items-center gap-1.5 bg-surface-muted p-1 rounded-xl border border-surface-border">
                                  <input
                                    type="password"
                                    placeholder="Mật khẩu mới"
                                    className="bg-surface border border-surface-border px-2 py-1 text-xs text-ink rounded-lg focus:outline-none focus:border-emerald-400 w-28"
                                    value={changePwdValue}
                                    onChange={e => setChangePwdValue(e.target.value)}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleChangePassword(u.id)}
                                    className="btn btn-primary text-[11px] px-2 py-1 rounded-lg"
                                  >
                                    Lưu
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setChangePwdId(null)}
                                    className="btn btn-ghost text-[11px] px-2 py-1 rounded-lg"
                                  >
                                    Hủy
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setChangePwdId(u.id)}
                                  className="px-2.5 py-1 text-xs font-medium text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-lg transition-colors flex items-center gap-1"
                                >
                                  <Key className="w-3.5 h-3.5" />
                                  <span>Đổi mật khẩu</span>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {usersList.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-ink-muted text-xs">
                      No users matching filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
