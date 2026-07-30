import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  Plus,
  Edit3,
  Trash2,
  Clock,
  Key,
  Shield,
  Sparkles,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { useTrackedMutation } from '../hooks/useTrackedMutation';
import { getProfiles, deleteProfile, createProfile, updateProfile } from '../api/client';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import type { Column } from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import ErrorState from '../components/ErrorState';
import { formatDateTime } from '../api/utils';
import type { CertificateProfile } from '../api/types';

function formatTTL(seconds: number): string {
  if (seconds === 0) return 'Không giới hạn';
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

interface CreateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isLoading: boolean;
  error: string | null;
}

const AVAILABLE_ALGORITHMS = ['RSA', 'ECDSA', 'Ed25519'];
const ALGORITHM_MIN_SIZES: Record<string, number[]> = {
  RSA: [2048, 3072, 4096],
  ECDSA: [256, 384],
  Ed25519: [0],
};

const AVAILABLE_EKUS = [
  { value: 'serverAuth', label: 'Server Authentication (TLS)' },
  { value: 'clientAuth', label: 'Client Authentication' },
  { value: 'codeSigning', label: 'Code Signing' },
  { value: 'emailProtection', label: 'Email Protection (S/MIME)' },
  { value: 'timeStamping', label: 'Time Stamping' },
];

interface KeyAlgorithmEntry {
  algorithm: string;
  min_size: number;
}

function CreateProfileModal({ isOpen, onClose, onSuccess, isLoading, error }: CreateProfileModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ttl, setTtl] = useState('86400');
  const [shortLived, setShortLived] = useState(false);
  const [keyAlgorithms, setKeyAlgorithms] = useState<KeyAlgorithmEntry[]>([
    { algorithm: 'ECDSA', min_size: 256 },
    { algorithm: 'RSA', min_size: 2048 },
  ]);
  const [selectedEkus, setSelectedEkus] = useState<string[]>(['serverAuth']);
  const [sanPatterns, setSanPatterns] = useState('');
  const [spiffePattern, setSpiffePattern] = useState('');

  const addAlgorithm = () => {
    const unused = AVAILABLE_ALGORITHMS.find(a => !keyAlgorithms.some(ka => ka.algorithm === a));
    if (unused) {
      setKeyAlgorithms([...keyAlgorithms, { algorithm: unused, min_size: ALGORITHM_MIN_SIZES[unused][0] }]);
    }
  };

  const removeAlgorithm = (idx: number) => {
    setKeyAlgorithms(keyAlgorithms.filter((_, i) => i !== idx));
  };

  const updateAlgorithm = (idx: number, field: 'algorithm' | 'min_size', value: string | number) => {
    const updated = [...keyAlgorithms];
    if (field === 'algorithm') {
      updated[idx] = { algorithm: value as string, min_size: ALGORITHM_MIN_SIZES[value as string]?.[0] || 0 };
    } else {
      updated[idx] = { ...updated[idx], min_size: value as number };
    }
    setKeyAlgorithms(updated);
  };

  const toggleEku = (eku: string) => {
    setSelectedEkus(prev => prev.includes(eku) ? prev.filter(e => e !== eku) : [...prev, eku]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createProfile({
      name: name.trim(),
      description: description.trim(),
      max_ttl_seconds: parseInt(ttl) || 86400,
      allow_short_lived: shortLived,
      allowed_key_algorithms: keyAlgorithms,
      allowed_ekus: selectedEkus,
      required_san_patterns: sanPatterns.trim() ? sanPatterns.split(',').map(s => s.trim()).filter(Boolean) : [],
      spiffe_uri_pattern: spiffePattern.trim() || '',
      enabled: true,
    });
    setName('');
    setDescription('');
    setTtl('86400');
    setShortLived(false);
    setKeyAlgorithms([{ algorithm: 'ECDSA', min_size: 256 }, { algorithm: 'RSA', min_size: 2048 }]);
    setSelectedEkus(['serverAuth']);
    setSanPatterns('');
    setSpiffePattern('');
    onSuccess();
  };

  if (!isOpen) return null;

  const inputClass = 'w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-emerald-400';
  const selectClass = 'bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-emerald-400';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-surface border border-surface-border rounded-2xl p-6 w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between pb-3 border-b border-surface-border">
          <h2 className="text-base font-bold text-ink flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span>Tạo Certificate Profile Mới</span>
          </h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink text-xs">✕</button>
        </div>

        {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Tên Profile *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className={inputClass}
              placeholder="Ví dụ: Web Server TLS Profile"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink mb-1">Mô tả</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className={inputClass}
              placeholder="Mô tả mục đích sử dụng profile này"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Thời Hạn Tối Đa Max TTL (Giây)</label>
              <input
                type="number"
                value={ttl}
                onChange={e => setTtl(e.target.value)}
                className={inputClass}
                placeholder="86400"
              />
              <p className="text-[11px] text-ink-muted mt-1">
                {shortLived ? 'Cấp ngắn hạn yêu cầu TTL < 3600s' : 'Ví dụ: 86400s = 1 ngày'}
              </p>
            </div>

            <div className="flex items-center pt-4">
              <label className="flex items-center gap-2.5 cursor-pointer bg-surface-muted/50 p-2.5 rounded-xl border border-surface-border w-full">
                <input
                  type="checkbox"
                  checked={shortLived}
                  onChange={e => {
                    setShortLived(e.target.checked);
                    if (e.target.checked && parseInt(ttl) >= 3600) {
                      setTtl('300');
                    }
                  }}
                  className="w-4 h-4 text-emerald-500 rounded focus:ring-0"
                />
                <div className="text-xs">
                  <span className="font-bold text-ink block">Allow Short-Lived</span>
                  <span className="text-[10px] text-ink-muted">Cho phép chứng chỉ siêu ngắn hạn</span>
                </div>
              </label>
            </div>
          </div>

          {/* Allowed Key Algorithms */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-ink">Thuật Toán Khóa Cho Phép (Algorithms)</label>
              {keyAlgorithms.length < AVAILABLE_ALGORITHMS.length && (
                <button type="button" onClick={addAlgorithm} className="text-xs text-emerald-400 font-bold hover:underline">
                  + Thêm Thuật Toán
                </button>
              )}
            </div>
            <div className="space-y-2">
              {keyAlgorithms.map((ka, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    value={ka.algorithm}
                    onChange={e => updateAlgorithm(idx, 'algorithm', e.target.value)}
                    className={selectClass + ' flex-1'}
                  >
                    {AVAILABLE_ALGORITHMS.map(a => (
                      <option key={a} value={a} disabled={a !== ka.algorithm && keyAlgorithms.some(k => k.algorithm === a)}>
                        {a}
                      </option>
                    ))}
                  </select>
                  {ka.algorithm !== 'Ed25519' ? (
                    <select
                      value={ka.min_size}
                      onChange={e => updateAlgorithm(idx, 'min_size', parseInt(e.target.value))}
                      className={selectClass + ' w-28'}
                    >
                      {(ALGORITHM_MIN_SIZES[ka.algorithm] || []).map(s => (
                        <option key={s} value={s}>{s}+ bits</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs text-ink-muted w-28 text-center bg-surface-muted py-2 rounded-xl border border-surface-border">fixed</span>
                  )}
                  <button type="button" onClick={() => removeAlgorithm(idx)} className="text-xs text-red-400 font-bold px-2">
                    Xóa
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Allowed EKUs */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">Mục Đích Sử Dụng Khóa (EKUs)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-surface-muted/50 p-3 rounded-xl border border-surface-border">
              {AVAILABLE_EKUS.map(eku => (
                <label key={eku.value} className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={selectedEkus.includes(eku.value)}
                    onChange={() => toggleEku(eku.value)}
                    className="w-3.5 h-3.5 text-emerald-500 rounded focus:ring-0"
                  />
                  <span className="text-ink">{eku.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* SAN Patterns */}
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Mẫu Tên Miền Bắt Buộc (SAN Patterns)</label>
            <input
              value={sanPatterns}
              onChange={e => setSanPatterns(e.target.value)}
              className={inputClass}
              placeholder="*.example.com, *.internal.bqp"
            />
          </div>

          {/* SPIFFE URI */}
          <div>
            <label className="block text-xs font-medium text-ink mb-1">SPIFFE URI Pattern</label>
            <input
              value={spiffePattern}
              onChange={e => setSpiffePattern(e.target.value)}
              className={inputClass}
              placeholder="spiffe://example.org/service/*"
            />
          </div>

          <div className="flex gap-3 pt-3">
            <button type="button" onClick={onClose} className="btn btn-ghost text-xs flex-1">
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary text-xs font-semibold flex-1 rounded-xl disabled:opacity-50"
            >
              {isLoading ? 'Đang tạo...' : 'Tạo Certificate Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProfilesPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editingProfile, setEditingProfile] = useState<CertificateProfile | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => getProfiles(),
  });

  const deleteMutation = useTrackedMutation({
    mutationFn: deleteProfile,
    invalidates: [['profiles']],
  });

  const createMutation = useTrackedMutation({
    mutationFn: createProfile,
    invalidates: [['profiles']],
    onSuccess: () => {
      setShowCreate(false);
    },
  });

  const updateMutation = useTrackedMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CertificateProfile> }) => updateProfile(id, data),
    invalidates: [['profiles']],
    onSuccess: () => {
      setEditingProfile(null);
    },
  });

  const columns: Column<CertificateProfile>[] = [
    {
      key: 'name',
      label: 'Profile Name & ID',
      render: (p) => (
        <div>
          <div className="font-bold text-ink text-sm">{p.name}</div>
          <div className="text-[11px] text-ink-faint font-mono mt-0.5">{p.id}</div>
          {p.description && (
            <div className="text-xs text-ink-muted mt-1 max-w-xs truncate italic">{p.description}</div>
          )}
        </div>
      ),
    },
    {
      key: 'algorithms',
      label: 'Thuật Toán Khóa',
      render: (p) => (
        <div className="flex flex-wrap gap-1">
          {(p.allowed_key_algorithms || []).map((alg, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono bg-surface-muted border border-surface-border text-emerald-400 font-semibold">
              <Key className="w-3 h-3" />
              <span>{alg.algorithm} {alg.min_size}+</span>
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'ttl',
      label: 'Max TTL',
      render: (p) => (
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-ink">{formatTTL(p.max_ttl_seconds)}</span>
          {p.allow_short_lived && (
            <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
              <Zap className="w-3 h-3" />
              <span>short-lived</span>
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'ekus',
      label: 'EKUs',
      render: (p) => (
        <div className="flex flex-wrap gap-1">
          {(p.allowed_ekus || []).map((eku, i) => (
            <span key={i} className="text-xs text-ink-muted bg-surface-muted px-2 py-0.5 rounded border border-surface-border font-mono">
              {eku}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'spiffe',
      label: 'SPIFFE Pattern',
      render: (p) => (
        p.spiffe_uri_pattern
          ? <span className="text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{p.spiffe_uri_pattern}</span>
          : <span className="text-ink-faint text-xs">&mdash;</span>
      ),
    },
    {
      key: 'enabled',
      label: 'Trạng Thái',
      render: (p) => <StatusBadge status={p.enabled ? 'active' : 'disabled'} />,
    },
    {
      key: 'created',
      label: 'Ngày Tạo',
      render: (p) => <span className="text-xs text-ink-muted font-mono">{formatDateTime(p.created_at)}</span>,
    },
    {
      key: 'actions',
      label: '',
      render: (p) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); setEditingProfile(p); }}
            className="px-2.5 py-1 text-xs font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg transition-colors flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); if (confirm(`Delete profile ${p.name}?`)) deleteMutation.mutate(p.id); }}
            className="px-2.5 py-1 text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Certificate Profiles"
        subtitle={data ? `${data.total} profiles` : undefined}
        action={
          <button
            onClick={() => setShowCreate(true)}
            className="btn btn-primary text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/10"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Profile</span>
          </button>
        }
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Main Content */}
        <div className="bg-surface rounded-2xl border border-surface-border shadow-sm overflow-hidden">
          {error ? (
            <ErrorState error={error as Error} onRetry={() => refetch()} />
          ) : (
            <DataTable columns={columns} data={data?.data || []} isLoading={isLoading} emptyMessage="No profiles configured" />
          )}
        </div>
      </div>

      <CreateProfileModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['profiles'] });
          setShowCreate(false);
        }}
        isLoading={createMutation.isPending}
        error={createMutation.error ? (createMutation.error as Error).message : null}
      />

      <EditProfileModal
        profile={editingProfile}
        onClose={() => setEditingProfile(null)}
        onSave={(data) => {
          if (!editingProfile) return;
          updateMutation.mutate({ id: editingProfile.id, data });
        }}
        isSaving={updateMutation.isPending}
        error={updateMutation.error ? (updateMutation.error as Error).message : null}
      />
    </>
  );
}

interface EditProfileModalProps {
  profile: CertificateProfile | null;
  onClose: () => void;
  onSave: (data: Partial<CertificateProfile>) => void;
  isSaving: boolean;
  error: string | null;
}

function EditProfileModal({ profile, onClose, onSave, isSaving, error }: EditProfileModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setDescription(profile.description || '');
    }
  }, [profile]);

  if (!profile) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      description: description.trim(),
      allowed_key_algorithms: profile.allowed_key_algorithms,
      max_ttl_seconds: profile.max_ttl_seconds,
      allowed_ekus: profile.allowed_ekus,
      required_san_patterns: profile.required_san_patterns,
      spiffe_uri_pattern: profile.spiffe_uri_pattern,
      allow_short_lived: profile.allow_short_lived,
      enabled: profile.enabled,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-surface border border-surface-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-ink flex items-center gap-2">
          <Edit3 className="w-5 h-5 text-emerald-400" />
          <span>Edit Profile Metadata</span>
        </h2>
        <p className="text-xs text-ink-muted font-mono bg-surface-muted px-2.5 py-1 rounded-lg border border-surface-border">
          ID: {profile.id}
        </p>
        {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Tên Profile *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-sm text-ink focus:outline-none focus:border-emerald-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Mô Tả</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-emerald-400"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-ghost text-xs flex-1">Hủy</button>
            <button type="submit" disabled={isSaving} className="btn btn-primary text-xs font-semibold flex-1 rounded-xl">
              {isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
