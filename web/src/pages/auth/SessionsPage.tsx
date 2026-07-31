import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, User, Users, Search, Trash2, Clock, Globe, Shield } from 'lucide-react';
import { listSessions, revokeSession, type SessionInfo } from '../../api/client';
import { useAuthMe } from '../../hooks/useAuthMe';
import PageHeader from '../../components/PageHeader';
import Timestamp from '../../components/Timestamp';
import ErrorState from '../../components/ErrorState';

type ViewMode = 'self' | 'all';

export default function SessionsPage() {
  const { data: me, hasPerm } = useAuthMe();
  const queryClient = useQueryClient();

  const canList = hasPerm('auth.session.list');
  const canListAll = hasPerm('auth.session.list.all');
  const canRevokeAny = hasPerm('auth.session.revoke');

  const [view, setView] = useState<ViewMode>('self');
  const [filterActorID, setFilterActorID] = useState('');
  const [error, setError] = useState<string | null>(null);

  const effectiveActorID = view === 'all' ? filterActorID.trim() : '';

  const { data, isLoading, error: loadErr } = useQuery({
    queryKey: ['sessions', view, effectiveActorID],
    queryFn: () =>
      effectiveActorID ? listSessions(effectiveActorID, 'User') : listSessions(),
    enabled: canList,
  });

  if (!canList) {
    return (
      <>
        <PageHeader title="Sessions" subtitle="Quản lý các phiên hoạt động trên hệ thống" />
        <div className="p-6">
          <ErrorState error={new Error('You need the auth.session.list permission to view sessions.')} />
        </div>
      </>
    );
  }

  const handleRevoke = async (s: SessionInfo) => {
    if (!window.confirm(`Revoke session ${s.id} for ${s.actor_id}? They will be logged out.`)) return;
    try {
      await revokeSession(s.id);
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const callerActorID = me?.actor_id || '';

  return (
    <>
      <PageHeader title="Sessions" subtitle="Quản lý các phiên hoạt động và đăng xuất tài khoản khẩn cấp" />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {error && (
          <div
            className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-medium"
            data-testid="sessions-page-error"
          >
            {error}
          </div>
        )}

        {/* View Controls & Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-surface p-4 rounded-2xl border border-surface-border shadow-sm">
          <div className="flex items-center gap-1.5 p-1 bg-surface-muted border border-surface-border rounded-xl">
            <button
              onClick={() => setView('self')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                view === 'self'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-ink-muted hover:text-ink'
              }`}
              data-testid="sessions-view-self"
            >
              <User className="w-3.5 h-3.5" />
              <span>My sessions</span>
            </button>
            {canListAll && (
              <button
                onClick={() => setView('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  view === 'all'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-ink-muted hover:text-ink'
                }`}
                data-testid="sessions-view-all"
              >
                <Users className="w-3.5 h-3.5" />
                <span>All actors (admin)</span>
              </button>
            )}
          </div>

          {view === 'all' && (
            <div className="flex-1 max-w-sm relative">
              <Search className="w-4 h-4 text-ink-faint absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={filterActorID}
                onChange={e => setFilterActorID(e.target.value)}
                placeholder="Lọc theo actor_id (ví dụ: u-alice)..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-surface-border rounded-xl bg-surface-muted text-ink font-mono focus:outline-none focus:border-emerald-400"
                data-testid="sessions-actor-id-filter"
              />
            </div>
          )}
        </div>

        {isLoading && (
          <div className="p-8 text-center text-xs text-ink-muted" data-testid="sessions-loading">
            Loading active sessions…
          </div>
        )}
        {loadErr && <ErrorState error={loadErr instanceof Error ? loadErr : new Error(String(loadErr))} />}

        {data && data.sessions && data.sessions.length === 0 && (
          <div
            className="bg-surface border border-surface-border rounded-2xl p-12 text-center shadow-sm"
            data-testid="sessions-empty"
          >
            <ShieldCheck className="w-10 h-10 text-ink-faint mx-auto mb-2 opacity-50" />
            <p className="text-ink-muted text-xs">Không có phiên làm việc nào đang hoạt động (No active sessions).</p>
          </div>
        )}

        {data && data.sessions && data.sessions.length > 0 && (
          <div className="bg-surface border border-surface-border rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-surface-muted/50 text-ink-muted text-[10px] uppercase tracking-wider border-b border-surface-border">
                  <tr>
                    <th className="text-left px-4 py-3">Session ID</th>
                    <th className="text-left px-4 py-3">Actor</th>
                    <th className="text-left px-4 py-3">Địa Chỉ IP</th>
                    <th className="text-left px-4 py-3">Lần Cuối Hoạt Động (Last Seen)</th>
                    <th className="text-left px-4 py-3">Thời Gian Hết Hạn (Expiry)</th>
                    <th className="text-right px-4 py-3">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/50">
                  {data.sessions.map((s: SessionInfo) => {
                    const isOwn = s.actor_id === callerActorID;
                    const showRevoke = isOwn || canRevokeAny;
                    return (
                      <tr
                        key={s.id}
                        className="hover:bg-surface-muted/40 transition-colors"
                        data-testid={`session-row-${s.id}`}
                      >
                        <td className="px-4 py-3 font-mono text-[11px] font-semibold text-emerald-400">{s.id}</td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-ink font-bold">{s.actor_id}</span>
                          <span className="ml-1 text-ink-muted text-[10px]">({s.actor_type})</span>
                          {isOwn && (
                            <span
                              className="ml-2 inline-flex items-center px-2 py-0.5 text-[10px] rounded-full font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              data-testid={`session-self-pill-${s.id}`}
                            >
                              you
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-ink-muted">{s.ip_address || '—'}</td>
                        <td className="px-4 py-3 text-ink-muted font-mono">
                          <Timestamp iso={s.last_seen_at} />
                        </td>
                        <td className="px-4 py-3 text-ink-muted font-mono">
                          <Timestamp iso={s.absolute_expires_at} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          {showRevoke && (
                            <button
                              onClick={() => handleRevoke(s)}
                              className="px-2.5 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors font-semibold inline-flex items-center gap-1"
                              data-testid={`session-revoke-${s.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Revoke</span>
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
      </div>
    </>
  );
}
