import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Zap,
  Sparkles,
  Server,
  Terminal,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Layers,
  Cpu,
  Globe,
  Lock,
  Pencil,
} from 'lucide-react';
import { useTrackedMutation } from '../hooks/useTrackedMutation';
import { getTargets, createTarget, updateTarget, deleteTarget, getAgents } from '../api/client';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import type { Column } from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import ErrorState from '../components/ErrorState';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatDateTime } from '../api/utils';
import type { Target } from '../api/types';

const typeLabels: Record<string, string> = {
  NGINX: 'NGINX Web Server',
  Apache: 'Apache httpd',
  HAProxy: 'HAProxy Load Balancer',
  Traefik: 'Traefik Proxy',
  Caddy: 'Caddy Web Server',
  Envoy: 'Envoy Proxy',
  Postfix: 'Postfix MTA',
  Dovecot: 'Dovecot IMAP/POP3',
  F5: 'F5 BIG-IP',
  IIS: 'Windows IIS',
  SSH: 'SSH Remote Server',
  WinCertStore: 'Windows Cert Store',
  JavaKeystore: 'Java Keystore (JKS/PKCS12)',
  KubernetesSecrets: 'Kubernetes TLS Secrets',
};

const TARGET_TYPES = [
  { value: 'NGINX', label: 'NGINX', category: 'Web / Proxy', description: 'Ghi cert/key, kiểm tra cấu hình nginx -t & reload nginx' },
  { value: 'Apache', label: 'Apache httpd', category: 'Web / Proxy', description: 'Ghi riêng cert/chain/key, apachectl configtest & reload' },
  { value: 'IIS', label: 'Windows IIS', category: 'Windows', description: 'Quản lý Bindings HTTPS trên IIS Web Site qua PowerShell/WinRM' },
  { value: 'HAProxy', label: 'HAProxy', category: 'Web / Proxy', description: 'Tự động gộp Combined PEM file & reload haproxy service' },
  { value: 'F5', label: 'F5 BIG-IP', category: 'Appliance', description: 'Cập nhật SSL Profile & upload cert qua iControl REST API' },
  { value: 'Traefik', label: 'Traefik', category: 'Web / Proxy', description: 'Ghi cert/key vào thư mục watched directory của Traefik File Provider' },
  { value: 'Caddy', label: 'Caddy', category: 'Web / Proxy', description: 'Cập nhật trực tiếp qua Admin API hoặc File Provider' },
  { value: 'Envoy', label: 'Envoy', category: 'Web / Proxy', description: 'Tự động xuất SDS Config hoặc file cert/key cho Envoy Proxy' },
  { value: 'SSH', label: 'SSH Remote', category: 'Agentless', description: 'Triển khai từ xa qua SSH/SFTP không cần cài Agent' },
  { value: 'WinCertStore', label: 'Win Cert Store', category: 'Windows', description: 'Import cert vào Windows Store cho Exchange, RDP, SQL Server' },
  { value: 'JavaKeystore', label: 'Java Keystore', category: 'Application', description: 'Cập nhật file JKS / PKCS12 cho Tomcat, Spring Boot, Kafka' },
  { value: 'KubernetesSecrets', label: 'K8s Secrets', category: 'Cloud Native', description: 'Cập nhật kubernetes.io/tls Secrets trong K8s Namespace' },
  { value: 'Postfix', label: 'Postfix MTA', category: 'Mail', description: 'Ghi cert/key & tự động postfix reload' },
  { value: 'Dovecot', label: 'Dovecot IMAP', category: 'Mail', description: 'Ghi cert/key & tự động doveadm reload' },
];

export interface TargetPreset {
  id: string;
  name: string;
  badge: string;
  type: string;
  targetName: string;
  description: string;
  config: Record<string, string>;
}

const QUICK_PRESETS: TargetPreset[] = [
  {
    id: 'ubuntu-nginx',
    name: 'Ubuntu / Debian NGINX',
    badge: 'Ubuntu NGINX',
    type: 'NGINX',
    targetName: 'Target-Ubuntu-NGINX',
    description: '/etc/nginx/certs/, nginx -s reload',
    config: {
      cert_path: '/etc/nginx/certs/cert.pem',
      key_path: '/etc/nginx/certs/cert.key',
      chain_path: '/etc/nginx/certs/chain.pem',
      reload_command: 'nginx -s reload',
      validate_command: 'nginx -t',
    },
  },
  {
    id: 'ubuntu-apache',
    name: 'Ubuntu / Debian Apache',
    badge: 'Ubuntu Apache',
    type: 'Apache',
    targetName: 'Target-Ubuntu-Apache',
    description: '/etc/apache2/ssl/, systemctl reload apache2',
    config: {
      cert_path: '/etc/apache2/ssl/cert.pem',
      key_path: '/etc/apache2/ssl/cert.key',
      chain_path: '/etc/apache2/ssl/chain.pem',
      reload_command: 'systemctl reload apache2',
      validate_command: 'apache2ctl configtest',
    },
  },
  {
    id: 'win-nginx',
    name: 'Windows NGINX',
    badge: 'Windows NGINX',
    type: 'NGINX',
    targetName: 'Target-Windows-NGINX',
    description: 'C:\\nginx\\certs\\, nginx.exe -s reload',
    config: {
      cert_path: 'C:\\nginx\\certs\\cert.pem',
      key_path: 'C:\\nginx\\certs\\cert.key',
      reload_command: 'C:\\nginx\\nginx.exe -s reload',
      validate_command: 'C:\\nginx\\nginx.exe -t',
    },
  },
  {
    id: 'win-apache',
    name: 'Windows Apache',
    badge: 'Windows Apache',
    type: 'Apache',
    targetName: 'Target-Windows-Apache',
    description: 'C:\\Apache24\\conf\\ssl\\, httpd.exe -k restart',
    config: {
      cert_path: 'C:\\Apache24\\conf\\ssl\\cert.pem',
      key_path: 'C:\\Apache24\\conf\\ssl\\cert.key',
      chain_path: 'C:\\Apache24\\conf\\ssl\\chain.pem',
      reload_command: 'C:\\Apache24\\bin\\httpd.exe -k restart',
      validate_command: 'C:\\Apache24\\bin\\httpd.exe -t',
    },
  },
  {
    id: 'win-iis',
    name: 'Windows IIS (Default)',
    badge: 'Windows IIS',
    type: 'IIS',
    targetName: 'Target-Windows-IIS',
    description: 'Default Web Site, Store My, Port 443',
    config: {
      site_name: 'Default Web Site',
      cert_store: 'My',
      port: '443',
      ip_address: '*',
      sni: 'true',
      mode: 'local',
    },
  },
  {
    id: 'haproxy-linux',
    name: 'HAProxy Combined PEM',
    badge: 'HAProxy',
    type: 'HAProxy',
    targetName: 'Target-HAProxy',
    description: '/etc/haproxy/certs/combined.pem',
    config: {
      pem_path: '/etc/haproxy/certs/combined.pem',
      reload_command: 'systemctl reload haproxy',
      validate_command: 'haproxy -c -f /etc/haproxy/haproxy.cfg',
    },
  },
  {
    id: 'f5-bigip',
    name: 'F5 BIG-IP REST API',
    badge: 'F5 BIG-IP',
    type: 'F5',
    targetName: 'Target-F5-BIGIP',
    description: 'Port 443, Partition Common, Profile clientssl_api',
    config: {
      port: '443',
      partition: 'Common',
      ssl_profile: 'clientssl_api',
      insecure: 'true',
    },
  },
];

const CONFIG_FIELDS: Record<string, { key: string; label: string; placeholder: string; required?: boolean; hint?: string }[]> = {
  NGINX: [
    { key: 'cert_path', label: 'Certificate Path', placeholder: '/etc/nginx/certs/cert.pem', required: true, hint: 'Đường dẫn tới file lưu chứng chỉ public (.pem/.crt)' },
    { key: 'key_path', label: 'Key Path', placeholder: '/etc/nginx/certs/cert.key', required: true, hint: 'Đường dẫn tới file lưu khóa tư private key (.key)' },
    { key: 'chain_path', label: 'Chain Path (optional)', placeholder: '/etc/nginx/certs/chain.pem', hint: 'Đường dẫn file ca-chain (nếu tách riêng khỏi cert.pem)' },
    { key: 'reload_command', label: 'Reload Command', placeholder: 'nginx -s reload', hint: 'Lệnh nạp lại cấu hình webserver không gây gián đoạn' },
    { key: 'validate_command', label: 'Validate Command', placeholder: 'nginx -t', hint: 'Lệnh kiểm tra cú pháp cấu hình trước khi reload' },
  ],
  Apache: [
    { key: 'cert_path', label: 'Certificate Path (SSLCertificateFile)', placeholder: '/etc/apache2/ssl/cert.pem', required: true, hint: 'Đường dẫn SSLCertificateFile' },
    { key: 'key_path', label: 'Key Path (SSLCertificateKeyFile)', placeholder: '/etc/apache2/ssl/cert.key', required: true, hint: 'Đường dẫn SSLCertificateKeyFile' },
    { key: 'chain_path', label: 'Chain Path (SSLCertificateChainFile)', placeholder: '/etc/apache2/ssl/chain.pem', hint: 'Đường dẫn SSLCertificateChainFile' },
    { key: 'reload_command', label: 'Reload Command', placeholder: 'systemctl reload apache2', hint: 'Lệnh reload Apache (systemctl reload apache2 hoặc apachectl graceful)' },
    { key: 'validate_command', label: 'Validate Command', placeholder: 'apache2ctl configtest', hint: 'Lệnh kiểm tra file config apache' },
  ],
  HAProxy: [
    { key: 'pem_path', label: 'Combined PEM Path', placeholder: '/etc/haproxy/certs/combined.pem', required: true, hint: 'Đường dẫn file gộp cert + chain + key' },
    { key: 'reload_command', label: 'Reload Command', placeholder: 'systemctl reload haproxy' },
    { key: 'validate_command', label: 'Validate Command (optional)', placeholder: 'haproxy -c -f /etc/haproxy/haproxy.cfg' },
  ],
  Traefik: [
    { key: 'cert_dir', label: 'Certificate Directory', placeholder: '/etc/traefik/certs', required: true },
    { key: 'cert_file', label: 'Certificate Filename', placeholder: 'cert.pem (default)' },
    { key: 'key_file', label: 'Key Filename', placeholder: 'key.pem (default)' },
  ],
  Caddy: [
    { key: 'mode', label: 'Deployment Mode', placeholder: 'api (default) or file', required: true },
    { key: 'admin_api', label: 'Admin API URL', placeholder: 'http://localhost:2019 (default)' },
    { key: 'cert_dir', label: 'Certificate Directory (file mode)', placeholder: '/etc/caddy/certs' },
    { key: 'cert_file', label: 'Certificate Filename', placeholder: 'cert.pem (default)' },
    { key: 'key_file', label: 'Key Filename', placeholder: 'key.pem (default)' },
  ],
  Envoy: [
    { key: 'cert_dir', label: 'Certificate Directory', placeholder: '/etc/envoy/certs', required: true },
    { key: 'cert_filename', label: 'Certificate Filename', placeholder: 'cert.pem (default)' },
    { key: 'key_filename', label: 'Key Filename', placeholder: 'key.pem (default)' },
    { key: 'chain_filename', label: 'Chain Filename (optional)', placeholder: 'chain.pem' },
    { key: 'sds_config', label: 'Generate SDS Config', placeholder: 'true or false' },
  ],
  Postfix: [
    { key: 'cert_path', label: 'Certificate Path', placeholder: '/etc/postfix/certs/cert.pem' },
    { key: 'key_path', label: 'Key Path', placeholder: '/etc/postfix/certs/key.pem' },
    { key: 'chain_path', label: 'Chain Path (optional)', placeholder: '/etc/postfix/certs/chain.pem' },
    { key: 'reload_command', label: 'Reload Command', placeholder: 'postfix reload' },
    { key: 'validate_command', label: 'Validate Command', placeholder: 'postfix check' },
  ],
  Dovecot: [
    { key: 'mode', label: 'Mode', placeholder: 'dovecot (auto-set)' },
    { key: 'cert_path', label: 'Certificate Path', placeholder: '/etc/dovecot/certs/cert.pem' },
    { key: 'key_path', label: 'Key Path', placeholder: '/etc/dovecot/certs/key.pem' },
    { key: 'chain_path', label: 'Chain Path (optional)', placeholder: '/etc/dovecot/certs/chain.pem' },
    { key: 'reload_command', label: 'Reload Command', placeholder: 'doveadm reload' },
    { key: 'validate_command', label: 'Validate Command', placeholder: 'doveconf -n' },
  ],
  F5: [
    { key: 'host', label: 'Management Host', placeholder: 'f5.internal.example.com', required: true },
    { key: 'port', label: 'Management Port', placeholder: '443' },
    { key: 'username', label: 'Username', placeholder: 'admin', required: true },
    { key: 'password', label: 'Password', placeholder: 'F5 admin password', required: true },
    { key: 'partition', label: 'Partition', placeholder: 'Common' },
    { key: 'ssl_profile', label: 'SSL Profile', placeholder: 'clientssl_api', required: true },
    { key: 'insecure', label: 'Skip TLS Verify', placeholder: 'true (default)' },
    { key: 'timeout', label: 'Timeout (seconds)', placeholder: '30' },
  ],
  IIS: [
    { key: 'hostname', label: 'Target Hostname', placeholder: 'iis-server.example.com' },
    { key: 'site_name', label: 'IIS Site Name', placeholder: 'Default Web Site', required: true },
    { key: 'cert_store', label: 'Certificate Store', placeholder: 'My', required: true },
    { key: 'port', label: 'HTTPS Port', placeholder: '443' },
    { key: 'ip_address', label: 'Binding IP', placeholder: '*' },
    { key: 'binding_info', label: 'Host Header (SNI)', placeholder: 'www.example.com' },
    { key: 'sni', label: 'Enable SNI', placeholder: 'true or false' },
    { key: 'mode', label: 'Deployment Mode', placeholder: 'local (default) or winrm' },
    { key: 'winrm_host', label: 'WinRM Host (remote mode)', placeholder: 'iis-server.example.com' },
    { key: 'winrm_port', label: 'WinRM Port', placeholder: '5985 (HTTP) or 5986 (HTTPS)' },
    { key: 'winrm_username', label: 'WinRM Username', placeholder: 'Administrator' },
    { key: 'winrm_password', label: 'WinRM Password', placeholder: '(sensitive)' },
    { key: 'winrm_https', label: 'WinRM Use HTTPS', placeholder: 'true or false' },
    { key: 'winrm_insecure', label: 'WinRM Skip TLS Verify', placeholder: 'false' },
    { key: 'winrm_timeout', label: 'WinRM Timeout (seconds)', placeholder: '60' },
  ],
  SSH: [
    { key: 'host', label: 'SSH Host', placeholder: '192.168.1.100 or server.example.com', required: true },
    { key: 'port', label: 'SSH Port', placeholder: '22 (default)' },
    { key: 'user', label: 'SSH Username', placeholder: 'root or certctl', required: true },
    { key: 'auth_method', label: 'Auth Method', placeholder: 'key (default) or password' },
    { key: 'private_key_path', label: 'Private Key Path', placeholder: '/home/certctl/.ssh/id_ed25519' },
    { key: 'private_key', label: 'Inline Private Key PEM', placeholder: 'Paste PEM key (alternative to path)' },
    { key: 'password', label: 'SSH Password', placeholder: 'Leave empty for key auth' },
    { key: 'passphrase', label: 'Key Passphrase', placeholder: 'For encrypted private keys' },
    { key: 'cert_path', label: 'Remote Certificate Path', placeholder: '/etc/ssl/certs/cert.pem', required: true },
    { key: 'key_path', label: 'Remote Key Path', placeholder: '/etc/ssl/private/key.pem', required: true },
    { key: 'chain_path', label: 'Remote Chain Path (optional)', placeholder: '/etc/ssl/certs/chain.pem' },
    { key: 'cert_mode', label: 'Cert File Permissions', placeholder: '0644 (default)' },
    { key: 'key_mode', label: 'Key File Permissions', placeholder: '0600 (default)' },
    { key: 'reload_command', label: 'Reload Command (optional)', placeholder: 'systemctl reload nginx' },
    { key: 'timeout', label: 'Connection Timeout (seconds)', placeholder: '30 (default)' },
  ],
  WinCertStore: [
    { key: 'store_name', label: 'Certificate Store', placeholder: 'My (default)', required: true },
    { key: 'store_location', label: 'Store Location', placeholder: 'LocalMachine (default) or CurrentUser' },
    { key: 'friendly_name', label: 'Friendly Name (optional)', placeholder: 'My Production Cert' },
    { key: 'remove_expired', label: 'Remove Expired Certs', placeholder: 'false (default)' },
    { key: 'mode', label: 'Deployment Mode', placeholder: 'local (default) or winrm' },
    { key: 'winrm_host', label: 'WinRM Host (remote mode)', placeholder: 'win-server.example.com' },
    { key: 'winrm_port', label: 'WinRM Port', placeholder: '5985 (HTTP) or 5986 (HTTPS)' },
    { key: 'winrm_username', label: 'WinRM Username', placeholder: 'Administrator' },
    { key: 'winrm_password', label: 'WinRM Password', placeholder: '(sensitive)' },
    { key: 'winrm_https', label: 'WinRM Use HTTPS', placeholder: 'true or false' },
    { key: 'winrm_insecure', label: 'WinRM Skip TLS Verify', placeholder: 'false' },
  ],
  JavaKeystore: [
    { key: 'keystore_path', label: 'Keystore Path', placeholder: '/opt/app/conf/keystore.p12', required: true },
    { key: 'keystore_password', label: 'Keystore Password', placeholder: 'changeit', required: true },
    { key: 'keystore_type', label: 'Keystore Type', placeholder: 'PKCS12 (default) or JKS' },
    { key: 'alias', label: 'Key Alias', placeholder: 'server (default)' },
    { key: 'create_keystore', label: 'Create Keystore If Missing', placeholder: 'true (default)' },
    { key: 'reload_command', label: 'Reload Command (optional)', placeholder: 'systemctl restart tomcat' },
    { key: 'keytool_path', label: 'Keytool Path (optional)', placeholder: 'keytool (default, from PATH)' },
  ],
  KubernetesSecrets: [
    { key: 'namespace', label: 'Namespace', placeholder: 'default', required: true },
    { key: 'secret_name', label: 'Secret Name', placeholder: 'my-tls-secret', required: true },
    { key: 'labels', label: 'Labels (JSON)', placeholder: '{"app": "my-app"}' },
    { key: 'kubeconfig_path', label: 'Kubeconfig Path (optional)', placeholder: '/home/agent/.kube/config' },
  ],
};

function CreateTargetWizard({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [step, setStep] = useState<'type' | 'config' | 'review'>('type');
  const [targetType, setTargetType] = useState('');
  const [name, setName] = useState('');
  const [agentId, setAgentId] = useState('');
  const [config, setConfig] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  const { data: agentsResp } = useQuery({
    queryKey: ['agents', 'form'],
    queryFn: () => getAgents({ per_page: '500' }),
  });
  const agents = agentsResp?.data || [];

  const BOOL_FIELDS = new Set([
    'sni', 'insecure', 'sds_config', 'remove_expired', 'create_keystore',
    'winrm_https', 'winrm_insecure',
  ]);
  const INT_FIELDS = new Set([
    'port', 'timeout', 'winrm_port', 'winrm_timeout', 'timeout_seconds',
  ]);

  const coerceValue = (key: string, val: string): unknown => {
    if (BOOL_FIELDS.has(key)) return val === 'true';
    if (INT_FIELDS.has(key)) { const n = parseInt(val, 10); return isNaN(n) ? val : n; }
    return val;
  };

  const buildConfigPayload = () => {
    const flat = Object.fromEntries(Object.entries(config).filter(([, v]) => v));
    if (targetType === 'Dovecot' && !flat['mode']) {
      flat['mode'] = 'dovecot';
    }
    if (targetType === 'IIS') {
      const iisWinrmKeys = ['winrm_host', 'winrm_port', 'winrm_username', 'winrm_password', 'winrm_https', 'winrm_insecure', 'winrm_timeout'];
      const winrmObj: Record<string, unknown> = {};
      const result: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(flat)) {
        if (iisWinrmKeys.includes(k)) {
          winrmObj[k] = coerceValue(k, v);
        } else {
          result[k] = coerceValue(k, v);
        }
      }
      if (Object.keys(winrmObj).length > 0) {
        result['winrm'] = winrmObj;
      }
      return result;
    }
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(flat)) {
      result[k] = coerceValue(k, v);
    }
    return result;
  };

  const mutation = useTrackedMutation({
    mutationFn: () => createTarget({
      name,
      type: targetType,
      agent_id: agentId,
      config: buildConfigPayload(),
    }),
    invalidates: [['targets']],
    onSuccess: () => onSuccess(),
    onError: (err: Error) => setError(err.message),
  });

  const applyPreset = (preset: TargetPreset) => {
    setTargetType(preset.type);
    if (!name || name.startsWith('Target-') || name === 'web-server-1') {
      setName(preset.targetName);
    }
    setConfig({ ...preset.config });
    setActivePresetId(preset.id);
    toast.success(`⚡ Đã điền nhanh thông số mẫu ${preset.name}!`);
    setStep('config');
  };

  const fields = CONFIG_FIELDS[targetType] || [];
  const canProceedToReview = name && targetType && agentId && fields.filter(f => f.required).every(f => config[f.key]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-surface border border-surface-border rounded-xl p-6 w-full max-w-3xl shadow-2xl max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        
        {/* Header Title */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink flex items-center gap-2">
                Tạo Deployment Target Mới
              </h2>
              <p className="text-xs text-ink-muted">Cấu hình máy chủ web & tham số tự động triển khai chứng chỉ số</p>
            </div>
          </div>
          <button onClick={onClose} className="text-ink-muted hover:text-ink transition-colors p-1.5 rounded-lg hover:bg-surface-muted">
            ✕
          </button>
        </div>

        {/* Quick Fill Banner Presets */}
        <div className="mb-6 bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-cyan-950/40 border border-emerald-500/30 rounded-xl p-3.5">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>⚡ Điền Nhanh Thông Số Mẫu (Quick Fill Presets)</span>
            </div>
            <span className="text-[11px] text-ink-muted">Click để tự động nhập đầy đủ tham số chuẩn</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_PRESETS.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all flex items-center gap-1.5 shadow-sm ${
                  activePresetId === p.id
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-semibold ring-2 ring-emerald-500/40'
                    : 'bg-surface/80 hover:bg-emerald-900/30 text-ink border-emerald-500/30 hover:border-emerald-400 hover:text-emerald-300'
                }`}
                title={p.description}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{p.badge}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-between mb-6 px-2">
          {['Chọn Loạt Máy Chủ', 'Điền Thông Số Target', 'Xác Nhận & Tạo'].map((label, i) => {
            const stepNames = ['type', 'config', 'review'] as const;
            const currentIdx = stepNames.indexOf(step);
            const isActive = i === currentIdx;
            const isDone = i < currentIdx;
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  isDone
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : isActive
                    ? 'bg-brand-400 text-white ring-4 ring-brand-400/20 shadow-md'
                    : 'bg-surface-muted text-ink-muted border border-surface-border'
                }`}>
                  {isDone ? '✓' : i + 1}
                </div>
                <span className={`text-xs font-medium ${isActive ? 'text-ink font-semibold' : 'text-ink-muted'}`}>{label}</span>
                {i < 2 && <div className="w-12 sm:w-20 h-px bg-surface-border mx-1" />}
              </div>
            );
          })}
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-2.5 text-sm mb-4 flex items-center gap-2">
          <XCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>}

        {/* Step 1: Select Type */}
        {step === 'type' && (
          <div>
            <h3 className="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              Chọn Loại Máy Chủ Web / Dịch Vụ Đích
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[48vh] overflow-y-auto pr-1">
              {TARGET_TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => { setTargetType(t.value); setConfig({}); setStep('config'); }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    targetType === t.value
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-md ring-1 ring-emerald-500/30'
                      : 'border-surface-border hover:border-emerald-500/50 bg-surface/50 hover:bg-surface-muted/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-ink">{t.label}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-muted border border-surface-border text-ink-muted font-mono">
                      {t.category}
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted leading-relaxed">{t.description}</p>
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-surface-border">
              <button type="button" onClick={onClose} className="btn btn-ghost text-sm">Hủy</button>
              <button type="button" onClick={() => setStep('config')} disabled={!targetType}
                className="btn btn-primary text-sm disabled:opacity-50 flex items-center gap-1.5">
                Tiếp Theo ➔
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Configure */}
        {step === 'config' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  Cấu Hình Thông Số Cho {typeLabels[targetType] || targetType}
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">Vui lòng điền thông số hoặc chọn nút điền nhanh ở trên</p>
              </div>
              <button
                type="button"
                onClick={() => setConfig({})}
                className="text-xs text-ink-muted hover:text-red-400 flex items-center gap-1 transition-colors px-2 py-1 rounded bg-surface-muted border border-surface-border"
                title="Xóa toàn bộ giá trị đã điền"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Xóa thông số</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-1">
                <label className="text-xs font-medium text-ink-muted block mb-1">
                  Tên Target * <span className="text-ink-faint">(Định danh dễ nhớ)</span>
                </label>
                <input value={name} onChange={e => setName(e.target.value)}
                  className="w-full bg-surface border border-surface-border rounded-lg px-3.5 py-2 text-sm text-ink focus:outline-none focus:border-emerald-400"
                  placeholder="Target-Ubuntu-NGINX" />
              </div>

              <div className="sm:col-span-1">
                <label className="text-xs font-medium text-ink-muted block mb-1">
                  Máy Chủ Agent Quản Lý *
                </label>
                <select value={agentId} onChange={e => setAgentId(e.target.value)}
                  className="w-full bg-surface border border-surface-border rounded-lg px-3.5 py-2 text-sm text-ink focus:outline-none focus:border-emerald-400">
                  <option value="">-- Chọn Agent quản lý máy chủ --</option>
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>
                      🟢 {a.hostname || a.id} ({a.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic Config Fields */}
              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-surface-border/50 mt-2">
                {fields.map(f => (
                  <div key={f.key} className={f.key.includes('command') || f.key.includes('path') ? 'sm:col-span-2' : 'sm:col-span-1'}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-ink block">
                        {f.label} {f.required && <span className="text-emerald-400 font-bold">*</span>}
                      </label>
                      {f.hint && (
                        <span className="text-[11px] text-ink-muted font-normal italic">
                          {f.hint}
                        </span>
                      )}
                    </div>
                    <input
                      value={config[f.key] || ''}
                      onChange={e => setConfig(c => ({ ...c, [f.key]: e.target.value }))}
                      className="w-full bg-surface border border-surface-border rounded-lg px-3.5 py-2 text-sm text-ink font-mono focus:outline-none focus:border-emerald-400 transition-colors"
                      placeholder={f.placeholder}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between gap-3 mt-6 pt-4 border-t border-surface-border">
              <button type="button" onClick={() => setStep('type')} className="btn btn-ghost text-sm"> Quay Lại</button>
              <div className="flex gap-3">
                <button type="button" onClick={onClose} className="btn btn-ghost text-sm">Hủy</button>
                <button type="button" onClick={() => setStep('review')} disabled={!canProceedToReview}
                  className="btn btn-primary text-sm disabled:opacity-50 flex items-center gap-1.5">
                  Xác Nhận (Review) ➔
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 'review' && (
          <div>
            <h3 className="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Kiểm Tra Lại Cấu Hình Deployment Target
            </h3>
            
            <div className="bg-surface-muted/60 border border-surface-border rounded-xl p-4 space-y-3 text-sm">
              <div className="flex justify-between py-1 border-b border-surface-border/40">
                <span className="text-ink-muted text-xs">Tên Target</span>
                <span className="text-ink font-semibold">{name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-border/40">
                <span className="text-ink-muted text-xs">Loại Máy Chủ</span>
                <span className="badge badge-success">{typeLabels[targetType] || targetType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-border/40">
                <span className="text-ink-muted text-xs">Agent Gắn Liền</span>
                <span className="text-emerald-400 font-mono text-xs font-semibold">{agentId}</span>
              </div>
              
              <div className="pt-2">
                <div className="text-xs font-semibold text-ink-muted mb-2 uppercase tracking-wider">Thông số cấu hình chi tiết:</div>
                <div className="space-y-1.5">
                  {Object.entries(config).filter(([, v]) => v).map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center bg-surface p-2 rounded border border-surface-border/50 text-xs">
                      <span className="text-ink-muted font-mono">{k}</span>
                      <span className="text-ink font-mono font-semibold text-emerald-300 truncate max-w-sm ml-2">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-3 mt-6 pt-4 border-t border-surface-border">
              <button type="button" onClick={() => setStep('config')} className="btn btn-ghost text-sm"> Quay Lại Cấu Hình</button>
              <div className="flex gap-3">
                <button type="button" onClick={onClose} className="btn btn-ghost text-sm">Hủy</button>
                <button type="button" onClick={() => mutation.mutate()} disabled={mutation.isPending}
                  className="btn btn-primary text-sm disabled:opacity-50 flex items-center gap-1.5">
                  {mutation.isPending ? 'Đang Tạo...' : '⚡ Khởi Tạo Target'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EditTargetModal({ target, onClose, onSuccess }: { target: Target; onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState(target.name);
  const [agentId, setAgentId] = useState(target.agent_id || '');
  const [enabled, setEnabled] = useState(target.enabled !== false);
  const [config, setConfig] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    if (target.config) {
      for (const [k, v] of Object.entries(target.config)) {
        if (typeof v === 'object' && v !== null) {
          for (const [subK, subV] of Object.entries(v as Record<string, unknown>)) {
            init[subK] = String(subV ?? '');
          }
        } else {
          init[k] = String(v ?? '');
        }
      }
    }
    return init;
  });
  const [error, setError] = useState('');

  const { data: agentsResp } = useQuery({
    queryKey: ['agents', 'form'],
    queryFn: () => getAgents({ per_page: '500' }),
  });
  const agents = agentsResp?.data || [];

  const fields = CONFIG_FIELDS[target.type] || [];

  const mutation = useTrackedMutation({
    mutationFn: () => {
      const flat = Object.fromEntries(Object.entries(config).filter(([, v]) => v));
      const buildPayloadConfig = () => {
        if (target.type === 'IIS') {
          const iisWinrmKeys = ['winrm_host', 'winrm_port', 'winrm_username', 'winrm_password', 'winrm_https', 'winrm_insecure', 'winrm_timeout'];
          const winrmObj: Record<string, unknown> = {};
          const result: Record<string, unknown> = {};
          for (const [k, v] of Object.entries(flat)) {
            if (iisWinrmKeys.includes(k)) winrmObj[k] = v;
            else result[k] = v;
          }
          if (Object.keys(winrmObj).length > 0) result['winrm'] = winrmObj;
          return result;
        }
        return flat;
      };

      return updateTarget(target.id, {
        name,
        agent_id: agentId,
        enabled,
        config: buildPayloadConfig(),
      });
    },
    invalidates: [['targets']],
    onSuccess: () => onSuccess(),
    onError: (err: Error) => setError(err.message),
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-surface border border-surface-border rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[92vh] overflow-y-auto space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between pb-3 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink">Chỉnh Sửa Deployment Target</h3>
              <p className="text-xs text-ink-muted">Mã Target: <span className="font-mono text-emerald-400 font-semibold">{target.id}</span> ({typeLabels[target.type] || target.type})</p>
            </div>
          </div>
          <button onClick={onClose} className="text-ink-muted hover:text-ink text-xs p-1">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 text-xs">{error}</div>}

        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-ink mb-1">Tên Target (Name) *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-emerald-400"
              placeholder="e.g. Target-Ubuntu-NGINX"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">Agent Giao Phụ Trách *</label>
            <select
              value={agentId}
              onChange={e => setAgentId(e.target.value)}
              className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-emerald-400 font-mono"
            >
              <option value="">-- Chọn Agent --</option>
              {agents.map(a => (
                <option key={a.id} value={a.id}>
                  {a.hostname || a.id} ({a.status})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="edit-target-enabled"
              checked={enabled}
              onChange={e => setEnabled(e.target.checked)}
              className="rounded border-surface-border bg-surface-muted text-emerald-500 focus:ring-emerald-400"
            />
            <label htmlFor="edit-target-enabled" className="text-xs font-semibold text-ink">
              Kích hoạt Deployment Target này (Enabled)
            </label>
          </div>

          {/* Config Fields */}
          {fields.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-surface-border">
              <h4 className="font-bold text-xs text-emerald-400 uppercase tracking-wider">Thông Số Cấu Hình ({target.type})</h4>
              <div className="grid grid-cols-1 gap-3">
                {fields.map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-semibold text-ink mb-1">
                      {f.label} {f.required && <span className="text-red-400">*</span>}
                    </label>
                    <input
                      type="text"
                      value={config[f.key] || ''}
                      onChange={e => setConfig({ ...config, [f.key]: e.target.value })}
                      placeholder={f.placeholder}
                      className="w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2 text-xs text-ink font-mono focus:outline-none focus:border-emerald-400"
                    />
                    {f.hint && <p className="text-[10px] text-ink-faint mt-0.5">{f.hint}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-surface-border text-xs">
          <button onClick={onClose} className="btn btn-ghost px-4 py-2 rounded-xl">
            Hủy bỏ
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !name.trim() || !agentId}
            className="btn btn-primary font-semibold px-4 py-2 rounded-xl disabled:opacity-50 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Lưu Thay Đổi</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TargetsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editingTarget, setEditingTarget] = useState<Target | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Target | null>(null);
  const [search, setSearch] = useState('');

  const { data: targetsResp, isLoading, error, refetch } = useQuery({
    queryKey: ['targets'],
    queryFn: () => getTargets({ per_page: '500' }),
  });
  const targets = targetsResp?.data || [];

  const deleteMutation = useTrackedMutation({
    mutationFn: deleteTarget,
    invalidates: [['targets']],
    onSuccess: () => {
      setConfirmDelete(null);
      toast.success('Deleted target');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const filteredTargets = targets.filter(t => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q) ||
      t.type.toLowerCase().includes(q) ||
      (t.agent_id && t.agent_id.toLowerCase().includes(q))
    );
  });

  const columns: Column<Target>[] = [
    {
      key: 'name',
      label: 'Target Name',
      render: (t) => (
        <div>
          <Link to={`/targets/${t.id}`} className="font-semibold text-xs text-ink hover:text-emerald-400 transition-colors">
            {t.name}
          </Link>
          <div className="text-[10px] text-ink-faint font-mono">{t.id}</div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (t) => (
        <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          {typeLabels[t.type] || t.type}
        </span>
      ),
    },
    {
      key: 'agent',
      label: 'Assigned Agent',
      render: (t) => (
        <span className="text-xs text-ink font-mono bg-surface-muted px-2 py-1 rounded border border-surface-border">
          {t.agent_id || '—'}
        </span>
      ),
    },
    {
      key: 'enabled',
      label: 'Status',
      render: (t) => <StatusBadge status={t.enabled ? 'Enabled' : 'Disabled'} />,
    },
    {
      key: 'test_status',
      label: 'Connection Test',
      render: (t) => {
        if (!t.test_status || t.test_status === 'untested') return <span className="text-xs text-ink-faint">— Chưa kiểm tra —</span>;
        return (
          <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium ${
            t.test_status === 'success'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'bg-red-500/15 text-red-400 border border-red-500/30'
          }`}>
            {t.test_status === 'success' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            {t.test_status === 'success' ? 'Connected' : 'Failed'}
          </span>
        );
      },
    },
    {
      key: 'created',
      label: 'Created Date',
      render: (t) => <span className="text-xs text-ink-muted font-mono">{formatDateTime(t.created_at)}</span>,
    },
    {
      key: 'actions',
      label: '',
      render: (t) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); setEditingTarget(t); }}
            className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
            title="Sửa Target"
            aria-label="Edit Target"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Sửa</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setConfirmDelete(t); }}
            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-1 text-xs"
            title="Delete Target"
            aria-label="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-5 rounded-2xl border border-surface-border shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-ink flex items-center gap-2">
            <Server className="w-6 h-6 text-emerald-400" />
            Deployment Targets
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Quản lý danh sách các máy chủ đích (Web Server / Appliances) nhận chứng chỉ tự động
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm target..."
              className="bg-surface-muted border border-surface-border rounded-xl pl-9 pr-3 py-1.5 text-xs text-ink focus:outline-none focus:border-emerald-400 w-48 sm:w-64"
            />
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="btn btn-primary text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tạo Target Mới</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-surface rounded-2xl border border-surface-border shadow-sm overflow-hidden">
        {error ? (
          <ErrorState error={error as Error} onRetry={() => refetch()} />
        ) : (
          <DataTable columns={columns} data={filteredTargets} isLoading={isLoading} emptyMessage="Chưa có deployment target nào" />
        )}
      </div>

      {/* Create Target Wizard Modal */}
      {showCreate && (
        <CreateTargetWizard
          onClose={() => setShowCreate(false)}
          onSuccess={() => {
            setShowCreate(false);
            queryClient.invalidateQueries({ queryKey: ['targets'] });
            toast.success('Đã khởi tạo Deployment Target thành công!');
          }}
        />
      )}

      {/* Edit Target Modal */}
      {editingTarget && (
        <EditTargetModal
          target={editingTarget}
          onClose={() => setEditingTarget(null)}
          onSuccess={() => {
            setEditingTarget(null);
            queryClient.invalidateQueries({ queryKey: ['targets'] });
            toast.success('Đã cập nhật Deployment Target thành công!');
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={confirmDelete !== null}
        title="Delete deployment target"
        message={
          confirmDelete
            ? `Delete target ${confirmDelete.name}? Active deployments referencing this target will fail until reconfigured.`
            : ''
        }
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (confirmDelete) deleteMutation.mutate(confirmDelete.id);
          setConfirmDelete(null);
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
