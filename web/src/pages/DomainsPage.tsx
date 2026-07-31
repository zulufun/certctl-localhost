import { useState, useEffect } from 'react';
import {
  Globe,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Shield,
  X,
  Search,
  Filter,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import type { Column } from '../components/DataTable';
import { formatDateTime } from '../api/utils';
import {
  getManagedDomains,
  addManagedDomain,
  updateManagedDomain,
  deleteManagedDomain,
  type DomainRecord,
} from '../api/domains';

const environmentStyles: Record<string, string> = {
  production: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  staging: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  internal: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  development: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
};

interface DomainModalProps {
  domain?: DomainRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

function DomainModal({ domain, isOpen, onClose, onSave }: DomainModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [associatedIPs, setAssociatedIPs] = useState('');
  const [environment, setEnvironment] = useState<'production' | 'staging' | 'internal' | 'development'>('production');
  const [isWildcardAllowed, setIsWildcardAllowed] = useState(true);

  useEffect(() => {
    if (domain) {
      setName(domain.name);
      setDescription(domain.description || '');
      setAssociatedIPs(domain.associated_ips || '');
      setEnvironment(domain.environment);
      setIsWildcardAllowed(domain.is_wildcard_allowed);
    } else {
      setName('');
      setDescription('');
      setAssociatedIPs('');
      setEnvironment('production');
      setIsWildcardAllowed(true);
    }
  }, [domain, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (domain) {
      updateManagedDomain(domain.id, {
        name: name.trim().toLowerCase(),
        description: description.trim(),
        associated_ips: associatedIPs.trim(),
        environment,
        is_wildcard_allowed: isWildcardAllowed,
      });
    } else {
      addManagedDomain({
        name: name.trim().toLowerCase(),
        description: description.trim(),
        associated_ips: associatedIPs.trim(),
        environment,
        is_wildcard_allowed: isWildcardAllowed,
      });
    }
    onSave();
    onClose();
  };

  const isEdit = Boolean(domain);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-surface border border-surface-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between pb-3 border-b border-surface-border">
          <div className="flex items-center gap-2 font-bold text-sm text-ink">
            {isEdit ? <Pencil className="w-4 h-4 text-emerald-400" /> : <Globe className="w-4 h-4 text-emerald-400" />}
            <span>{isEdit ? 'Chỉnh Sửa Domain' : 'Thêm Domain Mới Vừa Quản Lý'}</span>
          </div>
          <button onClick={onClose} className="text-ink-muted hover:text-ink text-xs p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-ink mb-1">Tên Tên Miền (Domain Name) *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. example.com hoặc sub.domain.org"
              className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-ink font-mono focus:outline-none focus:border-emerald-400"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-ink mb-1">Địa Chỉ IP Gắn Đi Kèm (Tùy chọn - Ngăn cách dấu phẩy)</label>
            <input
              type="text"
              value={associatedIPs}
              onChange={e => setAssociatedIPs(e.target.value)}
              placeholder="e.g. 10.1.0.12, 192.168.1.50"
              className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-ink font-mono focus:outline-none focus:border-emerald-400"
            />
            <span className="text-[10px] text-ink-faint mt-1 block">Dùng để ứng dụng tự động gợi ý điền IP vào ô SANs khi cấp phát chứng chỉ</span>
          </div>

          <div>
            <label className="block font-semibold text-ink mb-1">Mô Tả / Ghi Chú (Description)</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Miền dùng cho hệ thống API chính"
              className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="block font-semibold text-ink mb-1">Môi Trường Khai Thác (Environment) *</label>
            <select
              value={environment}
              onChange={e => setEnvironment(e.target.value as any)}
              className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-emerald-400"
            >
              <option value="production">Production (Vận hành chính)</option>
              <option value="staging">Staging (Kiểm thử)</option>
              <option value="internal">Internal (Mạng nội bộ)</option>
              <option value="development">Development (Phát triển)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="domain-wildcard"
              checked={isWildcardAllowed}
              onChange={e => setIsWildcardAllowed(e.target.checked)}
              className="w-4 h-4 rounded border-surface-border accent-emerald-500 cursor-pointer"
            />
            <label htmlFor="domain-wildcard" className="text-xs text-ink font-medium cursor-pointer">
              Cho phép cấp chứng chỉ Đại Diện Wildcard (*.domain)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-surface-border">
            <button type="button" onClick={onClose} className="btn btn-ghost text-xs px-4 py-2 rounded-xl">
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="btn btn-primary text-xs font-semibold px-4 py-2 rounded-xl disabled:opacity-50"
            >
              {isEdit ? 'Lưu Thay Đổi' : 'Thêm Domain'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DomainsPage() {
  const [domains, setDomains] = useState<DomainRecord[]>([]);
  const [search, setSearch] = useState('');
  const [envFilter, setEnvFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<DomainRecord | null>(null);

  const loadDomains = () => {
    setDomains(getManagedDomains());
  };

  useEffect(() => {
    loadDomains();
  }, []);

  const handleDelete = (domain: DomainRecord) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa domain "${domain.name}" khỏi danh sách quản lý?`)) return;
    deleteManagedDomain(domain.id);
    loadDomains();
  };

  const filteredDomains = domains.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) || (d.description && d.description.toLowerCase().includes(search.toLowerCase()));
    const matchesEnv = !envFilter || d.environment === envFilter;
    return matchesSearch && matchesEnv;
  });

  const wildcardCount = domains.filter(d => d.is_wildcard_allowed).length;

  const columns: Column<DomainRecord>[] = [
    {
      key: 'stt',
      label: 'STT',
      render: (_d, idx) => <span className="font-mono text-xs font-semibold text-ink-muted">{idx + 1}</span>,
      className: 'w-12 text-center',
    },
    {
      key: 'name',
      label: 'Tên Domain',
      render: (d) => (
        <div>
          <div className="font-bold text-sm text-ink font-mono flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>{d.name}</span>
          </div>
          <div className="text-[11px] text-ink-faint font-mono">{d.id}</div>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Mô Tả',
      render: (d) => <span className="text-xs text-ink-muted">{d.description || '—'}</span>,
    },
    {
      key: 'environment',
      label: 'Môi Trường',
      render: (d) => (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${environmentStyles[d.environment] || 'bg-surface-muted text-ink-muted border-surface-border'}`}>
          {d.environment}
        </span>
      ),
    },
    {
      key: 'wildcard',
      label: 'Cho Phép Wildcard',
      render: (d) => (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
          d.is_wildcard_allowed
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-surface-muted text-ink-muted border border-surface-border'
        }`}>
          {d.is_wildcard_allowed ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3 text-ink-faint" />}
          <span>{d.is_wildcard_allowed ? 'Có (*.domain)' : 'Không'}</span>
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Ngày Tạo',
      render: (d) => <span className="text-xs text-ink-muted font-mono">{formatDateTime(d.created_at)}</span>,
    },
    {
      key: 'actions',
      label: '',
      render: (d) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); setEditingDomain(d); setModalOpen(true); }}
            className="p-1.5 text-xs text-ink-muted hover:text-emerald-400 hover:bg-surface-muted rounded-lg transition-colors flex items-center gap-1 font-medium"
            title="Sửa domain"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Sửa</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(d); }}
            className="p-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-1 font-medium"
            title="Xóa domain"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Quản Lý Domain"
        subtitle={`${domains.length} tên miền được quản lý để cấp phát chứng chỉ SSL`}
        action={
          <button
            onClick={() => { setEditingDomain(null); setModalOpen(true); }}
            className="btn btn-primary text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Thêm Domain Mới</span>
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-surface p-4 rounded-2xl border border-surface-border flex items-center justify-between shadow-sm">
            <div>
              <div className="text-xs font-semibold text-ink-muted flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>Tổng Tên Miền Quản Lý</span>
              </div>
              <div className="text-2xl font-bold text-ink mt-1 font-mono">{domains.length}</div>
            </div>
            <div className="p-3 rounded-xl bg-surface-muted border border-surface-border text-emerald-400">
              <Globe className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-surface p-4 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 to-transparent flex items-center justify-between shadow-sm">
            <div>
              <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                <span>Hỗ Trợ Wildcard (*.domain)</span>
              </div>
              <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">{wildcardCount} / {domains.length}</div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Shield className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-surface p-4 rounded-2xl border border-surface-border flex items-center justify-between shadow-sm">
            <div>
              <div className="text-xs font-semibold text-ink-muted flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Miền Môi Trường Production</span>
              </div>
              <div className="text-2xl font-bold text-blue-400 mt-1 font-mono">
                {domains.filter(d => d.environment === 'production').length}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <CheckCircle2 className="w-5 h-5" />
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
                placeholder="Tìm kiếm domain hoặc mô tả..."
                className="w-full bg-surface-muted border border-surface-border rounded-xl pl-9 pr-3 py-1.5 text-xs text-ink focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-400" />
              <select
                value={envFilter}
                onChange={e => setEnvFilter(e.target.value)}
                className="bg-surface-muted border border-surface-border rounded-xl px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-emerald-400"
              >
                <option value="">Tất cả môi trường</option>
                <option value="production">Production</option>
                <option value="staging">Staging</option>
                <option value="internal">Internal</option>
                <option value="development">Development</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-surface rounded-2xl border border-surface-border shadow-sm overflow-hidden">
          <DataTable
            columns={columns}
            data={filteredDomains}
            isLoading={false}
            emptyMessage="Chưa có domain nào được tạo. Bấm '+ Thêm Domain Mới' để khai báo."
          />
        </div>
      </div>

      <DomainModal
        domain={editingDomain}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={loadDomains}
      />
    </>
  );
}
