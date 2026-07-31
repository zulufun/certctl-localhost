import { useState, useMemo, useEffect } from 'react';
import { useAuthMe } from '../hooks/useAuthMe';
import {
  Code2,
  Lock,
  Search,
  Copy,
  Check,
  Terminal,
  Trash2,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  Filter,
  Plus,
  Edit3,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

export interface ApiEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  category: 'Certificates' | 'Issuers' | 'Agents' | 'Auth' | 'Network' | 'Discovery' | 'System';
  description: string;
  scope?: string;
  status: 'active' | 'deprecated' | 'planned';
  // Extra metadata for deprecated APIs
  removedDate?: string;
  replacedBy?: string;
  reason?: string;
  // Extra metadata for planned APIs
  targetRelease?: string;
  priority?: 'High' | 'Medium' | 'Low';
  samplePayload?: string;
}

const ACTIVE_APIS: ApiEndpoint[] = [
  {
    id: 'act-1',
    method: 'GET',
    path: '/api/v1/certificates',
    category: 'Certificates',
    description: 'Lấy danh sách các chứng chỉ số đã được phát hành và quản lý',
    scope: 'certificate.read',
    status: 'active',
  },
  {
    id: 'act-2',
    method: 'POST',
    path: '/api/v1/certificates/issue',
    category: 'Certificates',
    description: 'Yêu cầu ký cấp chứng chỉ mới từ Issuer đã chỉ định',
    scope: 'certificate.create',
    status: 'active',
    samplePayload: '{\n  "common_name": "app.example.com",\n  "sans": ["api.example.com"],\n  "issuer_id": "iss-letsencrypt-prod",\n  "validity_days": 90\n}',
  },
  {
    id: 'act-3',
    method: 'DELETE',
    path: '/api/v1/certificates/{id}',
    category: 'Certificates',
    description: 'Thu hồi (revoke) và hủy quản lý chứng chỉ số',
    scope: 'certificate.delete',
    status: 'active',
  },
  {
    id: 'act-4',
    method: 'GET',
    path: '/api/v1/issuers',
    category: 'Issuers',
    description: 'Lấy danh sách tất cả các Certificate Authority (ACME, Local CA, Step-CA)',
    scope: 'issuer.read',
    status: 'active',
  },
  {
    id: 'act-5',
    method: 'POST',
    path: '/api/v1/issuers',
    category: 'Issuers',
    description: 'Tạo cấu hình Nhà cấp phát (Issuer) mới',
    scope: 'issuer.create',
    status: 'active',
    samplePayload: '{\n  "name": "Internal Vault CA",\n  "type": "vault",\n  "config": {\n    "address": "https://vault.internal:8200",\n    "path": "pki_int"\n  }\n}',
  },
  {
    id: 'act-6',
    method: 'DELETE',
    path: '/api/v1/issuers/{id}',
    category: 'Issuers',
    description: 'Xóa Nhà cấp phát (Yêu cầu không còn chứng chỉ liên kết)',
    scope: 'issuer.delete',
    status: 'active',
  },
  {
    id: 'act-7',
    method: 'GET',
    path: '/api/v1/agents',
    category: 'Agents',
    description: 'Danh sách các Certctl Deployment Agents đang hoạt động trên hệ thống',
    scope: 'agent.read',
    status: 'active',
  },
  {
    id: 'act-8',
    method: 'POST',
    path: '/api/v1/network-scans/trigger',
    category: 'Network',
    description: 'Kích hoạt tiến trình quét mạng phát hiện SSL/TLS trên CIDR/IP target',
    scope: 'network_scan.execute',
    status: 'active',
    samplePayload: '{\n  "targets": ["192.168.1.0/24"],\n  "ports": [443, 8443, 6443]\n}',
  },
  {
    id: 'act-9',
    method: 'GET',
    path: '/api/v1/discovery/certificates',
    category: 'Discovery',
    description: 'Danh sách chứng chỉ phát hiện qua Network Scanning (Discovered & Dismissed)',
    scope: 'discovery.read',
    status: 'active',
  },
  {
    id: 'act-10',
    method: 'GET',
    path: '/api/v1/domains',
    category: 'Certificates',
    description: 'Quản lý danh sách các Domain được phép ký cấp chứng chỉ SSL',
    scope: 'domain.read',
    status: 'active',
  },
  {
    id: 'act-11',
    method: 'GET',
    path: '/api/v1/auth/keys',
    category: 'Auth',
    description: 'Quản lý danh sách các API Keys của hệ thống',
    scope: 'auth.keys.manage',
    status: 'active',
  },
  {
    id: 'act-12',
    method: 'GET',
    path: '/api/v1/observability/metrics',
    category: 'System',
    description: 'Truy vấn chỉ số Prometheus & Health metrics của hệ thống',
    scope: 'system.metrics.read',
    status: 'active',
  },
];

const REMOVED_APIS: ApiEndpoint[] = [
  {
    id: 'rem-1',
    method: 'GET',
    path: '/v1/legacy-certs',
    category: 'Certificates',
    description: 'Endpoint lấy chứng chỉ theo định dạng JSON phẳng v1',
    status: 'deprecated',
    removedDate: '2026-03-15',
    replacedBy: 'GET /api/v1/certificates',
    reason: 'Đã chuyển sang kiến trúc chuẩn hóa API v1 REST response với phân trang Server-side',
  },
  {
    id: 'rem-2',
    method: 'POST',
    path: '/v1/auth/token-raw',
    category: 'Auth',
    description: 'Cấp JWT Token dạng không mã hóa RSA-256',
    status: 'deprecated',
    removedDate: '2026-04-01',
    replacedBy: 'POST /api/v1/auth/oidc/login',
    reason: 'Loại bỏ phương thức auth kém an toàn, chuyển sang OIDC 2.0 PKCE OAuth flow',
  },
  {
    id: 'rem-3',
    method: 'POST',
    path: '/api/v1/issuers/legacy-config',
    category: 'Issuers',
    description: 'Cấu hình Issuer trực tiếp bằng file plaintext',
    status: 'deprecated',
    removedDate: '2026-05-10',
    replacedBy: 'POST /api/v1/issuers',
    reason: 'Thay thế bằng cơ chế mã hóa mật khẩu AES-GCM 256-bit trong DB Postgres',
  },
  {
    id: 'rem-4',
    method: 'GET',
    path: '/v1/agents/poll-v1',
    category: 'Agents',
    description: 'Polling HTTP đơn giản cho Agent',
    status: 'deprecated',
    removedDate: '2026-06-01',
    replacedBy: 'GET /api/v1/agents/stream (gRPC/WebSockets)',
    reason: 'Nâng cấp lên kênh truyền hai chiều gRPC / TLS mTLS real-time streaming',
  },
  {
    id: 'rem-5',
    method: 'GET',
    path: '/v1/discovery/unmanaged-raw',
    category: 'Discovery',
    description: 'Lấy dữ liệu thô unmanaged discovery',
    status: 'deprecated',
    removedDate: '2026-07-12',
    replacedBy: 'GET /api/v1/discovery/certificates',
    reason: 'Tích hợp tab Dismissed và tính toán phân trang tự động',
  },
];

const DEFAULT_PLANNED_APIS: ApiEndpoint[] = [
  {
    id: 'plan-1',
    method: 'POST',
    path: '/api/v1/vault/sync-keys',
    category: 'Issuers',
    description: 'Đồng bộ tự động khóa private keys với HashiCorp Vault KV v2 Engine',
    status: 'planned',
    targetRelease: 'v2.4.0',
    priority: 'High',
    samplePayload: '{\n  "vault_addr": "https://vault.corp:8200",\n  "mount_path": "secret/pki",\n  "auto_rotate": true\n}',
  },
  {
    id: 'plan-2',
    method: 'GET',
    path: '/api/v1/compliance/pki-audit-report',
    category: 'System',
    description: 'Xuất báo cáo tuân thủ tiêu chuẩn PCI-DSS 4.0 & SOC2 Type II về quản lý chứng chỉ',
    status: 'planned',
    targetRelease: 'v2.4.0',
    priority: 'High',
  },
  {
    id: 'plan-3',
    method: 'POST',
    path: '/api/v1/acme/eab-automation',
    category: 'Auth',
    description: 'Tự động hóa đăng ký External Account Binding (EAB) cho CA chứng chỉ doanh nghiệp',
    status: 'planned',
    targetRelease: 'v2.5.0',
    priority: 'Medium',
  },
  {
    id: 'plan-4',
    method: 'POST',
    path: '/api/v1/agents/remote-exec',
    category: 'Agents',
    description: 'Thực thi lệnh kiểm tra hạ tầng mTLS từ xa trên Agent Fleet',
    status: 'planned',
    targetRelease: 'v2.5.0',
    priority: 'Medium',
  },
  {
    id: 'plan-5',
    method: 'GET',
    path: '/api/v1/analytics/cert-expiration-forecast',
    category: 'Certificates',
    description: 'Dự báo nguy cơ gián đoạn dịch vụ do hết hạn chứng chỉ số (AI Risk Score)',
    status: 'planned',
    targetRelease: 'v3.0.0',
    priority: 'Low',
  },
];

const LOCAL_STORAGE_PLANNED_KEY = 'certctl:devtools:planned-apis';

function loadPlannedApis(): ApiEndpoint[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_PLANNED_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // fallback
  }
  return DEFAULT_PLANNED_APIS;
}

export default function DevToolsPage() {
  const { data: me, isLoading: loadingMe, isAdmin } = useAuthMe();
  const [activeTab, setActiveTab] = useState<'active' | 'removed' | 'planned'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedPayloadId, setExpandedPayloadId] = useState<string | null>(null);

  // Planned APIs dynamic state
  const [plannedList, setPlannedList] = useState<ApiEndpoint[]>(loadPlannedApis);
  const [editingPlannedApi, setEditingPlannedApi] = useState<ApiEndpoint | null>(null);
  const [showCreatePlannedModal, setShowCreatePlannedModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const isUserAdmin = isAdmin();

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_PLANNED_KEY, JSON.stringify(plannedList));
    } catch {
      // ignore
    }
  }, [plannedList]);

  const currentList = useMemo(() => {
    switch (activeTab) {
      case 'active':
        return ACTIVE_APIS;
      case 'removed':
        return REMOVED_APIS;
      case 'planned':
        return plannedList;
    }
  }, [activeTab, plannedList]);

  const filteredList = useMemo(() => {
    return currentList.filter((item) => {
      const matchSearch =
        item.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.scope && item.scope.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchMethod = selectedMethod === 'ALL' || item.method === selectedMethod;
      const matchCategory = selectedCategory === 'ALL' || item.category === selectedCategory;

      return matchSearch && matchMethod && matchCategory;
    });
  }, [currentList, searchTerm, selectedMethod, selectedCategory]);

  const handleCopyPath = (path: string, id: string) => {
    navigator.clipboard.writeText(path);
    setCopiedId(id);
    toast.success(`Đã sao chép đường dẫn API: ${path}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSavePlannedApi = (apiData: Omit<ApiEndpoint, 'id' | 'status'> & { id?: string }) => {
    if (apiData.id) {
      // Edit mode
      setPlannedList(prev =>
        prev.map(item => (item.id === apiData.id ? { ...item, ...apiData } : item))
      );
      toast.success('Cập nhật API dự kiến thành công!');
    } else {
      // Create mode
      const newApi: ApiEndpoint = {
        ...apiData,
        id: `plan-${Date.now()}`,
        status: 'planned',
      };
      setPlannedList(prev => [newApi, ...prev]);
      toast.success('Thêm API dự kiến mới thành công!');
    }
    setShowCreatePlannedModal(false);
    setEditingPlannedApi(null);
  };

  const handleDeletePlannedApi = (id: string) => {
    setPlannedList(prev => prev.filter(item => item.id !== id));
    setConfirmDeleteId(null);
    toast.success('Đã xóa API dự kiến thành công!');
  };

  if (loadingMe) {
    return (
      <div className="p-8 text-center text-ink-muted text-xs flex items-center justify-center gap-2 min-h-[400px]">
        <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
        <span>Đang xác thực quyền Admin...</span>
      </div>
    );
  }

  // Strict Access control restriction for non-admin accounts
  if (!isUserAdmin) {
    return (
      <div className="p-8 max-w-2xl mx-auto my-12">
        <div className="bg-surface border border-red-500/30 rounded-2xl p-8 shadow-2xl text-center space-y-4">
          <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto text-red-400">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink">Quyền Truy Cập Bị Hạn Chế (Admin Only)</h1>
            <p className="text-xs text-ink-muted mt-1 max-w-md mx-auto">
              Trang <strong>Dev-tools & Quản Lý API</strong> chỉ dành riêng cho tài khoản có quyền Quản trị viên hệ thống (System Administrator).
            </p>
          </div>

          <div className="p-4 bg-surface-muted/50 rounded-xl border border-surface-border text-xs text-ink-faint text-left space-y-1">
            <p className="font-semibold text-ink flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Thông tin tài khoản hiện tại:</span>
            </p>
            <p>• User ID: <span className="font-mono text-ink">{me?.actor_id || 'Guest'}</span></p>
            <p>• Role: <span className="font-mono text-amber-400">{me?.roles?.join(', ') || 'User'}</span> (Yêu cầu quyền Administrator)</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col max-h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Scrollable Main Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 pr-4 custom-scrollbar">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-5 rounded-2xl border border-surface-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-ink flex items-center gap-2">
                Công Cụ Phát Triển & API (Dev Tools)
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 font-semibold uppercase tracking-wider">
                  Admin Only
                </span>
              </h1>
              <p className="text-xs text-ink-muted mt-0.5">
                Tra cứu tài liệu REST API, quản lý các endpoint hệ thống, API đã loại bỏ và danh mục API dự kiến
              </p>
            </div>
          </div>

          {activeTab === 'planned' && (
            <button
              onClick={() => {
                setEditingPlannedApi(null);
                setShowCreatePlannedModal(true);
              }}
              className="btn btn-primary text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-purple-500/10"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm API Dự Kiến</span>
            </button>
          )}
        </div>

        {/* Metrics overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-surface border border-surface-border rounded-2xl shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-ink-muted font-medium">API Đang Hoạt Động</p>
              <p className="text-2xl font-bold text-emerald-400">{ACTIVE_APIS.length}</p>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 bg-surface border border-surface-border rounded-2xl shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-ink-muted font-medium">API Đã Loại Bỏ / Deprecated</p>
              <p className="text-2xl font-bold text-red-400">{REMOVED_APIS.length}</p>
            </div>
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
              <Trash2 className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 bg-surface border border-surface-border rounded-2xl shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-ink-muted font-medium">API Dự Kiến Thêm (Roadmap)</p>
              <p className="text-2xl font-bold text-cyan-400">{plannedList.length}</p>
            </div>
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Main Tabs Navigation */}
        <div className="flex border-b border-surface-border gap-2">
          <button
            onClick={() => setActiveTab('active')}
            className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'active'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Các API Đang Có ({ACTIVE_APIS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('removed')}
            className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'removed'
                ? 'border-red-400 text-red-400'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>Các API Đã Xóa Đi ({REMOVED_APIS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('planned')}
            className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'planned'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Các API Dự Kiến Thêm ({plannedList.length})</span>
          </button>
        </div>

        {/* Filter and Search controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface p-4 rounded-2xl border border-surface-border">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-ink-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm path, mô tả, scope..."
              className="w-full pl-9 pr-3 py-1.5 bg-surface-muted border border-surface-border rounded-xl text-xs text-ink placeholder-ink-faint focus:outline-none focus:border-purple-400"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-1.5 text-xs text-ink-muted">
              <Filter className="w-3.5 h-3.5" />
              <span>Method:</span>
            </div>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="text-xs px-3 py-1.5 bg-surface-muted border border-surface-border rounded-xl text-ink focus:outline-none focus:border-purple-400 font-mono"
            >
              <option value="ALL">Tất cả Method</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs px-3 py-1.5 bg-surface-muted border border-surface-border rounded-xl text-ink focus:outline-none focus:border-purple-400"
            >
              <option value="ALL">Tất cả Nhóm</option>
              <option value="Certificates">Certificates</option>
              <option value="Issuers">Issuers</option>
              <option value="Agents">Agents</option>
              <option value="Auth">Auth</option>
              <option value="Network">Network</option>
              <option value="Discovery">Discovery</option>
              <option value="System">System</option>
            </select>
          </div>
        </div>

        {/* Endpoints List */}
        <div className="space-y-3 pb-8">
          {filteredList.length === 0 ? (
            <div className="p-8 text-center bg-surface border border-surface-border rounded-2xl text-xs text-ink-muted">
              Không tìm thấy API phù hợp với từ khóa tìm kiếm.
            </div>
          ) : (
            filteredList.map((api) => (
              <div
                key={api.id}
                className="bg-surface border border-surface-border rounded-2xl p-4 transition-all hover:border-purple-500/30 space-y-3 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <MethodBadge method={api.method} />
                    <span className="font-mono font-bold text-sm text-ink">{api.path}</span>
                    <button
                      onClick={() => handleCopyPath(api.path, api.id)}
                      className="p-1 text-ink-muted hover:text-ink transition-colors rounded-lg hover:bg-surface-muted"
                      title="Sao chép path"
                    >
                      {copiedId === api.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-surface-muted border border-surface-border text-ink-muted font-medium">
                      {api.category}
                    </span>
                    {api.scope && (
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
                        Scope: {api.scope}
                      </span>
                    )}

                    {/* Additional action buttons for Planned APIs tab */}
                    {activeTab === 'planned' && (
                      <div className="flex items-center gap-1.5 ml-2 border-l border-surface-border pl-2">
                        <button
                          onClick={() => {
                            setEditingPlannedApi(api);
                            setShowCreatePlannedModal(true);
                          }}
                          className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-colors"
                          title="Chỉnh sửa thông tin API"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(api.id)}
                          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Xóa API dự kiến"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-xs text-ink-muted">{api.description}</p>

                {/* Tab-specific Details */}
                {activeTab === 'removed' && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs space-y-1">
                    <div className="flex items-center gap-2 text-red-400 font-semibold">
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Ngày loại bỏ: {api.removedDate}</span>
                    </div>
                    <p className="text-ink-muted">Lý do: {api.reason}</p>
                    {api.replacedBy && (
                      <p className="text-emerald-400 font-mono flex items-center gap-1">
                        <ArrowRight className="w-3.5 h-3.5" /> Thay thế bởi: <strong>{api.replacedBy}</strong>
                      </p>
                    )}
                  </div>
                )}

                {activeTab === 'planned' && (
                  <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Phiên bản dự kiến: {api.targetRelease || 'Chưa định'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-ink-muted">Mức độ ưu tiên:</span>
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        api.priority === 'High'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : api.priority === 'Medium'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }`}>
                        {api.priority || 'Medium'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Sample payload preview if available */}
                {api.samplePayload && (
                  <div>
                    <button
                      onClick={() => setExpandedPayloadId(expandedPayloadId === api.id ? null : api.id)}
                      className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 mt-1"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>{expandedPayloadId === api.id ? 'Ẩn Request Payload' : 'Xem Request Payload mẫu'}</span>
                    </button>

                    {expandedPayloadId === api.id && (
                      <pre className="mt-2 p-3 bg-slate-950 border border-surface-border rounded-xl text-[11px] font-mono text-emerald-400 overflow-x-auto">
                        {api.samplePayload}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal create / edit Planned API */}
      {showCreatePlannedModal && (
        <PlannedApiModal
          initialData={editingPlannedApi}
          onSave={handleSavePlannedApi}
          onClose={() => {
            setShowCreatePlannedModal(false);
            setEditingPlannedApi(null);
          }}
        />
      )}

      {/* Confirm Delete Planned API Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setConfirmDeleteId(null)}>
          <div className="bg-surface border border-surface-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 pb-3 border-b border-surface-border text-red-400">
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-ink">Xác Nhận Xóa API Dự Kiến</h3>
                <p className="text-[11px] text-ink-muted">Hành động này sẽ gỡ bỏ API dự kiến khỏi lộ trình phát triển</p>
              </div>
            </div>

            <p className="text-xs text-ink-muted">
              Bạn có chắc chắn muốn xóa bản ghi API dự kiến này khỏi danh sách?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="btn btn-ghost text-xs px-4 py-2 rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDeletePlannedApi(confirmDeleteId)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Xóa Bản Ghi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MethodBadge({ method }: { method: string }) {
  const methodStyles: Record<string, string> = {
    GET: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    POST: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    PUT: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    DELETE: 'bg-red-500/15 text-red-400 border-red-500/30',
    PATCH: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  };

  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${methodStyles[method] || 'bg-gray-500/15 text-gray-400 border-gray-500/30'}`}>
      {method}
    </span>
  );
}

interface PlannedApiModalProps {
  initialData: ApiEndpoint | null;
  onSave: (data: Omit<ApiEndpoint, 'id' | 'status'> & { id?: string }) => void;
  onClose: () => void;
}

function PlannedApiModal({ initialData, onSave, onClose }: PlannedApiModalProps) {
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'>(
    initialData?.method || 'POST'
  );
  const [path, setPath] = useState(initialData?.path || '/api/v1/');
  const [category, setCategory] = useState<ApiEndpoint['category']>(
    initialData?.category || 'Certificates'
  );
  const [description, setDescription] = useState(initialData?.description || '');
  const [targetRelease, setTargetRelease] = useState(initialData?.targetRelease || 'v2.4.0');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>(
    initialData?.priority || 'Medium'
  );
  const [samplePayload, setSamplePayload] = useState(initialData?.samplePayload || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!path.trim() || !description.trim()) {
      toast.error('Vui lòng nhập đầy đủ Path và Mô tả API');
      return;
    }

    onSave({
      id: initialData?.id,
      method,
      path: path.trim(),
      category,
      description: description.trim(),
      targetRelease: targetRelease.trim(),
      priority,
      samplePayload: samplePayload.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-surface border border-surface-border rounded-2xl p-6 w-full max-w-xl shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto custom-scrollbar"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-surface-border">
          <div className="flex items-center gap-2 font-bold text-sm text-ink">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>{initialData ? 'Chỉnh Sửa API Dự Kiến' : 'Thêm Thông Tin API Dự Kiến Mới'}</span>
          </div>
          <button onClick={onClose} className="text-ink-muted hover:text-ink text-xs p-1">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-ink mb-1">HTTP Method *</label>
              <select
                value={method}
                onChange={e => setMethod(e.target.value as any)}
                className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-ink font-mono focus:outline-none focus:border-cyan-400"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-ink mb-1">Nhóm Chức Năng (Category) *</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-cyan-400"
              >
                <option value="Certificates">Certificates</option>
                <option value="Issuers">Issuers</option>
                <option value="Agents">Agents</option>
                <option value="Auth">Auth</option>
                <option value="Network">Network</option>
                <option value="Discovery">Discovery</option>
                <option value="System">System</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-ink mb-1">Đường Dẫn Endpoint Path *</label>
            <input
              value={path}
              onChange={e => setPath(e.target.value)}
              placeholder="Ví dụ: /api/v1/vault/sync"
              required
              className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-ink font-mono focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block font-semibold text-ink mb-1">Mô Tả Chức Năng API *</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Mô tả công dụng và mục đích phát triển API mới này..."
              rows={2}
              required
              className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-ink mb-1">Phiên Bản Dự Kiến (Target Release)</label>
              <input
                value={targetRelease}
                onChange={e => setTargetRelease(e.target.value)}
                placeholder="Ví dụ: v2.4.0"
                className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-ink mb-1">Mức Độ Ưu Tiên (Priority)</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-cyan-400"
              >
                <option value="High">High (Cao)</option>
                <option value="Medium">Medium (Trung bình)</option>
                <option value="Low">Low (Thấp)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-ink mb-1">Request Payload Mẫu (JSON tùy chọn)</label>
            <textarea
              value={samplePayload}
              onChange={e => setSamplePayload(e.target.value)}
              placeholder={`{\n  "key": "value"\n}`}
              rows={4}
              className="w-full bg-slate-950 border border-surface-border rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-surface-border">
            <button type="button" onClick={onClose} className="btn btn-ghost text-xs px-4 py-2 rounded-xl">
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary text-xs font-semibold px-4 py-2 rounded-xl"
            >
              {initialData ? 'Lưu Thay Đổi' : 'Tạo API Dự Kiến'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
