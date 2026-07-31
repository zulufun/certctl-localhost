export interface DomainRecord {
  id: string;
  name: string;
  description?: string;
  environment: 'production' | 'staging' | 'internal' | 'development';
  is_wildcard_allowed: boolean;
  associated_ips?: string; // Comma separated IP addresses linked to this domain
  created_at: string;
  updated_at: string;
}

const STORAGE_KEY = 'certctl.domains';

const DEFAULT_DOMAINS: DomainRecord[] = [
  {
    id: 'dom-001',
    name: 'example.com',
    description: 'Chính chủ miền tổ chức chính',
    environment: 'production',
    is_wildcard_allowed: true,
    associated_ips: '93.184.216.34',
    created_at: new Date('2026-01-15T08:00:00Z').toISOString(),
    updated_at: new Date('2026-01-15T08:00:00Z').toISOString(),
  },
  {
    id: 'dom-002',
    name: 'api.example.com',
    description: 'Cổng dịch vụ API Backend',
    environment: 'production',
    is_wildcard_allowed: false,
    associated_ips: '10.1.0.12, 10.1.0.13',
    created_at: new Date('2026-02-01T09:30:00Z').toISOString(),
    updated_at: new Date('2026-02-01T09:30:00Z').toISOString(),
  },
  {
    id: 'dom-003',
    name: 'internal.bqp.vn',
    description: 'Miền nội bộ hệ thống hạ tầng BQP',
    environment: 'internal',
    is_wildcard_allowed: true,
    associated_ips: '10.1.0.50',
    created_at: new Date('2026-03-10T10:15:00Z').toISOString(),
    updated_at: new Date('2026-03-10T10:15:00Z').toISOString(),
  },
];

export function getManagedDomains(): DomainRecord[] {
  if (typeof localStorage === 'undefined') return DEFAULT_DOMAINS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DOMAINS));
      return DEFAULT_DOMAINS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_DOMAINS;
  }
}

export function saveManagedDomains(domains: DomainRecord[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(domains));
  } catch (err) {
    console.error('Failed to save domains:', err);
  }
}

export function addManagedDomain(data: Omit<DomainRecord, 'id' | 'created_at' | 'updated_at'>): DomainRecord {
  const current = getManagedDomains();
  const newDomain: DomainRecord = {
    ...data,
    id: `dom-${Date.now().toString(36)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const updated = [newDomain, ...current];
  saveManagedDomains(updated);
  return newDomain;
}

export function updateManagedDomain(id: string, data: Partial<Omit<DomainRecord, 'id' | 'created_at'>>): DomainRecord {
  const current = getManagedDomains();
  let updatedRecord: DomainRecord | null = null;
  const updated = current.map(item => {
    if (item.id === id) {
      updatedRecord = {
        ...item,
        ...data,
        updated_at: new Date().toISOString(),
      };
      return updatedRecord;
    }
    return item;
  });
  saveManagedDomains(updated);
  if (!updatedRecord) throw new Error(`Domain not found: ${id}`);
  return updatedRecord;
}

export function deleteManagedDomain(id: string): void {
  const current = getManagedDomains();
  const updated = current.filter(item => item.id !== id);
  saveManagedDomains(updated);
}
