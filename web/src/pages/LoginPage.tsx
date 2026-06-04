import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { getAuthInfo, breakglassLogin, type AuthInfoOIDCProvider } from '../api/client';

// Audit 2026-05-10 HIGH-7 closure — operator-friendly cause text for
// each value the OIDC callback handler emits in the redirect's
// `?reason=<category>` query param. Keys MUST match the categories
// produced by `internal/api/handler/auth_session_oidc.go::classifyOIDCFailure`
// — see TestLoginCallback_RedirectsWithReason_AllCategories for the
// authoritative list.
const OIDC_FAILURE_REASON_TEXT: Record<string, string> = {
  pre_login_consume_failed:
    'Yêu cầu đăng nhập đã được sử dụng hoặc hết hạn. Vui lòng thử đăng nhập lại.',
  state_mismatch:
    'Phản hồi OIDC bị từ chối (state mismatch). Vui lòng thử lại trên một tab trình duyệt duy nhất.',
  nonce_mismatch:
    'Phản hồi OIDC bị từ chối (nonce mismatch). Vui lòng thử lại trên một tab trình duyệt duy nhất.',
  audience_mismatch:
    'Nhà cung cấp danh tính (IdP) trả về mã (token) cho đối tượng nhận khác. Vui lòng kiểm tra client_id trên IdP.',
  token_expired:
    'Token do IdP cấp đã hết hạn trước khi phản hồi hoàn tất. Vui lòng kiểm tra độ lệch giờ của máy chủ và thử lại.',
  azp_mismatch:
    'IdP trả về token với bên được ủy quyền không khớp. Vui lòng kiểm tra cấu hình client_id.',
  at_hash_mismatch:
    'Chữ ký access-token không khớp. Vui lòng kiểm tra cài đặt thuật toán ký của IdP.',
  iat_window:
    'Token do IdP cấp chỉ ra thời gian phát hành trong tương lai hoặc đã quá cũ. Vui lòng kiểm tra lệch giờ của máy chủ.',
  alg_rejected:
    'IdP đã ký token bằng thuật toán không được hỗ trợ bởi certctl. Vui lòng kiểm tra cấu hình nhà cung cấp OIDC.',
  unmapped_groups:
    'Bạn đã đăng nhập thành công, nhưng không có nhóm nào của bạn được ánh xạ vào vai trò trong certctl. Hãy yêu cầu quản trị viên thêm ánh xạ nhóm.',
  groups_missing:
    'IdP không trả về thông tin nhóm (groups claim). Hãy yêu cầu quản trị viên bật scope groups trên OIDC client.',
  jwks_unreachable:
    'certctl không thể lấy khóa ký (JWKS) từ IdP. Vui lòng kiểm tra kết nối mạng từ máy chủ đến IdP.',
  email_domain_not_allowed:
    'Tên miền email của bạn không nằm trong danh sách được phép cho nhà cung cấp OIDC này. Hãy liên hệ quản trị viên.',
  email_missing_but_required:
    'IdP không trả về thông tin email. Hãy yêu cầu quản trị viên bật scope email trên OIDC client.',
  pkce_invalid:
    'Trình xác thực PKCE không khớp với thử thách. Vui lòng đăng nhập lại từ một tab duy nhất.',
  unspecified:
    'Đăng nhập OIDC thất bại. Vui lòng thử lại hoặc kiểm tra nhật ký kiểm toán của máy chủ để biết chi tiết.',
};

// =============================================================================
// LoginPage — Bundle 2 Phase 8 / multi-mode entry surface.
//
// Pre-Bundle-2: API-key-only sign-in form.
// Post-Bundle-2: when `/auth/info` reports `oidc_providers[]`, the
// page renders one "Sign in with X" button per provider; clicking
// navigates to the provider's `login_url` (which 302s through the
// IdP and back to /auth/oidc/callback). The API-key form remains as
// a fallback for Bearer-mode deployments.
//
// Audit 2026-05-10 CRIT-4 closure: an inline break-glass form below
// the API-key form lets admins recover during SSO incidents without
// crafting curl commands. The link is intentionally low-key
// (text-amber-600 small text) — break-glass is the deliberate-bypass
// path, not the everyday-login path.
// =============================================================================

export default function LoginPage() {
  const { login, error: authError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [key, setKey] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [providers, setProviders] = useState<AuthInfoOIDCProvider[]>([]);

  // Audit 2026-05-10 HIGH-7 closure — when the OIDC callback path
  // redirects here with `?error=oidc_failed&reason=<category>`, render
  // an operator-friendly cause banner. The reason maps via
  // OIDC_FAILURE_REASON_TEXT; unknown reasons fall back to the
  // `unspecified` text (defensive against new server categories).
  const oidcError = searchParams.get('error');
  const oidcReason = searchParams.get('reason') || '';
  const oidcReasonText =
    oidcError === 'oidc_failed'
      ? OIDC_FAILURE_REASON_TEXT[oidcReason] ||
        OIDC_FAILURE_REASON_TEXT.unspecified
      : null;

  // Audit 2026-05-10 HIGH-8 closure — when the AuthProvider redirects
  // to /login because a session 401'd with a recognised cause, it
  // attaches `?session_expired=<idle_timeout|absolute_timeout|back_channel_revoked>`
  // so we can render OIDC-aware re-login wording instead of the
  // generic API-key UX. See AuthProvider.tsx for the WWW-Authenticate
  // parser.
  const sessionCause = searchParams.get('session_expired') || '';
  const sessionCauseText =
    {
      idle_timeout:
        'Phiên làm việc của bạn đã hết hạn do không hoạt động. Vui lòng đăng nhập lại để tiếp tục.',
      absolute_timeout:
        'Phiên làm việc của bạn đã đạt giới hạn thời gian tối đa. Vui lòng đăng nhập lại để tiếp tục.',
      back_channel_revoked:
        'Nhà cung cấp danh tính của bạn đã đăng xuất bạn (back-channel logout). Vui lòng đăng nhập lại để tiếp tục.',
    }[sessionCause] || null;

  // Break-glass inline form state.
  const [showBreakglass, setShowBreakglass] = useState(false);
  const [bgActorID, setBgActorID] = useState('');
  const [bgPassword, setBgPassword] = useState('');
  const [bgError, setBgError] = useState<string | null>(null);
  const [bgSubmitting, setBgSubmitting] = useState(false);

  const error = localError || authError;

  // On mount, fetch /auth/info and extract any configured OIDC
  // providers so we can render the "Sign in with X" buttons. Errors
  // are non-fatal — fall back to the API-key form.
  useEffect(() => {
    getAuthInfo()
      .then(info => {
        if (info.oidc_providers && info.oidc_providers.length > 0) {
          setProviders(info.oidc_providers);
        }
      })
      .catch(() => {
        // Server may be pre-Phase-6; ignore.
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!key.trim()) return;
    setSubmitting(true);
    setLocalError(null);
    try {
      await login(key.trim());
    } catch {
      setLocalError('API Key không hợp lệ. Vui lòng kiểm tra lại khóa của bạn và thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBreakglassSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!bgActorID.trim() || !bgPassword) return;
    setBgSubmitting(true);
    setBgError(null);
    try {
      await breakglassLogin(bgActorID.trim(), bgPassword);
      // breakglassLogin sets the session cookie via Set-Cookie; navigate
      // to the dashboard, which the AuthProvider will re-validate via
      // its session-cookie path on next render.
      navigate('/');
    } catch (err) {
      setBgError(err instanceof Error ? err.message : 'Đăng nhập tài khoản khẩn cấp thất bại.');
    } finally {
      setBgSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-page flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-brand-400 mb-2">TTDL</h1>
          <p className="text-sm text-ink-muted uppercase tracking-wider">Hệ thống quản lý chứng chỉ</p>
        </div>

        {oidcReasonText && (
          <div
            className="bg-amber-50 border border-amber-200 rounded p-4 mb-4 text-sm text-amber-900"
            data-testid="login-oidc-failure-banner"
            data-reason={oidcReason}
            role="alert"
          >
            <div className="font-medium mb-1">Đăng nhập với nhà cung cấp danh tính thất bại</div>
            <div className="text-xs">{oidcReasonText}</div>
          </div>
        )}

        {sessionCauseText && (
          <div
            className="bg-blue-50 border border-blue-200 rounded p-4 mb-4 text-sm text-blue-900"
            data-testid="login-session-cause-banner"
            data-cause={sessionCause}
            role="status"
          >
            <div className="font-medium mb-1">Bạn đã bị đăng xuất</div>
            <div className="text-xs">{sessionCauseText}</div>
          </div>
        )}

        {providers.length > 0 && (
          <div
            className="bg-surface border border-surface-border rounded p-6 space-y-3 shadow-sm mb-4"
            data-testid="login-oidc-providers"
          >
            <p className="text-sm font-medium text-ink-muted text-center">Đăng nhập bằng nhà cung cấp danh tính của bạn</p>
            {providers.map(p => (
              <a
                key={p.id}
                href={p.login_url}
                className="block w-full text-center bg-brand-400 hover:bg-brand-500 text-white py-2.5 text-sm font-medium rounded transition-colors"
                data-testid={`login-oidc-button-${p.id}`}
              >
                Đăng nhập bằng {p.display_name}
              </a>
            ))}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-surface border border-surface-border rounded p-6 space-y-4 shadow-sm"
          data-testid="login-api-key-form"
        >
          {providers.length > 0 && (
            <p className="text-xs text-ink-muted text-center pb-2 border-b border-surface-border">
              — hoặc đăng nhập bằng API Key —
            </p>
          )}
          <div>
            <label htmlFor="api-key" className="block text-sm font-medium text-ink-muted mb-1.5">
              API Key
            </label>
            <input
              id="api-key"
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Nhập API Key của bạn"
              autoFocus={providers.length === 0}
              className="w-full bg-white border border-surface-border rounded px-3 py-2.5 text-sm text-ink placeholder-ink-faint focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400/20"
              data-testid="login-api-key-input"
            />
          </div>

          {error && (
            <div
              className="bg-red-50 border border-red-200 rounded px-3 py-2 text-sm text-red-700"
              data-testid="login-error"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !key.trim()}
            className="w-full bg-brand-400 hover:bg-brand-500 text-white py-2.5 text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="login-api-key-submit"
          >
            {submitting ? 'Đang xác thực...' : 'Đăng nhập'}
          </button>

          <p className="text-xs text-ink-muted text-center">
            API Key được thiết lập qua biến môi trường <code className="text-ink-faint bg-page px-1 py-0.5 rounded">CERTCTL_AUTH_SECRET</code> trên máy chủ.
          </p>
        </form>

        {/* Break-glass entry — low-visibility on purpose. CRIT-4 closure. */}
        <div className="mt-4 text-center" data-testid="login-breakglass-entry">
          {!showBreakglass ? (
            <button
              type="button"
              onClick={() => setShowBreakglass(true)}
              className="text-xs text-amber-600 hover:text-amber-700 hover:underline"
              data-testid="login-breakglass-toggle"
            >
              Sử dụng tài khoản khẩn cấp (Khôi phục khi sự cố SSO)
            </button>
          ) : (
            <form
              onSubmit={handleBreakglassSubmit}
              className="bg-amber-50 border border-amber-200 rounded p-4 mt-4 space-y-3 text-left"
              data-testid="login-breakglass-form"
            >
              <p className="text-xs font-medium text-amber-900">
                Đăng nhập quản trị khẩn cấp (Break-glass) — mọi hành động đều được kiểm toán. Chỉ sử dụng khi xảy ra sự cố SSO.
              </p>
              <div>
                <label htmlFor="bg-actor-id" className="block text-xs font-medium text-amber-900 mb-1">
                  Actor ID
                </label>
                <input
                  id="bg-actor-id"
                  type="text"
                  value={bgActorID}
                  onChange={e => setBgActorID(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="actor-..."
                  className="w-full bg-white border border-amber-300 rounded px-3 py-2 text-sm text-ink placeholder-ink-faint focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                  data-testid="login-breakglass-actor-id"
                />
              </div>
              <div>
                <label htmlFor="bg-password" className="block text-xs font-medium text-amber-900 mb-1">
                  Mật khẩu
                </label>
                <input
                  id="bg-password"
                  type="password"
                  value={bgPassword}
                  onChange={e => setBgPassword(e.target.value)}
                  autoComplete="off"
                  className="w-full bg-white border border-amber-300 rounded px-3 py-2 text-sm text-ink placeholder-ink-faint focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                  data-testid="login-breakglass-password"
                />
              </div>
              {bgError && (
                <div
                  className="bg-red-50 border border-red-200 rounded px-3 py-2 text-xs text-red-700"
                  data-testid="login-breakglass-error"
                >
                  {bgError}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={bgSubmitting || !bgActorID.trim() || !bgPassword}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="login-breakglass-submit"
                >
                  {bgSubmitting ? 'Đang đăng nhập…' : 'Đăng nhập khẩn cấp'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBreakglass(false);
                    setBgActorID('');
                    setBgPassword('');
                    setBgError(null);
                  }}
                  className="px-3 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100 rounded transition-colors"
                  data-testid="login-breakglass-cancel"
                >
                  Hủy
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
