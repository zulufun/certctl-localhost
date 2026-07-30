BEGIN;

-- 1. Add password_hash column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT NOT NULL DEFAULT '';

-- 2. Drop NOT NULL constraint on oidc_provider_id
ALTER TABLE users ALTER COLUMN oidc_provider_id DROP NOT NULL;

-- 3. Drop NOT NULL constraint on oidc_subject
ALTER TABLE users ALTER COLUMN oidc_subject DROP NOT NULL;

-- 4. Add unique constraint for email (since it will be used for login)
ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (tenant_id, email);

-- 5. Insert default admin user if not exists
INSERT INTO users (id, tenant_id, email, display_name, password_hash, created_at, updated_at)
VALUES (
    'u-admin',
    't-default',
    'admin@certctl.local',
    'Administrator',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Default password: "password". Change immediately after first login.
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- 6. Add auth.user.edit permission for local user management
INSERT INTO permissions (id, name, namespace)
VALUES ('p-auth-user-edit', 'auth.user.edit', 'auth.user')
ON CONFLICT DO NOTHING;

-- 7. Grant auth.user.edit to r-admin role
INSERT INTO role_permissions (role_id, permission_id, scope_type, scope_id)
VALUES ('r-admin', 'p-auth-user-edit', 'global', NULL)
ON CONFLICT DO NOTHING;

-- 8. Assign r-admin role to u-admin user
INSERT INTO actor_roles (id, actor_id, actor_type, role_id, granted_at, tenant_id, scope_type)
VALUES ('ar-admin-local', 'u-admin', 'User', 'r-admin', NOW(), 't-default', 'global')
ON CONFLICT DO NOTHING;

COMMIT;
