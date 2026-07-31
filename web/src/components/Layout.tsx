import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  // Inventory
  LayoutDashboard, ShieldCheck, Search, Server, Network, Radar, Timer,
  // Trust
  KeyRound, FileText, ScrollText, RefreshCw, Wrench,
  // Delivery
  Target, ListTodo, HeartPulse, Globe,
  // People
  User, Users, Group,
  // Notify
  Bell, Activity,
  // Access
  Clock, UserCog, CheckCircle2, AlertTriangle, Cog,
  // Logout + setup
  LogOut, HelpCircle, Code2,
  // Group header chevron
  ChevronDown, ChevronRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from './AuthProvider';
import logo from '../assets/certctl-logo.png';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Optional data-testid; today only `nav-auth-users` (Audit 2026-05-11 Fix 11). */
  testID?: string;
}

interface NavGroup {
  /** localStorage key suffix for collapsed-state persistence. */
  id: string;
  /** Sidebar header label. */
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    id: 'inventory',
    label: 'Danh mục',
    items: [
      { to: '/', label: 'Bảng điều khiển', icon: LayoutDashboard },
      { to: '/certificates', label: 'Chứng chỉ', icon: ShieldCheck },
      { to: '/discovery', label: 'Phát hiện', icon: Search },
      { to: '/agents', label: 'Agent', icon: Server },
      { to: '/fleet', label: 'Tổng quan hệ thống', icon: Network },
    ],
  },
  {
    id: 'trust',
    label: 'Tin cậy',
    items: [
      { to: '/issuers', label: 'Nhà cấp phát', icon: KeyRound },
      { to: '/profiles', label: 'Hồ sơ cấu hình', icon: FileText },
      { to: '/policies', label: 'Chính sách', icon: ScrollText },
      { to: '/renewal-policies', label: 'Chính sách gia hạn', icon: RefreshCw },
    ],
  },
  {
    id: 'delivery',
    label: 'Phân phối',
    items: [
      { to: '/targets', label: 'Mục tiêu (Targets)', icon: Target },
      { to: '/domains', label: 'Quản lý Domain', icon: Globe },
      { to: '/jobs', label: 'Theo dõi các tiến trình (Jobs)', icon: ListTodo },
      { to: '/health-monitor', label: 'Giám sát sức khỏe', icon: HeartPulse },
    ],
  },
  {
    id: 'people',
    label: 'Nhân sự',
    items: [
      { to: '/owners', label: 'Chủ sở hữu', icon: User },
      { to: '/teams', label: 'Đội nhóm', icon: Users },
      { to: '/agent-groups', label: 'Nhóm Agent', icon: Group },
    ],
  },
  {
    id: 'notify',
    label: 'Thông báo',
    items: [
      { to: '/notifications', label: 'Thông báo', icon: Bell },
    ],
  },
  {
    id: 'access',
    label: 'Truy cập',
    items: [
      { to: '/auth/oidc/providers', label: 'Nhà cung cấp OIDC', icon: ShieldCheck },
      { to: '/auth/sessions', label: 'Phiên làm việc', icon: Clock },
      { to: '/auth/users', label: 'Người dùng', icon: Users, testID: 'nav-auth-users' },
      { to: '/auth/roles', label: 'Vai trò', icon: UserCog },
      { to: '/auth/keys', label: 'API Key', icon: KeyRound },
      { to: '/auth/approvals', label: 'Phê duyệt', icon: CheckCircle2 },
      { to: '/audit', label: 'Nhật ký kiểm toán (Audit)', icon: ScrollText },
    ],
  },
  {
    id: 'advanced',
    label: 'Nâng cao',
    items: [
      { to: '/network-scans', label: 'Quét mạng (Network Scanning)', icon: Radar },
      { to: '/scep', label: 'Quản trị SCEP', icon: Wrench },
      { to: '/est', label: 'Quản trị EST', icon: Wrench },
      { to: '/short-lived', label: 'Chứng chỉ ngắn hạn', icon: Timer },
      { to: '/auth/breakglass', label: 'Khẩn cấp (Break-glass)', icon: AlertTriangle },
      { to: '/observability', label: 'Giám sát hệ thống', icon: Activity },
      { to: '/auth/settings', label: 'Cài đặt xác thực', icon: Cog },
      { to: '/dev-tools', label: 'Công cụ phát triển (Dev Tools)', icon: Code2 },
    ],
  },
];

const STORAGE_KEY = 'certctl:nav:collapsed-groups';

function useCollapsedGroups(): [Set<string>, (id: string) => void] {
  const [collapsed, setCollapsed] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return new Set(JSON.parse(raw) as string[]);
    } catch {
      /* ignore storage failure */
    }
    return new Set<string>();
  });

  const toggle = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch {
        /* ignore storage failure */
      }
      return next;
    });
  };

  return [collapsed, toggle];
}

export default function Layout() {
  const { authRequired, logout, user } = useAuth();
  const navigate = useNavigate();
  const [collapsed, toggleGroup] = useCollapsedGroups();

  const openSetupGuide = () => {
    try { localStorage.removeItem('certctl:onboarding-dismissed'); } catch { /* noop */ }
    navigate('/?onboarding=1');
  };

  const openCommandPalette = () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Sidebar — Emerald / Green Theme */}
      <aside className="w-64 bg-emerald-950/95 backdrop-blur-xl border-r border-emerald-900/60 flex flex-col shadow-2xl relative z-20 select-none text-emerald-100">
        {/* Brand Header */}
        <div className="p-4 flex items-center gap-3 border-b border-emerald-900/50 bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-950">
          <div className="relative group cursor-pointer" onClick={() => navigate('/')}>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-400 to-teal-300 rounded-2xl blur opacity-40 group-hover:opacity-90 transition duration-300"></div>
            <div className="relative bg-emerald-900/80 p-2 rounded-xl border border-emerald-500/50 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <img src={logo} alt="TTDL Logo" className="h-9 w-9 object-contain" width={36} height={36} loading="eager" decoding="async" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-extrabold tracking-tight text-white font-mono">TTDL PKI</h1>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
            </div>
            <p className="text-[10px] font-bold text-emerald-300 tracking-widest uppercase font-mono">TRUNG TÂM ĐIỀU KHIỂN v1.0</p>
          </div>
        </div>

        {/* Command Search Quick Button */}
        <div className="px-3 pt-3 pb-1">
          <button
            onClick={openCommandPalette}
            type="button"
            className="w-full flex items-center justify-between px-3 py-1.5 bg-emerald-900/40 hover:bg-emerald-900/70 border border-emerald-800/60 hover:border-emerald-400/80 rounded-xl text-xs text-emerald-200/80 hover:text-white transition-all shadow-inner group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-emerald-400 group-hover:text-emerald-200 transition-colors" />
              <span>Tìm kiếm nhanh...</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-emerald-900/80 text-emerald-300 rounded border border-emerald-700/60">⌘K</kbd>
          </button>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 py-2 px-3 space-y-4 overflow-y-auto custom-scrollbar" aria-label="Primary navigation">
          {navGroups.map((group) => {
            const isCollapsed = collapsed.has(group.id);
            return (
              <div key={group.id} className="space-y-1">
                {/* Group header */}
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  aria-expanded={!isCollapsed}
                  aria-controls={`nav-group-${group.id}`}
                  className="w-full flex items-center justify-between px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 hover:text-emerald-200 transition-colors rounded-lg hover:bg-emerald-900/30"
                >
                  <span className="flex items-center gap-1.5">
                    {group.label}
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-900/80 text-emerald-300 font-mono border border-emerald-800/60">
                      {group.items.length}
                    </span>
                  </span>
                  {isCollapsed ? (
                    <ChevronRight className="w-3 h-3 shrink-0 opacity-70" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-3 h-3 shrink-0 opacity-70" aria-hidden="true" />
                  )}
                </button>

                {/* Group items */}
                <div
                  id={`nav-group-${group.id}`}
                  className={`space-y-0.5 transition-all ${isCollapsed ? 'hidden' : ''}`}
                  aria-hidden={isCollapsed}
                >
                  {group.items.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/'}
                        data-testid={item.testID}
                        className={({ isActive }) =>
                          `group flex items-center gap-3 px-3 py-2 text-xs rounded-xl font-medium transition-all duration-200 relative ${isActive
                            ? 'bg-gradient-to-r from-emerald-600/90 via-emerald-600/70 to-teal-700/50 text-white font-bold border-l-4 border-emerald-300 shadow-md shadow-emerald-900/50 pl-2.5'
                            : 'text-emerald-200/90 hover:text-white hover:bg-emerald-900/40 hover:translate-x-0.5'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <ItemIcon
                              className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-emerald-200 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'text-emerald-400 group-hover:text-emerald-200'
                                }`}
                              strokeWidth={isActive ? 2.2 : 1.75}
                              aria-hidden="true"
                            />
                            <span className="truncate">{item.label}</span>
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer Actions & User Status */}
        <div className="p-3 border-t border-emerald-900/60 bg-emerald-950/90 space-y-2">
          <button
            type="button"
            onClick={openSetupGuide}
            aria-label="Setup guide"
            title="Mở lại hướng dẫn cài đặt"
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl text-emerald-300/80 hover:text-white hover:bg-emerald-900/50 border border-transparent hover:border-emerald-800/60 transition-all font-medium"
          >
            <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <span>Setup guide</span>
          </button>

          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-900/50 border border-emerald-800/60 text-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse"></div>
              <span className="text-emerald-200 font-mono text-[11px] truncate">{user || 'Active Session'}</span>
            </div>

            {authRequired && (
              <button
                onClick={logout}
                className="p-1 text-emerald-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                title="Đăng xuất"
                aria-label="Đăng xuất"
              >
                <LogOut className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-page">
        <Outlet />
      </main>
    </div>
  );
}
