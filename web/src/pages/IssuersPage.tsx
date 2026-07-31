import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ShieldCheck,
  Plus,
  Activity,
  Edit3,
  Trash2,
  Eye,
  Filter,
  CheckCircle2,
  XCircle,
  Sparkles,
  Server,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { useTrackedMutation } from '../hooks/useTrackedMutation';
import { getIssuers, testIssuerConnection, deleteIssuer, createIssuer, updateIssuer, getCertificates } from '../api/client';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import type { Column } from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import ErrorState from '../components/ErrorState';
import { formatDateTime } from '../api/utils';
import type { Issuer } from '../api/types';
import { issuerTypes, typeLabels, getIssuerCatalogStatus, type IssuerTypeConfig } from '../config/issuerTypes';
import TypeSelector from '../components/issuer/TypeSelector';
import ConfigForm from '../components/issuer/ConfigForm';
import ConfigDetailModal from '../components/issuer/ConfigDetailModal';

const typeAliases: Record<string, string[]> = {
  GenericCA: ['GenericCA', 'local', 'local_ca'],
  ACME: ['ACME', 'acme'],
  StepCA: ['StepCA', 'stepca'],
  OpenSSL: ['OpenSSL', 'openssl'],
};

function issuerStatus(issuer: Issuer): string {
  return issuer.enabled ? 'Enabled' : 'Disabled';
}

export default function IssuersPage() {
  const [testResult, setTestResult] = useState<{ id: string; ok: boolean; msg: string } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [preselectedType, setPreselectedType] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [configModal, setConfigModal] = useState<{ title: string; config: Record<string, unknown> } | null>(null);
  const [editingIssuer, setEditingIssuer] = useState<Issuer | null>(null);

  // Deletion restriction states
  const [blockedDeleteModal, setBlockedDeleteModal] = useState<{ issuer: Issuer; count: number } | null>(null);
  const [confirmDeleteIssuer, setConfirmDeleteIssuer] = useState<Issuer | null>(null);
  const [checkingDeleteId, setCheckingDeleteId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['issuers'],
    queryFn: () => getIssuers(),
  });

  const testMutation = useTrackedMutation({
    mutationFn: testIssuerConnection,
    invalidates: [['issuers']],
    onSuccess: (_data, id) => setTestResult({ id, ok: true, msg: 'Kết nối thử nghiệm thành công!' }),
    onError: (err: Error, id) => setTestResult({ id, ok: false, msg: err.message }),
  });

  const deleteMutation = useTrackedMutation({
    mutationFn: deleteIssuer,
    invalidates: [['issuers']],
    onSuccess: () => {
      toast.success('Đã xóa Issuer thành công');
      setConfirmDeleteIssuer(null);
    },
    onError: (err: Error) => {
      toast.error(`Không thể xóa Issuer: ${err.message}`);
    },
  });

  const handleDeleteClick = async (issuer: Issuer) => {
    setCheckingDeleteId(issuer.id);
    try {
      const res = await getCertificates({ issuer_id: issuer.id, per_page: '1' });
      if (res && res.total > 0) {
        setBlockedDeleteModal({ issuer, count: res.total });
        setCheckingDeleteId(null);
        return;
      }
    } catch {
      // Ignore pre-check fetch error & fall back to confirmation
    }
    setCheckingDeleteId(null);
    setConfirmDeleteIssuer(issuer);
  };

  const createMutation = useTrackedMutation({
    mutationFn: (data: { name: string; type: string; config: Record<string, unknown> }) =>
      createIssuer(data),
    invalidates: [['issuers']],
    onSuccess: () => {
      setShowCreateModal(false);
      setPreselectedType(null);
      toast.success('Đã tạo Issuer mới thành công');
    },
  });

  const updateMutation = useTrackedMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Issuer> }) => updateIssuer(id, data),
    invalidates: [['issuers']],
    onSuccess: () => {
      setEditingIssuer(null);
      toast.success('Cập nhật Issuer thành công');
    },
  });

  const catalogStatus = useMemo(
    () => getIssuerCatalogStatus(data?.data || []),
    [data?.data]
  );

  const filteredIssuers = useMemo(() => {
    if (!data?.data) return [];
    if (!typeFilter) return data.data;
    const matches = typeAliases[typeFilter] || [typeFilter];
    return data.data.filter(i => matches.includes(i.type));
  }, [data?.data, typeFilter]);

  const columns: Column<Issuer>[] = [
    {
      key: 'name',
      label: 'Issuer Name & ID',
      render: (i) => (
        <div>
          <Link
            to={`/issuers/${i.id}`}
            className="font-bold text-ink hover:text-emerald-400 transition-colors text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {i.name}
          </Link>
          <div className="text-[11px] text-ink-faint font-mono mt-0.5">{i.id}</div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Loại CA Driver',
      render: (i) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-surface-muted border border-surface-border text-emerald-400 font-semibold">
          {typeLabels[i.type] || i.type}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Trạng Thái',
      render: (i) => <StatusBadge status={issuerStatus(i)} />,
    },
    {
      key: 'config',
      label: 'Cấu Hình',
      render: (i) => {
        if (!i.config || Object.keys(i.config).length === 0) return <span className="text-ink-faint text-xs">&mdash;</span>;
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setConfigModal({ title: `Cấu hình ${i.name}`, config: i.config });
            }}
            className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Xem chi tiết</span>
          </button>
        );
      },
    },
    {
      key: 'created',
      label: 'Ngày Tạo',
      render: (i) => <span className="text-xs text-ink-muted font-mono">{formatDateTime(i.created_at)}</span>,
    },
    {
      key: 'actions',
      label: '',
      render: (i) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); testMutation.mutate(i.id); }}
            disabled={testMutation.isPending}
            className="px-2.5 py-1 text-xs font-medium text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-lg transition-colors flex items-center gap-1"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Test</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setEditingIssuer(i); }}
            className="px-2.5 py-1 text-xs font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg transition-colors flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteClick(i); }}
            disabled={checkingDeleteId === i.id || deleteMutation.isPending}
            className="px-2.5 py-1 text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-5 rounded-2xl border border-surface-border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink flex items-center gap-2">
              Quản Lý Nhà Cấp Phát (Issuers)
              {data && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold font-mono">
                  {data.total} configured
                </span>
              )}
            </h1>
            <p className="text-xs text-ink-muted mt-0.5">
              Cấu hình các Certificate Authority (ACME, Local CA, Step-CA, Vault...) để ký cấp chứng chỉ số
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setPreselectedType(null);
            setShowCreateModal(true);
          }}
          className="btn btn-primary text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/10"
        >
          <Plus className="w-4 h-4" />
          <span>+ New Issuer</span>
        </button>
      </div>

      {testResult && (
        <div className={`p-4 rounded-2xl text-xs font-medium flex items-center justify-between shadow-sm border ${
          testResult.ok
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
            : 'bg-red-500/15 border-red-500/30 text-red-400'
        }`}>
          <div className="flex items-center gap-2">
            {testResult.ok ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            <span><strong>{testResult.id}:</strong> {testResult.msg}</span>
          </div>
          <button onClick={() => setTestResult(null)} className="text-xs opacity-70 hover:opacity-100 font-bold px-2 py-0.5">
            ✕ Đóng
          </button>
        </div>
      )}

      <div className="space-y-6">
        {error ? (
          <ErrorState error={error as Error} onRetry={() => refetch()} />
        ) : (
          <>
            {/* Catalog Cards */}
            <div>
              <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Danh Mục Loại CA Driver (Catalog)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {catalogStatus.map(({ type, status, count }) => (
                  <CatalogCard
                    key={type.id}
                    type={type}
                    status={status}
                    count={count}
                    onConfigure={() => {
                      setPreselectedType(type.id);
                      setShowCreateModal(true);
                    }}
                    onFilter={() => {
                      setTypeFilter(prev => prev === type.id ? '' : type.id);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Configured Issuers Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-emerald-400" />
                  <span>Danh Sách Issuers Đã Cấu Hình</span>
                </h3>
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-ink-muted" />
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="text-xs px-3 py-1.5 bg-surface border border-surface-border rounded-xl text-ink focus:outline-none focus:border-emerald-400"
                  >
                    <option value="">Tất cả loại CA</option>
                    {issuerTypes.filter(t => !t.comingSoon).map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-surface rounded-2xl border border-surface-border shadow-sm overflow-hidden">
                <DataTable
                  columns={columns}
                  data={filteredIssuers}
                  isLoading={isLoading}
                  emptyMessage={typeFilter ? `No ${typeLabels[typeFilter] || typeFilter} issuers configured` : 'No issuers configured'}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {configModal && (
        <ConfigDetailModal
          title={configModal.title}
          config={configModal.config}
          onClose={() => setConfigModal(null)}
        />
      )}

      {showCreateModal && (
        <CreateIssuerModal
          preselectedType={preselectedType}
          onSubmit={(name, type, config) => {
            createMutation.mutate({ name, type, config });
          }}
          onCancel={() => {
            setShowCreateModal(false);
            setPreselectedType(null);
          }}
          isSubmitting={createMutation.isPending}
        />
      )}

      <EditIssuerModal
        issuer={editingIssuer}
        onClose={() => setEditingIssuer(null)}
        onSave={({ name, enabled, config }) => {
          if (!editingIssuer) return;
          updateMutation.mutate({
            id: editingIssuer.id,
            data: {
              name,
              type: editingIssuer.type,
              config,
              enabled,
            },
          });
        }}
        isSaving={updateMutation.isPending}
        error={updateMutation.error ? (updateMutation.error as Error).message : null}
      />

      {/* Blocked Delete Warning Modal */}
      {blockedDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setBlockedDeleteModal(null)}>
          <div className="bg-surface border border-red-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 pb-3 border-b border-surface-border text-red-400">
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-ink">Không Thể Xóa Issuer Này</h3>
                <p className="text-[11px] text-red-400 font-medium">Bản ghi đang có ràng buộc dữ liệu phụ thuộc</p>
              </div>
            </div>

            <div className="text-xs space-y-2 text-ink-muted">
              <p>
                Nhà cấp phát <strong className="text-ink font-mono">{blockedDeleteModal.issuer.name}</strong> ({blockedDeleteModal.issuer.id}) đang được liên kết và sử dụng bởi <span className="font-bold text-amber-400">{blockedDeleteModal.count} chứng chỉ quản lý</span> trong hệ thống.
              </p>
              <p className="text-[11px] bg-amber-500/10 border border-amber-500/20 text-amber-300 p-3 rounded-xl">
                ⚠️ <strong>Cảnh báo an toàn:</strong> Để xóa Issuer này, vui lòng chuyển các chứng chỉ liên quan sang một Nhà cấp phát (Issuer) khác hoặc xóa các chứng chỉ đó trước.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setBlockedDeleteModal(null)}
                className="btn btn-primary text-xs font-semibold px-4 py-2 rounded-xl"
              >
                Đã Hiểu (Đóng)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal (Safe Delete) */}
      {confirmDeleteIssuer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setConfirmDeleteIssuer(null)}>
          <div className="bg-surface border border-surface-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 pb-3 border-b border-surface-border text-red-400">
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-ink">Xác Nhận Xóa Issuer</h3>
                <p className="text-[11px] text-ink-muted">Hành động này không thể hoàn tác</p>
              </div>
            </div>

            <p className="text-xs text-ink-muted">
              Bạn có chắc chắn muốn xóa Nhà cấp phát <strong className="text-ink font-mono">{confirmDeleteIssuer.name}</strong> ({confirmDeleteIssuer.id}) khỏi hệ thống?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmDeleteIssuer(null)}
                className="btn btn-ghost text-xs px-4 py-2 rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={() => deleteMutation.mutate(confirmDeleteIssuer.id)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-xs transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa Issuer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface EditIssuerModalProps {
  issuer: Issuer | null;
  onClose: () => void;
  onSave: (data: { name: string; enabled: boolean; config: Record<string, unknown> }) => void;
  isSaving: boolean;
  error: string | null;
}

function EditIssuerModal({ issuer, onClose, onSave, isSaving, error }: EditIssuerModalProps) {
  const [name, setName] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [config, setConfig] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (issuer) {
      setName(issuer.name);
      setEnabled(issuer.enabled);
      setConfig(issuer.config || {});
    }
  }, [issuer]);

  if (!issuer) return null;

  const typeConfig = issuerTypes.find(
    (t) => t.id === issuer.type || (typeAliases[t.id] && typeAliases[t.id].includes(issuer.type))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), enabled, config });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-surface border border-surface-border rounded-2xl p-6 w-full max-w-xl shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-surface-border">
          <div className="flex items-center gap-2 font-bold text-sm text-ink">
            <Edit3 className="w-4 h-4 text-emerald-400" />
            <span>Chỉnh Sửa Nhà Cấp Phát (Edit Issuer)</span>
          </div>
          <button onClick={onClose} className="text-ink-muted hover:text-ink text-xs p-1">
            ✕
          </button>
        </div>

        <p className="text-xs text-ink-muted font-mono bg-surface-muted px-2.5 py-1 rounded-lg border border-surface-border inline-block">
          ID: {issuer.id} · Type: {typeLabels[issuer.type] || issuer.type}
        </p>

        {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-ink mb-1">Tên Issuer *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="block font-semibold text-ink mb-1">Trạng Thái Kích Hoạt</label>
            <select
              value={enabled ? 'true' : 'false'}
              onChange={(e) => setEnabled(e.target.value === 'true')}
              className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-emerald-400"
            >
              <option value="true">Enabled (Đang hoạt động)</option>
              <option value="false">Disabled (Tạm ngưng)</option>
            </select>
          </div>

          {typeConfig && typeConfig.configFields.length > 0 && (
            <div className="pt-2 border-t border-surface-border space-y-3">
              <h4 className="font-bold text-ink text-xs uppercase tracking-wider text-emerald-400">
                Thông Tin Cấu Hình Chữ Ký ({typeConfig.name})
              </h4>
              <ConfigForm
                fields={typeConfig.configFields}
                values={config}
                onChange={(key, value) => setConfig({ ...config, [key]: value })}
                editMode={true}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-surface-border">
            <button type="button" onClick={onClose} className="btn btn-ghost text-xs px-4 py-2 rounded-xl">
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="btn btn-primary text-xs font-semibold px-4 py-2 rounded-xl disabled:opacity-50"
            >
              {isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface CatalogCardProps {
  type: IssuerTypeConfig;
  status: 'connected' | 'available' | 'coming_soon';
  count: number;
  onConfigure: () => void;
  onFilter: () => void;
}

function CatalogCard({ type, status, count, onConfigure, onFilter }: CatalogCardProps) {
  const statusConfig = {
    connected: { label: `${count} configured`, cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-mono' },
    available: { label: 'Có sẵn', cls: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' },
    coming_soon: { label: 'Sắp ra mắt', cls: 'bg-gray-500/15 text-gray-400 border-gray-500/30' },
  };
  const { label, cls } = statusConfig[status];

  return (
    <div className={`p-4 border rounded-2xl transition-all ${
      status === 'coming_soon'
        ? 'border-surface-border/40 opacity-50 bg-surface/50'
        : 'border-surface-border bg-surface hover:border-emerald-500/40 shadow-sm'
    }`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{type.icon}</span>
          <span className="font-bold text-ink text-sm">{type.name}</span>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${cls}`}>{label}</span>
      </div>
      <p className="text-xs text-ink-muted mb-3 line-clamp-2">{type.description}</p>
      {status === 'connected' && (
        <button
          onClick={onFilter}
          className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
        >
          <span>Xem các issuers</span>
          <span>→</span>
        </button>
      )}
      {status === 'available' && (
        <button
          onClick={onConfigure}
          className="text-xs px-3 py-1 bg-emerald-500 text-slate-950 rounded-lg font-bold hover:bg-emerald-400 transition-colors shadow-sm"
        >
          Cấu hình ngay
        </button>
      )}
    </div>
  );
}

interface CreateIssuerModalProps {
  preselectedType: string | null;
  onSubmit: (name: string, type: string, config: Record<string, unknown>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

function CreateIssuerModal({ preselectedType, onSubmit, onCancel, isSubmitting }: CreateIssuerModalProps) {
  const [step, setStep] = useState<'type' | 'config'>(preselectedType ? 'config' : 'type');
  const [selectedType, setSelectedType] = useState<string | null>(preselectedType);
  const [form, setForm] = useState<Record<string, unknown>>(() => {
    if (preselectedType) {
      const tc = issuerTypes.find(t => t.id === preselectedType);
      const defaults: Record<string, unknown> = {};
      tc?.configFields.forEach(f => { if (f.defaultValue) defaults[f.key] = f.defaultValue; });
      return defaults;
    }
    return {};
  });

  const selectedTypeConfig = issuerTypes.find(t => t.id === selectedType);

  function handleTypeSelect(typeId: string) {
    setSelectedType(typeId);
    const tc = issuerTypes.find(t => t.id === typeId);
    const defaults: Record<string, unknown> = {};
    tc?.configFields.forEach(f => { if (f.defaultValue) defaults[f.key] = f.defaultValue; });
    setForm(defaults);
    setStep('config');
  }

  function handleSubmit() {
    if (!selectedType || !form.name) return;
    const config = { ...form };
    const name = config.name as string;
    delete config.name;
    onSubmit(name, selectedType, config);
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-surface-border rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        <div className="border-b border-surface-border px-6 py-4 flex justify-between items-center bg-surface-muted/50">
          <h2 className="text-base font-bold text-ink flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{step === 'type' ? 'Tạo Issuer Cấp Phát Chứng Chỉ' : `Cấu hình ${selectedTypeConfig?.name || 'Issuer'}`}</span>
          </h2>
          <button onClick={onCancel} className="text-ink-muted hover:text-ink text-sm">
            ✕
          </button>
        </div>

        <div className="px-6 py-6 max-h-[75vh] overflow-y-auto">
          {step === 'type' ? (
            <TypeSelector onSelect={handleTypeSelect} />
          ) : (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-ink mb-1.5">Tên Issuer *</label>
                <input
                  type="text"
                  value={(form.name as string) || ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ví dụ: Production CA"
                  className="w-full px-3 py-2 bg-surface-muted border border-surface-border rounded-xl text-sm text-ink placeholder-ink-faint focus:outline-none focus:border-emerald-400"
                />
              </div>
              {selectedTypeConfig && (
                <ConfigForm
                  fields={selectedTypeConfig.configFields}
                  values={form}
                  onChange={(key, value) => setForm({ ...form, [key]: value })}
                />
              )}
            </div>
          )}
        </div>

        <div className="border-t border-surface-border px-6 py-4 flex justify-end gap-3 bg-surface-muted/30">
          {step === 'config' && (
            <button
              onClick={() => setStep('type')}
              className="btn btn-ghost text-xs"
            >
              Quay lại
            </button>
          )}
          <button
            onClick={onCancel}
            className="btn btn-ghost text-xs"
          >
            Hủy
          </button>
          {step === 'config' && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !form.name}
              className="btn btn-primary text-xs font-semibold px-4 py-2 rounded-xl disabled:opacity-50"
            >
              {isSubmitting ? 'Đang khởi tạo...' : 'Tạo Issuer Mới'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
