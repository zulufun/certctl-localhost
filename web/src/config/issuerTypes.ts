/**
 * Shared issuer type configuration.
 * Imported by IssuersPage.tsx (M33), and will be reused by M34 (Dynamic Issuer Config)
 * for its 3-step wizard config forms.
 */

export interface ConfigField {
  key: string;
  label: string;
  type?: 'text' | 'password' | 'number' | 'select' | 'textarea';
  placeholder?: string;
  required: boolean;
  options?: string[];
  defaultValue?: string;
  /** Mark fields that contain secrets (tokens, keys, passwords).
   *  Display as ******** when viewing existing config. M34 will use this
   *  for AES-GCM encryption decisions. */
  sensitive?: boolean;
}

export interface IssuerTypeConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  configFields: ConfigField[];
  /** If true, this type is not yet implemented — show as "Coming Soon" */
  comingSoon?: boolean;
}

/**
 * Canonical type label map. Keys MUST match backend IssuerType constants
 * defined in internal/domain/connector.go (e.g., "ACME", "GenericCA", "StepCA").
 */
export const typeLabels: Record<string, string> = {
  GenericCA: 'Local CA',
  local: 'Local CA',          // backward compat for old DB records
  local_ca: 'Local CA',       // backward compat (some frontend references)
  ACME: 'ACME',
  acme: 'ACME',               // backward compat for old DB records
  StepCA: 'step-ca',
  stepca: 'step-ca',          // backward compat for old DB records
  OpenSSL: 'OpenSSL/Custom',
  openssl: 'OpenSSL/Custom',  // backward compat for old DB records

};

/**
 * All supported issuer types.
 * Order: most common first, enterprise/commercial last.
 */
export const issuerTypes: IssuerTypeConfig[] = [
  {
    id: 'ACME',
    name: 'ACME',
    description: "ACME-compatible CA (e.g. Step-CA, Pebble)",
    icon: '\uD83D\uDD12',
    configFields: [
      { key: 'directory_url', label: 'Directory URL', placeholder: 'https://acme.internal/directory', required: true },
      { key: 'email', label: 'Email', placeholder: 'admin@example.com', required: true },
      { key: 'challenge_type', label: 'Challenge Type', type: 'select', options: ['http-01', 'dns-01', 'dns-persist-01'], required: false, defaultValue: 'http-01' },
      { key: 'profile', label: 'Certificate Profile', type: 'select', options: ['', 'tlsserver', 'shortlived'], required: false, defaultValue: '' },
      { key: 'eab_kid', label: 'EAB Key ID', placeholder: 'External Account Binding Key ID (optional)', required: false },
      { key: 'eab_hmac', label: 'EAB HMAC Key', placeholder: 'External Account Binding HMAC key', required: false, type: 'password', sensitive: true },
    ],
  },
  {
    id: 'GenericCA',
    name: 'Local CA',
    description: 'Self-signed or subordinate CA for internal certificates',
    icon: '\uD83C\uDFE0',
    configFields: [
      { key: 'ca_cert_path', label: 'CA Cert Path (optional)', placeholder: '/path/to/ca.crt', required: false },
      { key: 'ca_key_path', label: 'CA Key Path (optional)', placeholder: '/path/to/ca.key', required: false, sensitive: true },
    ],
  },
  {
    id: 'StepCA',
    name: 'step-ca',
    description: 'Smallstep private CA with JWK provisioner auth',
    icon: '\uD83D\uDC63',
    configFields: [
      { key: 'ca_url', label: 'CA URL', placeholder: 'https://ca.example.com', required: true },
      { key: 'provisioner_name', label: 'Provisioner Name', placeholder: 'my-provisioner', required: true },
      { key: 'provisioner_key_path', label: 'Provisioner Key Path', placeholder: '/path/to/provisioner.key', required: false, sensitive: true },
      { key: 'provisioner_password', label: 'Provisioner Password', placeholder: 'Password for encrypted key', required: false, type: 'password', sensitive: true },
    ],
  },
  {
    id: 'OpenSSL',
    name: 'OpenSSL/Custom',
    description: 'Script-based signing with your own CA',
    icon: '\uD83D\uDD27',
    configFields: [
      { key: 'sign_script', label: 'Sign Script Path', placeholder: '/path/to/sign.sh', required: true },
      { key: 'revoke_script', label: 'Revoke Script Path (optional)', placeholder: '/path/to/revoke.sh', required: false },
      { key: 'crl_script', label: 'CRL Script Path (optional)', placeholder: '/path/to/crl.sh', required: false },
      { key: 'timeout_seconds', label: 'Timeout (seconds)', placeholder: '30', type: 'number', required: false },
    ],
  },
];

/** Sensitive config key patterns for redaction in display */
const SENSITIVE_PATTERNS = ['password', 'secret', 'token', 'key', 'hmac', 'private'];

/** Check if a config key should be redacted */
export function isSensitiveKey(key: string): boolean {
  const lower = key.toLowerCase();
  return SENSITIVE_PATTERNS.some(p => lower.includes(p));
}

/** Redact sensitive values in a config object */
export function redactConfig(config: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(config).map(([k, v]) => [k, isSensitiveKey(k) ? '********' : v])
  );
}

/**
 * Returns catalog status info per issuer type.
 * M36 (Onboarding) will use this to detect first-run state.
 */
export function getIssuerCatalogStatus(
  configuredIssuers: { type: string }[]
): { type: IssuerTypeConfig; status: 'connected' | 'available' | 'coming_soon'; count: number }[] {
  return issuerTypes.map(t => {
    if (t.comingSoon) {
      return { type: t, status: 'coming_soon' as const, count: 0 };
    }
    // Match both the canonical id and common aliases
    const aliases: Record<string, string[]> = {
      GenericCA: ['GenericCA', 'local', 'local_ca'],
      ACME: ['ACME', 'acme'],
      StepCA: ['StepCA', 'stepca'],
      OpenSSL: ['OpenSSL', 'openssl'],
    };
    const matchIds = aliases[t.id] || [t.id];
    const matching = configuredIssuers.filter(i => matchIds.includes(i.type));
    return {
      type: t,
      status: matching.length > 0 ? 'connected' as const : 'available' as const,
      count: matching.length,
    };
  });
}
