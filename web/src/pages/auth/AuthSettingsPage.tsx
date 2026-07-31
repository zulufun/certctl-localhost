import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  UserCheck,
  Shield,
  Key,
  Clock,
  Terminal,
  Settings2,
  CheckCircle2,
  Lock,
  ChevronDown,
  Globe,
} from 'lucide-react';
import { authBootstrapAvailable, authRuntimeConfig } from '../../api/client';
import { useAuthMe } from '../../hooks/useAuthMe';
import PageHeader from '../../components/PageHeader';
import { STALE_TIME } from '../../api/queryConstants';
import { getTimestampPref, setTimestampPref, type TimestampMode } from '../../api/timestampPref';

export default function AuthSettingsPage() {
  const me = useAuthMe();
  const bootstrapQuery = useQuery({
    queryKey: ['auth', 'bootstrap', 'available'],
    queryFn: authBootstrapAvailable,
    staleTime: STALE_TIME.REFERENCE,
    retry: 0,
  });

  const runtimeQuery = useQuery({
    queryKey: ['auth', 'runtime-config'],
    queryFn: authRuntimeConfig,
    staleTime: STALE_TIME.REFERENCE,
    retry: 0,
  });

  return (
    <>
      <PageHeader
        title="Cài đặt xác thực"
        subtitle="Quản lý cài đặt định danh, trạng thái hệ thống và quyền truy cập."
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6" data-testid="auth-settings-page">
        {/* Current Identity Card */}
        <section className="bg-surface border border-surface-border rounded-2xl shadow-sm overflow-hidden">
          <header className="px-5 py-4 border-b border-surface-border bg-surface-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold text-ink">Current Identity (Định Danh Hiện Tại)</h3>
                <p className="text-[11px] text-ink-muted">Trạng thái được xác thực từ endpoint /api/v1/auth/me</p>
              </div>
            </div>
            {me.data?.admin && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                <Shield className="w-3 h-3 text-purple-400" />
                <span>Global Admin</span>
              </span>
            )}
          </header>

          <div className="p-5 text-xs space-y-4" data-testid="auth-settings-identity">
            {me.isLoading && <div className="text-ink-muted">Loading identity information…</div>}
            {me.error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">{me.error.message}</div>}
            {me.data && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-surface-muted/50 p-3.5 rounded-xl border border-surface-border space-y-1">
                  <div className="text-ink-muted font-medium">Actor ID / Loại Định Danh</div>
                  <div className="font-mono text-sm font-bold text-ink truncate">{me.data.actor_id}</div>
                  <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-surface border border-surface-border text-ink-muted font-mono">{me.data.actor_type}</span>
                </div>

                <div className="bg-surface-muted/50 p-3.5 rounded-xl border border-surface-border space-y-1">
                  <div className="text-ink-muted font-medium">Tenant ID</div>
                  <div className="font-mono text-sm font-bold text-ink truncate">{me.data.tenant_id}</div>
                </div>

                <div className="bg-surface-muted/50 p-3.5 rounded-xl border border-surface-border space-y-1">
                  <div className="text-ink-muted font-medium">Quyền Admin / Roles</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-ink">Admin:</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${me.data.admin ? 'bg-emerald-500/15 text-emerald-400' : 'bg-surface-muted text-ink-muted'}`} data-testid="auth-settings-admin">
                      {me.data.admin ? 'yes' : 'no'}
                    </span>
                  </div>
                  <div className="text-xs text-ink-muted truncate">
                    Roles: <span className="font-mono text-ink font-bold" data-testid="auth-settings-roles">{me.data.roles.join(', ') || '(none)'}</span>
                  </div>
                </div>

                <div className="bg-surface-muted/50 p-3.5 rounded-xl border border-surface-border md:col-span-2 lg:col-span-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-ink-muted font-medium flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-emerald-400" />
                      <span>Tổng Quyền Thực Thi (Effective Permissions):</span>
                      <span className="font-bold text-emerald-400 font-mono text-sm" data-testid="auth-settings-permcount">{me.data.effective_permissions.length}</span>
                    </div>
                  </div>

                  {me.data.effective_permissions.length > 0 && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-emerald-400 font-semibold hover:underline inline-flex items-center gap-1">
                        <span>Hiển thị danh sách quyền chi tiết</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </summary>
                      <div className="mt-3 p-3 bg-surface rounded-xl border border-surface-border max-h-48 overflow-y-auto">
                        <ul className="space-y-1">
                          {me.data.effective_permissions.map((p, i) => (
                            <li key={i} className="font-mono text-[11px] text-ink-muted flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span className="text-ink font-semibold">{p.permission}</span>
                              <span>@ {p.scope_type}</span>
                              {p.scope_id && <span className="text-ink-faint">({p.scope_id})</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </details>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Bootstrap Endpoint Status Card */}
        <section className="bg-surface border border-surface-border rounded-2xl shadow-sm overflow-hidden">
          <header className="px-5 py-4 border-b border-surface-border bg-surface-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-bold text-ink">Bootstrap Endpoint Status</h3>
                <p className="text-[11px] text-ink-muted">Tạo API Key Admin đầu tiên khi mới triển khai hệ thống</p>
              </div>
            </div>
          </header>

          <div className="p-5 text-xs space-y-3" data-testid="auth-settings-bootstrap">
            {bootstrapQuery.isLoading && <div className="text-ink-muted">Probing bootstrap status…</div>}
            {bootstrapQuery.error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
                Could not reach /v1/auth/bootstrap: {bootstrapQuery.error.message}
              </div>
            )}
            {bootstrapQuery.data && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-ink-muted font-medium">Trạng Thái (Status):</span>
                  <span
                    className={`px-3 py-1 rounded-full font-bold text-xs ${
                      bootstrapQuery.data.available
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : 'bg-surface-muted text-ink-muted border border-surface-border'
                    }`}
                    data-testid="auth-settings-bootstrap-status"
                  >
                    {bootstrapQuery.data.available ? 'OPEN — first-admin path callable' : 'closed'}
                  </span>
                </div>

                {bootstrapQuery.data.available && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 font-mono text-[11px]">
                    Lệnh mint admin: <code>curl -X POST $URL/api/v1/auth/bootstrap -d &apos;{'{'}&quot;token&quot;:&quot;…&quot;,&quot;actor_name&quot;:&quot;first-admin&quot;{'}'}&apos;</code>
                  </div>
                )}
                {!bootstrapQuery.data.available && (
                  <p className="text-ink-muted">
                    Endpoint đã đóng. Hoặc CERTCTL_BOOTSTRAP_TOKEN chưa được thiết lập, hoặc tài khoản admin đầu tiên đã được tạo.
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Auth Runtime Config Panel */}
        {runtimeQuery.data && (
          <section className="bg-surface border border-surface-border rounded-2xl shadow-sm overflow-hidden" data-testid="auth-settings-runtime-config">
            <header className="px-5 py-4 border-b border-surface-border bg-surface-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-ink">Auth Runtime Config</h3>
                  <p className="text-[11px] text-ink-muted">Cấu hình biến môi trường CERTCTL_* khi vận hành</p>
                </div>
              </div>
            </header>

            <div className="p-5 overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead className="bg-surface-muted text-ink-muted text-left uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2 px-3 rounded-l-lg">Setting (Biến Môi Trường)</th>
                    <th className="py-2 px-3 rounded-r-lg">Value (Giá Trị)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/50">
                  {Object.entries(runtimeQuery.data)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([k, v]) => (
                      <tr key={k} className="hover:bg-surface-muted/40 transition-colors">
                        <td className="py-2 px-3 font-semibold text-emerald-400">{k}</td>
                        <td className="py-2 px-3 text-ink-muted">{v || <span className="text-ink-faint font-normal italic">(empty)</span>}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Timestamp Preference Card */}
        <TimestampPreferenceCard />
      </div>
    </>
  );
}

function TimestampPreferenceCard() {
  const [mode, setMode] = useState<TimestampMode>(() => getTimestampPref().mode);
  const [customTz, setCustomTz] = useState<string>(() => getTimestampPref().customTz);

  function persist(next: { mode: TimestampMode; customTz: string }) {
    setMode(next.mode);
    setCustomTz(next.customTz);
    setTimestampPref(next);
  }

  return (
    <section className="bg-surface border border-surface-border rounded-2xl shadow-sm overflow-hidden" data-testid="timestamp-pref-card">
      <header className="px-5 py-4 border-b border-surface-border bg-surface-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-ink">Định Dạng Múi Giờ Hiển Thị (Timestamp Display)</h3>
            <p className="text-[11px] text-ink-muted">Tùy chọn hiển thị thời gian theo UTC, múi giờ trình duyệt hoặc múi giờ IANA tùy chỉnh</p>
          </div>
        </div>
      </header>

      <div className="p-5 text-xs space-y-4">
        <div className="flex items-center gap-6">
          {(['utc', 'local', 'custom'] as const).map((m) => (
            <label key={m} className="flex items-center gap-2 cursor-pointer font-medium text-ink hover:text-emerald-400 transition-colors">
              <input
                type="radio"
                name="timestamp-mode"
                value={m}
                checked={mode === m}
                onChange={() => persist({ mode: m, customTz })}
                className="w-4 h-4 accent-emerald-500"
                data-testid={`timestamp-mode-${m}`}
              />
              <span className="capitalize">{m === 'utc' ? 'UTC (Giờ chuẩn)' : m === 'local' ? 'Local (Trình duyệt)' : 'Custom (Múi giờ tùy chọn)'}</span>
            </label>
          ))}
        </div>

        {mode === 'custom' && (
          <div className="max-w-md pt-1 space-y-1">
            <label className="block text-xs font-semibold text-ink mb-1">Múi giờ IANA (IANA Timezone):</label>
            <input
              type="text"
              value={customTz}
              onChange={(e) => persist({ mode, customTz: e.target.value })}
              placeholder="America/New_York hoặc Asia/Ho_Chi_Minh"
              spellCheck={false}
              className="w-full px-3 py-2 border border-surface-border rounded-xl bg-surface-muted text-ink font-mono text-xs focus:outline-none focus:border-emerald-400"
              data-testid="timestamp-custom-tz-input"
            />
          </div>
        )}
      </div>
    </section>
  );
}
