import { useState, useRef, useEffect } from 'react';
import { Search, Plus, Globe, Check, ChevronDown } from 'lucide-react';
import { getManagedDomains, addManagedDomain, type DomainRecord } from '../api/domains';

interface DomainSelectorProps {
  value: string;
  onChange: (domainName: string, selectedDomain?: DomainRecord) => void;
  placeholder?: string;
  label?: string;
}

export default function DomainSelector({
  value,
  onChange,
  placeholder = '-- Chọn hoặc tìm kiếm Domain --',
  label,
}: DomainSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [domains, setDomains] = useState<DomainRecord[]>([]);
  const [showAddNew, setShowAddNew] = useState(false);
  const [newDomainName, setNewDomainName] = useState('');
  const [newDomainIPs, setNewDomainIPs] = useState('');
  const [newDomainEnv, setNewDomainEnv] = useState<'production' | 'staging' | 'internal' | 'development'>('production');

  const containerRef = useRef<HTMLDivElement>(null);

  const loadDomains = () => {
    setDomains(getManagedDomains());
  };

  useEffect(() => {
    loadDomains();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowAddNew(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredDomains = domains.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.associated_ips && d.associated_ips.includes(search)) ||
    d.environment.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (domain: DomainRecord) => {
    onChange(domain.name, domain);
    setIsOpen(false);
    setSearch('');
  };

  const handleCreateNewDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomainName.trim()) return;

    const created = addManagedDomain({
      name: newDomainName.trim().toLowerCase(),
      associated_ips: newDomainIPs.trim(),
      environment: newDomainEnv,
      is_wildcard_allowed: true,
    });

    loadDomains();
    onChange(created.name, created);
    setShowAddNew(false);
    setIsOpen(false);
    setNewDomainName('');
    setNewDomainIPs('');
  };

  const selectedDomainObj = domains.find((d) => d.name === value);

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && <label className="text-xs font-semibold text-ink block mb-1">{label}</label>}

      {/* Selector trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-surface border border-surface-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-emerald-400 text-left shadow-sm hover:border-emerald-500/50 transition-colors"
      >
        <div className="flex items-center gap-2 truncate">
          <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          {value ? (
            <span className="font-mono font-semibold text-ink">
              {value}
              {selectedDomainObj?.associated_ips && (
                <span className="ml-2 text-[10px] text-ink-muted font-normal">
                  (IP: {selectedDomainObj.associated_ips})
                </span>
              )}
            </span>
          ) : (
            <span className="text-ink-faint">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-ink-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-surface border border-surface-border rounded-2xl shadow-2xl z-50 overflow-hidden text-xs">
          {/* 1. Search Bar at Top */}
          <div className="p-2 border-b border-surface-border bg-surface-muted/50 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Gõ để tìm kiếm Domain hoặc IP..."
              className="w-full bg-transparent text-xs text-ink placeholder-ink-faint focus:outline-none"
              autoFocus
            />
          </div>

          {/* 2. Scrollable Domain List (max-h-60) */}
          <div className="max-h-60 overflow-y-auto custom-scrollbar p-1 space-y-0.5">
            {filteredDomains.length === 0 ? (
              <div className="p-3 text-center text-ink-muted text-[11px]">
                Không tìm thấy Domain nào khớp với &quot;{search}&quot;
              </div>
            ) : (
              filteredDomains.map((d) => {
                const isSelected = d.name === value;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => handleSelect(d)}
                    className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30'
                        : 'hover:bg-surface-muted text-ink'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">{d.name}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-surface-muted text-ink-muted font-mono border border-surface-border uppercase">
                          {d.environment}
                        </span>
                      </div>
                      {d.associated_ips && (
                        <div className="text-[10px] text-emerald-400/90 font-mono">
                          💡 IP: {d.associated_ips}
                        </div>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>

          {/* 3. Bottom Quick Add Button */}
          {!showAddNew ? (
            <div className="p-2 border-t border-surface-border bg-surface-muted/30">
              <button
                type="button"
                onClick={() => setShowAddNew(true)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Thêm Domain Mới Nhanh</span>
              </button>
            </div>
          ) : (
            /* Inline Form for Adding New Domain */
            <form onSubmit={handleCreateNewDomain} className="p-3 border-t border-surface-border bg-surface-muted space-y-2 text-xs">
              <div className="font-semibold text-emerald-400 flex items-center justify-between">
                <span>Thêm Domain Nhanh</span>
                <button type="button" onClick={() => setShowAddNew(false)} className="text-ink-muted hover:text-ink">
                  Hủy
                </button>
              </div>

              <div>
                <input
                  type="text"
                  value={newDomainName}
                  onChange={(e) => setNewDomainName(e.target.value)}
                  placeholder="Tên domain (ví dụ: api.internal.vn)"
                  className="w-full bg-surface border border-surface-border rounded-lg px-2.5 py-1.5 text-xs text-ink font-mono focus:outline-none focus:border-emerald-400"
                  required
                />
              </div>

              <div>
                <input
                  type="text"
                  value={newDomainIPs}
                  onChange={(e) => setNewDomainIPs(e.target.value)}
                  placeholder="IP gắn đi kèm (tùy chọn, ví dụ: 10.1.0.88)"
                  className="w-full bg-surface border border-surface-border rounded-lg px-2.5 py-1.5 text-xs text-ink font-mono focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={newDomainEnv}
                  onChange={(e) => setNewDomainEnv(e.target.value as any)}
                  className="bg-surface border border-surface-border rounded-lg px-2 py-1 text-[11px] text-ink focus:outline-none"
                >
                  <option value="production">Production</option>
                  <option value="internal">Internal</option>
                  <option value="staging">Staging</option>
                  <option value="development">Dev</option>
                </select>
                <button
                  type="submit"
                  disabled={!newDomainName.trim()}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-1 px-3 rounded-lg text-xs disabled:opacity-50"
                >
                  Tạo &amp; Chọn Nhãn
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
