--
-- PostgreSQL database dump
--

\restrict rG5wGIczaozvGIGJ1PITYWfK110GLHIaePYSdP1P5SP0bNfgnNfScUEpgf2gcWR

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_tenant_id_fkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_oidc_provider_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS sessions_tenant_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS sessions_signing_key_id_fkey;
ALTER TABLE IF EXISTS ONLY public.session_signing_keys DROP CONSTRAINT IF EXISTS session_signing_keys_tenant_id_fkey;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_tenant_id_fkey;
ALTER TABLE IF EXISTS ONLY public.role_permissions DROP CONSTRAINT IF EXISTS role_permissions_role_id_fkey;
ALTER TABLE IF EXISTS ONLY public.role_permissions DROP CONSTRAINT IF EXISTS role_permissions_permission_id_fkey;
ALTER TABLE IF EXISTS ONLY public.renewal_policies DROP CONSTRAINT IF EXISTS renewal_policies_certificate_profile_id_fkey;
ALTER TABLE IF EXISTS ONLY public.renewal_policies DROP CONSTRAINT IF EXISTS renewal_policies_agent_group_id_fkey;
ALTER TABLE IF EXISTS ONLY public.policy_violations DROP CONSTRAINT IF EXISTS policy_violations_rule_id_fkey;
ALTER TABLE IF EXISTS ONLY public.policy_violations DROP CONSTRAINT IF EXISTS policy_violations_certificate_id_fkey;
ALTER TABLE IF EXISTS ONLY public.owners DROP CONSTRAINT IF EXISTS owners_team_id_fkey;
ALTER TABLE IF EXISTS ONLY public.oidc_providers DROP CONSTRAINT IF EXISTS oidc_providers_tenant_id_fkey;
ALTER TABLE IF EXISTS ONLY public.oidc_pre_login_sessions DROP CONSTRAINT IF EXISTS oidc_pre_login_sessions_tenant_id_fkey;
ALTER TABLE IF EXISTS ONLY public.oidc_pre_login_sessions DROP CONSTRAINT IF EXISTS oidc_pre_login_sessions_signing_key_id_fkey;
ALTER TABLE IF EXISTS ONLY public.oidc_pre_login_sessions DROP CONSTRAINT IF EXISTS oidc_pre_login_sessions_oidc_provider_id_fkey;
ALTER TABLE IF EXISTS ONLY public.ocsp_response_cache DROP CONSTRAINT IF EXISTS ocsp_response_cache_issuer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.ocsp_responders DROP CONSTRAINT IF EXISTS ocsp_responders_issuer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notification_events DROP CONSTRAINT IF EXISTS notification_events_certificate_id_fkey;
ALTER TABLE IF EXISTS ONLY public.managed_certificates DROP CONSTRAINT IF EXISTS managed_certificates_team_id_fkey;
ALTER TABLE IF EXISTS ONLY public.managed_certificates DROP CONSTRAINT IF EXISTS managed_certificates_renewal_policy_id_fkey;
ALTER TABLE IF EXISTS ONLY public.managed_certificates DROP CONSTRAINT IF EXISTS managed_certificates_owner_id_fkey;
ALTER TABLE IF EXISTS ONLY public.managed_certificates DROP CONSTRAINT IF EXISTS managed_certificates_issuer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.managed_certificates DROP CONSTRAINT IF EXISTS managed_certificates_certificate_profile_id_fkey;
ALTER TABLE IF EXISTS ONLY public.jobs DROP CONSTRAINT IF EXISTS jobs_target_id_fkey;
ALTER TABLE IF EXISTS ONLY public.jobs DROP CONSTRAINT IF EXISTS jobs_certificate_id_fkey;
ALTER TABLE IF EXISTS ONLY public.jobs DROP CONSTRAINT IF EXISTS jobs_agent_id_fkey;
ALTER TABLE IF EXISTS ONLY public.issuance_approval_requests DROP CONSTRAINT IF EXISTS issuance_approval_requests_profile_id_fkey;
ALTER TABLE IF EXISTS ONLY public.issuance_approval_requests DROP CONSTRAINT IF EXISTS issuance_approval_requests_job_id_fkey;
ALTER TABLE IF EXISTS ONLY public.issuance_approval_requests DROP CONSTRAINT IF EXISTS issuance_approval_requests_certificate_id_fkey;
ALTER TABLE IF EXISTS ONLY public.intermediate_cas DROP CONSTRAINT IF EXISTS intermediate_cas_parent_ca_id_fkey;
ALTER TABLE IF EXISTS ONLY public.intermediate_cas DROP CONSTRAINT IF EXISTS intermediate_cas_owning_issuer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.group_role_mappings DROP CONSTRAINT IF EXISTS group_role_mappings_tenant_id_fkey;
ALTER TABLE IF EXISTS ONLY public.group_role_mappings DROP CONSTRAINT IF EXISTS group_role_mappings_role_id_fkey;
ALTER TABLE IF EXISTS ONLY public.group_role_mappings DROP CONSTRAINT IF EXISTS group_role_mappings_provider_id_fkey;
ALTER TABLE IF EXISTS ONLY public.endpoint_health_history DROP CONSTRAINT IF EXISTS endpoint_health_history_health_check_id_fkey;
ALTER TABLE IF EXISTS ONLY public.endpoint_health_checks DROP CONSTRAINT IF EXISTS endpoint_health_checks_network_scan_target_id_fkey;
ALTER TABLE IF EXISTS ONLY public.endpoint_health_checks DROP CONSTRAINT IF EXISTS endpoint_health_checks_certificate_id_fkey;
ALTER TABLE IF EXISTS ONLY public.discovery_scans DROP CONSTRAINT IF EXISTS discovery_scans_agent_id_fkey;
ALTER TABLE IF EXISTS ONLY public.discovered_certificates DROP CONSTRAINT IF EXISTS discovered_certificates_managed_certificate_id_fkey;
ALTER TABLE IF EXISTS ONLY public.discovered_certificates DROP CONSTRAINT IF EXISTS discovered_certificates_discovery_scan_id_fkey;
ALTER TABLE IF EXISTS ONLY public.discovered_certificates DROP CONSTRAINT IF EXISTS discovered_certificates_agent_id_fkey;
ALTER TABLE IF EXISTS ONLY public.deployment_targets DROP CONSTRAINT IF EXISTS deployment_targets_agent_id_fkey;
ALTER TABLE IF EXISTS ONLY public.crl_cache DROP CONSTRAINT IF EXISTS crl_cache_issuer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.certificate_versions DROP CONSTRAINT IF EXISTS certificate_versions_certificate_id_fkey;
ALTER TABLE IF EXISTS ONLY public.certificate_target_mappings DROP CONSTRAINT IF EXISTS certificate_target_mappings_target_id_fkey;
ALTER TABLE IF EXISTS ONLY public.certificate_target_mappings DROP CONSTRAINT IF EXISTS certificate_target_mappings_certificate_id_fkey;
ALTER TABLE IF EXISTS ONLY public.certificate_revocations DROP CONSTRAINT IF EXISTS certificate_revocations_issuer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.certificate_revocations DROP CONSTRAINT IF EXISTS certificate_revocations_certificate_id_fkey;
ALTER TABLE IF EXISTS ONLY public.breakglass_credentials DROP CONSTRAINT IF EXISTS breakglass_credentials_tenant_id_fkey;
ALTER TABLE IF EXISTS ONLY public.breakglass_credentials DROP CONSTRAINT IF EXISTS breakglass_credentials_actor_id_fkey;
ALTER TABLE IF EXISTS ONLY public.api_keys DROP CONSTRAINT IF EXISTS api_keys_tenant_id_fkey;
ALTER TABLE IF EXISTS ONLY public.agent_group_members DROP CONSTRAINT IF EXISTS agent_group_members_agent_id_fkey;
ALTER TABLE IF EXISTS ONLY public.agent_group_members DROP CONSTRAINT IF EXISTS agent_group_members_agent_group_id_fkey;
ALTER TABLE IF EXISTS ONLY public.actor_roles DROP CONSTRAINT IF EXISTS actor_roles_tenant_id_fkey;
ALTER TABLE IF EXISTS ONLY public.actor_roles DROP CONSTRAINT IF EXISTS actor_roles_role_id_fkey;
ALTER TABLE IF EXISTS ONLY public.acme_orders DROP CONSTRAINT IF EXISTS acme_orders_certificate_id_fkey;
ALTER TABLE IF EXISTS ONLY public.acme_orders DROP CONSTRAINT IF EXISTS acme_orders_account_id_fkey;
ALTER TABLE IF EXISTS ONLY public.acme_challenges DROP CONSTRAINT IF EXISTS acme_challenges_authz_id_fkey;
ALTER TABLE IF EXISTS ONLY public.acme_authorizations DROP CONSTRAINT IF EXISTS acme_authorizations_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.acme_accounts DROP CONSTRAINT IF EXISTS acme_accounts_profile_id_fkey;
ALTER TABLE IF EXISTS ONLY public.acme_accounts DROP CONSTRAINT IF EXISTS acme_accounts_owner_id_fkey;
DROP TRIGGER IF EXISTS audit_events_worm_trigger ON public.audit_events;
DROP TRIGGER IF EXISTS audit_events_hash_chain_trigger ON public.audit_events;
DROP INDEX IF EXISTS public.rate_limit_buckets_updated_at_idx;
DROP INDEX IF EXISTS public.idx_users_email;
DROP INDEX IF EXISTS public.idx_teams_name;
DROP INDEX IF EXISTS public.idx_sessions_pre_login_gc;
DROP INDEX IF EXISTS public.idx_sessions_actor_id;
DROP INDEX IF EXISTS public.idx_sessions_active;
DROP INDEX IF EXISTS public.idx_sessions_absolute_expires_at;
DROP INDEX IF EXISTS public.idx_session_signing_keys_active;
DROP INDEX IF EXISTS public.idx_scep_probe_results_target_url;
DROP INDEX IF EXISTS public.idx_scep_probe_results_probed_at;
DROP INDEX IF EXISTS public.idx_role_permissions_role;
DROP INDEX IF EXISTS public.idx_renewal_policies_name;
DROP INDEX IF EXISTS public.idx_policy_violations_severity;
DROP INDEX IF EXISTS public.idx_policy_violations_rule_id;
DROP INDEX IF EXISTS public.idx_policy_violations_certificate_id;
DROP INDEX IF EXISTS public.idx_policy_rules_name;
DROP INDEX IF EXISTS public.idx_policy_rules_enabled;
DROP INDEX IF EXISTS public.idx_owners_team_id;
DROP INDEX IF EXISTS public.idx_owners_email;
DROP INDEX IF EXISTS public.idx_oidc_pre_login_provider;
DROP INDEX IF EXISTS public.idx_oidc_pre_login_expires;
DROP INDEX IF EXISTS public.idx_oidc_bcl_consumed_jtis_expires;
DROP INDEX IF EXISTS public.idx_ocsp_response_cache_next_update;
DROP INDEX IF EXISTS public.idx_ocsp_response_cache_issuer;
DROP INDEX IF EXISTS public.idx_ocsp_responders_not_after;
DROP INDEX IF EXISTS public.idx_notification_events_type;
DROP INDEX IF EXISTS public.idx_notification_events_status;
DROP INDEX IF EXISTS public.idx_notification_events_retry_sweep;
DROP INDEX IF EXISTS public.idx_notification_events_certificate_id;
DROP INDEX IF EXISTS public.idx_network_scan_targets_enabled;
DROP INDEX IF EXISTS public.idx_managed_certificates_team_id;
DROP INDEX IF EXISTS public.idx_managed_certificates_status;
DROP INDEX IF EXISTS public.idx_managed_certificates_profile_id;
DROP INDEX IF EXISTS public.idx_managed_certificates_owner_id;
DROP INDEX IF EXISTS public.idx_managed_certificates_name;
DROP INDEX IF EXISTS public.idx_managed_certificates_issuer_id;
DROP INDEX IF EXISTS public.idx_managed_certificates_expires_at;
DROP INDEX IF EXISTS public.idx_jobs_verified_at;
DROP INDEX IF EXISTS public.idx_jobs_verification_status;
DROP INDEX IF EXISTS public.idx_jobs_status_scheduled_at;
DROP INDEX IF EXISTS public.idx_jobs_status;
DROP INDEX IF EXISTS public.idx_jobs_scheduled_at;
DROP INDEX IF EXISTS public.idx_jobs_certificate_id;
DROP INDEX IF EXISTS public.idx_jobs_agent_id;
DROP INDEX IF EXISTS public.idx_issuers_name;
DROP INDEX IF EXISTS public.idx_issuers_enabled;
DROP INDEX IF EXISTS public.idx_intermediate_ca_unique_name_per_issuer;
DROP INDEX IF EXISTS public.idx_intermediate_ca_state;
DROP INDEX IF EXISTS public.idx_intermediate_ca_parent;
DROP INDEX IF EXISTS public.idx_intermediate_ca_owning_issuer;
DROP INDEX IF EXISTS public.idx_intermediate_ca_expiring;
DROP INDEX IF EXISTS public.idx_intermediate_ca_active_root_per_issuer;
DROP INDEX IF EXISTS public.idx_health_history_check_time;
DROP INDEX IF EXISTS public.idx_health_checks_status;
DROP INDEX IF EXISTS public.idx_health_checks_endpoint;
DROP INDEX IF EXISTS public.idx_health_checks_enabled;
DROP INDEX IF EXISTS public.idx_health_checks_certificate;
DROP INDEX IF EXISTS public.idx_group_role_mappings_provider_id;
DROP INDEX IF EXISTS public.idx_discovery_scans_started_at;
DROP INDEX IF EXISTS public.idx_discovery_scans_agent_id;
DROP INDEX IF EXISTS public.idx_discovered_certs_status;
DROP INDEX IF EXISTS public.idx_discovered_certs_not_after;
DROP INDEX IF EXISTS public.idx_discovered_certs_managed_id;
DROP INDEX IF EXISTS public.idx_discovered_certs_fingerprint_agent_path;
DROP INDEX IF EXISTS public.idx_discovered_certs_fingerprint;
DROP INDEX IF EXISTS public.idx_discovered_certs_agent_id;
DROP INDEX IF EXISTS public.idx_deployment_targets_retired_at;
DROP INDEX IF EXISTS public.idx_deployment_targets_name;
DROP INDEX IF EXISTS public.idx_deployment_targets_enabled;
DROP INDEX IF EXISTS public.idx_deployment_targets_agent_name;
DROP INDEX IF EXISTS public.idx_deployment_targets_agent_id;
DROP INDEX IF EXISTS public.idx_crl_generation_events_issuer_started;
DROP INDEX IF EXISTS public.idx_crl_cache_next_update;
DROP INDEX IF EXISTS public.idx_certificate_versions_fingerprint;
DROP INDEX IF EXISTS public.idx_certificate_versions_certificate_id;
DROP INDEX IF EXISTS public.idx_certificate_versions_cert_created;
DROP INDEX IF EXISTS public.idx_certificate_target_mappings_target_id;
DROP INDEX IF EXISTS public.idx_certificate_revocations_serial_lookup;
DROP INDEX IF EXISTS public.idx_certificate_revocations_revoked_at;
DROP INDEX IF EXISTS public.idx_certificate_revocations_issuer_serial;
DROP INDEX IF EXISTS public.idx_certificate_revocations_cert_id;
DROP INDEX IF EXISTS public.idx_certificate_profiles_name;
DROP INDEX IF EXISTS public.idx_certificate_profiles_enabled;
DROP INDEX IF EXISTS public.idx_breakglass_credentials_locked_until;
DROP INDEX IF EXISTS public.idx_breakglass_credentials_actor_id;
DROP INDEX IF EXISTS public.idx_audit_events_timestamp_desc;
DROP INDEX IF EXISTS public.idx_audit_events_timestamp;
DROP INDEX IF EXISTS public.idx_audit_events_resource_type_id;
DROP INDEX IF EXISTS public.idx_audit_events_event_category;
DROP INDEX IF EXISTS public.idx_audit_events_category_timestamp;
DROP INDEX IF EXISTS public.idx_audit_events_actor;
DROP INDEX IF EXISTS public.idx_audit_events_action;
DROP INDEX IF EXISTS public.idx_approval_state;
DROP INDEX IF EXISTS public.idx_approval_pending_per_job;
DROP INDEX IF EXISTS public.idx_approval_pending_age;
DROP INDEX IF EXISTS public.idx_approval_kind;
DROP INDEX IF EXISTS public.idx_approval_certificate;
DROP INDEX IF EXISTS public.idx_api_keys_tenant_id;
DROP INDEX IF EXISTS public.idx_api_keys_created_by;
DROP INDEX IF EXISTS public.idx_agents_status;
DROP INDEX IF EXISTS public.idx_agents_retired_at;
DROP INDEX IF EXISTS public.idx_agents_os;
DROP INDEX IF EXISTS public.idx_agents_online_heartbeat;
DROP INDEX IF EXISTS public.idx_agents_last_heartbeat_at;
DROP INDEX IF EXISTS public.idx_agents_hostname;
DROP INDEX IF EXISTS public.idx_agents_architecture;
DROP INDEX IF EXISTS public.idx_agent_groups_name;
DROP INDEX IF EXISTS public.idx_agent_groups_enabled;
DROP INDEX IF EXISTS public.idx_agent_group_members_agent;
DROP INDEX IF EXISTS public.idx_actor_roles_scope;
DROP INDEX IF EXISTS public.idx_actor_roles_role;
DROP INDEX IF EXISTS public.idx_actor_roles_actor;
DROP INDEX IF EXISTS public.idx_acme_orders_status;
DROP INDEX IF EXISTS public.idx_acme_orders_expires;
DROP INDEX IF EXISTS public.idx_acme_orders_account;
DROP INDEX IF EXISTS public.idx_acme_nonces_expires;
DROP INDEX IF EXISTS public.idx_acme_challenges_authz;
DROP INDEX IF EXISTS public.idx_acme_authz_status;
DROP INDEX IF EXISTS public.idx_acme_authz_order;
DROP INDEX IF EXISTS public.idx_acme_accounts_status;
DROP INDEX IF EXISTS public.idx_acme_accounts_jwk_thumb;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_oidc_provider_id_oidc_subject_key;
ALTER TABLE IF EXISTS ONLY public.tenants DROP CONSTRAINT IF EXISTS tenants_pkey;
ALTER TABLE IF EXISTS ONLY public.teams DROP CONSTRAINT IF EXISTS teams_pkey;
ALTER TABLE IF EXISTS ONLY public.teams DROP CONSTRAINT IF EXISTS teams_name_key;
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.session_signing_keys DROP CONSTRAINT IF EXISTS session_signing_keys_pkey;
ALTER TABLE IF EXISTS ONLY public.schema_migrations DROP CONSTRAINT IF EXISTS schema_migrations_pkey;
ALTER TABLE IF EXISTS ONLY public.scep_probe_results DROP CONSTRAINT IF EXISTS scep_probe_results_pkey;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_tenant_id_name_key;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_pkey;
ALTER TABLE IF EXISTS ONLY public.role_permissions DROP CONSTRAINT IF EXISTS role_permissions_unique;
ALTER TABLE IF EXISTS ONLY public.role_permissions DROP CONSTRAINT IF EXISTS role_permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.renewal_policies DROP CONSTRAINT IF EXISTS renewal_policies_pkey;
ALTER TABLE IF EXISTS ONLY public.renewal_policies DROP CONSTRAINT IF EXISTS renewal_policies_name_key;
ALTER TABLE IF EXISTS ONLY public.rate_limit_buckets DROP CONSTRAINT IF EXISTS rate_limit_buckets_pkey;
ALTER TABLE IF EXISTS ONLY public.policy_violations DROP CONSTRAINT IF EXISTS policy_violations_pkey;
ALTER TABLE IF EXISTS ONLY public.policy_rules DROP CONSTRAINT IF EXISTS policy_rules_pkey;
ALTER TABLE IF EXISTS ONLY public.policy_rules DROP CONSTRAINT IF EXISTS policy_rules_name_key;
ALTER TABLE IF EXISTS ONLY public.permissions DROP CONSTRAINT IF EXISTS permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.permissions DROP CONSTRAINT IF EXISTS permissions_name_key;
ALTER TABLE IF EXISTS ONLY public.owners DROP CONSTRAINT IF EXISTS owners_pkey;
ALTER TABLE IF EXISTS ONLY public.oidc_providers DROP CONSTRAINT IF EXISTS oidc_providers_tenant_id_name_key;
ALTER TABLE IF EXISTS ONLY public.oidc_providers DROP CONSTRAINT IF EXISTS oidc_providers_pkey;
ALTER TABLE IF EXISTS ONLY public.oidc_pre_login_sessions DROP CONSTRAINT IF EXISTS oidc_pre_login_sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.oidc_bcl_consumed_jtis DROP CONSTRAINT IF EXISTS oidc_bcl_consumed_jtis_pkey;
ALTER TABLE IF EXISTS ONLY public.ocsp_response_cache DROP CONSTRAINT IF EXISTS ocsp_response_cache_pkey;
ALTER TABLE IF EXISTS ONLY public.ocsp_responders DROP CONSTRAINT IF EXISTS ocsp_responders_pkey;
ALTER TABLE IF EXISTS ONLY public.notification_events DROP CONSTRAINT IF EXISTS notification_events_pkey;
ALTER TABLE IF EXISTS ONLY public.network_scan_targets DROP CONSTRAINT IF EXISTS network_scan_targets_pkey;
ALTER TABLE IF EXISTS ONLY public.managed_certificates DROP CONSTRAINT IF EXISTS managed_certificates_pkey;
ALTER TABLE IF EXISTS ONLY public.managed_certificates DROP CONSTRAINT IF EXISTS managed_certificates_name_key;
ALTER TABLE IF EXISTS ONLY public.jobs DROP CONSTRAINT IF EXISTS jobs_pkey;
ALTER TABLE IF EXISTS ONLY public.issuers DROP CONSTRAINT IF EXISTS issuers_pkey;
ALTER TABLE IF EXISTS ONLY public.issuers DROP CONSTRAINT IF EXISTS issuers_name_key;
ALTER TABLE IF EXISTS ONLY public.issuance_approval_requests DROP CONSTRAINT IF EXISTS issuance_approval_requests_pkey;
ALTER TABLE IF EXISTS ONLY public.intermediate_cas DROP CONSTRAINT IF EXISTS intermediate_cas_pkey;
ALTER TABLE IF EXISTS ONLY public.group_role_mappings DROP CONSTRAINT IF EXISTS group_role_mappings_provider_id_group_name_role_id_key;
ALTER TABLE IF EXISTS ONLY public.group_role_mappings DROP CONSTRAINT IF EXISTS group_role_mappings_pkey;
ALTER TABLE IF EXISTS ONLY public.endpoint_health_history DROP CONSTRAINT IF EXISTS endpoint_health_history_pkey;
ALTER TABLE IF EXISTS ONLY public.endpoint_health_checks DROP CONSTRAINT IF EXISTS endpoint_health_checks_pkey;
ALTER TABLE IF EXISTS ONLY public.discovery_scans DROP CONSTRAINT IF EXISTS discovery_scans_pkey;
ALTER TABLE IF EXISTS ONLY public.discovered_certificates DROP CONSTRAINT IF EXISTS discovered_certificates_pkey;
ALTER TABLE IF EXISTS ONLY public.deployment_targets DROP CONSTRAINT IF EXISTS deployment_targets_pkey;
ALTER TABLE IF EXISTS ONLY public.crl_generation_events DROP CONSTRAINT IF EXISTS crl_generation_events_pkey;
ALTER TABLE IF EXISTS ONLY public.crl_cache DROP CONSTRAINT IF EXISTS crl_cache_pkey;
ALTER TABLE IF EXISTS ONLY public.certificate_versions DROP CONSTRAINT IF EXISTS certificate_versions_pkey;
ALTER TABLE IF EXISTS ONLY public.certificate_versions DROP CONSTRAINT IF EXISTS certificate_versions_fingerprint_sha256_key;
ALTER TABLE IF EXISTS ONLY public.certificate_target_mappings DROP CONSTRAINT IF EXISTS certificate_target_mappings_pkey;
ALTER TABLE IF EXISTS ONLY public.certificate_revocations DROP CONSTRAINT IF EXISTS certificate_revocations_pkey;
ALTER TABLE IF EXISTS ONLY public.certificate_profiles DROP CONSTRAINT IF EXISTS certificate_profiles_pkey;
ALTER TABLE IF EXISTS ONLY public.certificate_profiles DROP CONSTRAINT IF EXISTS certificate_profiles_name_key;
ALTER TABLE IF EXISTS ONLY public.breakglass_credentials DROP CONSTRAINT IF EXISTS breakglass_credentials_pkey;
ALTER TABLE IF EXISTS ONLY public.audit_events DROP CONSTRAINT IF EXISTS audit_events_pkey;
ALTER TABLE IF EXISTS ONLY public.audit_chain_head DROP CONSTRAINT IF EXISTS audit_chain_head_pkey;
ALTER TABLE IF EXISTS ONLY public.api_keys DROP CONSTRAINT IF EXISTS api_keys_pkey;
ALTER TABLE IF EXISTS ONLY public.api_keys DROP CONSTRAINT IF EXISTS api_keys_name_key;
ALTER TABLE IF EXISTS ONLY public.api_keys DROP CONSTRAINT IF EXISTS api_keys_key_hash_key;
ALTER TABLE IF EXISTS ONLY public.agents DROP CONSTRAINT IF EXISTS agents_pkey;
ALTER TABLE IF EXISTS ONLY public.agents DROP CONSTRAINT IF EXISTS agents_name_key;
ALTER TABLE IF EXISTS ONLY public.agent_groups DROP CONSTRAINT IF EXISTS agent_groups_pkey;
ALTER TABLE IF EXISTS ONLY public.agent_groups DROP CONSTRAINT IF EXISTS agent_groups_name_key;
ALTER TABLE IF EXISTS ONLY public.agent_group_members DROP CONSTRAINT IF EXISTS agent_group_members_pkey;
ALTER TABLE IF EXISTS ONLY public.actor_roles DROP CONSTRAINT IF EXISTS actor_roles_pkey;
ALTER TABLE IF EXISTS ONLY public.actor_roles DROP CONSTRAINT IF EXISTS actor_roles_actor_role_scope_unique;
ALTER TABLE IF EXISTS ONLY public.acme_orders DROP CONSTRAINT IF EXISTS acme_orders_pkey;
ALTER TABLE IF EXISTS ONLY public.acme_nonces DROP CONSTRAINT IF EXISTS acme_nonces_pkey;
ALTER TABLE IF EXISTS ONLY public.acme_challenges DROP CONSTRAINT IF EXISTS acme_challenges_pkey;
ALTER TABLE IF EXISTS ONLY public.acme_authorizations DROP CONSTRAINT IF EXISTS acme_authorizations_pkey;
ALTER TABLE IF EXISTS ONLY public.acme_accounts DROP CONSTRAINT IF EXISTS acme_accounts_profile_id_jwk_thumbprint_key;
ALTER TABLE IF EXISTS ONLY public.acme_accounts DROP CONSTRAINT IF EXISTS acme_accounts_pkey;
ALTER TABLE IF EXISTS public.role_permissions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.crl_generation_events ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.tenants;
DROP TABLE IF EXISTS public.teams;
DROP TABLE IF EXISTS public.sessions;
DROP TABLE IF EXISTS public.session_signing_keys;
DROP TABLE IF EXISTS public.schema_migrations;
DROP TABLE IF EXISTS public.scep_probe_results;
DROP TABLE IF EXISTS public.roles;
DROP SEQUENCE IF EXISTS public.role_permissions_id_seq;
DROP TABLE IF EXISTS public.role_permissions;
DROP TABLE IF EXISTS public.renewal_policies;
DROP TABLE IF EXISTS public.rate_limit_buckets;
DROP TABLE IF EXISTS public.policy_violations;
DROP TABLE IF EXISTS public.policy_rules;
DROP TABLE IF EXISTS public.permissions;
DROP TABLE IF EXISTS public.owners;
DROP TABLE IF EXISTS public.oidc_providers;
DROP TABLE IF EXISTS public.oidc_pre_login_sessions;
DROP TABLE IF EXISTS public.oidc_bcl_consumed_jtis;
DROP TABLE IF EXISTS public.ocsp_response_cache;
DROP TABLE IF EXISTS public.ocsp_responders;
DROP TABLE IF EXISTS public.notification_events;
DROP TABLE IF EXISTS public.network_scan_targets;
DROP TABLE IF EXISTS public.managed_certificates;
DROP TABLE IF EXISTS public.jobs;
DROP TABLE IF EXISTS public.issuers;
DROP TABLE IF EXISTS public.issuance_approval_requests;
DROP TABLE IF EXISTS public.intermediate_cas;
DROP TABLE IF EXISTS public.group_role_mappings;
DROP TABLE IF EXISTS public.endpoint_health_history;
DROP TABLE IF EXISTS public.endpoint_health_checks;
DROP TABLE IF EXISTS public.discovery_scans;
DROP TABLE IF EXISTS public.discovered_certificates;
DROP TABLE IF EXISTS public.deployment_targets;
DROP SEQUENCE IF EXISTS public.crl_generation_events_id_seq;
DROP TABLE IF EXISTS public.crl_generation_events;
DROP TABLE IF EXISTS public.crl_cache;
DROP TABLE IF EXISTS public.certificate_versions;
DROP TABLE IF EXISTS public.certificate_target_mappings;
DROP TABLE IF EXISTS public.certificate_revocations;
DROP TABLE IF EXISTS public.certificate_profiles;
DROP TABLE IF EXISTS public.breakglass_credentials;
DROP TABLE IF EXISTS public.audit_events;
DROP TABLE IF EXISTS public.audit_chain_head;
DROP TABLE IF EXISTS public.api_keys;
DROP TABLE IF EXISTS public.agents;
DROP TABLE IF EXISTS public.agent_groups;
DROP TABLE IF EXISTS public.agent_group_members;
DROP TABLE IF EXISTS public.actor_roles;
DROP TABLE IF EXISTS public.acme_orders;
DROP TABLE IF EXISTS public.acme_nonces;
DROP TABLE IF EXISTS public.acme_challenges;
DROP TABLE IF EXISTS public.acme_authorizations;
DROP TABLE IF EXISTS public.acme_accounts;
DROP FUNCTION IF EXISTS public.audit_events_verify_chain(OUT first_break_id text, OUT first_break_pos integer, OUT row_count integer);
DROP FUNCTION IF EXISTS public.audit_events_compute_hash_chain();
DROP FUNCTION IF EXISTS public.audit_events_canonical_payload(p_prev_hash text, p_id text, p_actor text, p_actor_type text, p_action text, p_resource_type text, p_resource_id text, p_details jsonb, p_timestamp timestamp with time zone, p_event_category text);
DROP FUNCTION IF EXISTS public.audit_events_block_modification();
DROP EXTENSION IF EXISTS pgcrypto;
--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: audit_events_block_modification(); Type: FUNCTION; Schema: public; Owner: certctl
--

CREATE FUNCTION public.audit_events_block_modification() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    RAISE EXCEPTION 'audit_events is append-only (Bundle-6 / M-017 / HIPAA §164.312(b))'
        USING ERRCODE = 'check_violation',
              HINT = 'Use a compliance superuser role for legitimate retention operations.';
END;
$$;


ALTER FUNCTION public.audit_events_block_modification() OWNER TO certctl;

--
-- Name: audit_events_canonical_payload(text, text, text, text, text, text, text, jsonb, timestamp with time zone, text); Type: FUNCTION; Schema: public; Owner: certctl
--

CREATE FUNCTION public.audit_events_canonical_payload(p_prev_hash text, p_id text, p_actor text, p_actor_type text, p_action text, p_resource_type text, p_resource_id text, p_details jsonb, p_timestamp timestamp with time zone, p_event_category text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
BEGIN
    RETURN COALESCE(p_prev_hash, '')      || '|' ||
           p_id                            || '|' ||
           p_actor                         || '|' ||
           p_actor_type                    || '|' ||
           p_action                        || '|' ||
           p_resource_type                 || '|' ||
           p_resource_id                   || '|' ||
           COALESCE(p_details::text, '')   || '|' ||
           to_char(p_timestamp AT TIME ZONE 'UTC',
                   'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') || '|' ||
           COALESCE(p_event_category, '');
END;
$$;


ALTER FUNCTION public.audit_events_canonical_payload(p_prev_hash text, p_id text, p_actor text, p_actor_type text, p_action text, p_resource_type text, p_resource_id text, p_details jsonb, p_timestamp timestamp with time zone, p_event_category text) OWNER TO certctl;

--
-- Name: audit_events_compute_hash_chain(); Type: FUNCTION; Schema: public; Owner: certctl
--

CREATE FUNCTION public.audit_events_compute_hash_chain() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    head_hash TEXT;
BEGIN
    SELECT row_hash INTO head_hash
        FROM audit_chain_head
        WHERE id = 1
        FOR UPDATE;

    IF head_hash IS NULL OR head_hash = '' THEN
        NEW.prev_hash := NULL;
    ELSE
        NEW.prev_hash := head_hash;
    END IF;

    NEW.row_hash := encode(
        digest(
            audit_events_canonical_payload(
                NEW.prev_hash,
                NEW.id,
                NEW.actor,
                NEW.actor_type,
                NEW.action,
                NEW.resource_type,
                NEW.resource_id,
                NEW.details,
                NEW.timestamp,
                NEW.event_category
            ),
            'sha256'
        ),
        'hex'
    );

    UPDATE audit_chain_head
        SET row_hash = NEW.row_hash, updated_at = NOW()
        WHERE id = 1;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.audit_events_compute_hash_chain() OWNER TO certctl;

--
-- Name: audit_events_verify_chain(); Type: FUNCTION; Schema: public; Owner: certctl
--

CREATE FUNCTION public.audit_events_verify_chain(OUT first_break_id text, OUT first_break_pos integer, OUT row_count integer) RETURNS record
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    r           RECORD;
    expected    TEXT := '';
    computed    TEXT;
    pos         INT := 0;
BEGIN
    first_break_id  := NULL;
    first_break_pos := -1;
    row_count       := 0;

    FOR r IN
        SELECT id, actor, actor_type, action, resource_type, resource_id,
               details, timestamp, event_category, prev_hash, row_hash
        FROM audit_events
        ORDER BY timestamp ASC, id ASC
    LOOP
        -- prev_hash on this row must equal the running expected hash
        -- (NULL on the very first row, otherwise the previous row's
        -- row_hash). Mismatch = chain break.
        IF (pos = 0 AND r.prev_hash IS NOT NULL)
           OR (pos > 0 AND r.prev_hash IS DISTINCT FROM expected) THEN
            first_break_id  := r.id;
            first_break_pos := pos;
            row_count       := pos + 1;
            RETURN;
        END IF;

        computed := encode(
            digest(
                audit_events_canonical_payload(
                    r.prev_hash, r.id, r.actor, r.actor_type, r.action,
                    r.resource_type, r.resource_id, r.details,
                    r.timestamp, r.event_category
                ),
                'sha256'
            ),
            'hex'
        );

        IF computed IS DISTINCT FROM r.row_hash THEN
            first_break_id  := r.id;
            first_break_pos := pos;
            row_count       := pos + 1;
            RETURN;
        END IF;

        expected := r.row_hash;
        pos := pos + 1;
    END LOOP;

    row_count := pos;
END;
$$;


ALTER FUNCTION public.audit_events_verify_chain(OUT first_break_id text, OUT first_break_pos integer, OUT row_count integer) OWNER TO certctl;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: acme_accounts; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.acme_accounts (
    account_id text NOT NULL,
    jwk_thumbprint text NOT NULL,
    jwk_pem text NOT NULL,
    contact text[],
    status text NOT NULL,
    profile_id text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.acme_accounts OWNER TO certctl;

--
-- Name: acme_authorizations; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.acme_authorizations (
    authz_id text NOT NULL,
    order_id text NOT NULL,
    identifier jsonb NOT NULL,
    status text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    wildcard boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.acme_authorizations OWNER TO certctl;

--
-- Name: acme_challenges; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.acme_challenges (
    challenge_id text NOT NULL,
    authz_id text NOT NULL,
    type text NOT NULL,
    status text NOT NULL,
    token text NOT NULL,
    validated_at timestamp with time zone,
    error jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.acme_challenges OWNER TO certctl;

--
-- Name: acme_nonces; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.acme_nonces (
    nonce text NOT NULL,
    issued_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used boolean DEFAULT false NOT NULL
);


ALTER TABLE public.acme_nonces OWNER TO certctl;

--
-- Name: acme_orders; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.acme_orders (
    order_id text NOT NULL,
    account_id text NOT NULL,
    identifiers jsonb NOT NULL,
    status text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    not_before timestamp with time zone,
    not_after timestamp with time zone,
    error jsonb,
    csr_pem text,
    certificate_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.acme_orders OWNER TO certctl;

--
-- Name: actor_roles; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.actor_roles (
    id text NOT NULL,
    actor_id text NOT NULL,
    actor_type text NOT NULL,
    role_id text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone,
    granted_by text DEFAULT 'system'::text NOT NULL,
    tenant_id text NOT NULL,
    scope_type text DEFAULT 'global'::text NOT NULL,
    scope_id text,
    CONSTRAINT actor_roles_scope_id_required_when_not_global CHECK ((((scope_type = 'global'::text) AND (scope_id IS NULL)) OR ((scope_type = ANY (ARRAY['profile'::text, 'issuer'::text])) AND (scope_id IS NOT NULL)))),
    CONSTRAINT actor_roles_scope_type_enum CHECK ((scope_type = ANY (ARRAY['global'::text, 'profile'::text, 'issuer'::text]))),
    CONSTRAINT actor_type_enum CHECK ((actor_type = ANY (ARRAY['User'::text, 'System'::text, 'Agent'::text, 'APIKey'::text, 'Anonymous'::text])))
);


ALTER TABLE public.actor_roles OWNER TO certctl;

--
-- Name: agent_group_members; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.agent_group_members (
    agent_group_id text NOT NULL,
    agent_id text NOT NULL,
    membership_type character varying(20) DEFAULT 'include'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.agent_group_members OWNER TO certctl;

--
-- Name: agent_groups; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.agent_groups (
    id text NOT NULL,
    name character varying(255) NOT NULL,
    description text DEFAULT ''::text,
    match_os character varying(100) DEFAULT ''::character varying,
    match_architecture character varying(100) DEFAULT ''::character varying,
    match_ip_cidr character varying(45) DEFAULT ''::character varying,
    match_version character varying(50) DEFAULT ''::character varying,
    enabled boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.agent_groups OWNER TO certctl;

--
-- Name: agents; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.agents (
    id text NOT NULL,
    name character varying(255) NOT NULL,
    hostname character varying(255) NOT NULL,
    status character varying(50) DEFAULT 'offline'::character varying NOT NULL,
    last_heartbeat_at timestamp with time zone,
    registered_at timestamp with time zone DEFAULT now() NOT NULL,
    api_key_hash character varying(255) NOT NULL,
    os character varying(100) DEFAULT ''::character varying,
    architecture character varying(100) DEFAULT ''::character varying,
    ip_address character varying(45) DEFAULT ''::character varying,
    version character varying(50) DEFAULT ''::character varying,
    retired_at timestamp with time zone,
    retired_reason text
);


ALTER TABLE public.agents OWNER TO certctl;

--
-- Name: api_keys; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.api_keys (
    id text NOT NULL,
    name text NOT NULL,
    key_hash text NOT NULL,
    tenant_id text DEFAULT 't-default'::text NOT NULL,
    admin boolean DEFAULT false NOT NULL,
    created_by text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone,
    last_used_at timestamp with time zone
);


ALTER TABLE public.api_keys OWNER TO certctl;

--
-- Name: audit_chain_head; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.audit_chain_head (
    id integer NOT NULL,
    row_hash text DEFAULT ''::text NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT audit_chain_head_id_check CHECK ((id = 1))
);


ALTER TABLE public.audit_chain_head OWNER TO certctl;

--
-- Name: audit_events; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.audit_events (
    id text NOT NULL,
    actor character varying(255) NOT NULL,
    actor_type character varying(50) NOT NULL,
    action character varying(255) NOT NULL,
    resource_type character varying(255) NOT NULL,
    resource_id character varying(255) NOT NULL,
    details jsonb,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    event_category text DEFAULT 'cert_lifecycle'::text NOT NULL,
    prev_hash text,
    row_hash text NOT NULL,
    CONSTRAINT audit_events_event_category_check CHECK ((event_category = ANY (ARRAY['cert_lifecycle'::text, 'auth'::text, 'config'::text])))
);


ALTER TABLE public.audit_events OWNER TO certctl;

--
-- Name: breakglass_credentials; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.breakglass_credentials (
    id text NOT NULL,
    tenant_id text DEFAULT 't-default'::text NOT NULL,
    actor_id text NOT NULL,
    password_hash text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    last_password_change_at timestamp with time zone DEFAULT now() NOT NULL,
    failure_count integer DEFAULT 0 NOT NULL,
    locked_until timestamp with time zone,
    last_failure_at timestamp with time zone,
    CONSTRAINT breakglass_failure_count_non_negative CHECK ((failure_count >= 0))
);


ALTER TABLE public.breakglass_credentials OWNER TO certctl;

--
-- Name: certificate_profiles; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.certificate_profiles (
    id text NOT NULL,
    name character varying(255) NOT NULL,
    description text DEFAULT ''::text,
    allowed_key_algorithms jsonb DEFAULT '[{"min_size": 256, "algorithm": "ECDSA"}, {"min_size": 2048, "algorithm": "RSA"}]'::jsonb NOT NULL,
    max_ttl_seconds integer DEFAULT 0 NOT NULL,
    allowed_ekus jsonb DEFAULT '["serverAuth"]'::jsonb NOT NULL,
    required_san_patterns jsonb DEFAULT '[]'::jsonb NOT NULL,
    spiffe_uri_pattern character varying(512) DEFAULT ''::character varying,
    allow_short_lived boolean DEFAULT false NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    required_csr_attributes jsonb DEFAULT '[]'::jsonb NOT NULL,
    must_staple boolean DEFAULT false NOT NULL,
    acme_auth_mode text DEFAULT 'trust_authenticated'::text NOT NULL,
    requires_approval boolean DEFAULT false NOT NULL,
    CONSTRAINT certificate_profiles_acme_auth_mode_chk CHECK ((acme_auth_mode = ANY (ARRAY['trust_authenticated'::text, 'challenge'::text])))
);


ALTER TABLE public.certificate_profiles OWNER TO certctl;

--
-- Name: certificate_revocations; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.certificate_revocations (
    id text NOT NULL,
    certificate_id text NOT NULL,
    serial_number text NOT NULL,
    reason character varying(50) DEFAULT 'unspecified'::character varying NOT NULL,
    revoked_by text NOT NULL,
    revoked_at timestamp with time zone DEFAULT now() NOT NULL,
    issuer_id text,
    issuer_notified boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.certificate_revocations OWNER TO certctl;

--
-- Name: certificate_target_mappings; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.certificate_target_mappings (
    certificate_id text NOT NULL,
    target_id text NOT NULL
);


ALTER TABLE public.certificate_target_mappings OWNER TO certctl;

--
-- Name: certificate_versions; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.certificate_versions (
    id text NOT NULL,
    certificate_id text NOT NULL,
    serial_number character varying(255) NOT NULL,
    not_before timestamp with time zone NOT NULL,
    not_after timestamp with time zone NOT NULL,
    fingerprint_sha256 character varying(255) NOT NULL,
    pem_chain text NOT NULL,
    csr_pem text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    key_algorithm character varying(50) DEFAULT ''::character varying,
    key_size integer DEFAULT 0
);


ALTER TABLE public.certificate_versions OWNER TO certctl;

--
-- Name: crl_cache; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.crl_cache (
    issuer_id text NOT NULL,
    crl_der bytea NOT NULL,
    crl_number bigint NOT NULL,
    this_update timestamp with time zone NOT NULL,
    next_update timestamp with time zone NOT NULL,
    generated_at timestamp with time zone DEFAULT now() NOT NULL,
    generation_duration_ms integer NOT NULL,
    revoked_count integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.crl_cache OWNER TO certctl;

--
-- Name: crl_generation_events; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.crl_generation_events (
    id bigint NOT NULL,
    issuer_id text NOT NULL,
    crl_number bigint NOT NULL,
    duration_ms integer NOT NULL,
    revoked_count integer NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    succeeded boolean NOT NULL,
    error text
);


ALTER TABLE public.crl_generation_events OWNER TO certctl;

--
-- Name: crl_generation_events_id_seq; Type: SEQUENCE; Schema: public; Owner: certctl
--

CREATE SEQUENCE public.crl_generation_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.crl_generation_events_id_seq OWNER TO certctl;

--
-- Name: crl_generation_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: certctl
--

ALTER SEQUENCE public.crl_generation_events_id_seq OWNED BY public.crl_generation_events.id;


--
-- Name: deployment_targets; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.deployment_targets (
    id text NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    agent_id text NOT NULL,
    config jsonb,
    enabled boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    encrypted_config bytea,
    last_tested_at timestamp with time zone,
    test_status text DEFAULT 'untested'::text NOT NULL,
    source text DEFAULT 'database'::text NOT NULL,
    retired_at timestamp with time zone,
    retired_reason text
);


ALTER TABLE public.deployment_targets OWNER TO certctl;

--
-- Name: discovered_certificates; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.discovered_certificates (
    id text NOT NULL,
    fingerprint_sha256 text NOT NULL,
    common_name text DEFAULT ''::text NOT NULL,
    sans text[] DEFAULT '{}'::text[],
    serial_number text DEFAULT ''::text NOT NULL,
    issuer_dn text DEFAULT ''::text NOT NULL,
    subject_dn text DEFAULT ''::text NOT NULL,
    not_before timestamp with time zone,
    not_after timestamp with time zone,
    key_algorithm text DEFAULT ''::text NOT NULL,
    key_size integer DEFAULT 0 NOT NULL,
    is_ca boolean DEFAULT false NOT NULL,
    pem_data text DEFAULT ''::text NOT NULL,
    source_path text DEFAULT ''::text NOT NULL,
    source_format text DEFAULT 'PEM'::text NOT NULL,
    agent_id text NOT NULL,
    discovery_scan_id text,
    managed_certificate_id text,
    status text DEFAULT 'Unmanaged'::text NOT NULL,
    first_seen_at timestamp with time zone DEFAULT now() NOT NULL,
    last_seen_at timestamp with time zone DEFAULT now() NOT NULL,
    dismissed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.discovered_certificates OWNER TO certctl;

--
-- Name: discovery_scans; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.discovery_scans (
    id text NOT NULL,
    agent_id text NOT NULL,
    directories text[] NOT NULL,
    certificates_found integer DEFAULT 0 NOT NULL,
    certificates_new integer DEFAULT 0 NOT NULL,
    errors_count integer DEFAULT 0 NOT NULL,
    scan_duration_ms integer DEFAULT 0 NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone
);


ALTER TABLE public.discovery_scans OWNER TO certctl;

--
-- Name: endpoint_health_checks; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.endpoint_health_checks (
    id text NOT NULL,
    endpoint text NOT NULL,
    certificate_id text,
    network_scan_target_id text,
    expected_fingerprint text DEFAULT ''::text NOT NULL,
    observed_fingerprint text DEFAULT ''::text NOT NULL,
    status text DEFAULT 'unknown'::text NOT NULL,
    consecutive_failures integer DEFAULT 0 NOT NULL,
    response_time_ms integer DEFAULT 0 NOT NULL,
    tls_version text DEFAULT ''::text NOT NULL,
    cipher_suite text DEFAULT ''::text NOT NULL,
    cert_subject text DEFAULT ''::text NOT NULL,
    cert_issuer text DEFAULT ''::text NOT NULL,
    cert_expiry timestamp with time zone,
    last_checked_at timestamp with time zone,
    last_success_at timestamp with time zone,
    last_failure_at timestamp with time zone,
    last_transition_at timestamp with time zone,
    failure_reason text DEFAULT ''::text NOT NULL,
    degraded_threshold integer DEFAULT 2 NOT NULL,
    down_threshold integer DEFAULT 5 NOT NULL,
    check_interval_seconds integer DEFAULT 300 NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    acknowledged boolean DEFAULT false NOT NULL,
    acknowledged_by text DEFAULT ''::text NOT NULL,
    acknowledged_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.endpoint_health_checks OWNER TO certctl;

--
-- Name: endpoint_health_history; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.endpoint_health_history (
    id text NOT NULL,
    health_check_id text NOT NULL,
    status text NOT NULL,
    response_time_ms integer DEFAULT 0 NOT NULL,
    fingerprint text DEFAULT ''::text NOT NULL,
    failure_reason text DEFAULT ''::text NOT NULL,
    checked_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.endpoint_health_history OWNER TO certctl;

--
-- Name: group_role_mappings; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.group_role_mappings (
    id text NOT NULL,
    tenant_id text DEFAULT 't-default'::text NOT NULL,
    provider_id text NOT NULL,
    group_name text NOT NULL,
    role_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.group_role_mappings OWNER TO certctl;

--
-- Name: intermediate_cas; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.intermediate_cas (
    id text NOT NULL,
    owning_issuer_id text NOT NULL,
    parent_ca_id text,
    name text NOT NULL,
    subject text NOT NULL,
    state character varying(20) DEFAULT 'active'::character varying NOT NULL,
    cert_pem text NOT NULL,
    key_driver_id text NOT NULL,
    not_before timestamp with time zone NOT NULL,
    not_after timestamp with time zone NOT NULL,
    path_len_constraint integer,
    name_constraints jsonb DEFAULT '[]'::jsonb NOT NULL,
    ocsp_responder_url text,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT intermediate_ca_no_self_parent CHECK (((parent_ca_id IS NULL) OR (parent_ca_id <> id))),
    CONSTRAINT intermediate_ca_state_check CHECK (((state)::text = ANY ((ARRAY['active'::character varying, 'retiring'::character varying, 'retired'::character varying])::text[]))),
    CONSTRAINT intermediate_ca_validity_check CHECK ((not_after > not_before))
);


ALTER TABLE public.intermediate_cas OWNER TO certctl;

--
-- Name: issuance_approval_requests; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.issuance_approval_requests (
    id text NOT NULL,
    certificate_id text,
    job_id text,
    profile_id text NOT NULL,
    requested_by text NOT NULL,
    state character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    decided_by text,
    decided_at timestamp with time zone,
    decision_note text,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    approval_kind text DEFAULT 'cert_issuance'::text NOT NULL,
    payload jsonb,
    CONSTRAINT approval_decision_consistency CHECK (((((state)::text = 'pending'::text) AND (decided_by IS NULL) AND (decided_at IS NULL)) OR (((state)::text = ANY ((ARRAY['approved'::character varying, 'rejected'::character varying, 'expired'::character varying])::text[])) AND (decided_at IS NOT NULL)))),
    CONSTRAINT approval_kind_check CHECK ((approval_kind = ANY (ARRAY['cert_issuance'::text, 'profile_edit'::text]))),
    CONSTRAINT approval_kind_consistency CHECK ((((approval_kind = 'cert_issuance'::text) AND (certificate_id IS NOT NULL) AND (job_id IS NOT NULL)) OR ((approval_kind = 'profile_edit'::text) AND (payload IS NOT NULL)))),
    CONSTRAINT approval_state_check CHECK (((state)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying, 'expired'::character varying])::text[])))
);


ALTER TABLE public.issuance_approval_requests OWNER TO certctl;

--
-- Name: issuers; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.issuers (
    id text NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    config jsonb,
    enabled boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    encrypted_config bytea,
    last_tested_at timestamp with time zone,
    test_status text DEFAULT 'untested'::text NOT NULL,
    source text DEFAULT 'database'::text NOT NULL,
    hierarchy_mode character varying(20) DEFAULT 'single'::character varying NOT NULL
);


ALTER TABLE public.issuers OWNER TO certctl;

--
-- Name: jobs; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.jobs (
    id text NOT NULL,
    type character varying(255) NOT NULL,
    certificate_id text,
    target_id text,
    agent_id text,
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    max_attempts integer DEFAULT 3 NOT NULL,
    last_error text,
    deployment_result jsonb,
    scheduled_at timestamp with time zone,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    verification_status text DEFAULT 'pending'::text,
    verified_at timestamp with time zone,
    verification_fingerprint text,
    verification_error text
);


ALTER TABLE public.jobs OWNER TO certctl;

--
-- Name: managed_certificates; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.managed_certificates (
    id text NOT NULL,
    name character varying(255) NOT NULL,
    common_name character varying(255) NOT NULL,
    sans text[] DEFAULT ARRAY[]::text[],
    environment character varying(50),
    owner_id text NOT NULL,
    team_id text NOT NULL,
    issuer_id text NOT NULL,
    renewal_policy_id text NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    expires_at timestamp with time zone,
    tags jsonb DEFAULT '{}'::jsonb NOT NULL,
    last_renewal_at timestamp with time zone,
    last_deployment_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    certificate_profile_id text,
    revoked_at timestamp with time zone,
    revocation_reason character varying(50),
    source text DEFAULT ''::text NOT NULL
);


ALTER TABLE public.managed_certificates OWNER TO certctl;

--
-- Name: network_scan_targets; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.network_scan_targets (
    id text NOT NULL,
    name text NOT NULL,
    cidrs text[] DEFAULT '{}'::text[] NOT NULL,
    ports integer[] DEFAULT '{443}'::integer[] NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    scan_interval_hours integer DEFAULT 6 NOT NULL,
    timeout_ms integer DEFAULT 5000 NOT NULL,
    last_scan_at timestamp with time zone,
    last_scan_duration_ms integer,
    last_scan_certs_found integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.network_scan_targets OWNER TO certctl;

--
-- Name: notification_events; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.notification_events (
    id text NOT NULL,
    type character varying(255) NOT NULL,
    certificate_id text,
    channel character varying(255) NOT NULL,
    recipient character varying(255) NOT NULL,
    message text NOT NULL,
    sent_at timestamp with time zone,
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    error text,
    retry_count integer DEFAULT 0 NOT NULL,
    next_retry_at timestamp with time zone,
    last_error text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notification_events OWNER TO certctl;

--
-- Name: ocsp_responders; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.ocsp_responders (
    issuer_id text NOT NULL,
    cert_pem text NOT NULL,
    cert_serial text NOT NULL,
    key_path text NOT NULL,
    key_alg text NOT NULL,
    not_before timestamp with time zone NOT NULL,
    not_after timestamp with time zone NOT NULL,
    rotated_from text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ocsp_responders OWNER TO certctl;

--
-- Name: ocsp_response_cache; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.ocsp_response_cache (
    issuer_id text NOT NULL,
    serial_hex text NOT NULL,
    response_der bytea NOT NULL,
    cert_status text NOT NULL,
    revocation_reason integer,
    revoked_at timestamp with time zone,
    this_update timestamp with time zone NOT NULL,
    next_update timestamp with time zone NOT NULL,
    generated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ocsp_response_cache OWNER TO certctl;

--
-- Name: oidc_bcl_consumed_jtis; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.oidc_bcl_consumed_jtis (
    jti text NOT NULL,
    issuer_url text NOT NULL,
    consumed_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL
);


ALTER TABLE public.oidc_bcl_consumed_jtis OWNER TO certctl;

--
-- Name: oidc_pre_login_sessions; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.oidc_pre_login_sessions (
    id text NOT NULL,
    tenant_id text DEFAULT 't-default'::text NOT NULL,
    signing_key_id text NOT NULL,
    oidc_provider_id text NOT NULL,
    state text,
    nonce text,
    pkce_verifier text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    absolute_expires_at timestamp with time zone DEFAULT (now() + '00:10:00'::interval) NOT NULL,
    state_enc bytea,
    nonce_enc bytea,
    pkce_verifier_enc bytea,
    client_ip text,
    user_agent text,
    CONSTRAINT oidc_pre_login_expiry_after_created CHECK ((absolute_expires_at > created_at))
);


ALTER TABLE public.oidc_pre_login_sessions OWNER TO certctl;

--
-- Name: oidc_providers; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.oidc_providers (
    id text NOT NULL,
    tenant_id text DEFAULT 't-default'::text NOT NULL,
    name text NOT NULL,
    issuer_url text NOT NULL,
    client_id text NOT NULL,
    client_secret_encrypted bytea NOT NULL,
    redirect_uri text NOT NULL,
    groups_claim_path text DEFAULT 'groups'::text NOT NULL,
    groups_claim_format text DEFAULT 'string-array'::text NOT NULL,
    fetch_userinfo boolean DEFAULT false NOT NULL,
    scopes text[] DEFAULT ARRAY['openid'::text, 'profile'::text, 'email'::text] NOT NULL,
    allowed_email_domains text[] DEFAULT ARRAY[]::text[] NOT NULL,
    iat_window_seconds integer DEFAULT 300 NOT NULL,
    jwks_cache_ttl_seconds integer DEFAULT 3600 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    CONSTRAINT oidc_providers_claim_format_check CHECK ((groups_claim_format = ANY (ARRAY['string-array'::text, 'json-path'::text]))),
    CONSTRAINT oidc_providers_iat_window_bounds CHECK (((iat_window_seconds > 0) AND (iat_window_seconds <= 600))),
    CONSTRAINT oidc_providers_jwks_ttl_bounds CHECK ((jwks_cache_ttl_seconds >= 60))
);


ALTER TABLE public.oidc_providers OWNER TO certctl;

--
-- Name: owners; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.owners (
    id text NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    team_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.owners OWNER TO certctl;

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.permissions (
    id text NOT NULL,
    name text NOT NULL,
    namespace text NOT NULL
);


ALTER TABLE public.permissions OWNER TO certctl;

--
-- Name: policy_rules; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.policy_rules (
    id text NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    config jsonb NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    severity character varying(50) DEFAULT 'Warning'::character varying NOT NULL,
    CONSTRAINT policy_rules_severity_check CHECK (((severity)::text = ANY ((ARRAY['Warning'::character varying, 'Error'::character varying, 'Critical'::character varying])::text[])))
);


ALTER TABLE public.policy_rules OWNER TO certctl;

--
-- Name: policy_violations; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.policy_violations (
    id text NOT NULL,
    certificate_id text NOT NULL,
    rule_id text NOT NULL,
    message text NOT NULL,
    severity character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT policy_violations_severity_check CHECK (((severity)::text = ANY ((ARRAY['Warning'::character varying, 'Error'::character varying, 'Critical'::character varying])::text[])))
);


ALTER TABLE public.policy_violations OWNER TO certctl;

--
-- Name: rate_limit_buckets; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.rate_limit_buckets (
    bucket_key text NOT NULL,
    timestamps timestamp with time zone[] DEFAULT '{}'::timestamp with time zone[] NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.rate_limit_buckets OWNER TO certctl;

--
-- Name: renewal_policies; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.renewal_policies (
    id text NOT NULL,
    name character varying(255) NOT NULL,
    renewal_window_days integer NOT NULL,
    auto_renew boolean DEFAULT true NOT NULL,
    max_retries integer DEFAULT 3 NOT NULL,
    retry_interval_seconds integer DEFAULT 60 NOT NULL,
    alert_thresholds_days jsonb DEFAULT '[30, 14, 7, 0]'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    certificate_profile_id text,
    agent_group_id text,
    alert_channels jsonb DEFAULT '{}'::jsonb NOT NULL,
    alert_severity_map jsonb DEFAULT '{}'::jsonb NOT NULL
);


ALTER TABLE public.renewal_policies OWNER TO certctl;

--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.role_permissions (
    id bigint NOT NULL,
    role_id text NOT NULL,
    permission_id text NOT NULL,
    scope_type text DEFAULT 'global'::text NOT NULL,
    scope_id text,
    CONSTRAINT role_permission_scope_check CHECK ((scope_type = ANY (ARRAY['global'::text, 'profile'::text, 'issuer'::text]))),
    CONSTRAINT role_permission_scope_id_consistency CHECK ((((scope_type = 'global'::text) AND (scope_id IS NULL)) OR ((scope_type = ANY (ARRAY['profile'::text, 'issuer'::text])) AND (scope_id IS NOT NULL))))
);


ALTER TABLE public.role_permissions OWNER TO certctl;

--
-- Name: role_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: certctl
--

CREATE SEQUENCE public.role_permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.role_permissions_id_seq OWNER TO certctl;

--
-- Name: role_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: certctl
--

ALTER SEQUENCE public.role_permissions_id_seq OWNED BY public.role_permissions.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.roles (
    id text NOT NULL,
    tenant_id text NOT NULL,
    name text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.roles OWNER TO certctl;

--
-- Name: scep_probe_results; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.scep_probe_results (
    id text NOT NULL,
    target_url text NOT NULL,
    reachable boolean NOT NULL,
    advertised_caps text[] DEFAULT '{}'::text[] NOT NULL,
    supports_rfc8894 boolean DEFAULT false NOT NULL,
    supports_aes boolean DEFAULT false NOT NULL,
    supports_post_operation boolean DEFAULT false NOT NULL,
    supports_renewal boolean DEFAULT false NOT NULL,
    supports_sha256 boolean DEFAULT false NOT NULL,
    supports_sha512 boolean DEFAULT false NOT NULL,
    ca_cert_subject text,
    ca_cert_issuer text,
    ca_cert_not_before timestamp with time zone,
    ca_cert_not_after timestamp with time zone,
    ca_cert_expired boolean DEFAULT false NOT NULL,
    ca_cert_algorithm text,
    ca_cert_chain_length integer DEFAULT 0 NOT NULL,
    probed_at timestamp with time zone NOT NULL,
    probe_duration_ms bigint DEFAULT 0 NOT NULL,
    error text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.scep_probe_results OWNER TO certctl;

--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.schema_migrations (
    version text NOT NULL,
    applied_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.schema_migrations OWNER TO certctl;

--
-- Name: session_signing_keys; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.session_signing_keys (
    id text NOT NULL,
    tenant_id text DEFAULT 't-default'::text NOT NULL,
    key_material_encrypted bytea NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    retired_at timestamp with time zone,
    CONSTRAINT session_signing_keys_retired_after_created CHECK (((retired_at IS NULL) OR (retired_at >= created_at)))
);


ALTER TABLE public.session_signing_keys OWNER TO certctl;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.sessions (
    id text NOT NULL,
    tenant_id text DEFAULT 't-default'::text NOT NULL,
    actor_id text NOT NULL,
    actor_type text NOT NULL,
    signing_key_id text NOT NULL,
    is_pre_login boolean DEFAULT false NOT NULL,
    csrf_token_hash text DEFAULT ''::text NOT NULL,
    idle_expires_at timestamp with time zone NOT NULL,
    absolute_expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    last_seen_at timestamp with time zone DEFAULT now() NOT NULL,
    ip_address text DEFAULT ''::text NOT NULL,
    user_agent text DEFAULT ''::text NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT sessions_expiry_order CHECK ((absolute_expires_at > idle_expires_at)),
    CONSTRAINT sessions_idle_after_created CHECK ((idle_expires_at > created_at))
);


ALTER TABLE public.sessions OWNER TO certctl;

--
-- Name: teams; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.teams (
    id text NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.teams OWNER TO certctl;

--
-- Name: tenants; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.tenants (
    id text NOT NULL,
    name text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.tenants OWNER TO certctl;

--
-- Name: users; Type: TABLE; Schema: public; Owner: certctl
--

CREATE TABLE public.users (
    id text NOT NULL,
    tenant_id text DEFAULT 't-default'::text NOT NULL,
    email text NOT NULL,
    display_name text DEFAULT ''::text NOT NULL,
    oidc_subject text NOT NULL,
    oidc_provider_id text NOT NULL,
    last_login_at timestamp with time zone DEFAULT now() NOT NULL,
    webauthn_credentials jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deactivated_at timestamp with time zone
);


ALTER TABLE public.users OWNER TO certctl;

--
-- Name: crl_generation_events id; Type: DEFAULT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.crl_generation_events ALTER COLUMN id SET DEFAULT nextval('public.crl_generation_events_id_seq'::regclass);


--
-- Name: role_permissions id; Type: DEFAULT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.role_permissions ALTER COLUMN id SET DEFAULT nextval('public.role_permissions_id_seq'::regclass);


--
-- Data for Name: acme_accounts; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.acme_accounts (account_id, jwk_thumbprint, jwk_pem, contact, status, profile_id, owner_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: acme_authorizations; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.acme_authorizations (authz_id, order_id, identifier, status, expires_at, wildcard, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: acme_challenges; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.acme_challenges (challenge_id, authz_id, type, status, token, validated_at, error, created_at) FROM stdin;
\.


--
-- Data for Name: acme_nonces; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.acme_nonces (nonce, issued_at, expires_at, used) FROM stdin;
\.


--
-- Data for Name: acme_orders; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.acme_orders (order_id, account_id, identifiers, status, expires_at, not_before, not_after, error, csr_pem, certificate_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: actor_roles; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.actor_roles (id, actor_id, actor_type, role_id, granted_at, expires_at, granted_by, tenant_id, scope_type, scope_id) FROM stdin;
ar-demo-anon-admin	actor-demo-anon	Anonymous	r-admin	2026-06-04 02:40:21.259856+00	\N	system	t-default	global	\N
ar-7c84627e-953e-4c56-af2e-cddaf0472292	legacy-key-0	APIKey	r-viewer	2026-06-04 03:46:05.000677+00	\N	bootstrap	t-default	global	\N
\.


--
-- Data for Name: agent_group_members; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.agent_group_members (agent_group_id, agent_id, membership_type, created_at) FROM stdin;
ag-manual	ag-web-prod	include	2026-05-05 02:40:21.589496+00
ag-manual	ag-web-staging	include	2026-05-05 02:40:21.589496+00
ag-manual	ag-iis-prod	exclude	2026-05-05 02:40:21.589496+00
\.


--
-- Data for Name: agent_groups; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.agent_groups (id, name, description, match_os, match_architecture, match_ip_cidr, match_version, enabled, created_at, updated_at) FROM stdin;
ag-linux-prod	Linux Production	All Linux agents in production	linux				t	2026-03-06 02:40:21.589496+00	2026-06-04 02:40:21.589496+00
ag-linux-amd64	Linux AMD64	Linux agents on x86_64 architecture	linux	amd64			t	2026-03-06 02:40:21.589496+00	2026-06-04 02:40:21.589496+00
ag-windows	Windows Agents	All Windows-based agents	windows				t	2026-04-05 02:40:21.589496+00	2026-06-04 02:40:21.589496+00
ag-datacenter-a	Datacenter A	Agents in 10.0.1.0/24 subnet			10.0.1.0/24		t	2026-03-06 02:40:21.589496+00	2026-06-04 02:40:21.589496+00
ag-arm64	ARM64 Agents	Agents on ARM architecture		arm64			t	2026-04-20 02:40:21.589496+00	2026-06-04 02:40:21.589496+00
ag-manual	Manual Group	Manually managed agent group					f	2026-05-05 02:40:21.589496+00	2026-06-04 02:40:21.589496+00
\.


--
-- Data for Name: agents; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.agents (id, name, hostname, status, last_heartbeat_at, registered_at, api_key_hash, os, architecture, ip_address, version, retired_at, retired_reason) FROM stdin;
ag-iis-prod	iis-prod-agent	iis-prod-01.internal	Offline	2026-06-03 23:40:21.589496+00	2026-04-05 02:40:21.589496+00	demo_hash_4	windows	amd64	10.0.3.15	2.0.12	\N	\N
ag-mac-dev	mac-dev-agent	dev-mac-01.internal	Offline	2026-06-04 02:39:21.589496+00	2026-05-20 02:40:21.589496+00	demo_hash_8	darwin	arm64	10.0.7.5	2.0.14	\N	\N
ag-k8s-prod	k8s-prod-agent	k8s-node-01.internal	Offline	2026-06-04 02:40:11.589496+00	2026-05-05 02:40:21.589496+00	demo_hash_7	linux	amd64	10.0.6.10	2.0.14	\N	\N
ag-edge-01	edge-eu-agent	edge-eu-01.internal	Offline	2026-06-04 02:39:31.589496+00	2026-04-20 02:40:21.589496+00	demo_hash_6	linux	arm64	10.0.5.10	2.0.14	\N	\N
ag-web-staging	web-staging-agent	web-stg-01.internal	Offline	2026-06-04 02:39:36.589496+00	2026-03-06 02:40:21.589496+00	demo_hash_2	linux	amd64	10.0.2.20	2.0.14	\N	\N
ag-data-prod	data-prod-agent	data-prod-01.internal	Offline	2026-06-04 02:40:01.589496+00	2026-03-06 02:40:21.589496+00	demo_hash_5	linux	arm64	10.0.4.30	2.0.14	\N	\N
cloud-azure-kv	Azure Key Vault Discovery	certctl-server	Offline	2026-06-04 02:40:21.589496+00	2026-03-06 02:40:21.589496+00	sentinel_no_auth	linux	amd64	127.0.0.1	2.1.0	\N	\N
cloud-gcp-sm	GCP Secret Manager Discovery	certctl-server	Offline	2026-06-04 02:40:21.589496+00	2026-03-06 02:40:21.589496+00	sentinel_no_auth	linux	amd64	127.0.0.1	2.1.0	\N	\N
server-scanner	Network Scanner (Server-Side)	certctl-server	Offline	2026-06-04 02:40:21.589496+00	2026-03-06 02:40:21.589496+00	sentinel_no_auth	linux	amd64	127.0.0.1	2.0.14	\N	\N
cloud-aws-sm	AWS Secrets Manager Discovery	certctl-server	Offline	2026-06-04 02:40:21.589496+00	2026-03-06 02:40:21.589496+00	sentinel_no_auth	linux	amd64	127.0.0.1	2.1.0	\N	\N
ag-web-prod	web-prod-agent	web-prod-01.internal	Offline	2026-06-04 02:39:51.589496+00	2026-02-04 02:40:21.589496+00	demo_hash_1	linux	amd64	10.0.1.10	2.0.14	\N	\N
ag-lb-prod	lb-prod-agent	lb-prod-01.internal	Offline	2026-06-04 02:40:06.589496+00	2026-01-05 02:40:21.589496+00	demo_hash_3	linux	amd64	10.0.1.50	2.0.14	\N	\N
agent-demo-1	docker-agent	4c720aafca16	Offline	2026-06-04 03:41:45.139473+00	2026-06-04 02:40:21.589496+00	demo_no_auth	linux	amd64	172.20.0.4	1.0.0	\N	\N
\.


--
-- Data for Name: api_keys; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.api_keys (id, name, key_hash, tenant_id, admin, created_by, created_at, expires_at, last_used_at) FROM stdin;
\.


--
-- Data for Name: audit_chain_head; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.audit_chain_head (id, row_hash, updated_at) FROM stdin;
1	fa05c168c91deedd563f8c54fcdc7307d9c64bdcf7fac7bf2ce324bf7f94bbd8	2026-06-04 03:46:05.257993+00
\.


--
-- Data for Name: audit_events; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.audit_events (id, actor, actor_type, action, resource_type, resource_id, details, "timestamp", event_category, prev_hash, row_hash) FROM stdin;
audit-001	alice@example.com	user	issuer.configured	issuer	iss-local	{"type": "local", "ca_common_name": "CertCtl Demo CA"}	2025-12-06 02:40:21.589496+00	cert_lifecycle	\N	66511421456dc45fe7b05ba26a5cae3ef2bc0ac9d18622032416154536270dfb
audit-002	alice@example.com	user	issuer.configured	issuer	iss-acme-le	{"type": "acme", "directory": "letsencrypt-staging"}	2026-01-05 02:40:21.589496+00	cert_lifecycle	66511421456dc45fe7b05ba26a5cae3ef2bc0ac9d18622032416154536270dfb	7d2e3f1473cd7d8875e1c4e9846c3f9c2881ddcc5aa2366880d9bddc8cafddba
audit-003	bob@example.com	user	issuer.configured	issuer	iss-stepca	{"type": "stepca", "ca_url": "ca.internal:9000"}	2026-02-04 02:40:21.589496+00	cert_lifecycle	7d2e3f1473cd7d8875e1c4e9846c3f9c2881ddcc5aa2366880d9bddc8cafddba	79f46b90e65737e11f3bd3c057af99f39f9762e900435c17c1260d43c6e18a66
audit-004	alice@example.com	user	target.configured	target	tgt-nginx-prod	{"type": "nginx", "agent": "ag-web-prod"}	2026-02-04 02:40:21.589496+00	cert_lifecycle	79f46b90e65737e11f3bd3c057af99f39f9762e900435c17c1260d43c6e18a66	41f3a0d7525257f1a16bd37f30801a72b3d36c9902e4ed29b7eef89668d22daf
audit-005	system	system	agent.registered	agent	ag-web-prod	{"os": "linux", "hostname": "web-prod-01.internal"}	2026-02-04 02:40:21.589496+00	cert_lifecycle	41f3a0d7525257f1a16bd37f30801a72b3d36c9902e4ed29b7eef89668d22daf	a5372685e17ab5b9aa18d55452aa00f8507972562379c9ad78f524cd2c0663f5
audit-006	system	system	agent.registered	agent	ag-lb-prod	{"os": "linux", "hostname": "lb-prod-01.internal"}	2026-01-05 02:40:21.589496+00	cert_lifecycle	a5372685e17ab5b9aa18d55452aa00f8507972562379c9ad78f524cd2c0663f5	4b164842fefb9f4080def08dd799386d7b8c1eae7758d7241439d8b210e7b9db
audit-010	system	system	certificate.issued	certificate	mc-api-prod	{"issuer": "iss-local", "serial": "0A:1B:2C:3D:4E:5F:00:01"}	2026-03-06 02:40:21.589496+00	cert_lifecycle	4b164842fefb9f4080def08dd799386d7b8c1eae7758d7241439d8b210e7b9db	9daca332b976ad76e3054a12bfe5346cad8d239ce3ed690d37596a6d0f367b8f
audit-011	system	system	certificate.deployed	certificate	mc-api-prod	{"status": "success", "target": "tgt-nginx-prod"}	2026-03-06 02:40:46.589496+00	cert_lifecycle	9daca332b976ad76e3054a12bfe5346cad8d239ce3ed690d37596a6d0f367b8f	068d06035def98bb93405be4a261504d8d950f19488fb20b6f3c89eeb9e29ae7
audit-012	system	system	certificate.issued	certificate	mc-pay-prod	{"issuer": "iss-local", "serial": "0A:1B:2C:3D:4E:5F:00:03"}	2026-03-11 02:40:21.589496+00	cert_lifecycle	068d06035def98bb93405be4a261504d8d950f19488fb20b6f3c89eeb9e29ae7	ede88760b3db3c4bc0c7f263782bb678732bc6aa403195e7495a598466841c05
audit-013	system	system	certificate.deployed	certificate	mc-pay-prod	{"status": "success", "target": "tgt-nginx-prod"}	2026-03-11 02:40:43.589496+00	cert_lifecycle	ede88760b3db3c4bc0c7f263782bb678732bc6aa403195e7495a598466841c05	7b8741b750285aa1bc4d573c2337b45040ebf68cf29d2aae50e7a2588e7b6b89
audit-014	system	system	certificate.issued	certificate	mc-web-prod	{"issuer": "iss-local", "serial": "0A:1B:2C:3D:4E:5F:00:02"}	2026-03-19 02:40:21.589496+00	cert_lifecycle	7b8741b750285aa1bc4d573c2337b45040ebf68cf29d2aae50e7a2588e7b6b89	e96c911508061350f444b50abfd3f5e00d6d42bcc847dc8569d8499bdb149b45
audit-015	system	system	certificate.deployed	certificate	mc-web-prod	{"status": "success", "target": "tgt-nginx-prod"}	2026-03-19 02:40:43.589496+00	cert_lifecycle	e96c911508061350f444b50abfd3f5e00d6d42bcc847dc8569d8499bdb149b45	bc0da7c89892b201fe3338f382c97e75ad8393de422ed6966d4892788a001cb3
audit-016	system	system	certificate.deployed	certificate	mc-web-prod	{"status": "success", "target": "tgt-haproxy-prod"}	2026-03-19 02:40:45.589496+00	cert_lifecycle	bc0da7c89892b201fe3338f382c97e75ad8393de422ed6966d4892788a001cb3	9d75ff907bec05c3831035e7f9dc89c6e858322eee47e85596155dd4724ef3f6
audit-020	system	system	certificate.renewed	certificate	mc-grpc-prod	{"issuer": "iss-stepca", "serial": "0A:1B:2C:3D:4E:5F:00:09"}	2026-04-02 02:40:21.589496+00	cert_lifecycle	9d75ff907bec05c3831035e7f9dc89c6e858322eee47e85596155dd4724ef3f6	b212431f0199889a60a9973f8cca053a48ce8195088a797358ce988a17609d81
audit-021	system	system	certificate.deployed	certificate	mc-grpc-prod	{"status": "success", "target": "tgt-nginx-prod"}	2026-04-02 02:40:39.589496+00	cert_lifecycle	b212431f0199889a60a9973f8cca053a48ce8195088a797358ce988a17609d81	1c9dc87df951d314b9c8cb271c04adc23135cee85e05e587c0a9a0db36735342
audit-025	system	system	renewal.failed	certificate	mc-vpn-prod	{"error": "ACME challenge failed: DNS timeout", "attempt": 3}	2026-04-09 02:40:21.589496+00	cert_lifecycle	1c9dc87df951d314b9c8cb271c04adc23135cee85e05e587c0a9a0db36735342	1de3fc6797b3a6d6770b3ad0a57316671ff85b892f4c98c8c923d57364aeb15c
audit-030	system	system	certificate.renewed	certificate	mc-pay-prod	{"issuer": "iss-local", "serial": "0A:1B:2C:3D:4E:5F:00:03"}	2026-04-15 02:40:21.589496+00	cert_lifecycle	1de3fc6797b3a6d6770b3ad0a57316671ff85b892f4c98c8c923d57364aeb15c	27d9ed83e45ea4217f7645ca4d038eeb49bdeba49fc6057f8a2267f6beeaf877
audit-031	system	system	certificate.deployed	certificate	mc-pay-prod	{"status": "success", "target": "tgt-nginx-prod"}	2026-04-15 02:40:43.589496+00	cert_lifecycle	27d9ed83e45ea4217f7645ca4d038eeb49bdeba49fc6057f8a2267f6beeaf877	4a216962adbaee1ee31e1dd65ac4eb27f630929897a81efe98e3fe7f91578e31
audit-032	system	system	certificate.deployed	certificate	mc-pay-prod	{"status": "success", "target": "tgt-haproxy-prod"}	2026-04-15 02:40:46.589496+00	cert_lifecycle	4a216962adbaee1ee31e1dd65ac4eb27f630929897a81efe98e3fe7f91578e31	958b93301591583b3f26343cf82e7275b9274a05bc659edacef79bda14b10e8d
audit-035	carol@example.com	user	certificate.created	certificate	mc-shop-prod	{"issuer": "iss-acme-zs", "common_name": "shop.example.com"}	2026-04-19 02:40:21.589496+00	cert_lifecycle	958b93301591583b3f26343cf82e7275b9274a05bc659edacef79bda14b10e8d	85f4a47175e6c5d5c9b259a065fa152249172dc3ab5309645bb111ebcb3b8745
audit-036	system	system	certificate.issued	certificate	mc-shop-prod	{"issuer": "iss-acme-zs", "serial": "0A:1B:2C:3D:4E:5F:00:10"}	2026-04-19 02:40:21.589496+00	cert_lifecycle	85f4a47175e6c5d5c9b259a065fa152249172dc3ab5309645bb111ebcb3b8745	f51a5f115902e8481c7aafa10480259db67a5b96701796f4e7b0da9b42b211ae
audit-037	system	system	certificate.deployed	certificate	mc-shop-prod	{"status": "success", "target": "tgt-nginx-prod"}	2026-04-19 02:40:49.589496+00	cert_lifecycle	f51a5f115902e8481c7aafa10480259db67a5b96701796f4e7b0da9b42b211ae	b40bf3aaad0c9b0ce2f3e37d435004a13f01bb85d1e0b797f6de1d8ca5434355
audit-040	system	system	certificate.renewed	certificate	mc-wildcard-prod	{"issuer": "iss-acme-le", "challenge": "dns-01"}	2026-04-25 02:40:21.589496+00	cert_lifecycle	b40bf3aaad0c9b0ce2f3e37d435004a13f01bb85d1e0b797f6de1d8ca5434355	2db3244939cffabcee615bf881daa819b0053c12607865261b91aa3fcaca001e
audit-041	system	system	certificate.deployed	certificate	mc-wildcard-prod	{"status": "success", "target": "tgt-nginx-prod"}	2026-04-25 02:41:16.589496+00	cert_lifecycle	2db3244939cffabcee615bf881daa819b0053c12607865261b91aa3fcaca001e	93578bdd856c39539cc834174340fa9052b318d6f5aed2f078d78b08bd88e9f2
audit-045	frank@example.com	user	certificate.created	certificate	mc-k8s-ingress	{"common_name": "ingress.example.com"}	2026-05-01 02:40:21.589496+00	cert_lifecycle	93578bdd856c39539cc834174340fa9052b318d6f5aed2f078d78b08bd88e9f2	fa61f2f13c9d0f11194df92c95d43c3dbae67af7d510260b2588e722ce1ff899
audit-046	system	system	certificate.deployed	certificate	mc-k8s-ingress	{"status": "success", "target": "tgt-traefik-prod"}	2026-05-01 02:40:45.589496+00	cert_lifecycle	fa61f2f13c9d0f11194df92c95d43c3dbae67af7d510260b2588e722ce1ff899	8ca4add819352e02e88307f97932194aa3fd39ea03910519374dd60cde0a834d
audit-048	alice@example.com	user	certificate.created	certificate	mc-edge-eu	{"common_name": "eu.cdn.example.com"}	2026-05-06 02:40:21.589496+00	cert_lifecycle	8ca4add819352e02e88307f97932194aa3fd39ea03910519374dd60cde0a834d	bec751e15949eb214534e28db5a496a3c5e55350faf18488cb8f688d506ce445
audit-049	system	system	certificate.deployed	certificate	mc-edge-eu	{"status": "success", "target": "tgt-caddy-prod"}	2026-05-06 02:40:41.589496+00	cert_lifecycle	bec751e15949eb214534e28db5a496a3c5e55350faf18488cb8f688d506ce445	1e6d51f42e9ebf90136afda8b75a299344bac18012b3ce2f75f7a019f87e34fc
audit-050	system	system	certificate.renewed	certificate	mc-api-prod	{"issuer": "iss-local", "serial": "0A:1B:2C:3D:4E:5F:00:01"}	2026-05-20 02:40:21.589496+00	cert_lifecycle	1e6d51f42e9ebf90136afda8b75a299344bac18012b3ce2f75f7a019f87e34fc	f267a5f37702145009e63f3557291394f38d6c6520c75329b0ff6ee0bccd4cf9
audit-051	system	system	certificate.deployed	certificate	mc-api-prod	{"status": "success", "target": "tgt-nginx-prod"}	2026-05-20 02:40:41.589496+00	cert_lifecycle	f267a5f37702145009e63f3557291394f38d6c6520c75329b0ff6ee0bccd4cf9	e51332a46ac325660f34acb43a8379256fe90c1282dd29ccbf3dfba185013013
audit-052	system	system	certificate.deployed	certificate	mc-api-prod	{"status": "success", "target": "tgt-haproxy-prod"}	2026-05-20 02:40:43.589496+00	cert_lifecycle	e51332a46ac325660f34acb43a8379256fe90c1282dd29ccbf3dfba185013013	03b46cd74969d9b73c161a61891a6abf46244d727a2a81e16f9a705bb3c90622
audit-055	bob@example.com	user	certificate.revoked	certificate	mc-compromised	{"reason": "keyCompromise", "serial": "0A:1B:2C:3D:4E:5F:00:14"}	2026-05-21 02:40:21.589496+00	cert_lifecycle	03b46cd74969d9b73c161a61891a6abf46244d727a2a81e16f9a705bb3c90622	08cbf6806848b8eda7647c3b02d089d988803b6d13da8db129df28ccfc1ae348
audit-060	system	system	certificate.renewed	certificate	mc-dash-prod	{"issuer": "iss-local"}	2026-05-27 02:40:21.589496+00	cert_lifecycle	08cbf6806848b8eda7647c3b02d089d988803b6d13da8db129df28ccfc1ae348	dd236e03ff2cfedad350bb903671a4d70b79391aec5a6535f19251e3b395c440
audit-061	system	system	certificate.deployed	certificate	mc-dash-prod	{"status": "success", "target": "tgt-nginx-prod"}	2026-05-27 02:40:39.589496+00	cert_lifecycle	dd236e03ff2cfedad350bb903671a4d70b79391aec5a6535f19251e3b395c440	56e07528c881f0880382daa509ccc580e06fdd7ba3941841d9d4919598236d70
audit-070	system	system	expiration.warning	certificate	mc-auth-prod	{"days_until_expiry": 12}	2026-06-04 02:10:21.589496+00	cert_lifecycle	56e07528c881f0880382daa509ccc580e06fdd7ba3941841d9d4919598236d70	b534b1968a43eb0df99e89b46461f0fd00936fbdef0bc7a73af40e79c889ea74
audit-071	system	system	expiration.warning	certificate	mc-cdn-prod	{"days_until_expiry": 8}	2026-06-04 02:15:21.589496+00	cert_lifecycle	b534b1968a43eb0df99e89b46461f0fd00936fbdef0bc7a73af40e79c889ea74	165c77c5099a2367f3d8492060f84ca67ae51abb57d28e1da069d77c4d4fdec6
audit-072	system	system	expiration.warning	certificate	mc-mail-prod	{"days_until_expiry": 5}	2026-06-04 02:20:21.589496+00	cert_lifecycle	165c77c5099a2367f3d8492060f84ca67ae51abb57d28e1da069d77c4d4fdec6	093c1be7d78261956b750b3fc0e0c5977e0dbbb86c525245535923f521203854
audit-073	system	system	expiration.warning	certificate	mc-ci-prod	{"days_until_expiry": 18}	2026-06-04 02:25:21.589496+00	cert_lifecycle	093c1be7d78261956b750b3fc0e0c5977e0dbbb86c525245535923f521203854	e5289876bf7c40a6edb29fbb64b3da1ef5aa85f9dd960f0e9f35cd8cbf6a4fc9
audit-075	system	system	renewal.failed	certificate	mc-vpn-prod	{"error": "ACME HTTP-01 challenge: connection refused", "attempt": 3}	2026-06-01 02:40:21.589496+00	cert_lifecycle	e5289876bf7c40a6edb29fbb64b3da1ef5aa85f9dd960f0e9f35cd8cbf6a4fc9	9233f5885399177a64817e321112c2cdb6aa4a21250628bc2815ad0d34b84a7a
audit-080	system	system	renewal.started	certificate	mc-grafana-prod	{"reason": "expiring_in_3_days"}	2026-06-04 00:40:21.589496+00	cert_lifecycle	9233f5885399177a64817e321112c2cdb6aa4a21250628bc2815ad0d34b84a7a	d8a52b4fdaecc7db0faeaad0a746ead80ae662a90a4cf91aaac90faf1d7e5947
audit-085	system	system	agent.registered	agent	ag-edge-01	{"os": "linux", "hostname": "edge-eu-01.internal"}	2026-04-20 02:40:21.589496+00	cert_lifecycle	d8a52b4fdaecc7db0faeaad0a746ead80ae662a90a4cf91aaac90faf1d7e5947	876738c0c85e7702ddb66fda8628681f1c0897098f36efd5dcf4516d6e7ec385
audit-086	system	system	agent.registered	agent	ag-k8s-prod	{"os": "linux", "hostname": "k8s-node-01.internal"}	2026-05-05 02:40:21.589496+00	cert_lifecycle	876738c0c85e7702ddb66fda8628681f1c0897098f36efd5dcf4516d6e7ec385	c2fb5028092ca0efa3bc5ed477c815b6f4f8c307c497cc86258a6b43d6b0ceb8
audit-087	system	system	agent.registered	agent	ag-mac-dev	{"os": "darwin", "hostname": "dev-mac-01.internal"}	2026-05-20 02:40:21.589496+00	cert_lifecycle	c2fb5028092ca0efa3bc5ed477c815b6f4f8c307c497cc86258a6b43d6b0ceb8	6d600561ac111438652ef456b8dc1a214829cd2070b05bd211285e75df069486
audit-088	bob@example.com	user	agent.registered	agent	ag-iis-prod	{"os": "windows", "hostname": "iis-prod-01.internal"}	2026-04-05 02:40:21.589496+00	cert_lifecycle	6d600561ac111438652ef456b8dc1a214829cd2070b05bd211285e75df069486	24b61d6c3ed4c2369033a54802e01fd2463a32991ea9739a1b48452d428a20c5
audit-089	system	system	agent.offline	agent	ag-iis-prod	{"last_heartbeat": "3 hours ago"}	2026-06-03 23:40:21.589496+00	cert_lifecycle	24b61d6c3ed4c2369033a54802e01fd2463a32991ea9739a1b48452d428a20c5	72f3b8543d9b4834589bf76a74e51af5b740e8d33f2f20fbbd2062c263d13257
audit-090	system	system	discovery_scan_completed	agent	ag-web-prod	{"dirs": ["/etc/nginx/ssl"], "certs_new": 2, "certs_found": 4}	2026-06-03 23:40:21.589496+00	cert_lifecycle	72f3b8543d9b4834589bf76a74e51af5b740e8d33f2f20fbbd2062c263d13257	85811936cd54fd800e3b79e74c11543c91dabcfac45a37b6aeee2412e97dbd5c
audit-091	system	system	discovery_scan_completed	agent	ag-data-prod	{"dirs": ["/etc/nginx/ssl"], "certs_new": 1, "certs_found": 3}	2026-06-04 00:40:21.589496+00	cert_lifecycle	85811936cd54fd800e3b79e74c11543c91dabcfac45a37b6aeee2412e97dbd5c	b42eb30a02778e82f823b7cbba0131c7fe5d9f53dedf2eb04d3f4e00579f2e8a
audit-092	system	system	discovery_scan_completed	agent	server-scanner	{"certs_new": 5, "scan_type": "network", "certs_found": 5}	2026-06-04 01:40:21.589496+00	cert_lifecycle	b42eb30a02778e82f823b7cbba0131c7fe5d9f53dedf2eb04d3f4e00579f2e8a	38bfbdf19211bfe2e33aa9edc8d31d7a5c586be0ff533c648ff90726a481d7c5
audit-095	alice@example.com	user	policy.violation	certificate	mc-legacy-prod	{"rule": "max-certificate-lifetime", "message": "Certificate expired"}	2026-06-01 02:40:21.589496+00	cert_lifecycle	38bfbdf19211bfe2e33aa9edc8d31d7a5c586be0ff533c648ff90726a481d7c5	0551d6da915a57e065696d29c18b7294d3274f5b6af7b4b28e9b4978ab9b7dce
audit-096	system	system	policy.violation	certificate	mc-old-api	{"rule": "max-certificate-lifetime", "message": "Certificate expired 15 days ago"}	2026-05-20 02:40:21.589496+00	cert_lifecycle	0551d6da915a57e065696d29c18b7294d3274f5b6af7b4b28e9b4978ab9b7dce	3e75b78e5ab2d814fbac554fcbafd9c173e811287575a9d98a633d5afce92ddc
audit-100	alice@example.com	user	api.call	api	GET /api/v1/certificates	{"status": 200, "latency_ms": 12}	2026-06-04 00:40:21.589496+00	cert_lifecycle	3e75b78e5ab2d814fbac554fcbafd9c173e811287575a9d98a633d5afce92ddc	96a4bd93610b664dd1dceaf44cea164e56245675522a04eb1ff90beae8d3cff3
audit-101	bob@example.com	user	api.call	api	GET /api/v1/agents	{"status": 200, "latency_ms": 8}	2026-06-04 01:40:21.589496+00	cert_lifecycle	96a4bd93610b664dd1dceaf44cea164e56245675522a04eb1ff90beae8d3cff3	964fbb5a2f6ae843f0796b10bd31ae5208c214f6162c2678e0e15511527bd33c
audit-102	anonymous	system	api.call	api	GET /api/v1/auth/info	{"status": 200, "latency_ms": 1}	2026-06-04 02:10:21.589496+00	cert_lifecycle	964fbb5a2f6ae843f0796b10bd31ae5208c214f6162c2678e0e15511527bd33c	b84623be12429323b796c0f9fda5c4656b1f9f06cac6ed2e66fb290e79953603
audit-1780540821742436709-1	system	System	auth.session_signing_key_bootstrap	session	sk-0pSsoKpxSWaLpCCav1lubQ	{"key_id": "sk-0pSsoKpxSWaLpCCav1lubQ"}	2026-06-04 02:40:21.742441+00	auth	b84623be12429323b796c0f9fda5c4656b1f9f06cac6ed2e66fb290e79953603	cce6ba87d9fb003efb3b2497a5470df9fc66b7bb86d34516a69702fcc2c802d8
audit-1780540865432320988-2	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 19}	2026-06-04 02:41:05.432323+00	cert_lifecycle	cce6ba87d9fb003efb3b2497a5470df9fc66b7bb86d34516a69702fcc2c802d8	bb7ae6959909748ff8c23100244d13801e2153e44358c77cbfced17065b1ee83
audit-1780540875129271762-3	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 02:41:15.129274+00	cert_lifecycle	bb7ae6959909748ff8c23100244d13801e2153e44358c77cbfced17065b1ee83	252e4fd2b2d077af8a86afa97760dd7f6bf0423ede9c1932d5a236127161ea76
audit-1780540875137002454-4	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 6}	2026-06-04 02:41:15.137005+00	cert_lifecycle	252e4fd2b2d077af8a86afa97760dd7f6bf0423ede9c1932d5a236127161ea76	508eab98bc200bdb5b084c88981980b3acbe05660f97a8e6c50cf899d9a386b9
audit-1780540880443390893-5	actor-demo-anon	User	api_get	api	/api/v1/issuers	{"path": "/api/v1/issuers", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 6}	2026-06-04 02:41:20.443405+00	cert_lifecycle	508eab98bc200bdb5b084c88981980b3acbe05660f97a8e6c50cf899d9a386b9	830d0e93026e2b89a645d6eb995fa5ed204a6cdee7af45f6c2b827722cc70e02
audit-1780540880457870908-6	actor-demo-anon	User	api_get	api	/api/v1/stats/summary	{"path": "/api/v1/stats/summary", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 21}	2026-06-04 02:41:20.457874+00	cert_lifecycle	830d0e93026e2b89a645d6eb995fa5ed204a6cdee7af45f6c2b827722cc70e02	d8271ced760b3b799d4d396e5d0c3acfc25651007e7d217e7ffc38275a04de20
audit-1780540880461629508-7	actor-demo-anon	User	api_get	api	/api/v1/stats/job-trends	{"path": "/api/v1/stats/job-trends", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 17}	2026-06-04 02:41:20.461632+00	cert_lifecycle	d8271ced760b3b799d4d396e5d0c3acfc25651007e7d217e7ffc38275a04de20	13e055571cf698c4914fc005de38e28c4101b58f690ce0e4ebcfcc29edd41a4d
audit-1780540880462048602-8	actor-demo-anon	User	api_get	api	/api/v1/jobs	{"path": "/api/v1/jobs", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 17}	2026-06-04 02:41:20.46205+00	cert_lifecycle	13e055571cf698c4914fc005de38e28c4101b58f690ce0e4ebcfcc29edd41a4d	360be95546322daa7e00f8069c807d59775fcbb8a3b633404b3c52eab5fccc11
audit-1780540880463745359-9	actor-demo-anon	User	api_get	api	/api/v1/stats/certificates-by-status	{"path": "/api/v1/stats/certificates-by-status", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 25}	2026-06-04 02:41:20.463747+00	cert_lifecycle	360be95546322daa7e00f8069c807d59775fcbb8a3b633404b3c52eab5fccc11	7242eb63775e921bd394e6c0d678221c71afe2a15b918dc1d686d3c8d926ee1b
audit-1780540880470546132-10	actor-demo-anon	User	api_get	api	/api/v1/stats/issuance-rate	{"path": "/api/v1/stats/issuance-rate", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 25}	2026-06-04 02:41:20.470548+00	cert_lifecycle	7242eb63775e921bd394e6c0d678221c71afe2a15b918dc1d686d3c8d926ee1b	4aaa24ab72f09096241f89ce124629a06f468383b1306d68b8a1900e766f89bc
audit-1780540880481034405-12	actor-demo-anon	User	api_get	api	/api/v1/stats/expiration-timeline	{"path": "/api/v1/stats/expiration-timeline", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 36}	2026-06-04 02:41:20.481036+00	cert_lifecycle	4aaa24ab72f09096241f89ce124629a06f468383b1306d68b8a1900e766f89bc	1ea934a2bdce3944f41589519976d84b891a7436cbf37cf2fa95d51e47c08f73
audit-1780540880478126933-11	actor-demo-anon	User	api_get	api	/api/v1/certificates	{"path": "/api/v1/certificates", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 33}	2026-06-04 02:41:20.47813+00	cert_lifecycle	1ea934a2bdce3944f41589519976d84b891a7436cbf37cf2fa95d51e47c08f73	9ce03e4faa4c7cfb4301a1c43dc0c70d6148418fecf26f8562687d0152ce4aff
audit-1780540882971312647-13	actor-demo-anon	User	api_get	api	/api/v1/issuers	{"path": "/api/v1/issuers", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 02:41:22.971315+00	cert_lifecycle	9ce03e4faa4c7cfb4301a1c43dc0c70d6148418fecf26f8562687d0152ce4aff	89778a9eb161937ba9cdded2fba567c4919d370990ee196b10717024ff481634
audit-1780540882977475847-14	actor-demo-anon	User	api_get	api	/api/v1/owners	{"path": "/api/v1/owners", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 02:41:22.977478+00	cert_lifecycle	89778a9eb161937ba9cdded2fba567c4919d370990ee196b10717024ff481634	70aef465ff2a5a6b34e035a80c040ddb7646b9fcd415f4c66553fb1ad572e32c
audit-1780540882978084379-15	actor-demo-anon	User	api_get	api	/api/v1/teams	{"path": "/api/v1/teams", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 6}	2026-06-04 02:41:22.978087+00	cert_lifecycle	70aef465ff2a5a6b34e035a80c040ddb7646b9fcd415f4c66553fb1ad572e32c	e52d72b3a94cc4c835cd71c609f633881130095695e76b3103cfa1707d788130
audit-1780540882978217233-16	actor-demo-anon	User	api_get	api	/api/v1/profiles	{"path": "/api/v1/profiles", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 6}	2026-06-04 02:41:22.978218+00	cert_lifecycle	e52d72b3a94cc4c835cd71c609f633881130095695e76b3103cfa1707d788130	8ecac66ce5091e3a46117af72975c7c140743840574235aa86932518b0eee2cf
audit-1780540882980432934-17	actor-demo-anon	User	api_get	api	/api/v1/certificates	{"path": "/api/v1/certificates", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 8}	2026-06-04 02:41:22.980435+00	cert_lifecycle	8ecac66ce5091e3a46117af72975c7c140743840574235aa86932518b0eee2cf	4e2f3880f4f55250b7c9a838d7e9fe93790f4cb1a99a4940257d9a4b337bc78f
audit-1780540885822079114-20	actor-demo-anon	User	api_get	api	/api/v1/discovery-summary	{"path": "/api/v1/discovery-summary", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 02:41:25.822081+00	cert_lifecycle	4fa734491a1effd9962bbd590124b6a9f7d3754b2bb5777dd95fbc385451eac7	2d9158d5a1c7ca8ca27ec01bf075c081756d26b9c7e64546ff1a6b35fcfc807f
audit-1780540883544248186-18	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 8}	2026-06-04 02:41:23.54425+00	cert_lifecycle	4e2f3880f4f55250b7c9a838d7e9fe93790f4cb1a99a4940257d9a4b337bc78f	5d679915bb2aac70991d97ab4f2358fbcc295c551baafd0116923454d9c61e43
audit-1780540885821239049-19	actor-demo-anon	User	api_get	api	/api/v1/agents	{"path": "/api/v1/agents", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 02:41:25.821242+00	cert_lifecycle	5d679915bb2aac70991d97ab4f2358fbcc295c551baafd0116923454d9c61e43	4fa734491a1effd9962bbd590124b6a9f7d3754b2bb5777dd95fbc385451eac7
audit-1780540885822761476-21	actor-demo-anon	User	api_get	api	/api/v1/discovery-scans	{"path": "/api/v1/discovery-scans", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 02:41:25.822764+00	cert_lifecycle	2d9158d5a1c7ca8ca27ec01bf075c081756d26b9c7e64546ff1a6b35fcfc807f	03bc72d6bedf17cac4e62334883bc2638c9023d03adbb69c6a04bac397cc775e
audit-1780540963463018137-36	actor-demo-anon	User	api_get	api	/api/v1/metrics/prometheus	{"path": "/api/v1/metrics/prometheus", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 9}	2026-06-04 02:42:43.46302+00	cert_lifecycle	f7336c18f21889bf16a2565797cc941439b60b9de8191262c9a2d789f91d2fef	6e7a47b767746d75153b86e3a69bdb72bc97fd195de7df07844e634fec83844c
audit-1780540966149609886-37	actor-demo-anon	User	api_get	api	/api/v1/auth/me	{"path": "/api/v1/auth/me", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 2}	2026-06-04 02:42:46.149612+00	cert_lifecycle	6e7a47b767746d75153b86e3a69bdb72bc97fd195de7df07844e634fec83844c	132e1764124c6e02a6611de395e0ef07eb68948b69432f89dad8ed3cf84c391a
audit-1780540966161384878-38	actor-demo-anon	User	api_get	api	/api/v1/auth/breakglass/credentials	{"path": "/api/v1/auth/breakglass/credentials", "method": "GET", "status": 404, "body_hash": "", "latency_ms": 2}	2026-06-04 02:42:46.161386+00	cert_lifecycle	132e1764124c6e02a6611de395e0ef07eb68948b69432f89dad8ed3cf84c391a	13fad9719fc6a40e4767b0b59f845b4065ea1b6d2ac69984cce968aa4d09b385
audit-1780540966935314259-39	actor-demo-anon	User	api_get	api	/api/v1/approvals	{"path": "/api/v1/approvals", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 02:42:46.935316+00	cert_lifecycle	13fad9719fc6a40e4767b0b59f845b4065ea1b6d2ac69984cce968aa4d09b385	f956827909c4a22f15a6c7985cec49eab174e641402a850ec2a900fa816401c4
audit-1780540967535149895-40	actor-demo-anon	User	api_get	api	/api/v1/auth/keys	{"path": "/api/v1/auth/keys", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 02:42:47.535152+00	cert_lifecycle	f956827909c4a22f15a6c7985cec49eab174e641402a850ec2a900fa816401c4	92a5019de787ff9decd22ac743fd14baec02d74ad7ac1eb901f149ed5fc2c326
audit-1780540976710540638-44	actor-demo-anon	User	api_get	api	/api/v1/stats/certificates-by-status	{"path": "/api/v1/stats/certificates-by-status", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 02:42:56.710543+00	cert_lifecycle	0c0a35e8beb6950c10aad7843f7df07d36b46178e1bd9f4d4b3972eb2007ba3b	3e1f3adef1a216717e3ab025be66c09df16543d7edc883fc75548ac09a3ab810
audit-1780540991475730180-52	actor-demo-anon	User	api_get	api	/api/v1/audit	{"path": "/api/v1/audit", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 02:43:11.475732+00	cert_lifecycle	5916324fea817d8bc86f8a908cedd8c9723db3a80b1af3fd96d022f14ef58cc6	5edfb8412cf1dd6011e7c092ea437f6b7868e3b14f21ec5fe64556989571e7d6
audit-1780540995240657596-54	actor-demo-anon	User	api_get	api	/api/v1/stats/summary	{"path": "/api/v1/stats/summary", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 6}	2026-06-04 02:43:15.24066+00	cert_lifecycle	e5d7a799bc21f93a5613690e23d70d1944a465f812c2171f2abcd8e5156d57ac	4a6933db5afb3849c62c41cf0b06e2e6ede5f04b6aad079a93c69b5d459e2488
audit-1780541000063134377-55	actor-demo-anon	User	api_get	api	/api/v1/stats/summary	{"path": "/api/v1/stats/summary", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 7}	2026-06-04 02:43:20.063137+00	cert_lifecycle	4a6933db5afb3849c62c41cf0b06e2e6ede5f04b6aad079a93c69b5d459e2488	84b319208faec0e82b0e576a0a2797dbb5077d5330c8c72fa6ab38fefa3c457a
audit-1780541005082174490-60	actor-demo-anon	User	api_get	api	/api/v1/stats/certificates-by-status	{"path": "/api/v1/stats/certificates-by-status", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 02:43:25.082177+00	cert_lifecycle	27520526416e059865cf84e70598347e62c9792d9d613f5049ff675af222dfc1	94f9d3be46030cb80e09e0602cf8d3d018169e78516ed9a5c15b40013958f10d
audit-1780541022596869865-64	actor-demo-anon	User	api_get	api	/api/v1/stats/summary	{"path": "/api/v1/stats/summary", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 7}	2026-06-04 02:43:42.596872+00	cert_lifecycle	6f024d273bcd192d255fca56a5b15df341098e4ead75e225a963f995b3bb0711	3035134879415aed08d3406cc4290c60270686ec5da463dae4b0906df80ad617
audit-1780540885823693699-22	actor-demo-anon	User	api_get	api	/api/v1/discovered-certificates	{"path": "/api/v1/discovered-certificates", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 02:41:25.823696+00	cert_lifecycle	03bc72d6bedf17cac4e62334883bc2638c9023d03adbb69c6a04bac397cc775e	a919b1d8f5d5dd9f38cdef8e27feb175e58be7bc58d2fd86c451988d318b5a2f
audit-1780540888658965955-23	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 02:41:28.658968+00	cert_lifecycle	a919b1d8f5d5dd9f38cdef8e27feb175e58be7bc58d2fd86c451988d318b5a2f	567d5964b189cd2d125030715b67f74a3a5603341d42d219ecceaeacd6ec65b4
audit-1780540905330761951-24	actor-demo-anon	User	api_get	api	/api/v1/agent-groups	{"path": "/api/v1/agent-groups", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 02:41:45.330764+00	cert_lifecycle	567d5964b189cd2d125030715b67f74a3a5603341d42d219ecceaeacd6ec65b4	419bd2ed6aa51b2b8bdb2135efac3cf180f4caf7f37167b230491e317327c3e4
audit-1780540908447765585-25	actor-demo-anon	User	api_get	api	/api/v1/renewal-policies	{"path": "/api/v1/renewal-policies", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 2}	2026-06-04 02:41:48.447767+00	cert_lifecycle	419bd2ed6aa51b2b8bdb2135efac3cf180f4caf7f37167b230491e317327c3e4	ecbff7b9c3643888116be1e69b070efb7d6a61a3337df6625d5343d1f61cfd1d
audit-1780540909111587711-26	actor-demo-anon	User	api_get	api	/api/v1/policies	{"path": "/api/v1/policies", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 02:41:49.11159+00	cert_lifecycle	ecbff7b9c3643888116be1e69b070efb7d6a61a3337df6625d5343d1f61cfd1d	a1447760dd6b6dbe558d61434cf65c6e7ed3b5e60a7bbecc4d4205e5f47f9caf
audit-1780540910780227428-27	actor-demo-anon	User	api_get	api	/api/v1/profiles	{"path": "/api/v1/profiles", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 02:41:50.78023+00	cert_lifecycle	a1447760dd6b6dbe558d61434cf65c6e7ed3b5e60a7bbecc4d4205e5f47f9caf	f0ed1fcad97873c7558afc01afc91dadbcc86ad277c153f83c9b1c8319ff7fe3
audit-1780540915503511484-28	actor-demo-anon	User	api_get	api	/api/v1/teams	{"path": "/api/v1/teams", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 2}	2026-06-04 02:41:55.503514+00	cert_lifecycle	f0ed1fcad97873c7558afc01afc91dadbcc86ad277c153f83c9b1c8319ff7fe3	65f0a31007ca75ad4e6d1756ab97a47169c225c9500c0a691b902f04213ebd78
audit-1780540917317606657-29	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 02:41:57.317609+00	cert_lifecycle	65f0a31007ca75ad4e6d1756ab97a47169c225c9500c0a691b902f04213ebd78	dd51155fee60f3f933cb492c54503006a49f51050595850c4512d6d63a95d35f
audit-1780540918658298834-30	actor-demo-anon	User	api_get	api	/api/v1/owners	{"path": "/api/v1/owners", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 2}	2026-06-04 02:41:58.658301+00	cert_lifecycle	dd51155fee60f3f933cb492c54503006a49f51050595850c4512d6d63a95d35f	f30bce67441826849571ce0e7ba9b80c853db97892aa6d718fe4ae90e4f47e50
audit-1780540946569900437-31	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 6}	2026-06-04 02:42:26.569902+00	cert_lifecycle	f30bce67441826849571ce0e7ba9b80c853db97892aa6d718fe4ae90e4f47e50	1638cbe7e74350d4cb61740073d52e3784da1b0f725b2b2a63c39a0433e09047
audit-1780540947695553434-32	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 8}	2026-06-04 02:42:27.695555+00	cert_lifecycle	1638cbe7e74350d4cb61740073d52e3784da1b0f725b2b2a63c39a0433e09047	213359a1409d88ae9d6be3a703640049784d032fb948ae8e73b06c151cace549
audit-1780540958467301170-33	actor-demo-anon	User	api_get	api	/api/v1/notifications	{"path": "/api/v1/notifications", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 02:42:38.467303+00	cert_lifecycle	213359a1409d88ae9d6be3a703640049784d032fb948ae8e73b06c151cace549	4047827a57ad0a16ca4a990e797eec46ce6a09abfc7f4bd29cb811c454602037
audit-1780540962804892202-34	actor-demo-anon	User	api_get	api	/api/v1/digest/preview	{"path": "/api/v1/digest/preview", "method": "GET", "status": 503, "body_hash": "", "latency_ms": 2}	2026-06-04 02:42:42.804894+00	cert_lifecycle	4047827a57ad0a16ca4a990e797eec46ce6a09abfc7f4bd29cb811c454602037	02c69f6096eaca993c23b5e2ed9affab3f98eda55d6f5ca8b5a9ed5291a85b05
audit-1780540963453186767-35	actor-demo-anon	User	api_get	api	/api/v1/metrics	{"path": "/api/v1/metrics", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 6}	2026-06-04 02:42:43.453189+00	cert_lifecycle	02c69f6096eaca993c23b5e2ed9affab3f98eda55d6f5ca8b5a9ed5291a85b05	f7336c18f21889bf16a2565797cc941439b60b9de8191262c9a2d789f91d2fef
audit-1780540967539610656-41	actor-demo-anon	User	api_get	api	/api/v1/auth/roles	{"path": "/api/v1/auth/roles", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 02:42:47.539613+00	cert_lifecycle	92a5019de787ff9decd22ac743fd14baec02d74ad7ac1eb901f149ed5fc2c326	a0dce245b3e4114270fcc620fc8825a34eec5d0ee2ed5084cc8ff225ed21fb84
audit-1780540971684214810-42	actor-demo-anon	User	api_get	api	/api/v1/admin/scep/profiles	{"path": "/api/v1/admin/scep/profiles", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 02:42:51.684217+00	cert_lifecycle	a0dce245b3e4114270fcc620fc8825a34eec5d0ee2ed5084cc8ff225ed21fb84	93429efdc116aa12ac9449a6c561acaa6ec74db6bc30b161512c1c428f30d193
audit-1780540976715754434-45	actor-demo-anon	User	api_get	api	/api/v1/stats/summary	{"path": "/api/v1/stats/summary", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 9}	2026-06-04 02:42:56.715757+00	cert_lifecycle	3e1f3adef1a216717e3ab025be66c09df16543d7edc883fc75548ac09a3ab810	f5020a82da23caeab2032a08c7bb090d636131e61a7ce22fbe88e86817c2ec58
audit-1780540977851922535-46	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 02:42:57.851924+00	cert_lifecycle	f5020a82da23caeab2032a08c7bb090d636131e61a7ce22fbe88e86817c2ec58	ff3144a356cd0e1a2800db49684738f5d1d135a8fbd43f457fbdc1de6708274a
audit-1780540986924358480-47	actor-demo-anon	User	api_post	api	/api/v1/jobs/job-approval-02/approve	{"path": "/api/v1/jobs/job-approval-02/approve", "method": "POST", "status": 200, "body_hash": "", "latency_ms": 7}	2026-06-04 02:43:06.924361+00	cert_lifecycle	ff3144a356cd0e1a2800db49684738f5d1d135a8fbd43f457fbdc1de6708274a	d3b4b148353f7837d08a190efb40404e9488396274217c0f4ac6a5f773ab011c
audit-1780540986929129569-48	actor-demo-anon	User	api_get	api	/api/v1/jobs	{"path": "/api/v1/jobs", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 1}	2026-06-04 02:43:06.929132+00	cert_lifecycle	d3b4b148353f7837d08a190efb40404e9488396274217c0f4ac6a5f773ab011c	32c17ad4731ffceee1fb6a022c32dc77f4580912a42976dca9d9ddcbb7cdcb04
audit-1780540976709549007-43	actor-demo-anon	User	api_get	api	/api/v1/jobs	{"path": "/api/v1/jobs", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 02:42:56.709551+00	cert_lifecycle	93429efdc116aa12ac9449a6c561acaa6ec74db6bc30b161512c1c428f30d193	0c0a35e8beb6950c10aad7843f7df07d36b46178e1bd9f4d4b3972eb2007ba3b
audit-1780541000068596866-57	actor-demo-anon	User	api_get	api	/api/v1/stats/certificates-by-status	{"path": "/api/v1/stats/certificates-by-status", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 02:43:20.068598+00	cert_lifecycle	4e54b91d25b82bb52fda184b149272f7302ab292db91d50efdf0e242892515f5	8838759aca77d54096cdbaac2e827955e3f772201a7bf925552d20632d3ae3e3
audit-1780541003715884357-58	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 7}	2026-06-04 02:43:23.715886+00	cert_lifecycle	8838759aca77d54096cdbaac2e827955e3f772201a7bf925552d20632d3ae3e3	9173b2b4fe9fd038cacfb034f360e93bff6ff2b17b47eb62455d8247869cc33a
audit-1780541005081071018-59	actor-demo-anon	User	api_get	api	/api/v1/jobs	{"path": "/api/v1/jobs", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 02:43:25.081073+00	cert_lifecycle	9173b2b4fe9fd038cacfb034f360e93bff6ff2b17b47eb62455d8247869cc33a	27520526416e059865cf84e70598347e62c9792d9d613f5049ff675af222dfc1
audit-1780541022597806461-65	actor-demo-anon	User	api_get	api	/api/v1/stats/certificates-by-status	{"path": "/api/v1/stats/certificates-by-status", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 02:43:42.597808+00	cert_lifecycle	3035134879415aed08d3406cc4290c60270686ec5da463dae4b0906df80ad617	eeea6e8a8c185aa62f3c84982ba55351633f6421a1f8853d433c29a690f6e44d
audit-1780540988283382339-49	actor-demo-anon	User	api_post	api	/api/v1/jobs/job-approval-01/approve	{"path": "/api/v1/jobs/job-approval-01/approve", "method": "POST", "status": 200, "body_hash": "", "latency_ms": 16}	2026-06-04 02:43:08.283384+00	cert_lifecycle	32c17ad4731ffceee1fb6a022c32dc77f4580912a42976dca9d9ddcbb7cdcb04	4755a07f1d524cb5d2695139b11f4026589399b2ecc7b3ee7395a3db5f0a1688
audit-1780540988334974911-50	actor-demo-anon	User	api_get	api	/api/v1/jobs	{"path": "/api/v1/jobs", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 02:43:08.334977+00	cert_lifecycle	4755a07f1d524cb5d2695139b11f4026589399b2ecc7b3ee7395a3db5f0a1688	ca0cdf850db11854db4584d4f0842fb7678b0fd621e2b8f8fa18b2997d5e733c
audit-1780540991471225123-51	actor-demo-anon	User	api_get	api	/api/v1/jobs/job-approval-01	{"path": "/api/v1/jobs/job-approval-01", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 2}	2026-06-04 02:43:11.471227+00	cert_lifecycle	ca0cdf850db11854db4584d4f0842fb7678b0fd621e2b8f8fa18b2997d5e733c	5916324fea817d8bc86f8a908cedd8c9723db3a80b1af3fd96d022f14ef58cc6
audit-1780540995238446078-53	actor-demo-anon	User	api_get	api	/api/v1/stats/certificates-by-status	{"path": "/api/v1/stats/certificates-by-status", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 02:43:15.238448+00	cert_lifecycle	5edfb8412cf1dd6011e7c092ea437f6b7868e3b14f21ec5fe64556989571e7d6	e5d7a799bc21f93a5613690e23d70d1944a465f812c2171f2abcd8e5156d57ac
audit-1780541000068219782-56	actor-demo-anon	User	api_get	api	/api/v1/jobs	{"path": "/api/v1/jobs", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 02:43:20.068223+00	cert_lifecycle	84b319208faec0e82b0e576a0a2797dbb5077d5330c8c72fa6ab38fefa3c457a	4e54b91d25b82bb52fda184b149272f7302ab292db91d50efdf0e242892515f5
audit-1780541005083914557-61	actor-demo-anon	User	api_get	api	/api/v1/stats/summary	{"path": "/api/v1/stats/summary", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 6}	2026-06-04 02:43:25.083916+00	cert_lifecycle	94f9d3be46030cb80e09e0602cf8d3d018169e78516ed9a5c15b40013958f10d	96698f21bd8848715dd24a177afa5867bdcfd03c30c6f6c8a877dbda0e0a7d9a
audit-1780541010151300824-62	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 17}	2026-06-04 02:43:30.151304+00	cert_lifecycle	96698f21bd8848715dd24a177afa5867bdcfd03c30c6f6c8a877dbda0e0a7d9a	ecc5a6d50b6e9948e1e3931c2ebed6962a848cfab92fd681d96e4ac1895943be
audit-1780541022592683197-63	actor-demo-anon	User	api_get	api	/api/v1/jobs	{"path": "/api/v1/jobs", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 2}	2026-06-04 02:43:42.592685+00	cert_lifecycle	ecc5a6d50b6e9948e1e3931c2ebed6962a848cfab92fd681d96e4ac1895943be	6f024d273bcd192d255fca56a5b15df341098e4ead75e225a963f995b3bb0711
audit-1780541030333626791-66	actor-demo-anon	User	api_get	api	/api/v1/certificates/mc-old-api	{"path": "/api/v1/certificates/mc-old-api", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 02:43:50.333629+00	cert_lifecycle	eeea6e8a8c185aa62f3c84982ba55351633f6421a1f8853d433c29a690f6e44d	c5f0528609210ca0a6f2631b6be663e236cee36f1b44fc5d60d6b4008e9b6244
audit-1780541030338669622-67	actor-demo-anon	User	api_get	api	/api/v1/certificates/mc-old-api/versions	{"path": "/api/v1/certificates/mc-old-api/versions", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 02:43:50.338678+00	cert_lifecycle	c5f0528609210ca0a6f2631b6be663e236cee36f1b44fc5d60d6b4008e9b6244	b2793b6550b430073406b1d6bcee76e6772245358dd7401a31a604e19375124c
audit-1780541030345084432-68	actor-demo-anon	User	api_get	api	/api/v1/jobs	{"path": "/api/v1/jobs", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 2}	2026-06-04 02:43:50.345087+00	cert_lifecycle	b2793b6550b430073406b1d6bcee76e6772245358dd7401a31a604e19375124c	c9121be98ae90ae32412470b74a80dea412fe385244cbc394dc025145ca821b2
audit-1780541033142366785-69	actor-demo-anon	User	api_post	api	/api/v1/certificates/mc-old-api/renew	{"path": "/api/v1/certificates/mc-old-api/renew", "method": "POST", "status": 400, "body_hash": "", "latency_ms": 2}	2026-06-04 02:43:53.142368+00	cert_lifecycle	c9121be98ae90ae32412470b74a80dea412fe385244cbc394dc025145ca821b2	13457cc58b2866824a126d32242f727edbe64098cc526a8d79e43813bce1f538
audit-1780541043063621605-70	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 02:44:03.063624+00	cert_lifecycle	13457cc58b2866824a126d32242f727edbe64098cc526a8d79e43813bce1f538	8cebaf3d5b9ab175b1947811898b9b14844c8ffef76b49862df6f8619f340c83
audit-1780541064572588299-71	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 15}	2026-06-04 02:44:24.57259+00	cert_lifecycle	8cebaf3d5b9ab175b1947811898b9b14844c8ffef76b49862df6f8619f340c83	644161f2d18c04cab4efb48bc45c0182b1e908140ac19093a8abf6b9e240d9a0
audit-1780541066436242119-72	actor-demo-anon	User	api_get	api	/api/v1/discovered-certificates	{"path": "/api/v1/discovered-certificates", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 02:44:26.436243+00	cert_lifecycle	644161f2d18c04cab4efb48bc45c0182b1e908140ac19093a8abf6b9e240d9a0	db8bd099dd4667f5283cb54b5947c741aba3316a246243d68be76d939817f5d5
audit-1780541066438961818-74	actor-demo-anon	User	api_get	api	/api/v1/discovery-scans	{"path": "/api/v1/discovery-scans", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 2}	2026-06-04 02:44:26.438963+00	cert_lifecycle	db8bd099dd4667f5283cb54b5947c741aba3316a246243d68be76d939817f5d5	595c0f7b1b615518d942770817c0ceab3480e689a6a13bb10e429f225562aeb9
audit-1780541066438921845-73	actor-demo-anon	User	api_get	api	/api/v1/discovery-summary	{"path": "/api/v1/discovery-summary", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 2}	2026-06-04 02:44:26.438923+00	cert_lifecycle	595c0f7b1b615518d942770817c0ceab3480e689a6a13bb10e429f225562aeb9	fbec8ed4c1f50a40772dc815ed27e7cc48a115b27ca01e9fe3ca4872dc82f922
audit-1780541071801318633-75	actor-demo-anon	User	api_get	api	/api/v1/agents	{"path": "/api/v1/agents", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 2}	2026-06-04 02:44:31.801321+00	cert_lifecycle	fbec8ed4c1f50a40772dc815ed27e7cc48a115b27ca01e9fe3ca4872dc82f922	6d76cc44dc4a4d6ca768e3b95706eb04886c2c85d7137b75d601b9c40c0ba30a
audit-1780541071911372760-76	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 02:44:31.911375+00	cert_lifecycle	6d76cc44dc4a4d6ca768e3b95706eb04886c2c85d7137b75d601b9c40c0ba30a	19bccfa71df4899b2338517ee27fd964bbf8eba53bb6d696a0019cab491bcd7d
audit-1780544164265902518-494	actor-demo-anon	Anonymous	auth.runtime_config_read	config		{"key_count": 12}	2026-06-04 03:36:04.265909+00	auth	54786c5ae6ca71cd0f0214ed8a5ac30fd0475f58d51a7238ef750903d80fadd6	f3cb39ef72c13c7e4cc8b350e8ef261b4d399220da7d3596136184c83fd22e66
audit-1780541088214817571-77	actor-demo-anon	User	api_get	api	/api/v1/agents	{"path": "/api/v1/agents", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 02:44:48.21482+00	cert_lifecycle	19bccfa71df4899b2338517ee27fd964bbf8eba53bb6d696a0019cab491bcd7d	70ccdacff3f4213c6e29e0fbb3cbd8e5cf37c1508f34477520644645e80ba6ac
audit-1780541100750404494-78	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 02:45:00.750407+00	cert_lifecycle	70ccdacff3f4213c6e29e0fbb3cbd8e5cf37c1508f34477520644645e80ba6ac	a97daa8635e904e379c17b7e62dea6292b2db21b855fdf6028277bf36eb54291
audit-1780541108381003886-80	actor-demo-anon	User	api_get	api	/api/v1/auth/me	{"path": "/api/v1/auth/me", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 02:45:08.381006+00	cert_lifecycle	a97daa8635e904e379c17b7e62dea6292b2db21b855fdf6028277bf36eb54291	31b7df5bf0bcd6c090b9641595d31f5baf792b35cfe3a11c41f474b3e5eb2128
audit-1780541109795308296-82	actor-demo-anon	Anonymous	auth.runtime_config_read	config		{"key_count": 12}	2026-06-04 02:45:09.795314+00	auth	0fe8ff06fb8e3ae9590a29854c0380a4351b1daae26c6f5ddf195a6f5331a8e8	e83f15dec3c2dfceae4962fbabd26ee0bcea5824cb7051b36b55209e9094475e
audit-1780541109798546997-83	actor-demo-anon	User	api_get	api	/api/v1/auth/runtime-config	{"path": "/api/v1/auth/runtime-config", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 7}	2026-06-04 02:45:09.798549+00	cert_lifecycle	e83f15dec3c2dfceae4962fbabd26ee0bcea5824cb7051b36b55209e9094475e	f4ab6fe9b1c3a5f1c5572a8c45201e7cf9a834694813b9d3fe735a46716321b4
audit-1780541113241138896-84	actor-demo-anon	User	api_get	api	/api/v1/audit	{"path": "/api/v1/audit", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 17}	2026-06-04 02:45:13.241141+00	cert_lifecycle	f4ab6fe9b1c3a5f1c5572a8c45201e7cf9a834694813b9d3fe735a46716321b4	e0d72a846f14e418a3feab40577ea250f02f4662304e75703f4a1b2b409967a1
audit-1780541118763332752-85	actor-demo-anon	User	api_get	api	/api/v1/digest/preview	{"path": "/api/v1/digest/preview", "method": "GET", "status": 503, "body_hash": "", "latency_ms": 2}	2026-06-04 02:45:18.763335+00	cert_lifecycle	e0d72a846f14e418a3feab40577ea250f02f4662304e75703f4a1b2b409967a1	c31c857f553e9af02de1d080351b9ced73d4162c3242ddee3aef547cf5edc3eb
audit-1780541125926855002-86	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 4}	2026-06-04 02:45:25.926857+00	cert_lifecycle	c31c857f553e9af02de1d080351b9ced73d4162c3242ddee3aef547cf5edc3eb	9167316c85ce8da9b99d3cb03d585121ffe40d5e9b9518e7eed9c337c795fabe
audit-1780541129233774518-87	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 02:45:29.233777+00	cert_lifecycle	9167316c85ce8da9b99d3cb03d585121ffe40d5e9b9518e7eed9c337c795fabe	bbb6f0898449370769a9e2267c48b5f5cce61a35368ef4b2dcd530e3f2db51f7
audit-1780541130139511379-88	actor-demo-anon	User	api_get	api	/api/v1/auth/oidc/providers	{"path": "/api/v1/auth/oidc/providers", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 02:45:30.139513+00	cert_lifecycle	bbb6f0898449370769a9e2267c48b5f5cce61a35368ef4b2dcd530e3f2db51f7	17e0dca9974ffe825b7c9e8fc114cfcbbacb770d478a61b01523184ab6d4cfc4
audit-1780541131074310973-89	actor-demo-anon	User	api_get	api	/api/v1/auth/sessions	{"path": "/api/v1/auth/sessions", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 02:45:31.074314+00	cert_lifecycle	17e0dca9974ffe825b7c9e8fc114cfcbbacb770d478a61b01523184ab6d4cfc4	ec4681cea92fbb2fa356c0dfc841a7a6bd0e4d05ff091cb45ace43c190582ec3
audit-1780541132878626519-90	actor-demo-anon	Anonymous	auth.user_list	user		{"count": 0, "provider_filter": ""}	2026-06-04 02:45:32.878631+00	auth	ec4681cea92fbb2fa356c0dfc841a7a6bd0e4d05ff091cb45ace43c190582ec3	07079e5958eb4603818e90ab4270ceb01fc3cb283ab08b545a146a09534849d5
audit-1780541132880737899-91	actor-demo-anon	User	api_get	api	/api/v1/auth/users	{"path": "/api/v1/auth/users", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 02:45:32.88074+00	cert_lifecycle	07079e5958eb4603818e90ab4270ceb01fc3cb283ab08b545a146a09534849d5	c02b0fc05f643968206b5151fe366cc7498dc5d6abfae96fc1415506f84d6563
audit-1780541138119505002-92	actor-demo-anon	User	api_get	api	/api/v1/admin/est/profiles	{"path": "/api/v1/admin/est/profiles", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 2}	2026-06-04 02:45:38.119507+00	cert_lifecycle	c02b0fc05f643968206b5151fe366cc7498dc5d6abfae96fc1415506f84d6563	b532c73c3ae63072b83b170c90e0997b6a26582a0654595b3c89b8f343137a02
audit-1780541161137291529-93	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 02:46:01.137294+00	cert_lifecycle	b532c73c3ae63072b83b170c90e0997b6a26582a0654595b3c89b8f343137a02	6c4c789291b2652cbf256bcbabb80f9a822afbaf772d54df94a7ab60a5bd8d57
audit-1780541163356018939-95	actor-demo-anon	User	api_get	api	/api/v1/network-scan/scep-probes	{"path": "/api/v1/network-scan/scep-probes", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 2}	2026-06-04 02:46:03.35602+00	cert_lifecycle	ce6aa324e26f2b785e23a59fc3c7600dd4f8efe08f9e62c83b6bfd799e80d7ad	e61a18e3e6c1b44a1b28d3423c6e2ca2bf01bdcf31c84039afa68c4d2b0580b3
audit-1780541172063535751-96	actor-demo-anon	User	api_get	api	/api/v1/jobs	{"path": "/api/v1/jobs", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 02:46:12.063538+00	cert_lifecycle	e61a18e3e6c1b44a1b28d3423c6e2ca2bf01bdcf31c84039afa68c4d2b0580b3	8e64d2576d42207fafee42978243b663b470cc1f47a8101c39d17dabd07de8a6
audit-1780541281135863537-106	actor-demo-anon	User	api_get	api	/api/v1/jobs	{"path": "/api/v1/jobs", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 02:48:01.135865+00	cert_lifecycle	f3e8b4670384e2956ec6426732583e1a568bd4aab765933f7b1f4dfc5c738822	f6142a76824114794248995eadfad728d2c9ac93e4ff3a239cfc7fbc94632501
audit-1780541283376616592-111	actor-demo-anon	User	api_get	api	/api/v1/owners	{"path": "/api/v1/owners", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 02:48:03.376634+00	cert_lifecycle	203061bdb6f73524b8947b3edd7cfe586b7ca3315c3aa0144b914456dd9da8f1	6483d514d0001c33bc7b098a51e5f6b0157e9d915cb47c0517c9776804b612dc
audit-1780541359360662608-130	actor-demo-anon	User	api_get	api	/api/v1/jobs	{"path": "/api/v1/jobs", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 24}	2026-06-04 02:49:19.360665+00	cert_lifecycle	5d5c53e00cc0c5d02c1074c2e17a7aaebd7112171c90816ff966865d16d4299c	fb33bead90b6b607a8f5db915291baba3ffe464acbc98567bb11b5c70dd95b7f
audit-1780541108380185462-79	actor-demo-anon	User	api_get	api	/api/v1/auth/breakglass/credentials	{"path": "/api/v1/auth/breakglass/credentials", "method": "GET", "status": 404, "body_hash": "", "latency_ms": 2}	2026-06-04 02:45:08.380189+00	cert_lifecycle	31b7df5bf0bcd6c090b9641595d31f5baf792b35cfe3a11c41f474b3e5eb2128	99c1fbc6f2130f9614c2ed17855a45920bf943ab15362783571ffa963165fb78
audit-1780541109790596326-81	actor-demo-anon	User	api_get	api	/api/v1/auth/bootstrap	{"path": "/api/v1/auth/bootstrap", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 0}	2026-06-04 02:45:09.790599+00	cert_lifecycle	99c1fbc6f2130f9614c2ed17855a45920bf943ab15362783571ffa963165fb78	0fe8ff06fb8e3ae9590a29854c0380a4351b1daae26c6f5ddf195a6f5331a8e8
audit-1780541163355862702-94	actor-demo-anon	User	api_get	api	/api/v1/network-scan-targets	{"path": "/api/v1/network-scan-targets", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 2}	2026-06-04 02:46:03.355865+00	cert_lifecycle	6c4c789291b2652cbf256bcbabb80f9a822afbaf772d54df94a7ab60a5bd8d57	ce6aa324e26f2b785e23a59fc3c7600dd4f8efe08f9e62c83b6bfd799e80d7ad
audit-1780541172065758266-97	actor-demo-anon	User	api_get	api	/api/v1/stats/certificates-by-status	{"path": "/api/v1/stats/certificates-by-status", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 6}	2026-06-04 02:46:12.065761+00	cert_lifecycle	8e64d2576d42207fafee42978243b663b470cc1f47a8101c39d17dabd07de8a6	b4f613b08d0f38cd34cae4b514e671b085a462cb29bc9f94451999fd2e8a8bc5
audit-1780541281136982774-107	actor-demo-anon	User	api_get	api	/api/v1/stats/certificates-by-status	{"path": "/api/v1/stats/certificates-by-status", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 02:48:01.136985+00	cert_lifecycle	f6142a76824114794248995eadfad728d2c9ac93e4ff3a239cfc7fbc94632501	8a451dd2d5b4c3abb68d8877452de0e8c8c72aa37ddfce163a8a2d0f3d9e041a
audit-1780541283378870907-114	actor-demo-anon	User	api_get	api	/api/v1/profiles	{"path": "/api/v1/profiles", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 02:48:03.378872+00	cert_lifecycle	6483d514d0001c33bc7b098a51e5f6b0157e9d915cb47c0517c9776804b612dc	9fb235deb35e7d2ed2b70d62a5fa1d22860db9e9b3c05a28696f3b6ca2a70e35
audit-1780541327586343742-123	actor-demo-anon	User	api_get	api	/api/v1/auth/keys	{"path": "/api/v1/auth/keys", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 6}	2026-06-04 02:48:47.586346+00	cert_lifecycle	d177aae5995fff274de9a6a4278a873f2756d61d22c873a3f5646132d385e1d7	0e18b503e9deac19f25f2a358c9b9d08ff72003b91d281aa55cea39038b4a368
audit-1780541331673972572-124	actor-demo-anon	User	api_get	api	/api/v1/approvals	{"path": "/api/v1/approvals", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 2}	2026-06-04 02:48:51.673975+00	cert_lifecycle	0e18b503e9deac19f25f2a358c9b9d08ff72003b91d281aa55cea39038b4a368	8067cf7586285646e85d74fca191bd968d3f67c0238611032f128b41a8a3e1fd
audit-1780541333145041852-125	actor-demo-anon	User	api_get	api	/api/v1/auth/breakglass/credentials	{"path": "/api/v1/auth/breakglass/credentials", "method": "GET", "status": 404, "body_hash": "", "latency_ms": 1}	2026-06-04 02:48:53.145044+00	cert_lifecycle	8067cf7586285646e85d74fca191bd968d3f67c0238611032f128b41a8a3e1fd	ce5efe7aabe8cbdc5f6e53deda1756c393c1cebf045685d3e0c109368be0bbed
audit-1780541336465386251-126	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 02:48:56.465388+00	cert_lifecycle	ce5efe7aabe8cbdc5f6e53deda1756c393c1cebf045685d3e0c109368be0bbed	b0c3892a4fe3f1330eabaaaacab4cc7b95b7de43868fa8722526c5d77d44f1ca
audit-1780541359355988725-127	actor-demo-anon	User	api_get	api	/api/v1/stats/summary	{"path": "/api/v1/stats/summary", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 35}	2026-06-04 02:49:19.355991+00	cert_lifecycle	b0c3892a4fe3f1330eabaaaacab4cc7b95b7de43868fa8722526c5d77d44f1ca	d8d139f5e1587a578ec8665c363174914f99edc215f0c0e78f3bc72e899afff1
audit-1780541172069655455-98	actor-demo-anon	User	api_get	api	/api/v1/stats/summary	{"path": "/api/v1/stats/summary", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 10}	2026-06-04 02:46:12.069658+00	cert_lifecycle	b4f613b08d0f38cd34cae4b514e671b085a462cb29bc9f94451999fd2e8a8bc5	9acd9dbf7ec0bf645d57ed81f672e551c2b2f385bda6d80e0e6c9f1615f44eec
audit-1780541186673150317-99	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 15}	2026-06-04 02:46:26.673153+00	cert_lifecycle	9acd9dbf7ec0bf645d57ed81f672e551c2b2f385bda6d80e0e6c9f1615f44eec	4ef39a1bb56bb9ab6274005be2ba5b03a84fc64f52bbf2f62057081b1a58d02c
audit-1780541193145479798-100	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 02:46:33.145481+00	cert_lifecycle	4ef39a1bb56bb9ab6274005be2ba5b03a84fc64f52bbf2f62057081b1a58d02c	c30e38d0605e64aa5f0fba45ff6139013974b805e78816ff6a851a291205f953
audit-1780541220767513313-101	actor-demo-anon	User	api_post	api	/api/v1/network-scan-targets/nst-edge/scan	{"path": "/api/v1/network-scan-targets/nst-edge/scan", "method": "POST", "status": 200, "body_hash": "", "latency_ms": 55045}	2026-06-04 02:47:00.767515+00	cert_lifecycle	c30e38d0605e64aa5f0fba45ff6139013974b805e78816ff6a851a291205f953	bac0852b1282962bf9f766ef09a867db14238cf7be28def6fe5ef0f0e253a786
audit-1780541222450355763-102	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 02:47:02.450358+00	cert_lifecycle	bac0852b1282962bf9f766ef09a867db14238cf7be28def6fe5ef0f0e253a786	ae9ff1350e4c83e68e77cf2a5582aa8bffe1ed9cd3abe46956c8644195254ecb
audit-1780541241812677423-103	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 4}	2026-06-04 02:47:21.812679+00	cert_lifecycle	ae9ff1350e4c83e68e77cf2a5582aa8bffe1ed9cd3abe46956c8644195254ecb	bbb37edcc492b9c1565e2dc5f4461f8dc0380d3b9d9d1020e092d14314ed2a75
audit-1780541249493934884-104	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 02:47:29.493937+00	cert_lifecycle	bbb37edcc492b9c1565e2dc5f4461f8dc0380d3b9d9d1020e092d14314ed2a75	ffd631547c38b225d6abdbecbffacfdf6e03db7b153705211aa011db34a334bc
audit-1780541279211508841-105	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 6}	2026-06-04 02:47:59.211511+00	cert_lifecycle	ffd631547c38b225d6abdbecbffacfdf6e03db7b153705211aa011db34a334bc	f3e8b4670384e2956ec6426732583e1a568bd4aab765933f7b1f4dfc5c738822
audit-1780541281139146906-108	actor-demo-anon	User	api_get	api	/api/v1/stats/summary	{"path": "/api/v1/stats/summary", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 6}	2026-06-04 02:48:01.139149+00	cert_lifecycle	8a451dd2d5b4c3abb68d8877452de0e8c8c72aa37ddfce163a8a2d0f3d9e041a	453d64de1dc2f62e6270b7a6d1fac01400eb7e27615089cbc74cc6c97c318490
audit-1780541282196192077-109	actor-demo-anon	User	api_get	api	/api/v1/agents	{"path": "/api/v1/agents", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 02:48:02.196195+00	cert_lifecycle	453d64de1dc2f62e6270b7a6d1fac01400eb7e27615089cbc74cc6c97c318490	5170e08a0422720d401e2c9455ae810e91457e1a0cda6ff140e159227dabaeaf
audit-1780541283372609474-110	actor-demo-anon	User	api_get	api	/api/v1/issuers	{"path": "/api/v1/issuers", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 02:48:03.372613+00	cert_lifecycle	5170e08a0422720d401e2c9455ae810e91457e1a0cda6ff140e159227dabaeaf	203061bdb6f73524b8947b3edd7cfe586b7ca3315c3aa0144b914456dd9da8f1
audit-1780541283378000118-112	actor-demo-anon	User	api_get	api	/api/v1/teams	{"path": "/api/v1/teams", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 02:48:03.378002+00	cert_lifecycle	9fb235deb35e7d2ed2b70d62a5fa1d22860db9e9b3c05a28696f3b6ca2a70e35	2623ef0334e497489e53b4b3f6f282b748c0afb20e85705c075ea5f84b1ef1d1
audit-1780541283378841143-113	actor-demo-anon	User	api_get	api	/api/v1/certificates	{"path": "/api/v1/certificates", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 02:48:03.378843+00	cert_lifecycle	2623ef0334e497489e53b4b3f6f282b748c0afb20e85705c075ea5f84b1ef1d1	57eab540544dee78693fbd239a24f5ce417a63d5f18cee63844469a8ab258d8c
audit-1780541286161446120-115	actor-demo-anon	User	api_get	api	/api/v1/network-scan-targets	{"path": "/api/v1/network-scan-targets", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 1}	2026-06-04 02:48:06.161448+00	cert_lifecycle	57eab540544dee78693fbd239a24f5ce417a63d5f18cee63844469a8ab258d8c	03b5d6f826c0deba587466a3240dd2cb01ca1358f0cc03a54cba419aad2c1cb0
audit-1780541292131096514-116	actor-demo-anon	User	api_get	api	/api/v1/certificates	{"path": "/api/v1/certificates", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 02:48:12.131107+00	cert_lifecycle	03b5d6f826c0deba587466a3240dd2cb01ca1358f0cc03a54cba419aad2c1cb0	80f86a29f8b11af6027293dec15123930a46ef356049673d06de267784473283
audit-1780541292135434907-117	actor-demo-anon	User	api_get	api	/api/v1/profiles	{"path": "/api/v1/profiles", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 02:48:12.135437+00	cert_lifecycle	80f86a29f8b11af6027293dec15123930a46ef356049673d06de267784473283	7a89c9cecc5924f728b5033d319e3ba9b65f77eed411ec72f354aae60917642c
audit-1780541295683895804-118	actor-demo-anon	User	api_get	api	/api/v1/issuers	{"path": "/api/v1/issuers", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 2}	2026-06-04 02:48:15.683898+00	cert_lifecycle	7a89c9cecc5924f728b5033d319e3ba9b65f77eed411ec72f354aae60917642c	85cb327965e75b63c26a7edbd4a60d82c8e33fa228b26829100e9d6835aa1f8d
audit-1780541299272651239-119	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 10}	2026-06-04 02:48:19.272654+00	cert_lifecycle	85cb327965e75b63c26a7edbd4a60d82c8e33fa228b26829100e9d6835aa1f8d	7731505e28f162b076e13d608adb2cd7d535eb6aa555dc2899dc2d8ab753d1f3
audit-1780541308729478064-120	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 02:48:28.72948+00	cert_lifecycle	7731505e28f162b076e13d608adb2cd7d535eb6aa555dc2899dc2d8ab753d1f3	8f89ea49e52ed8bfc13f8bf3d4ff3de5694578153ab9700bfc5ef4881ff157f4
audit-1780541327579279798-121	actor-demo-anon	User	api_get	api	/api/v1/auth/me	{"path": "/api/v1/auth/me", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 2}	2026-06-04 02:48:47.579282+00	cert_lifecycle	8f89ea49e52ed8bfc13f8bf3d4ff3de5694578153ab9700bfc5ef4881ff157f4	f2105d53ce66568a3e9d135695f925f8d838b969a87d2d3b63e6cfa17b90ae5e
audit-1780541359364593965-131	actor-demo-anon	User	api_get	api	/api/v1/stats/issuance-rate	{"path": "/api/v1/stats/issuance-rate", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 28}	2026-06-04 02:49:19.364597+00	cert_lifecycle	fb33bead90b6b607a8f5db915291baba3ffe464acbc98567bb11b5c70dd95b7f	b66590531e36b8f39d9269d68d478104751b2ade10c823905791a1781ac74a37
audit-1780541360157850770-133	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 3}	2026-06-04 02:49:20.157852+00	cert_lifecycle	b66590531e36b8f39d9269d68d478104751b2ade10c823905791a1781ac74a37	f7faec2eb2044903709a91937128934a041253b5c7f89df5ebed2ecca2acb453
audit-1780541364970189359-134	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 02:49:24.970192+00	cert_lifecycle	f7faec2eb2044903709a91937128934a041253b5c7f89df5ebed2ecca2acb453	69ca9516fc3465660b4f31fcaca1bf29b81f4a31d69431dfedef66b81f04088d
audit-1780541327585419813-122	actor-demo-anon	User	api_get	api	/api/v1/auth/roles	{"path": "/api/v1/auth/roles", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 02:48:47.585422+00	cert_lifecycle	f2105d53ce66568a3e9d135695f925f8d838b969a87d2d3b63e6cfa17b90ae5e	d177aae5995fff274de9a6a4278a873f2756d61d22c873a3f5646132d385e1d7
audit-1780541359358119806-128	actor-demo-anon	User	api_get	api	/api/v1/stats/certificates-by-status	{"path": "/api/v1/stats/certificates-by-status", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 37}	2026-06-04 02:49:19.358122+00	cert_lifecycle	d8d139f5e1587a578ec8665c363174914f99edc215f0c0e78f3bc72e899afff1	ad0fb7c641a50553f6acc378d1cc2686572604667595f41343650045327a4493
audit-1780541359365400394-132	actor-demo-anon	User	api_get	api	/api/v1/stats/job-trends	{"path": "/api/v1/stats/job-trends", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 14}	2026-06-04 02:49:19.365403+00	cert_lifecycle	ad0fb7c641a50553f6acc378d1cc2686572604667595f41343650045327a4493	fe9995623398ad57ef52025e7a8745bf68da9942a15420923854b529448e2592
audit-1780541359358128768-129	actor-demo-anon	User	api_get	api	/api/v1/stats/expiration-timeline	{"path": "/api/v1/stats/expiration-timeline", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 18}	2026-06-04 02:49:19.35813+00	cert_lifecycle	fe9995623398ad57ef52025e7a8745bf68da9942a15420923854b529448e2592	5d5c53e00cc0c5d02c1074c2e17a7aaebd7112171c90816ff966865d16d4299c
audit-1780541390201073655-135	system	System	job_offline_agent_reap	job	job-ren-150	{"agent_id": "ag-data-prod", "new_status": "Failed", "old_status": "Running", "timeout_reason": "agent_offline"}	2026-06-04 02:49:50.201078+00	cert_lifecycle	69ca9516fc3465660b4f31fcaca1bf29b81f4a31d69431dfedef66b81f04088d	86e4d40bd6b11619b93e5512614dd9146aa302f79e021e2ee92e5d8f2a8eafd5
audit-1780541390208019728-136	system	System	job_offline_agent_reap	job	job-approval-01	{"agent_id": "ag-web-prod", "new_status": "Failed", "old_status": "Running", "timeout_reason": "agent_offline"}	2026-06-04 02:49:50.208023+00	cert_lifecycle	86e4d40bd6b11619b93e5512614dd9146aa302f79e021e2ee92e5d8f2a8eafd5	571a619b77682ceaa902ac5470d627fbf505bd47c38d024002eb108a300cc332
audit-1780541390212374824-137	system	System	job_offline_agent_reap	job	job-approval-02	{"agent_id": "ag-web-prod", "new_status": "Failed", "old_status": "Running", "timeout_reason": "agent_offline"}	2026-06-04 02:49:50.212378+00	cert_lifecycle	571a619b77682ceaa902ac5470d627fbf505bd47c38d024002eb108a300cc332	0ccde031685aa003687fe57811a0936c50a0ef4a696902e8101f8df82d888777
audit-1780541392139842487-138	actor-demo-anon	User	api_get	api	/api/v1/issuers	{"path": "/api/v1/issuers", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 02:49:52.139845+00	cert_lifecycle	0ccde031685aa003687fe57811a0936c50a0ef4a696902e8101f8df82d888777	f7dfc3f34c81b70995171a892c12f90d20c9dd8c0d1db322f90216fdd949b8fd
audit-1780541392143184970-139	actor-demo-anon	User	api_get	api	/api/v1/stats/certificates-by-status	{"path": "/api/v1/stats/certificates-by-status", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 6}	2026-06-04 02:49:52.143188+00	cert_lifecycle	f7dfc3f34c81b70995171a892c12f90d20c9dd8c0d1db322f90216fdd949b8fd	a250f9c1ad02845e456ffd1f42626263a7fea881ed7999080119158e2e9127ea
audit-1780541392177943368-144	actor-demo-anon	User	api_get	api	/api/v1/stats/summary	{"path": "/api/v1/stats/summary", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 41}	2026-06-04 02:49:52.177946+00	cert_lifecycle	a250f9c1ad02845e456ffd1f42626263a7fea881ed7999080119158e2e9127ea	9b61067c608b3d3e08da21744c7d732a0ed3cd9e38cf8f216da2194f9112dec3
audit-1780541392181124556-145	actor-demo-anon	User	api_get	api	/api/v1/certificates	{"path": "/api/v1/certificates", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 40}	2026-06-04 02:49:52.181128+00	cert_lifecycle	9b61067c608b3d3e08da21744c7d732a0ed3cd9e38cf8f216da2194f9112dec3	564929428fcf88626c8a8c2e53dfb7caa91676841851c912d968a03b96e8d515
audit-1780541392173972642-143	actor-demo-anon	User	api_get	api	/api/v1/jobs	{"path": "/api/v1/jobs", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 33}	2026-06-04 02:49:52.173977+00	cert_lifecycle	564929428fcf88626c8a8c2e53dfb7caa91676841851c912d968a03b96e8d515	54d93a2e632fb9337456092ec4f2db6fe384df480b4fcba642e64564c61460c1
audit-1780541392145519013-140	actor-demo-anon	User	api_get	api	/api/v1/stats/job-trends	{"path": "/api/v1/stats/job-trends", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 02:49:52.145521+00	cert_lifecycle	54d93a2e632fb9337456092ec4f2db6fe384df480b4fcba642e64564c61460c1	7504171725315dce261c41efd407513e36191ccfc4659cf0d719ce53a58ef0c3
audit-1780541392152737410-141	actor-demo-anon	User	api_get	api	/api/v1/stats/expiration-timeline	{"path": "/api/v1/stats/expiration-timeline", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 12}	2026-06-04 02:49:52.15274+00	cert_lifecycle	7504171725315dce261c41efd407513e36191ccfc4659cf0d719ce53a58ef0c3	075c1c295898bcc0d89db7768ececeef2b3ba1a99b3dbff0d2ccb3f3806a92fa
audit-1780541392158454847-142	actor-demo-anon	User	api_get	api	/api/v1/stats/issuance-rate	{"path": "/api/v1/stats/issuance-rate", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 17}	2026-06-04 02:49:52.158457+00	cert_lifecycle	075c1c295898bcc0d89db7768ececeef2b3ba1a99b3dbff0d2ccb3f3806a92fa	7dbdb22668c38338e772be71d6e44fa755c3c197df92d2393d78bee0647472d3
audit-1780541396261492643-146	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 02:49:56.261495+00	cert_lifecycle	7dbdb22668c38338e772be71d6e44fa755c3c197df92d2393d78bee0647472d3	5ec5619a99cfa3677fc882e07e21c54275eb3bdc4dc2e72d2930857ab55aab1b
audit-1780541401926520162-147	actor-demo-anon	User	api_get	api	/api/v1/issuers	{"path": "/api/v1/issuers", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 02:50:01.926526+00	cert_lifecycle	5ec5619a99cfa3677fc882e07e21c54275eb3bdc4dc2e72d2930857ab55aab1b	795d4713b37bf2aa143a845828a1edd358184cd437dd06d9e779a7768b7e5142
audit-1780541401937449139-149	actor-demo-anon	User	api_get	api	/api/v1/profiles	{"path": "/api/v1/profiles", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 9}	2026-06-04 02:50:01.937451+00	cert_lifecycle	795d4713b37bf2aa143a845828a1edd358184cd437dd06d9e779a7768b7e5142	4a63eea6126e76a11af71678eb08a9835281cd0af932ceb04941a85d672763f9
audit-1780541401937271620-148	actor-demo-anon	User	api_get	api	/api/v1/owners	{"path": "/api/v1/owners", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 9}	2026-06-04 02:50:01.937275+00	cert_lifecycle	4a63eea6126e76a11af71678eb08a9835281cd0af932ceb04941a85d672763f9	bd0b1ecbaf3a735399312bad5b208da1688688b1ee77d69a7d7ffe75eab1f4c2
audit-1780541401945016730-150	actor-demo-anon	User	api_get	api	/api/v1/teams	{"path": "/api/v1/teams", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 7}	2026-06-04 02:50:01.945019+00	cert_lifecycle	bd0b1ecbaf3a735399312bad5b208da1688688b1ee77d69a7d7ffe75eab1f4c2	25d47438196e56fe5bca16f4de2b51948a5d2256cdf39610907d09946a3b86f9
audit-1780541401945321581-151	actor-demo-anon	User	api_get	api	/api/v1/certificates	{"path": "/api/v1/certificates", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 7}	2026-06-04 02:50:01.945323+00	cert_lifecycle	25d47438196e56fe5bca16f4de2b51948a5d2256cdf39610907d09946a3b86f9	644a3b45e04017f072380cbbec77d09ccaed20231ce3d18068b7afba34d1ca52
audit-1780541413375535594-152	actor-demo-anon	User	api_get	api	/api/v1/certificates/mc-old-api	{"path": "/api/v1/certificates/mc-old-api", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 02:50:13.375543+00	cert_lifecycle	644a3b45e04017f072380cbbec77d09ccaed20231ce3d18068b7afba34d1ca52	d27fd5a3c4ca852e9367712b45d8fe51d855cf5034077797e6c0db5eced63170
audit-1780541413382691649-153	actor-demo-anon	User	api_get	api	/api/v1/certificates/mc-old-api/versions	{"path": "/api/v1/certificates/mc-old-api/versions", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 6}	2026-06-04 02:50:13.382694+00	cert_lifecycle	d27fd5a3c4ca852e9367712b45d8fe51d855cf5034077797e6c0db5eced63170	830461542e621de7469e1c502f66cdbd86a3c2d98815a61004cf4cde7143f1e8
audit-1780541413401295175-154	actor-demo-anon	User	api_get	api	/api/v1/jobs	{"path": "/api/v1/jobs", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 02:50:13.401301+00	cert_lifecycle	830461542e621de7469e1c502f66cdbd86a3c2d98815a61004cf4cde7143f1e8	e41529ba20f1f373006e4f0662a5c05ecfe7163ca73c1727e32ca995cc47a1c3
audit-1780541416373506729-155	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 24}	2026-06-04 02:50:16.373514+00	cert_lifecycle	e41529ba20f1f373006e4f0662a5c05ecfe7163ca73c1727e32ca995cc47a1c3	4e78a881ada74672325d4e6efafafb5468f62b8ea32a4f92c55517278e5fef1b
audit-1780541423346014193-156	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 02:50:23.346017+00	cert_lifecycle	4e78a881ada74672325d4e6efafafb5468f62b8ea32a4f92c55517278e5fef1b	2f1594f4e90408c4da5b5307740525539d938e35b5b3992c7bd870df686b2ba6
audit-1780541425883513314-157	actor-demo-anon	User	api_post	api	/api/v1/certificates/mc-old-api/renew	{"path": "/api/v1/certificates/mc-old-api/renew", "method": "POST", "status": 400, "body_hash": "", "latency_ms": 4}	2026-06-04 02:50:25.883521+00	cert_lifecycle	2f1594f4e90408c4da5b5307740525539d938e35b5b3992c7bd870df686b2ba6	aaad95ee2eb691be958a3b5a37d02c000385f79eab3f618be00bc120ed4351c3
audit-1780541441241574851-158	actor-demo-anon	User	api_get	api	/api/v1/certificates/mc-wildcard-prod	{"path": "/api/v1/certificates/mc-wildcard-prod", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 02:50:41.241578+00	cert_lifecycle	aaad95ee2eb691be958a3b5a37d02c000385f79eab3f618be00bc120ed4351c3	0653846b8a9855f4f4d866195c097002f4ecef6c16bfb9c39acbf8811f0bbf39
audit-1780541490377434304-174	actor-demo-anon	User	api_get	api	/api/v1/audit	{"path": "/api/v1/audit", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 12}	2026-06-04 02:51:30.377437+00	cert_lifecycle	c8ed10c168d3a76d166165b84d360042222caa4719afa8520bcf7088558aa594	9daecd9842c2261c053b34a0d941b6d6e29866e9f54b10211b8b2d583d80420f
audit-1780541500387073475-175	actor-demo-anon	User	api_get	api	/api/v1/jobs/job-1780541450025945339-161	{"path": "/api/v1/jobs/job-1780541450025945339-161", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 8}	2026-06-04 02:51:40.387077+00	cert_lifecycle	9daecd9842c2261c053b34a0d941b6d6e29866e9f54b10211b8b2d583d80420f	eb8c7abde8e7e028fc27aa81a05bffeaa473a8de891a90631cc773eb36f6e1c1
audit-1780541512572324379-176	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 7}	2026-06-04 02:51:52.572327+00	cert_lifecycle	eb8c7abde8e7e028fc27aa81a05bffeaa473a8de891a90631cc773eb36f6e1c1	e94ebf9b1e0374e361fd1d67871fa3b21f592529ed34c9b54889ecb98f02eacc
audit-1780541536215848882-177	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 6}	2026-06-04 02:52:16.215854+00	cert_lifecycle	e94ebf9b1e0374e361fd1d67871fa3b21f592529ed34c9b54889ecb98f02eacc	ce19b222a32d402aa8d18d992e71a5d2644dfa4c9fea6c997150e65c1b47b44f
audit-1780541540003408815-178	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 16}	2026-06-04 02:52:20.003419+00	cert_lifecycle	ce19b222a32d402aa8d18d992e71a5d2644dfa4c9fea6c997150e65c1b47b44f	c58fe54f6582af7e863eea9a46134ae06f03773611872b7191f7743d2e478484
audit-1780541566306678486-180	actor-demo-anon	User	api_post	api	/api/v1/issuers	{"path": "/api/v1/issuers", "method": "POST", "status": 201, "body_hash": "c7c8c2ce37c4cbddfade6e09e3995fa8ccd818f3edd070d004b11e3bcad5651c", "latency_ms": 427}	2026-06-04 02:52:46.306681+00	cert_lifecycle	c58fe54f6582af7e863eea9a46134ae06f03773611872b7191f7743d2e478484	46c325b1ccf89bd9f3db1ef039538be4d4fe9f5c71c7fc07c921cbeaf8fe2fe7
audit-1780541566326443787-181	actor-demo-anon	User	api_get	api	/api/v1/issuers	{"path": "/api/v1/issuers", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 02:52:46.326447+00	cert_lifecycle	46c325b1ccf89bd9f3db1ef039538be4d4fe9f5c71c7fc07c921cbeaf8fe2fe7	4d0c48bba3afa3e9f26b33db617bae409c001c7f61dd60f7688fd372dcebc125
audit-1780541572261607373-182	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 02:52:52.26161+00	cert_lifecycle	4d0c48bba3afa3e9f26b33db617bae409c001c7f61dd60f7688fd372dcebc125	b3ecc2858e8491546c0c8e5dcb815287e53a4c287d1d0bf028649376d1aabeb2
audit-1780541581834392683-183	system	System	issuer_test_connection_failed	issuer	issuer-1780541565882073177-179	{"result": "failed", "issuer_type": "GenericCA"}	2026-06-04 02:53:01.834396+00	cert_lifecycle	b3ecc2858e8491546c0c8e5dcb815287e53a4c287d1d0bf028649376d1aabeb2	9ae4d6d3a6d1b8d3619718a4cd55ff929b579d8df070f9c47870d2181a97e23c
audit-1780541581837064412-184	actor-demo-anon	User	api_post	api	/api/v1/issuers/issuer-1780541565882073177-179/test	{"path": "/api/v1/issuers/issuer-1780541565882073177-179/test", "method": "POST", "status": 500, "body_hash": "", "latency_ms": 232}	2026-06-04 02:53:01.837068+00	cert_lifecycle	9ae4d6d3a6d1b8d3619718a4cd55ff929b579d8df070f9c47870d2181a97e23c	463d8c2f3890556d6b6361ca6579cb94c79588cafa95566fa3b9c618b020d3c7
audit-1780541593528924568-185	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 16}	2026-06-04 02:53:13.528928+00	cert_lifecycle	463d8c2f3890556d6b6361ca6579cb94c79588cafa95566fa3b9c618b020d3c7	d57f0970441787a4ddf1509e239cecc5789d8ebaead849333dc21ce3dcfcf1c3
audit-1780541599487589104-186	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 10}	2026-06-04 02:53:19.487591+00	cert_lifecycle	d57f0970441787a4ddf1509e239cecc5789d8ebaead849333dc21ce3dcfcf1c3	be024824e524ebe15cefa094962b9b53ff1033fab1b45f574245192714f363b7
audit-1780541626862626679-187	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 02:53:46.862629+00	cert_lifecycle	be024824e524ebe15cefa094962b9b53ff1033fab1b45f574245192714f363b7	a80dc3124b8ec95c3352ec282068ad2968b385e20a1a97c2d55edac8379c446f
audit-1780541655422118909-188	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 6}	2026-06-04 02:54:15.422121+00	cert_lifecycle	a80dc3124b8ec95c3352ec282068ad2968b385e20a1a97c2d55edac8379c446f	1a3d07e84692cb2f71493f4ac129eec5cb82e1927ad641e52e85af533348fc45
audit-1780541441246467035-159	actor-demo-anon	User	api_get	api	/api/v1/certificates/mc-wildcard-prod/versions	{"path": "/api/v1/certificates/mc-wildcard-prod/versions", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 6}	2026-06-04 02:50:41.24647+00	cert_lifecycle	0653846b8a9855f4f4d866195c097002f4ecef6c16bfb9c39acbf8811f0bbf39	8f7388449321364f0f2c778a4d62f6e522a4fa4b75fd15a49098147be4ca4661
audit-1780541441264986089-160	actor-demo-anon	User	api_get	api	/api/v1/jobs	{"path": "/api/v1/jobs", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 8}	2026-06-04 02:50:41.264989+00	cert_lifecycle	8f7388449321364f0f2c778a4d62f6e522a4fa4b75fd15a49098147be4ca4661	4a7ad84308266b75e6b77075436f5d04afa620e64d1f0c8bda96fb9b14b73811
audit-1780541450032064643-162	actor-demo-anon	User	renewal_triggered	certificate	mc-wildcard-prod	{"common_name": "*.example.com"}	2026-06-04 02:50:50.032072+00	cert_lifecycle	4a7ad84308266b75e6b77075436f5d04afa620e64d1f0c8bda96fb9b14b73811	fb29cef734454149ae46ef4090b7b20679d15f379c3659549c91a1d938e6f45c
audit-1780541450035293796-163	actor-demo-anon	User	api_post	api	/api/v1/certificates/mc-wildcard-prod/renew	{"path": "/api/v1/certificates/mc-wildcard-prod/renew", "method": "POST", "status": 202, "body_hash": "", "latency_ms": 21}	2026-06-04 02:50:50.035297+00	cert_lifecycle	fb29cef734454149ae46ef4090b7b20679d15f379c3659549c91a1d938e6f45c	9302cb9c762a87beabca08009f9b9178a7c4d54f0c2957c98275a16200513d0d
audit-1780541450085225750-164	actor-demo-anon	User	api_get	api	/api/v1/certificates/mc-wildcard-prod	{"path": "/api/v1/certificates/mc-wildcard-prod", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 02:50:50.085228+00	cert_lifecycle	9302cb9c762a87beabca08009f9b9178a7c4d54f0c2957c98275a16200513d0d	9ab53b7ff0e72535da66e6171be1800d4b7c4c7ccd54dd8fff58c52cdcbc913f
audit-1780541450862451527-165	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 9}	2026-06-04 02:50:50.862454+00	cert_lifecycle	9ab53b7ff0e72535da66e6171be1800d4b7c4c7ccd54dd8fff58c52cdcbc913f	aa1378e2d411d5829b37afc6af204174e08ca6086dc8efaa57248c1f742e07b6
audit-1780541453429036767-167	system	System	renewal_job_failed	certificate	mc-wildcard-prod	{"error": "ACME client init: failed to register ACME account: 400 urn:ietf:params:acme:error:invalidContact: Error validating contact(s) :: contact email has forbidden domain \\"example.com\\" (get existing: acme: account does not exist)", "job_id": "job-1780541450025945339-161"}	2026-06-04 02:50:53.429043+00	cert_lifecycle	aa1378e2d411d5829b37afc6af204174e08ca6086dc8efaa57248c1f742e07b6	15477e6d354962e6c1efad7689215fb743c1672d19406a0978581ae0f808f61f
audit-1780541469621103835-168	actor-demo-anon	User	api_get	api	/api/v1/jobs	{"path": "/api/v1/jobs", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 02:51:09.62113+00	cert_lifecycle	15477e6d354962e6c1efad7689215fb743c1672d19406a0978581ae0f808f61f	0ce684dc9a4302d5cd87ccebceb808a44c48f63b9b6b1c7dd85ab976936b41cb
audit-1780541472738902860-169	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 8}	2026-06-04 02:51:12.738906+00	cert_lifecycle	0ce684dc9a4302d5cd87ccebceb808a44c48f63b9b6b1c7dd85ab976936b41cb	4cd1161ac77e927bfcccb46785201a4e0dbc9df0ff2e773faeab2bed70fb2ea0
audit-1780541479644993974-170	actor-demo-anon	User	api_get	api	/api/v1/jobs	{"path": "/api/v1/jobs", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 7}	2026-06-04 02:51:19.644997+00	cert_lifecycle	4cd1161ac77e927bfcccb46785201a4e0dbc9df0ff2e773faeab2bed70fb2ea0	d9b3ca1c68005615db7f1909d6450d6d15fbb024c8ae7ca820a2d70e5c51c942
audit-1780541480042196583-171	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 7}	2026-06-04 02:51:20.042201+00	cert_lifecycle	d9b3ca1c68005615db7f1909d6450d6d15fbb024c8ae7ca820a2d70e5c51c942	1a9efa498558ba980dc5f08b2223f65ea19cfd02d8dd2c6dff21102bbfc2c4cb
audit-1780541489670244675-172	actor-demo-anon	User	api_get	api	/api/v1/jobs	{"path": "/api/v1/jobs", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 02:51:29.670253+00	cert_lifecycle	1a9efa498558ba980dc5f08b2223f65ea19cfd02d8dd2c6dff21102bbfc2c4cb	71aff7b449639611f589b3ed3f3d30e5f610ab4ec22e81a8199556ec3283a5a2
audit-1780541490364600434-173	actor-demo-anon	User	api_get	api	/api/v1/jobs/job-1780541450025945339-161	{"path": "/api/v1/jobs/job-1780541450025945339-161", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 8}	2026-06-04 02:51:30.364604+00	cert_lifecycle	71aff7b449639611f589b3ed3f3d30e5f610ab4ec22e81a8199556ec3283a5a2	c8ed10c168d3a76d166165b84d360042222caa4719afa8520bcf7088558aa594
audit-1780541658129256164-189	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 7}	2026-06-04 02:54:18.129259+00	cert_lifecycle	1a3d07e84692cb2f71493f4ac129eec5cb82e1927ad641e52e85af533348fc45	9220d695002b91e53bcb93ebd552a501d7fb2d79ba771b7ebc36b11a24985b61
audit-1780541683625287303-190	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 02:54:43.62529+00	cert_lifecycle	9220d695002b91e53bcb93ebd552a501d7fb2d79ba771b7ebc36b11a24985b61	82e18524aa66c0046ef8b8c3aed1d2f3b5ab839e599cf2245d96317ff1fb8889
audit-1780541697109415894-191	system	System	job_retry	job	job-1780541450025945339-161	{"attempts": 0, "new_status": "Pending", "old_status": "Failed", "max_attempts": 3}	2026-06-04 02:54:57.10942+00	cert_lifecycle	82e18524aa66c0046ef8b8c3aed1d2f3b5ab839e599cf2245d96317ff1fb8889	e6e126bf35f6e7d0daeccf7b4212d2bcd1318682803f8caff431bbf6f9fa2eb3
audit-1780541697113831336-192	system	System	job_retry	job	job-approval-02	{"attempts": 0, "new_status": "Pending", "old_status": "Failed", "max_attempts": 3}	2026-06-04 02:54:57.113836+00	cert_lifecycle	e6e126bf35f6e7d0daeccf7b4212d2bcd1318682803f8caff431bbf6f9fa2eb3	761349f7912b7ef745d67be8bae5193ecd05555c4d0614416130279f82b62378
audit-1780541697118916433-193	system	System	job_retry	job	job-approval-01	{"attempts": 0, "new_status": "Pending", "old_status": "Failed", "max_attempts": 3}	2026-06-04 02:54:57.118919+00	cert_lifecycle	761349f7912b7ef745d67be8bae5193ecd05555c4d0614416130279f82b62378	497c15626a1e45d460f92af1a9692722917d8f5d0386161356ec0838da520709
audit-1780541697125280654-194	system	System	job_retry	job	job-ren-150	{"attempts": 1, "new_status": "Pending", "old_status": "Failed", "max_attempts": 3}	2026-06-04 02:54:57.125284+00	cert_lifecycle	497c15626a1e45d460f92af1a9692722917d8f5d0386161356ec0838da520709	38f6650a3d84d6b051bfb63c319cf601dbc887d18447bd3926b4f34d2699f922
audit-1780541703964243294-195	actor-demo-anon	User	api_put	api	/api/v1/issuers/issuer-1780541565882073177-179	{"path": "/api/v1/issuers/issuer-1780541565882073177-179", "method": "PUT", "status": 200, "body_hash": "62df5c2d348f37db0deca618d60626f94a379cb3ac27f5b6ae4fd234b65c4478", "latency_ms": 508}	2026-06-04 02:55:03.964246+00	cert_lifecycle	38f6650a3d84d6b051bfb63c319cf601dbc887d18447bd3926b4f34d2699f922	005f0bc908fc5b4778dacd508afffc49d840b2393f57879a06970827edf2124f
audit-1780541703976457621-196	actor-demo-anon	User	api_get	api	/api/v1/issuers	{"path": "/api/v1/issuers", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 02:55:03.97646+00	cert_lifecycle	005f0bc908fc5b4778dacd508afffc49d840b2393f57879a06970827edf2124f	7ae3c6fc87f448b1026f04e90b52b343043d4a45ee87156ddd5480189eb1b71d
audit-1780541712597316305-197	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 7}	2026-06-04 02:55:12.597319+00	cert_lifecycle	7ae3c6fc87f448b1026f04e90b52b343043d4a45ee87156ddd5480189eb1b71d	d1aee64ae6b1b075881e1c5c28a091fc6f108c24d2feba71a84a09b711e79629
audit-1780541717230515255-198	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 5}	2026-06-04 02:55:17.230518+00	cert_lifecycle	d1aee64ae6b1b075881e1c5c28a091fc6f108c24d2feba71a84a09b711e79629	8929c74de13edc651afe7c7232b6af7d5de742909ec6d81aa73fb67e16d1793f
audit-1780541724227326637-200	system	System	renewal_job_failed	certificate	mc-wildcard-prod	{"error": "ACME client init: failed to register ACME account: 400 urn:ietf:params:acme:error:invalidContact: Error validating contact(s) :: contact email has forbidden domain \\"example.com\\" (get existing: acme: account does not exist)", "job_id": "job-1780541450025945339-161"}	2026-06-04 02:55:24.22733+00	cert_lifecycle	8929c74de13edc651afe7c7232b6af7d5de742909ec6d81aa73fb67e16d1793f	3a404d330fe47b4059cf00ff3d9e52bf80605fd1de361b6df410540a8102f231
audit-1780541745464510495-201	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 7}	2026-06-04 02:55:45.464514+00	cert_lifecycle	3a404d330fe47b4059cf00ff3d9e52bf80605fd1de361b6df410540a8102f231	4ebae7a0fe95ac13a56f744b9ca88cc2956b991adac22c88e92e9f643c0feb7e
audit-1780541772878854662-202	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 02:56:12.878856+00	cert_lifecycle	4ebae7a0fe95ac13a56f744b9ca88cc2956b991adac22c88e92e9f643c0feb7e	270e6b40185100569be2119d3bae47a8bd98ade1c163a391bf6e214afb635a5a
audit-1780541777985269664-203	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 38}	2026-06-04 02:56:17.985272+00	cert_lifecycle	270e6b40185100569be2119d3bae47a8bd98ade1c163a391bf6e214afb635a5a	0303ef0bd537dc00cec6a10ccd6af20cf3109a22e858cb237dbf3988e8e9ac7f
audit-1780541801896553663-204	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 02:56:41.896555+00	cert_lifecycle	0303ef0bd537dc00cec6a10ccd6af20cf3109a22e858cb237dbf3988e8e9ac7f	45b8fdaddadf48dc716de522ab711c547752590039ed3c157d103a8c0a81c21c
audit-1780541833965126160-205	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 02:57:13.965128+00	cert_lifecycle	45b8fdaddadf48dc716de522ab711c547752590039ed3c157d103a8c0a81c21c	d0ccf25389ac8683d7955178df983bea520d7bb01c1d3f0106b3cf4573647a3e
audit-1780541843955932572-206	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 14}	2026-06-04 02:57:23.955934+00	cert_lifecycle	d0ccf25389ac8683d7955178df983bea520d7bb01c1d3f0106b3cf4573647a3e	73b91f2d17f7f1ef034af685beab42b7d352feb067693bcfdaa80495d48e62d9
audit-1780541862475034934-207	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 02:57:42.475036+00	cert_lifecycle	73b91f2d17f7f1ef034af685beab42b7d352feb067693bcfdaa80495d48e62d9	2b118cf0ed0468ba62d415c8d27b3facd1a847857e2f4623b184fb89168e651c
audit-1780541889986929913-208	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 6}	2026-06-04 02:58:09.986931+00	cert_lifecycle	2b118cf0ed0468ba62d415c8d27b3facd1a847857e2f4623b184fb89168e651c	527b8abad97656bd0974a2adfb7c7ec4034c5dedc605d8867f8f459d3d982704
audit-1780541902459089367-209	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 3}	2026-06-04 02:58:22.459092+00	cert_lifecycle	527b8abad97656bd0974a2adfb7c7ec4034c5dedc605d8867f8f459d3d982704	61428a326b15cdf7d537ee82c70e5768ddcdf65edefa2d83ceae7d156cd42ce1
audit-1780541921794968125-210	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 02:58:41.79497+00	cert_lifecycle	61428a326b15cdf7d537ee82c70e5768ddcdf65edefa2d83ceae7d156cd42ce1	7fa63e324bc5da633afccf93f93aa711f2409ef8b81ce6c80630c9aa2c34f913
audit-1780541948999998447-211	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 7}	2026-06-04 02:59:09+00	cert_lifecycle	7fa63e324bc5da633afccf93f93aa711f2409ef8b81ce6c80630c9aa2c34f913	b387c06cbbaae26e1a3034cafa766e7f2c2367f88de28c1cfd0fc29d51de5af5
audit-1780541957894783843-212	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 14}	2026-06-04 02:59:17.894785+00	cert_lifecycle	b387c06cbbaae26e1a3034cafa766e7f2c2367f88de28c1cfd0fc29d51de5af5	ebaadc63dffe762614e27863d2a2b115381acd3dc3d0ab8523929f68f1ac79d7
audit-1780541963727941938-213	system	System	job_offline_agent_reap	job	job-ren-150	{"agent_id": "ag-data-prod", "new_status": "Failed", "old_status": "Running", "timeout_reason": "agent_offline"}	2026-06-04 02:59:23.727946+00	cert_lifecycle	ebaadc63dffe762614e27863d2a2b115381acd3dc3d0ab8523929f68f1ac79d7	7819ec4b734fa168a39571422190532b7cece5dc4f40a616cdd525ab5b62b7a7
audit-1780541963732521708-214	system	System	job_offline_agent_reap	job	job-approval-01	{"agent_id": "ag-web-prod", "new_status": "Failed", "old_status": "Running", "timeout_reason": "agent_offline"}	2026-06-04 02:59:23.732524+00	cert_lifecycle	7819ec4b734fa168a39571422190532b7cece5dc4f40a616cdd525ab5b62b7a7	19aa9e4c6e3a76d9aa1f7948937d6643b58cce08d871b0fce0eca16d4d64374d
audit-1780541963736155937-215	system	System	job_offline_agent_reap	job	job-approval-02	{"agent_id": "ag-web-prod", "new_status": "Failed", "old_status": "Running", "timeout_reason": "agent_offline"}	2026-06-04 02:59:23.736158+00	cert_lifecycle	19aa9e4c6e3a76d9aa1f7948937d6643b58cce08d871b0fce0eca16d4d64374d	5e8b22290f995317ccbc507bf6d2d87e2475112c518cd4a477c4eab08bac80c7
audit-1780541977779198292-216	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 02:59:37.779201+00	cert_lifecycle	5e8b22290f995317ccbc507bf6d2d87e2475112c518cd4a477c4eab08bac80c7	a184aa56193df3d752a7b31d1c57c66817c31b538f1c9e4e6f731b3878c0967b
audit-1780541986254116281-217	system	System	job_retry	job	job-1780541450025945339-161	{"attempts": 0, "new_status": "Pending", "old_status": "Failed", "max_attempts": 3}	2026-06-04 02:59:46.254122+00	cert_lifecycle	a184aa56193df3d752a7b31d1c57c66817c31b538f1c9e4e6f731b3878c0967b	82878040d344832399ea71c5886db34ebff2f0a54dc8840ad9b82c30e4d27c8e
audit-1780541986259602701-218	system	System	job_retry	job	job-approval-02	{"attempts": 0, "new_status": "Pending", "old_status": "Failed", "max_attempts": 3}	2026-06-04 02:59:46.259605+00	cert_lifecycle	82878040d344832399ea71c5886db34ebff2f0a54dc8840ad9b82c30e4d27c8e	2c89c65eb64ca0a58f62304f5d06419dd40a10deb570467bb33f4dbbbc6f2ec7
audit-1780541986262966666-219	system	System	job_retry	job	job-approval-01	{"attempts": 0, "new_status": "Pending", "old_status": "Failed", "max_attempts": 3}	2026-06-04 02:59:46.262968+00	cert_lifecycle	2c89c65eb64ca0a58f62304f5d06419dd40a10deb570467bb33f4dbbbc6f2ec7	5459854ed9c9610868ac9087b32b6d83758b5e965460a4c5b9d9e348541d037b
audit-1780541986266282913-220	system	System	job_retry	job	job-ren-150	{"attempts": 1, "new_status": "Pending", "old_status": "Failed", "max_attempts": 3}	2026-06-04 02:59:46.266284+00	cert_lifecycle	5459854ed9c9610868ac9087b32b6d83758b5e965460a4c5b9d9e348541d037b	24dcafa1287de043272ed797880041d496a15a3da9ba70d0e5e38d345846925d
audit-1780542003037667437-222	system	System	renewal_job_failed	certificate	mc-wildcard-prod	{"error": "failed to create ACME order: 400 urn:ietf:params:acme:error:malformed: Unable to validate JWS :: No Key ID in JWS header", "job_id": "job-1780541450025945339-161"}	2026-06-04 03:00:03.03767+00	cert_lifecycle	24dcafa1287de043272ed797880041d496a15a3da9ba70d0e5e38d345846925d	e2b5ffa7aa03c4d9b2f27a23cea92287966b28693deadf1c1ecccf010007e16f
audit-1780542007184138152-223	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:00:07.18414+00	cert_lifecycle	e2b5ffa7aa03c4d9b2f27a23cea92287966b28693deadf1c1ecccf010007e16f	7744f02e9c96e4cd422dbf426d2a091a1adce05d9339a39b72bfda9e021921a0
audit-1780542015896172544-224	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 14}	2026-06-04 03:00:15.896175+00	cert_lifecycle	7744f02e9c96e4cd422dbf426d2a091a1adce05d9339a39b72bfda9e021921a0	b215fe72959b038189577e7d329da656cd96de16e025ce30358275c46d778550
audit-1780542034498438724-225	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:00:34.498441+00	cert_lifecycle	b215fe72959b038189577e7d329da656cd96de16e025ce30358275c46d778550	b198973b1da601fc6a8fcf13d7667eb33f2cb3348a66f1b6a922dd8bbe76605b
audit-1780542066927366489-226	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 03:01:06.927368+00	cert_lifecycle	b198973b1da601fc6a8fcf13d7667eb33f2cb3348a66f1b6a922dd8bbe76605b	64db2206761e6760b833cfebc040325210526a2b0e063a329c103acf7dbd014d
audit-1780542076681740919-227	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 18}	2026-06-04 03:01:16.681743+00	cert_lifecycle	64db2206761e6760b833cfebc040325210526a2b0e063a329c103acf7dbd014d	38d154e8d090c6f4faf0452fd97a8618ffb1132d790f40f259db84f8d4ead77c
audit-1780542099325247186-228	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 6}	2026-06-04 03:01:39.325248+00	cert_lifecycle	38d154e8d090c6f4faf0452fd97a8618ffb1132d790f40f259db84f8d4ead77c	80be98852ba62b0be9cd98470805067a1f55d67ba3465c90dd83ecd4a210753e
audit-1780542132055841904-229	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:02:12.055844+00	cert_lifecycle	80be98852ba62b0be9cd98470805067a1f55d67ba3465c90dd83ecd4a210753e	b96de841c794726ade58d77575a6aa084cc29e1bb7786f6c95db6fe7c3d97371
audit-1780542137063380017-230	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 3}	2026-06-04 03:02:17.063382+00	cert_lifecycle	b96de841c794726ade58d77575a6aa084cc29e1bb7786f6c95db6fe7c3d97371	934a3de66c8603fd3e25bf72ed1dcab0941e8ca31261d0b84337238415d397e1
audit-1780542159280079804-231	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 03:02:39.280082+00	cert_lifecycle	934a3de66c8603fd3e25bf72ed1dcab0941e8ca31261d0b84337238415d397e1	1be0de0e00f70fdd2fd69b16d4e7a6738fd10c4f2edcacabcde7c37c4cee084a
audit-1780542189774277107-232	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 8}	2026-06-04 03:03:09.774279+00	cert_lifecycle	1be0de0e00f70fdd2fd69b16d4e7a6738fd10c4f2edcacabcde7c37c4cee084a	8d46ba993c734e92d41cc290dc99f2f628566425ec6fe91366399c3fa1f2797f
audit-1780542196426623091-233	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 15}	2026-06-04 03:03:16.426625+00	cert_lifecycle	8d46ba993c734e92d41cc290dc99f2f628566425ec6fe91366399c3fa1f2797f	9d4c5d67ebf68f31516ce0982b0f3d88e476024fc88c6b4833f203e03d44195b
audit-1780542222534385790-234	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:03:42.534388+00	cert_lifecycle	9d4c5d67ebf68f31516ce0982b0f3d88e476024fc88c6b4833f203e03d44195b	9d84b963f3ede7ee516a816bafd63eafedc9a27b8d2ec9fc6a400e6a1fb77d46
audit-1780542250469976838-235	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 03:04:10.469978+00	cert_lifecycle	9d84b963f3ede7ee516a816bafd63eafedc9a27b8d2ec9fc6a400e6a1fb77d46	1f17d321ea5949407d95ad278517e82a1695f1a881e2729ce1bfe1629ae909ae
audit-1780542258791138588-236	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 14}	2026-06-04 03:04:18.79114+00	cert_lifecycle	1f17d321ea5949407d95ad278517e82a1695f1a881e2729ce1bfe1629ae909ae	125565630762bc7594a2e0a2172c3c8cceb4ef85d2bb4f0de0c37aa01227baf5
audit-1780542278016397704-237	system	System	job_retry	job	job-1780541450025945339-161	{"attempts": 0, "new_status": "Pending", "old_status": "Failed", "max_attempts": 3}	2026-06-04 03:04:38.016401+00	cert_lifecycle	125565630762bc7594a2e0a2172c3c8cceb4ef85d2bb4f0de0c37aa01227baf5	60737a0110e261ec6d5cc751af1f6e54cc5850fed62a64008dd276501746fa91
audit-1780542280992458758-238	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:04:40.99246+00	cert_lifecycle	60737a0110e261ec6d5cc751af1f6e54cc5850fed62a64008dd276501746fa91	deefee7cccbce7a46bad6e1b3c8f9ea65abf60083b4da2ecb541ad7f7a5bba17
audit-1780542302015379403-240	system	System	renewal_job_failed	certificate	mc-wildcard-prod	{"error": "failed to create ACME order: 400 urn:ietf:params:acme:error:malformed: Unable to validate JWS :: No Key ID in JWS header", "job_id": "job-1780541450025945339-161"}	2026-06-04 03:05:02.015382+00	cert_lifecycle	deefee7cccbce7a46bad6e1b3c8f9ea65abf60083b4da2ecb541ad7f7a5bba17	8196a02cedff6db07b96dc4131e9de552cb1e017a61c9da249bd06d1e28ed4af
audit-1780542312883890595-241	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:05:12.883892+00	cert_lifecycle	8196a02cedff6db07b96dc4131e9de552cb1e017a61c9da249bd06d1e28ed4af	5ca3311456f56eb1e577ff1de2b9ae5da76be3b6fdece4939ebad475a58f6ee5
audit-1780542314958044509-242	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 4}	2026-06-04 03:05:14.958046+00	cert_lifecycle	5ca3311456f56eb1e577ff1de2b9ae5da76be3b6fdece4939ebad475a58f6ee5	b8978c3e0e4975cccb16e785a58437fb8bd1063154fcd8f037f43c154608d394
audit-1780542343549955758-243	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:05:43.549958+00	cert_lifecycle	b8978c3e0e4975cccb16e785a58437fb8bd1063154fcd8f037f43c154608d394	8e0fadaa32bc113463e7d24b137698d4974cbf1fd3bd23e5c37f5fbe2830e702
audit-1780542368195448813-246	actor-demo-anon	User	api_get	api	/api/v1/stats/summary	{"path": "/api/v1/stats/summary", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 6}	2026-06-04 03:06:08.195451+00	cert_lifecycle	82b1e85b1dd816e5f839e3dd4df0e651cd87355b0cecbd02ff0df20ce8353786	4e90a59a6c98525955c34174887e70a8db52f03c808a6e44962601bc309d6b59
audit-1780542369795690850-247	actor-demo-anon	User	api_get	api	/api/v1/jobs	{"path": "/api/v1/jobs", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 03:06:09.795693+00	cert_lifecycle	446aadb1572c934504ca40f4cea91edbc57cf31b06a13f2ba6fb7887d16690b4	ea802527fd90776fc5d16ec47e6f432f71b6cbb6d7768dd1b317f17a00362ed9
audit-1780542369799126503-249	actor-demo-anon	User	api_get	api	/api/v1/stats/summary	{"path": "/api/v1/stats/summary", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 9}	2026-06-04 03:06:09.799134+00	cert_lifecycle	d68e55de195326bf66cfa03bf1797c3e238fde71c46549d9eec774df734d18a7	5b1c37e4c32e8ef415a6cef4b4737ae374e75a7b279dde3dfe43009438cc0fe5
audit-1780542368193835649-244	actor-demo-anon	User	api_get	api	/api/v1/jobs	{"path": "/api/v1/jobs", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 03:06:08.193838+00	cert_lifecycle	8e0fadaa32bc113463e7d24b137698d4974cbf1fd3bd23e5c37f5fbe2830e702	82b1e85b1dd816e5f839e3dd4df0e651cd87355b0cecbd02ff0df20ce8353786
audit-1780542368194083133-245	actor-demo-anon	User	api_get	api	/api/v1/stats/certificates-by-status	{"path": "/api/v1/stats/certificates-by-status", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 03:06:08.194084+00	cert_lifecycle	4e90a59a6c98525955c34174887e70a8db52f03c808a6e44962601bc309d6b59	446aadb1572c934504ca40f4cea91edbc57cf31b06a13f2ba6fb7887d16690b4
audit-1780542369798829352-248	actor-demo-anon	User	api_get	api	/api/v1/stats/certificates-by-status	{"path": "/api/v1/stats/certificates-by-status", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 8}	2026-06-04 03:06:09.798832+00	cert_lifecycle	ea802527fd90776fc5d16ec47e6f432f71b6cbb6d7768dd1b317f17a00362ed9	d68e55de195326bf66cfa03bf1797c3e238fde71c46549d9eec774df734d18a7
audit-1780542370780665961-250	actor-demo-anon	User	api_get	api	/api/v1/stats/certificates-by-status	{"path": "/api/v1/stats/certificates-by-status", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 9}	2026-06-04 03:06:10.780668+00	cert_lifecycle	5b1c37e4c32e8ef415a6cef4b4737ae374e75a7b279dde3dfe43009438cc0fe5	18d8601c1ffdb426d85b9dc376d5f1b4a6b6b9b8025c5c3ce9d14d47b23e102c
audit-1780542370792908948-251	actor-demo-anon	User	api_get	api	/api/v1/stats/summary	{"path": "/api/v1/stats/summary", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 13}	2026-06-04 03:06:10.792912+00	cert_lifecycle	18d8601c1ffdb426d85b9dc376d5f1b4a6b6b9b8025c5c3ce9d14d47b23e102c	e07edade425ee8b6e3edc73fcd6cf6200e2137ef5c50d783d705094b56a7b762
audit-1780542375432649747-256	actor-demo-anon	User	api_get	api	/api/v1/jobs	{"path": "/api/v1/jobs", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 03:06:15.432725+00	cert_lifecycle	f69763165958acd56530c0341e530346131e1ddffac0c4233df64d1681ccec4f	d71b0d51a175dc7873d3d880b1282219fb48ca36df6984b483a978d19a03310e
audit-1780542375433495286-257	actor-demo-anon	User	api_get	api	/api/v1/stats/certificates-by-status	{"path": "/api/v1/stats/certificates-by-status", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 03:06:15.433497+00	cert_lifecycle	d71b0d51a175dc7873d3d880b1282219fb48ca36df6984b483a978d19a03310e	b16dab8945760be54a676455da9f31744417b2966f8c0af5f9035abe86e9b90d
audit-1780542386139731183-259	actor-demo-anon	User	api_get	api	/api/v1/stats/certificates-by-status	{"path": "/api/v1/stats/certificates-by-status", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 03:06:26.139733+00	cert_lifecycle	0d97325baf1e83b1775ee1862a050d7ad37f308e0b10ee98727a3d4009e58511	27dda109454ff72b00b3436d824f02e5fb2649d2f094be78f1dba4ed2c7643d5
audit-1780542391024717400-266	actor-demo-anon	User	api_get	api	/api/v1/metrics/prometheus	{"path": "/api/v1/metrics/prometheus", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 7}	2026-06-04 03:06:31.02472+00	cert_lifecycle	18117353f234ffc290c184fb7a0121ffd0ad1557b64d7e5db73ba8f49c5003f2	bb1a72128a4a3a4e3cf2b4fc4339f8e5a9309da6c1c5384a65e646f47e726108
audit-1780542399931125559-267	actor-demo-anon	User	api_get	api	/api/v1/auth/breakglass/credentials	{"path": "/api/v1/auth/breakglass/credentials", "method": "GET", "status": 404, "body_hash": "", "latency_ms": 1}	2026-06-04 03:06:39.931128+00	cert_lifecycle	bb1a72128a4a3a4e3cf2b4fc4339f8e5a9309da6c1c5384a65e646f47e726108	545654da62b1dd56ddf5a266fe4d72ab348fb3068445883632a05d31531cb2c0
audit-1780542400922985744-268	actor-demo-anon	User	api_get	api	/api/v1/approvals	{"path": "/api/v1/approvals", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:06:40.922987+00	cert_lifecycle	545654da62b1dd56ddf5a266fe4d72ab348fb3068445883632a05d31531cb2c0	a438345157816735bcbd7b25ef94a10787d10518719434bc88f5e3229a053cd7
audit-1780542402710891385-269	actor-demo-anon	User	api_get	api	/api/v1/auth/bootstrap	{"path": "/api/v1/auth/bootstrap", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 0}	2026-06-04 03:06:42.710894+00	cert_lifecycle	a438345157816735bcbd7b25ef94a10787d10518719434bc88f5e3229a053cd7	8956ca224966650359964006de5917d3fe0c4e65c8ec74a84981c3f2afd58072
audit-1780542419128904909-280	actor-demo-anon	User	api_get	api	/api/v1/owners	{"path": "/api/v1/owners", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 2}	2026-06-04 03:06:59.128907+00	cert_lifecycle	31e5a21f026aa419f373dc4951416e85524751eb0c04a5989846b3a7cf6c0a22	44e0e2a73e11168a235bd581c23095a09b8543327dad80d20cba909249a3a7b9
audit-1780542419128906402-281	actor-demo-anon	User	api_get	api	/api/v1/profiles	{"path": "/api/v1/profiles", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 2}	2026-06-04 03:06:59.128909+00	cert_lifecycle	44e0e2a73e11168a235bd581c23095a09b8543327dad80d20cba909249a3a7b9	98f7e964db09341fc61a52925a8a4ce7f1b13f3fb3e62f00aebf81ea8f9eacd7
audit-1780542419132827797-283	actor-demo-anon	User	api_get	api	/api/v1/certificates	{"path": "/api/v1/certificates", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 6}	2026-06-04 03:06:59.13283+00	cert_lifecycle	98f7e964db09341fc61a52925a8a4ce7f1b13f3fb3e62f00aebf81ea8f9eacd7	4be6ec1c890bea33f4f7314a5342892934f2be511dc7a5a0009295fb8d41958b
audit-1780542424377590269-285	actor-demo-anon	User	api_get	api	/api/v1/certificates/mc-dash-prod/versions	{"path": "/api/v1/certificates/mc-dash-prod/versions", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 03:07:04.377592+00	cert_lifecycle	51c590e4c46d766424e4e5040f18af26298a77423865945c3ed9ab5157a9ad4a	2cfaac13d2e544ea880b8c8d3d016eb9fb94c7d2038019bd7d9c61c2a83726fc
audit-1780542424388776272-286	actor-demo-anon	User	api_get	api	/api/v1/jobs	{"path": "/api/v1/jobs", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:07:04.388779+00	cert_lifecycle	2cfaac13d2e544ea880b8c8d3d016eb9fb94c7d2038019bd7d9c61c2a83726fc	f4ab8506cb656559be6c7627ffe7439daa440b9f3c3055d48afbf2e8043a8e1e
audit-1780542430766799543-287	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 15}	2026-06-04 03:07:10.766801+00	cert_lifecycle	f4ab8506cb656559be6c7627ffe7439daa440b9f3c3055d48afbf2e8043a8e1e	bcadda4d5f6d8acbc68ffd0de64276741ca461ca478d4ca2aed6d846efc0ee99
audit-1780542436918742150-288	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:07:16.918744+00	cert_lifecycle	bcadda4d5f6d8acbc68ffd0de64276741ca461ca478d4ca2aed6d846efc0ee99	0db5bdfd8fcbf66cea175a7f02376fcaff803a78021cdebe6ddb92365a2745c8
audit-1780542370793364345-252	actor-demo-anon	User	api_get	api	/api/v1/jobs	{"path": "/api/v1/jobs", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 21}	2026-06-04 03:06:10.793366+00	cert_lifecycle	e07edade425ee8b6e3edc73fcd6cf6200e2137ef5c50d783d705094b56a7b762	827bb847dc2342c4f12d6b51cb5759aab0f1a1043e749c3e470abf8688f268f5
audit-1780542372846117498-253	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 03:06:12.846122+00	cert_lifecycle	827bb847dc2342c4f12d6b51cb5759aab0f1a1043e749c3e470abf8688f268f5	8b0ec9bf7bf4f2dbb78d0ff0daf803d4513ca816205898ddc78db3d7552174d1
audit-1780542375156760012-254	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 15}	2026-06-04 03:06:15.156762+00	cert_lifecycle	8b0ec9bf7bf4f2dbb78d0ff0daf803d4513ca816205898ddc78db3d7552174d1	9cff5b345e0bea3ac55bc00b814f1896bf5ae8c198dbdf4b59e8b8fd9736791a
audit-1780542375427612883-255	actor-demo-anon	User	api_get	api	/api/v1/stats/summary	{"path": "/api/v1/stats/summary", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 03:06:15.427615+00	cert_lifecycle	9cff5b345e0bea3ac55bc00b814f1896bf5ae8c198dbdf4b59e8b8fd9736791a	f69763165958acd56530c0341e530346131e1ddffac0c4233df64d1681ccec4f
audit-1780542386138860102-258	actor-demo-anon	User	api_get	api	/api/v1/jobs	{"path": "/api/v1/jobs", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:06:26.138862+00	cert_lifecycle	b16dab8945760be54a676455da9f31744417b2966f8c0af5f9035abe86e9b90d	0d97325baf1e83b1775ee1862a050d7ad37f308e0b10ee98727a3d4009e58511
audit-1780542386141508391-260	actor-demo-anon	User	api_get	api	/api/v1/stats/summary	{"path": "/api/v1/stats/summary", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 6}	2026-06-04 03:06:26.141511+00	cert_lifecycle	27dda109454ff72b00b3436d824f02e5fb2649d2f094be78f1dba4ed2c7643d5	1b11a896105b57e14b3d3ec4e9d9b402e2daae88993fa4d1a3326c3416bcb53a
audit-1780542387675246426-261	actor-demo-anon	User	api_get	api	/api/v1/auth/me	{"path": "/api/v1/auth/me", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 2}	2026-06-04 03:06:27.675249+00	cert_lifecycle	1b11a896105b57e14b3d3ec4e9d9b402e2daae88993fa4d1a3326c3416bcb53a	fb22b64d1b9f90a4dbcc040c3a5d5820af389d5b7e1458eeee61168998412859
audit-1780542387687613006-262	actor-demo-anon	User	api_get	api	/api/v1/auth/sessions	{"path": "/api/v1/auth/sessions", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:06:27.687616+00	cert_lifecycle	fb22b64d1b9f90a4dbcc040c3a5d5820af389d5b7e1458eeee61168998412859	b64c5f39c623884388ccda9a78f2878eb78f7443a522885dd4729aea08db83c1
audit-1780542389494659397-263	actor-demo-anon	User	api_get	api	/api/v1/auth/sessions	{"path": "/api/v1/auth/sessions", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 2}	2026-06-04 03:06:29.494662+00	cert_lifecycle	b64c5f39c623884388ccda9a78f2878eb78f7443a522885dd4729aea08db83c1	0263410d451c2832be0eb27be6f1888d0c8c720e685afe372d60d0251fdd7a0d
audit-1780542390346085340-264	actor-demo-anon	User	api_get	api	/api/v1/auth/oidc/providers	{"path": "/api/v1/auth/oidc/providers", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 2}	2026-06-04 03:06:30.346088+00	cert_lifecycle	0263410d451c2832be0eb27be6f1888d0c8c720e685afe372d60d0251fdd7a0d	a6fa8e02124ee0ef5d1d8748bd9843a143edc13b912ab56a6a7d772e987b5576
audit-1780542391016040025-265	actor-demo-anon	User	api_get	api	/api/v1/metrics	{"path": "/api/v1/metrics", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 7}	2026-06-04 03:06:31.016043+00	cert_lifecycle	a6fa8e02124ee0ef5d1d8748bd9843a143edc13b912ab56a6a7d772e987b5576	18117353f234ffc290c184fb7a0121ffd0ad1557b64d7e5db73ba8f49c5003f2
audit-1780542402713486461-270	actor-demo-anon	Anonymous	auth.runtime_config_read	config		{"key_count": 12}	2026-06-04 03:06:42.713492+00	auth	8956ca224966650359964006de5917d3fe0c4e65c8ec74a84981c3f2afd58072	41c56199514ebb956f40c9e6ebf52ca5d5f226f6b3db01383eda46533939d552
audit-1780542402724262639-271	actor-demo-anon	User	api_get	api	/api/v1/auth/runtime-config	{"path": "/api/v1/auth/runtime-config", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 12}	2026-06-04 03:06:42.72427+00	cert_lifecycle	41c56199514ebb956f40c9e6ebf52ca5d5f226f6b3db01383eda46533939d552	2deb3aa0146404dda10801deaf90df4a2f07398e49cf7b8e1fec649eb0359558
audit-1780542403553427950-272	actor-demo-anon	User	api_get	api	/api/v1/auth/breakglass/credentials	{"path": "/api/v1/auth/breakglass/credentials", "method": "GET", "status": 404, "body_hash": "", "latency_ms": 1}	2026-06-04 03:06:43.55343+00	cert_lifecycle	2deb3aa0146404dda10801deaf90df4a2f07398e49cf7b8e1fec649eb0359558	b2083c9c0eaddd87c5d4cf84980a6139ab952ced7c17ae29815c1c66f1b89c79
audit-1780542405246240444-273	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 7}	2026-06-04 03:06:45.246242+00	cert_lifecycle	b2083c9c0eaddd87c5d4cf84980a6139ab952ced7c17ae29815c1c66f1b89c79	92f06cf70bc3118fd32ac7cf9f822a4dc5269303aa5ad738076134df7245f745
audit-1780542405793123368-274	actor-demo-anon	User	api_get	api	/api/v1/auth/breakglass/credentials	{"path": "/api/v1/auth/breakglass/credentials", "method": "GET", "status": 404, "body_hash": "", "latency_ms": 1}	2026-06-04 03:06:45.793126+00	cert_lifecycle	92f06cf70bc3118fd32ac7cf9f822a4dc5269303aa5ad738076134df7245f745	3132dac469c1d52819de6397c72e9b346ba50721da7ee376c8c65a9a3f16bd18
audit-1780542409641723422-275	actor-demo-anon	User	api_get	api	/api/v1/approvals	{"path": "/api/v1/approvals", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:06:49.641725+00	cert_lifecycle	3132dac469c1d52819de6397c72e9b346ba50721da7ee376c8c65a9a3f16bd18	9c9ca618262037f140c9c3ac72434689aecee0820a7d85bb2aac536bed378a4f
audit-1780542410839876387-276	actor-demo-anon	User	api_get	api	/api/v1/approvals	{"path": "/api/v1/approvals", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 2}	2026-06-04 03:06:50.839878+00	cert_lifecycle	9c9ca618262037f140c9c3ac72434689aecee0820a7d85bb2aac536bed378a4f	029a363fc64f1883ffc9a273f8756a8d91c460e8f6242e5b27d0fdb4c1e06861
audit-1780542412104099859-277	actor-demo-anon	User	api_get	api	/api/v1/approvals	{"path": "/api/v1/approvals", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 2}	2026-06-04 03:06:52.104101+00	cert_lifecycle	029a363fc64f1883ffc9a273f8756a8d91c460e8f6242e5b27d0fdb4c1e06861	70caa54f19be4b326b45770ee82ccaf5e23ca6314416527e395c7cae796e2ff8
audit-1780542413107671743-278	actor-demo-anon	User	api_get	api	/api/v1/teams	{"path": "/api/v1/teams", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 2}	2026-06-04 03:06:53.107674+00	cert_lifecycle	70caa54f19be4b326b45770ee82ccaf5e23ca6314416527e395c7cae796e2ff8	48c52e302086632875768dade45fb61148521dda67f3b0ca7b8d9070e123448b
audit-1780542419125565839-279	actor-demo-anon	User	api_get	api	/api/v1/issuers	{"path": "/api/v1/issuers", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 03:06:59.125569+00	cert_lifecycle	48c52e302086632875768dade45fb61148521dda67f3b0ca7b8d9070e123448b	31e5a21f026aa419f373dc4951416e85524751eb0c04a5989846b3a7cf6c0a22
audit-1780542419131854885-282	actor-demo-anon	User	api_get	api	/api/v1/teams	{"path": "/api/v1/teams", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 03:06:59.131857+00	cert_lifecycle	4be6ec1c890bea33f4f7314a5342892934f2be511dc7a5a0009295fb8d41958b	b0e357ce6906403ab43e16db201764bd729478f5d904be42a53845cb3db0e493
audit-1780542424373039239-284	actor-demo-anon	User	api_get	api	/api/v1/certificates/mc-dash-prod	{"path": "/api/v1/certificates/mc-dash-prod", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:07:04.373042+00	cert_lifecycle	b0e357ce6906403ab43e16db201764bd729478f5d904be42a53845cb3db0e493	51c590e4c46d766424e4e5040f18af26298a77423865945c3ed9ab5157a9ad4a
audit-1780542438684974370-289	actor-demo-anon	User	api_get	api	/api/v1/issuers	{"path": "/api/v1/issuers", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 2}	2026-06-04 03:07:18.684976+00	cert_lifecycle	0db5bdfd8fcbf66cea175a7f02376fcaff803a78021cdebe6ddb92365a2745c8	b592b94ced4820795a2a33143b8d2b5a8cb7e4c3a21bc5c9f5151f5f17164579
audit-1780542438686508212-291	actor-demo-anon	User	api_get	api	/api/v1/stats/expiration-timeline	{"path": "/api/v1/stats/expiration-timeline", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 03:07:18.68651+00	cert_lifecycle	ef7156e23c46fef3618363fc3f0013d388ce0a2cc46144a3effc34af56fe5b99	f1a9f539ea46f2f9751715eaf7d6d18c55322fc537e8b0246b667ea1b9d3552f
audit-1780542438688446004-292	actor-demo-anon	User	api_get	api	/api/v1/stats/job-trends	{"path": "/api/v1/stats/job-trends", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:07:18.688448+00	cert_lifecycle	f1a9f539ea46f2f9751715eaf7d6d18c55322fc537e8b0246b667ea1b9d3552f	6d401dc3a5fde15638e7150dd311b49c13ffb0771a828ca67648be3ef50cd273
audit-1780542438686070549-290	actor-demo-anon	User	api_get	api	/api/v1/stats/certificates-by-status	{"path": "/api/v1/stats/certificates-by-status", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 03:07:18.686072+00	cert_lifecycle	b592b94ced4820795a2a33143b8d2b5a8cb7e4c3a21bc5c9f5151f5f17164579	3246be162708fec0adbc41dacb19ee9e97b8b1d3d69fd5be95c13a4a5e64147a
audit-1780542438694200181-293	actor-demo-anon	User	api_get	api	/api/v1/stats/summary	{"path": "/api/v1/stats/summary", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 12}	2026-06-04 03:07:18.694203+00	cert_lifecycle	3246be162708fec0adbc41dacb19ee9e97b8b1d3d69fd5be95c13a4a5e64147a	ef7156e23c46fef3618363fc3f0013d388ce0a2cc46144a3effc34af56fe5b99
audit-1780542438701099922-296	actor-demo-anon	User	api_get	api	/api/v1/certificates	{"path": "/api/v1/certificates", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 15}	2026-06-04 03:07:18.701103+00	cert_lifecycle	6d401dc3a5fde15638e7150dd311b49c13ffb0771a828ca67648be3ef50cd273	7a972f732a3e61fe910d74ac6de925cda8275ad7da91243952a0354ab045dae1
audit-1780542438699161031-295	actor-demo-anon	User	api_get	api	/api/v1/stats/issuance-rate	{"path": "/api/v1/stats/issuance-rate", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 13}	2026-06-04 03:07:18.699162+00	cert_lifecycle	7a972f732a3e61fe910d74ac6de925cda8275ad7da91243952a0354ab045dae1	4ba0a676f926d956e21ab0d189e2c55e8c84e7df9e9e667fa2501aaae3650b7d
audit-1780542438698599574-294	actor-demo-anon	User	api_get	api	/api/v1/jobs	{"path": "/api/v1/jobs", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 12}	2026-06-04 03:07:18.698602+00	cert_lifecycle	4ba0a676f926d956e21ab0d189e2c55e8c84e7df9e9e667fa2501aaae3650b7d	5f76dbbd00b8e218c3d31253975fdde8ca0fa1e4442f23113942182efdaccd0c
audit-1780542446260487342-297	actor-demo-anon	User	api_get	api	/api/v1/jobs	{"path": "/api/v1/jobs", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:07:26.260526+00	cert_lifecycle	5f76dbbd00b8e218c3d31253975fdde8ca0fa1e4442f23113942182efdaccd0c	eb9c401641628ae21175ebcf88293c8de81658240471f4f0460d0b7136a74764
audit-1780542446262768361-298	actor-demo-anon	User	api_get	api	/api/v1/stats/certificates-by-status	{"path": "/api/v1/stats/certificates-by-status", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 03:07:26.262771+00	cert_lifecycle	eb9c401641628ae21175ebcf88293c8de81658240471f4f0460d0b7136a74764	e3b2326a2a1a7a19e721a618eec7db635a2c814130a03084f9d62dad947ed2d6
audit-1780542446266146488-299	actor-demo-anon	User	api_get	api	/api/v1/stats/summary	{"path": "/api/v1/stats/summary", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 9}	2026-06-04 03:07:26.266149+00	cert_lifecycle	e3b2326a2a1a7a19e721a618eec7db635a2c814130a03084f9d62dad947ed2d6	aaffa19e9ffa87ef3235779a80c29640868dd7e2a7e8d06fe6ffe9df7ccf8396
audit-1780542449489320084-300	actor-demo-anon	User	api_get	api	/api/v1/targets	{"path": "/api/v1/targets", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:07:29.489323+00	cert_lifecycle	aaffa19e9ffa87ef3235779a80c29640868dd7e2a7e8d06fe6ffe9df7ccf8396	b2b8d4ce7e8b4c9203dbf744970a50b277b241eee826e3180ecb469b51eb715d
audit-1780542455243874713-301	actor-demo-anon	User	api_get	api	/api/v1/jobs/job-approval-02	{"path": "/api/v1/jobs/job-approval-02", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:07:35.243877+00	cert_lifecycle	b2b8d4ce7e8b4c9203dbf744970a50b277b241eee826e3180ecb469b51eb715d	4f674a35702856cf61077a1e2ef8dfeb9f6f47994b51e6e2465ef85ad5150731
audit-1780542455245145416-302	actor-demo-anon	User	api_get	api	/api/v1/audit	{"path": "/api/v1/audit", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 03:07:35.245147+00	cert_lifecycle	4f674a35702856cf61077a1e2ef8dfeb9f6f47994b51e6e2465ef85ad5150731	043b192cc0bc7617545d073dd367d64bf872d9c3e0751b6bab5ca317a22baba9
audit-1780542464395374738-303	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 03:07:44.395376+00	cert_lifecycle	043b192cc0bc7617545d073dd367d64bf872d9c3e0751b6bab5ca317a22baba9	a29b4ac7d18ba6b1eb665005df09e4d1e751defac2125fae6214be812ce42ed3
audit-1780542466492219010-304	actor-demo-anon	User	api_get	api	/api/v1/jobs	{"path": "/api/v1/jobs", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:07:46.492221+00	cert_lifecycle	a29b4ac7d18ba6b1eb665005df09e4d1e751defac2125fae6214be812ce42ed3	2fb4678441619e2135809a1573c9cbfa33e20a402b72c2b5225278e5d735bf23
audit-1780542466493625460-305	actor-demo-anon	User	api_get	api	/api/v1/stats/certificates-by-status	{"path": "/api/v1/stats/certificates-by-status", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 03:07:46.493628+00	cert_lifecycle	2fb4678441619e2135809a1573c9cbfa33e20a402b72c2b5225278e5d735bf23	75597d655f42f456b225ae7e24bbdb5b44c638325f38c2838855f7204f391f3b
audit-1780542466495522824-306	actor-demo-anon	User	api_get	api	/api/v1/stats/summary	{"path": "/api/v1/stats/summary", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 6}	2026-06-04 03:07:46.495525+00	cert_lifecycle	75597d655f42f456b225ae7e24bbdb5b44c638325f38c2838855f7204f391f3b	70e47bd36f35498c214673646b52363eac1a899d2937ecf175aaa70f3e8285b2
audit-1780542485027188682-307	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 10}	2026-06-04 03:08:05.027192+00	cert_lifecycle	70e47bd36f35498c214673646b52363eac1a899d2937ecf175aaa70f3e8285b2	702ed177b7827f4d6b11f33fdb743083aadc8cc5446ca6e3039ab61df16e134d
audit-1780542496363074377-308	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:08:16.363076+00	cert_lifecycle	702ed177b7827f4d6b11f33fdb743083aadc8cc5446ca6e3039ab61df16e134d	ba445ac227fdeff6c03ff3f907a9e2682efeed35f9f33683f9afb4739fc43518
audit-1780542526236780759-309	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 7}	2026-06-04 03:08:46.236782+00	cert_lifecycle	ba445ac227fdeff6c03ff3f907a9e2682efeed35f9f33683f9afb4739fc43518	445702f24fa72c7ef37348e472cbfcce1125f7f8b60ae5192f1b7cc0e86673ec
audit-1780542550246998067-310	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 5}	2026-06-04 03:09:10.247001+00	cert_lifecycle	445702f24fa72c7ef37348e472cbfcce1125f7f8b60ae5192f1b7cc0e86673ec	3e1166b0242e1334241e3ee69d2b2b6f6bd96e987626a2a2895ed26f9c158b28
audit-1780542553092771855-311	system	System	job_retry	job	job-1780541450025945339-161	{"attempts": 0, "new_status": "Pending", "old_status": "Failed", "max_attempts": 3}	2026-06-04 03:09:13.092777+00	cert_lifecycle	3e1166b0242e1334241e3ee69d2b2b6f6bd96e987626a2a2895ed26f9c158b28	14f7162cb4a6ef023730c3e65533f34c9f53e34c196ea82a10021605d4acbdd4
audit-1780542555807094831-312	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:09:15.807097+00	cert_lifecycle	14f7162cb4a6ef023730c3e65533f34c9f53e34c196ea82a10021605d4acbdd4	3efea602619474e8ab10fba2c1c2d8d92bbb483c51d68d87844d241d2b6e8686
audit-1780542565394407158-314	system	System	renewal_job_failed	certificate	mc-wildcard-prod	{"error": "failed to create ACME order: 400 urn:ietf:params:acme:error:malformed: Unable to validate JWS :: No Key ID in JWS header", "job_id": "job-1780541450025945339-161"}	2026-06-04 03:09:25.39441+00	cert_lifecycle	3efea602619474e8ab10fba2c1c2d8d92bbb483c51d68d87844d241d2b6e8686	1b4181c2f102a5f223d2c2a6e4648e6cdfeee02cc278c8f96e254641711b4306
audit-1780542571616826026-315	system	System	job_offline_agent_reap	job	job-ren-150	{"agent_id": "ag-data-prod", "new_status": "Failed", "old_status": "Running", "timeout_reason": "agent_offline"}	2026-06-04 03:09:31.616829+00	cert_lifecycle	1b4181c2f102a5f223d2c2a6e4648e6cdfeee02cc278c8f96e254641711b4306	e2f3795e0c0560d00e6ded8ac09555c369ddf01013cc857b6fbd675c0cf49823
audit-1780542571620496634-316	system	System	job_offline_agent_reap	job	job-approval-01	{"agent_id": "ag-web-prod", "new_status": "Failed", "old_status": "Running", "timeout_reason": "agent_offline"}	2026-06-04 03:09:31.6205+00	cert_lifecycle	e2f3795e0c0560d00e6ded8ac09555c369ddf01013cc857b6fbd675c0cf49823	b23fe05070182f166d78014a606e22b18abbe6a45c5c64eb423a83ca43e35e64
audit-1780542571624133938-317	system	System	job_offline_agent_reap	job	job-approval-02	{"agent_id": "ag-web-prod", "new_status": "Failed", "old_status": "Running", "timeout_reason": "agent_offline"}	2026-06-04 03:09:31.624136+00	cert_lifecycle	b23fe05070182f166d78014a606e22b18abbe6a45c5c64eb423a83ca43e35e64	6276e80a29e20b7b1bc31af90fea366b7c23c6f1c18b9be1ef3e2966bc31ba1a
audit-1780542584357613254-318	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:09:44.357615+00	cert_lifecycle	6276e80a29e20b7b1bc31af90fea366b7c23c6f1c18b9be1ef3e2966bc31ba1a	3bb48702432a954b2ce8b7cb0938e8e77d1b9bfd2cb0ce4f078e34cd6c7ada0b
audit-1780542614196512242-319	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 4}	2026-06-04 03:10:14.196514+00	cert_lifecycle	3bb48702432a954b2ce8b7cb0938e8e77d1b9bfd2cb0ce4f078e34cd6c7ada0b	f6473007cc6b06e4547708b67c9c4dfbd5836f9ff3d224bba502bffdd50c6f98
audit-1780542614889861139-320	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 7}	2026-06-04 03:10:14.889863+00	cert_lifecycle	f6473007cc6b06e4547708b67c9c4dfbd5836f9ff3d224bba502bffdd50c6f98	fa2955f5a292bca551deb847333be15f12fbbb3ebb2d00980fb025c3373003d9
audit-1780542647184856476-321	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 03:10:47.184859+00	cert_lifecycle	fa2955f5a292bca551deb847333be15f12fbbb3ebb2d00980fb025c3373003d9	9a44eae6c54617eebf3f66030a80b15618da43c900b81fa5cd2dab5cd9f9d5de
audit-1780542677088904830-322	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 7}	2026-06-04 03:11:17.088907+00	cert_lifecycle	9a44eae6c54617eebf3f66030a80b15618da43c900b81fa5cd2dab5cd9f9d5de	4c0724a9dfd4cd94b28659b397d9599ed606abbdb0baa2b877719d63625ee4ea
audit-1780542677597432001-323	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 14}	2026-06-04 03:11:17.597434+00	cert_lifecycle	4c0724a9dfd4cd94b28659b397d9599ed606abbdb0baa2b877719d63625ee4ea	29b48aff9215d7e223099c548a7cbf212fb792ac3731e51b4ecbd3efbec7e9ed
audit-1780542704835600952-324	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:11:44.835603+00	cert_lifecycle	29b48aff9215d7e223099c548a7cbf212fb792ac3731e51b4ecbd3efbec7e9ed	f27c0b11783c79166afc279bd9cb9f065f2d8158af4f8f36bbfe8bc5dcc6f2b6
audit-1780542731939591259-325	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:12:11.939599+00	cert_lifecycle	f27c0b11783c79166afc279bd9cb9f065f2d8158af4f8f36bbfe8bc5dcc6f2b6	0bf111ca781b7e75b8c9700c4adb8731e360571cfc2b5f38e87f57bcf3754b9b
audit-1780542739681156272-326	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 4}	2026-06-04 03:12:19.681159+00	cert_lifecycle	0bf111ca781b7e75b8c9700c4adb8731e360571cfc2b5f38e87f57bcf3754b9b	76cee42a82bfc9faab561e86d8b6bc5eeeb10577235702c3e87a719a00354bcb
audit-1780542762090776150-327	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:12:42.090778+00	cert_lifecycle	76cee42a82bfc9faab561e86d8b6bc5eeeb10577235702c3e87a719a00354bcb	1f29637ae17c1aec77fdf5f253c8beb3efba948fca2334ac26cf2ea398a1d319
audit-1780542793066719197-328	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 03:13:13.066722+00	cert_lifecycle	1f29637ae17c1aec77fdf5f253c8beb3efba948fca2334ac26cf2ea398a1d319	ae07eab2f910d914fce65ec2cb9f08bb2c11c5f0e4a355b2c9fe53bf56c15ecd
audit-1780542794746899828-329	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 14}	2026-06-04 03:13:14.746902+00	cert_lifecycle	ae07eab2f910d914fce65ec2cb9f08bb2c11c5f0e4a355b2c9fe53bf56c15ecd	c7ec5071d962fb2cb0d2b0d96f58688ab801c8d4dcb5953c08eb5ea9dcd4e0b7
audit-1780542824789831698-330	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:13:44.789834+00	cert_lifecycle	c7ec5071d962fb2cb0d2b0d96f58688ab801c8d4dcb5953c08eb5ea9dcd4e0b7	175cef659dbdf02246eaaec0d4deb547a43c38f2b6a381a64a9eca8c03c2f6eb
audit-1780542854819256697-331	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:14:14.81926+00	cert_lifecycle	175cef659dbdf02246eaaec0d4deb547a43c38f2b6a381a64a9eca8c03c2f6eb	f553bfda8949a1875cdc9ed41b29ffc3effc4815b82e95782c0377ca63acd52e
audit-1780542854908139173-332	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 3}	2026-06-04 03:14:14.908141+00	cert_lifecycle	f553bfda8949a1875cdc9ed41b29ffc3effc4815b82e95782c0377ca63acd52e	f72c6386ebb4027ce6b363eff87652f06508e2f804201c0a311bcd4a8454234c
audit-1780542874505580534-333	system	System	job_retry	job	job-1780541450025945339-161	{"attempts": 0, "new_status": "Pending", "old_status": "Failed", "max_attempts": 3}	2026-06-04 03:14:34.505583+00	cert_lifecycle	f72c6386ebb4027ce6b363eff87652f06508e2f804201c0a311bcd4a8454234c	14a10b27c19426757f6dc404b30095d2c8b5e6289202a8bd87bef74640d40a4f
audit-1780542874510084023-334	system	System	job_retry	job	job-approval-02	{"attempts": 0, "new_status": "Pending", "old_status": "Failed", "max_attempts": 3}	2026-06-04 03:14:34.510087+00	cert_lifecycle	14a10b27c19426757f6dc404b30095d2c8b5e6289202a8bd87bef74640d40a4f	90066c3370af26384f65afa12c6bb0c90226f0322f496baa20692d3ec1589036
audit-1780542874513750737-335	system	System	job_retry	job	job-approval-01	{"attempts": 0, "new_status": "Pending", "old_status": "Failed", "max_attempts": 3}	2026-06-04 03:14:34.513755+00	cert_lifecycle	90066c3370af26384f65afa12c6bb0c90226f0322f496baa20692d3ec1589036	a396c666a9fab095fe825de64d1e038d832729e638f30d219e6ce2e4bbad2830
audit-1780542874518194105-336	system	System	job_retry	job	job-ren-150	{"attempts": 1, "new_status": "Pending", "old_status": "Failed", "max_attempts": 3}	2026-06-04 03:14:34.518197+00	cert_lifecycle	a396c666a9fab095fe825de64d1e038d832729e638f30d219e6ce2e4bbad2830	9e767a7bd1ce7d0d99fd5b3f4d5eac39710b646d22d52e9da60f7c692c3e2043
audit-1780542884123114506-337	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:14:44.123117+00	cert_lifecycle	9e767a7bd1ce7d0d99fd5b3f4d5eac39710b646d22d52e9da60f7c692c3e2043	d1ceccbc8a369c6c4e2db5d70f87e17ab46fca4bf538477fcce9547cd28ea5f6
audit-1780542889313430422-339	system	System	renewal_job_failed	certificate	mc-wildcard-prod	{"error": "failed to create ACME order: 400 urn:ietf:params:acme:error:malformed: Unable to validate JWS :: No Key ID in JWS header", "job_id": "job-1780541450025945339-161"}	2026-06-04 03:14:49.313434+00	cert_lifecycle	d1ceccbc8a369c6c4e2db5d70f87e17ab46fca4bf538477fcce9547cd28ea5f6	a4308ad59a045fad69b3ab501340d532f5fa6846a8403cfae39424aaf09010d6
audit-1780542911800138208-340	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 8}	2026-06-04 03:15:11.80014+00	cert_lifecycle	a4308ad59a045fad69b3ab501340d532f5fa6846a8403cfae39424aaf09010d6	b50e564d81300a1016bf235bdf3a2efacaecb1c3cdaca871b625facfe95d4ee8
audit-1780542920742005327-341	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 14}	2026-06-04 03:15:20.742008+00	cert_lifecycle	b50e564d81300a1016bf235bdf3a2efacaecb1c3cdaca871b625facfe95d4ee8	89dbc729f36350cf02e54c38b2c00635a9e2290e10ca1bb5c029550790f4a26a
audit-1780542941774411319-342	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 03:15:41.774413+00	cert_lifecycle	89dbc729f36350cf02e54c38b2c00635a9e2290e10ca1bb5c029550790f4a26a	eb3bdde5e46e513d8e481185d7eef55a0ed4ede3da22e3ab8f0c8c2cf3f3961a
audit-1780542973404360622-343	actor-demo-anon	User	api_get	api	/api/v1/stats/summary	{"path": "/api/v1/stats/summary", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 6}	2026-06-04 03:16:13.404363+00	cert_lifecycle	eb3bdde5e46e513d8e481185d7eef55a0ed4ede3da22e3ab8f0c8c2cf3f3961a	fc782acc20caffc75881a131bbc2d1595ed95c23718987ebfcbd7b73f7e6036d
audit-1780542973409024685-344	actor-demo-anon	User	api_get	api	/api/v1/jobs	{"path": "/api/v1/jobs", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 03:16:13.409027+00	cert_lifecycle	fc782acc20caffc75881a131bbc2d1595ed95c23718987ebfcbd7b73f7e6036d	3602a6afc25002ed790464044b788fafec6a3fe8ec91eecc3cdc52443b522276
audit-1780542973409757391-345	actor-demo-anon	User	api_get	api	/api/v1/stats/certificates-by-status	{"path": "/api/v1/stats/certificates-by-status", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 03:16:13.409759+00	cert_lifecycle	3602a6afc25002ed790464044b788fafec6a3fe8ec91eecc3cdc52443b522276	febd11d6b7741e8efc1d54a2e7a532ba28ba9031fcf3ab0ea3be91573af86ab0
audit-1780542973814356272-346	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:16:13.814358+00	cert_lifecycle	febd11d6b7741e8efc1d54a2e7a532ba28ba9031fcf3ab0ea3be91573af86ab0	520abe5cb4e478a4b643d8a77d6ad3cf10b99e99a4b137f19d055401d696aad7
audit-1780542974608912127-347	actor-demo-anon	User	api_get	api	/api/v1/issuers	{"path": "/api/v1/issuers", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:16:14.608915+00	cert_lifecycle	520abe5cb4e478a4b643d8a77d6ad3cf10b99e99a4b137f19d055401d696aad7	2b393ef04bc19f3737b84847cda717662f61b78a534a9c753fad40c3bc7bb6bb
audit-1780542974617950921-348	actor-demo-anon	User	api_get	api	/api/v1/jobs	{"path": "/api/v1/jobs", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 8}	2026-06-04 03:16:14.617953+00	cert_lifecycle	2b393ef04bc19f3737b84847cda717662f61b78a534a9c753fad40c3bc7bb6bb	192507f192ff8f3b8fc5360ed30c9f6113f199ef25fe2855236ce0f920bfcb58
audit-1780542974619200973-350	actor-demo-anon	User	api_get	api	/api/v1/stats/summary	{"path": "/api/v1/stats/summary", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 14}	2026-06-04 03:16:14.619203+00	cert_lifecycle	192507f192ff8f3b8fc5360ed30c9f6113f199ef25fe2855236ce0f920bfcb58	45ad9a74b92264d6cf5ba7c8d0975c42cf2bf917fd77055d7c5e9088c4bc1e7b
audit-1780542974622607737-353	actor-demo-anon	User	api_get	api	/api/v1/stats/expiration-timeline	{"path": "/api/v1/stats/expiration-timeline", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 13}	2026-06-04 03:16:14.622609+00	cert_lifecycle	45ad9a74b92264d6cf5ba7c8d0975c42cf2bf917fd77055d7c5e9088c4bc1e7b	ffd7ac628a52fee3838eca296268af4578dde91a56c6c3df1cb07d732d05f146
audit-1780542974622587762-352	actor-demo-anon	User	api_get	api	/api/v1/stats/issuance-rate	{"path": "/api/v1/stats/issuance-rate", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 13}	2026-06-04 03:16:14.62259+00	cert_lifecycle	ffd7ac628a52fee3838eca296268af4578dde91a56c6c3df1cb07d732d05f146	d6a03219b0f8b4130df68b391cd53f016920cb1ff6a58e159cad0f361c06f872
audit-1780542975714536348-359	actor-demo-anon	User	api_get	api	/api/v1/profiles	{"path": "/api/v1/profiles", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 6}	2026-06-04 03:16:15.714538+00	cert_lifecycle	0a105e439de93a6454f260f1bd54ff41f6f241a8cd3a0c9c152486d5c15b1fbc	8d99d31f397c3d83dc6184628e28494d911e94b0d22735138801caa9efd7b44f
audit-1780542976127394633-360	actor-demo-anon	User	api_get	api	/api/v1/agents	{"path": "/api/v1/agents", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 03:16:16.127396+00	cert_lifecycle	8d99d31f397c3d83dc6184628e28494d911e94b0d22735138801caa9efd7b44f	b1a20f4a39091752d2f342d66e7e0c2f3f5b7f5a7bca16d61e82c5bfc104ddbe
audit-1780542978508084005-361	actor-demo-anon	User	api_get	api	/api/v1/targets	{"path": "/api/v1/targets", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:16:18.508086+00	cert_lifecycle	b1a20f4a39091752d2f342d66e7e0c2f3f5b7f5a7bca16d61e82c5bfc104ddbe	8a7bcb3043ac0fdb400cc386942dbe4cf850e9d03f5afee1fb64b2c501df2828
audit-1780542979374670031-362	actor-demo-anon	User	api_get	api	/api/v1/owners	{"path": "/api/v1/owners", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 2}	2026-06-04 03:16:19.374673+00	cert_lifecycle	8a7bcb3043ac0fdb400cc386942dbe4cf850e9d03f5afee1fb64b2c501df2828	7b31adea936b1ca1bcb0fa29cfa61ce4753947d40d45d880c9ff76de05c3e7c8
audit-1780542981232589820-365	actor-demo-anon	User	api_get	api	/api/v1/network-scan-targets	{"path": "/api/v1/network-scan-targets", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 2}	2026-06-04 03:16:21.232592+00	cert_lifecycle	21719243a4fc5739f47bc4c2043ae7e035b6f3d846cbea2c5137e39b72ede434	dcd341e5022634cce4f09e2ec4f699614641a182dd74b2b0c60a2fcd60dfca8a
audit-1780542982364357138-366	actor-demo-anon	User	api_get	api	/api/v1/discovered-certificates	{"path": "/api/v1/discovered-certificates", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 03:16:22.364359+00	cert_lifecycle	dcd341e5022634cce4f09e2ec4f699614641a182dd74b2b0c60a2fcd60dfca8a	67a599694a019bb7ac72647c3a921da5b896d434d73903a7755cc154c33b7675
audit-1780542974619221670-351	actor-demo-anon	User	api_get	api	/api/v1/stats/certificates-by-status	{"path": "/api/v1/stats/certificates-by-status", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 10}	2026-06-04 03:16:14.619223+00	cert_lifecycle	d6a03219b0f8b4130df68b391cd53f016920cb1ff6a58e159cad0f361c06f872	94b640002eec7344d27a9a699afdce3e8ae454568cfae3338fb7cb5b6addc452
audit-1780542975713916904-358	actor-demo-anon	User	api_get	api	/api/v1/certificates	{"path": "/api/v1/certificates", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 03:16:15.713918+00	cert_lifecycle	5f39d80cafca05de967c692999de1c868bf590048587de7e6766dd4fcff5d9c8	0a105e439de93a6454f260f1bd54ff41f6f241a8cd3a0c9c152486d5c15b1fbc
audit-1780542979378232522-363	actor-demo-anon	User	api_get	api	/api/v1/teams	{"path": "/api/v1/teams", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 2}	2026-06-04 03:16:19.378234+00	cert_lifecycle	7b31adea936b1ca1bcb0fa29cfa61ce4753947d40d45d880c9ff76de05c3e7c8	0d6bc427c104d3b6df3ccd084cda2fc7196d4c7d0ca2f91714095dec1cd85fa6
audit-1780542981229719637-364	actor-demo-anon	User	api_get	api	/api/v1/network-scan/scep-probes	{"path": "/api/v1/network-scan/scep-probes", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 2}	2026-06-04 03:16:21.229721+00	cert_lifecycle	0d6bc427c104d3b6df3ccd084cda2fc7196d4c7d0ca2f91714095dec1cd85fa6	21719243a4fc5739f47bc4c2043ae7e035b6f3d846cbea2c5137e39b72ede434
audit-1780542982367776155-367	actor-demo-anon	User	api_get	api	/api/v1/discovery-scans	{"path": "/api/v1/discovery-scans", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:16:22.367779+00	cert_lifecycle	67a599694a019bb7ac72647c3a921da5b896d434d73903a7755cc154c33b7675	aa7da76871ad5b37de2ee836a643180a68483b1c1b2f3f1aab53338ec06215ac
audit-1780542974629198305-354	actor-demo-anon	User	api_get	api	/api/v1/certificates	{"path": "/api/v1/certificates", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 19}	2026-06-04 03:16:14.629202+00	cert_lifecycle	94b640002eec7344d27a9a699afdce3e8ae454568cfae3338fb7cb5b6addc452	d9f0e2b650babf5c3e9f2f3d528d3291115f53452b093d2fc0a4825f095fbab6
audit-1780542975713838929-357	actor-demo-anon	User	api_get	api	/api/v1/owners	{"path": "/api/v1/owners", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 03:16:15.713841+00	cert_lifecycle	20e0ab95ccd5b3a2ec6b5e3165618d64f0cff474a8bd6c71f70c25d631a19ba0	5f39d80cafca05de967c692999de1c868bf590048587de7e6766dd4fcff5d9c8
audit-1780542982368108806-368	actor-demo-anon	User	api_get	api	/api/v1/discovery-summary	{"path": "/api/v1/discovery-summary", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:16:22.36811+00	cert_lifecycle	16465c022c1071647734ec4e7893bc78bc8217a4f3c1367642a14a4bba6eb8be	d6a1b9a4f0ad766004987d6e046a24702d0bbaab6ff9d75b1bae9ea1e48800a3
audit-1780542986420940259-370	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 5}	2026-06-04 03:16:26.420943+00	cert_lifecycle	d6a1b9a4f0ad766004987d6e046a24702d0bbaab6ff9d75b1bae9ea1e48800a3	b9edf9da76828ccc4888e111b265d8aada4578c1d88bab7f59e715ad112d1791
audit-1780543004583411324-371	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 03:16:44.583413+00	cert_lifecycle	b9edf9da76828ccc4888e111b265d8aada4578c1d88bab7f59e715ad112d1791	8b1d41e0517246086493eae74a477417d271c6f8b6e44759520f7ffbd60f92b2
audit-1780543033856492132-372	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:17:13.856494+00	cert_lifecycle	8b1d41e0517246086493eae74a477417d271c6f8b6e44759520f7ffbd60f92b2	6e90ab3307be9318f366c47262e811d7114ad9f60b8f1eef4aabc29d65abc2fb
audit-1780543051750286675-373	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 7}	2026-06-04 03:17:31.750289+00	cert_lifecycle	6e90ab3307be9318f366c47262e811d7114ad9f60b8f1eef4aabc29d65abc2fb	00e9361b6b12f8cdb0a99e9dc91e19a44e9823de47a1c5ef1212e7270fda6483
audit-1780543061032306687-374	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:17:41.032309+00	cert_lifecycle	00e9361b6b12f8cdb0a99e9dc91e19a44e9823de47a1c5ef1212e7270fda6483	3aa1e73a916f80cb010c74acb04c97a90aec6d8454286eb842d1945ae0d6fcbb
audit-1780543090761115048-375	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 03:18:10.761117+00	cert_lifecycle	3aa1e73a916f80cb010c74acb04c97a90aec6d8454286eb842d1945ae0d6fcbb	dc1c5cebf038bfc222a9130b5232a57a94b461daea387ab3ba45c73eba093c8e
audit-1780543111294016630-376	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 18}	2026-06-04 03:18:31.294018+00	cert_lifecycle	dc1c5cebf038bfc222a9130b5232a57a94b461daea387ab3ba45c73eba093c8e	feb68f3ece38c880da1e5d8d97ef0da472925c02262ee5577615abb1b43162e3
audit-1780543120058985682-377	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:18:40.058987+00	cert_lifecycle	feb68f3ece38c880da1e5d8d97ef0da472925c02262ee5577615abb1b43162e3	5140759311d7f9cfcebfa4bc58736da8bee054eca24b849d758d02a44e2f3933
audit-1780543133691985273-378	system	System	job_offline_agent_reap	job	job-ren-150	{"agent_id": "ag-data-prod", "new_status": "Failed", "old_status": "Running", "timeout_reason": "agent_offline"}	2026-06-04 03:18:53.691991+00	cert_lifecycle	5140759311d7f9cfcebfa4bc58736da8bee054eca24b849d758d02a44e2f3933	6476a1aa8694cbb7f21397ae070ac7b9a0e8c42e9d0fbfeb2d7e83ae6c0a8c68
audit-1780543133696722081-379	system	System	job_offline_agent_reap	job	job-approval-01	{"agent_id": "ag-web-prod", "new_status": "Failed", "old_status": "Running", "timeout_reason": "agent_offline"}	2026-06-04 03:18:53.696724+00	cert_lifecycle	6476a1aa8694cbb7f21397ae070ac7b9a0e8c42e9d0fbfeb2d7e83ae6c0a8c68	913fcefedaa98e2f66b222f47cc912c34fe3f2c3c7dcffe9d09f604c517ac8e9
audit-1780543133700326515-380	system	System	job_offline_agent_reap	job	job-approval-02	{"agent_id": "ag-web-prod", "new_status": "Failed", "old_status": "Running", "timeout_reason": "agent_offline"}	2026-06-04 03:18:53.700328+00	cert_lifecycle	913fcefedaa98e2f66b222f47cc912c34fe3f2c3c7dcffe9d09f604c517ac8e9	68e53609efbd3382afae06bfeabd44777b848c261cd42150cce8c56490c9a888
audit-1780543146362144240-381	system	System	job_retry	job	job-1780541450025945339-161	{"attempts": 0, "new_status": "Pending", "old_status": "Failed", "max_attempts": 3}	2026-06-04 03:19:06.362148+00	cert_lifecycle	68e53609efbd3382afae06bfeabd44777b848c261cd42150cce8c56490c9a888	d7b6db31e63241f803702a3b6a8049eadcb36b5909658fdc392339ad1d1ba94b
audit-1780543146365897133-382	system	System	job_retry	job	job-approval-02	{"attempts": 0, "new_status": "Pending", "old_status": "Failed", "max_attempts": 3}	2026-06-04 03:19:06.365899+00	cert_lifecycle	d7b6db31e63241f803702a3b6a8049eadcb36b5909658fdc392339ad1d1ba94b	c9a28341a419d06d5a446390cc64045b048e07536ad4f577a3ab90d2cc051bd9
audit-1780543146369693032-383	system	System	job_retry	job	job-approval-01	{"attempts": 0, "new_status": "Pending", "old_status": "Failed", "max_attempts": 3}	2026-06-04 03:19:06.369697+00	cert_lifecycle	c9a28341a419d06d5a446390cc64045b048e07536ad4f577a3ab90d2cc051bd9	ea923550c60c65f8f882b52450f254409c3d15688c4fc787f4d2166d2aaf3b57
audit-1780543146373317583-384	system	System	job_retry	job	job-ren-150	{"attempts": 1, "new_status": "Pending", "old_status": "Failed", "max_attempts": 3}	2026-06-04 03:19:06.373319+00	cert_lifecycle	ea923550c60c65f8f882b52450f254409c3d15688c4fc787f4d2166d2aaf3b57	58c2ceda67d77b99fbca1bbbec0e3b15a8471064a705363ad89ee5dd22780ed3
audit-1780543150496322270-385	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 10}	2026-06-04 03:19:10.496324+00	cert_lifecycle	58c2ceda67d77b99fbca1bbbec0e3b15a8471064a705363ad89ee5dd22780ed3	cabfe0dbf062319143cb306fe04ad15ba2b9ecf53165047b0e57faee7d8148b1
audit-1780542974619195481-349	actor-demo-anon	User	api_get	api	/api/v1/stats/job-trends	{"path": "/api/v1/stats/job-trends", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 9}	2026-06-04 03:16:14.619198+00	cert_lifecycle	d9f0e2b650babf5c3e9f2f3d528d3291115f53452b093d2fc0a4825f095fbab6	59629a45c618aca038e9ddbfc307a762917d9f1bd55868f6ac4f1f9e50b656ff
audit-1780542975708111975-355	actor-demo-anon	User	api_get	api	/api/v1/issuers	{"path": "/api/v1/issuers", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:16:15.708117+00	cert_lifecycle	59629a45c618aca038e9ddbfc307a762917d9f1bd55868f6ac4f1f9e50b656ff	4f25e63355bc52736d98b3432807342f65e6b7a0c4c2a7afd930d771dc65d95d
audit-1780542975711670701-356	actor-demo-anon	User	api_get	api	/api/v1/teams	{"path": "/api/v1/teams", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:16:15.711672+00	cert_lifecycle	4f25e63355bc52736d98b3432807342f65e6b7a0c4c2a7afd930d771dc65d95d	20e0ab95ccd5b3a2ec6b5e3165618d64f0cff474a8bd6c71f70c25d631a19ba0
audit-1780542982368110702-369	actor-demo-anon	User	api_get	api	/api/v1/agents	{"path": "/api/v1/agents", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:16:22.368111+00	cert_lifecycle	aa7da76871ad5b37de2ee836a643180a68483b1c1b2f3f1aab53338ec06215ac	16465c022c1071647734ec4e7893bc78bc8217a4f3c1367642a14a4bba6eb8be
audit-1780543163673539861-387	system	System	renewal_job_failed	certificate	mc-wildcard-prod	{"error": "failed to create ACME order: 400 urn:ietf:params:acme:error:malformed: Unable to validate JWS :: No Key ID in JWS header", "job_id": "job-1780541450025945339-161"}	2026-06-04 03:19:23.673543+00	cert_lifecycle	cabfe0dbf062319143cb306fe04ad15ba2b9ecf53165047b0e57faee7d8148b1	cf88134bf77c6caff6c26532abe20f865c42cf478354e6e0e06ee0103b87eadb
audit-1780543168087170211-388	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 11}	2026-06-04 03:19:28.087172+00	cert_lifecycle	cf88134bf77c6caff6c26532abe20f865c42cf478354e6e0e06ee0103b87eadb	f6f945375c3ceea6d11a5010eef9e82ca99bce64ae2b2b34ea2244948d74e701
audit-1780543180108105180-389	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:19:40.108107+00	cert_lifecycle	f6f945375c3ceea6d11a5010eef9e82ca99bce64ae2b2b34ea2244948d74e701	06ddf6cf591055878d488ba80e68a5b83dd2e66f6f599d41870ce8b516088900
audit-1780543208998906728-390	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 6}	2026-06-04 03:20:08.998909+00	cert_lifecycle	06ddf6cf591055878d488ba80e68a5b83dd2e66f6f599d41870ce8b516088900	88e4e854bc1d531f35e0065799e2b316bdc3e5edc5d5f6d920851b2dcb79d21f
audit-1780543224083362090-391	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 3}	2026-06-04 03:20:24.083364+00	cert_lifecycle	88e4e854bc1d531f35e0065799e2b316bdc3e5edc5d5f6d920851b2dcb79d21f	4fc2919db77ee2e4b1b197c2550fc93f85332c111b6d0dfbfd2cea4178f3ed35
audit-1780543239686492473-392	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:20:39.686495+00	cert_lifecycle	4fc2919db77ee2e4b1b197c2550fc93f85332c111b6d0dfbfd2cea4178f3ed35	8f94e4f062f62876a97fc227a34e4496c11956b873ff97ffc37e1c75510775fc
audit-1780543272064008804-393	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 03:21:12.064011+00	cert_lifecycle	8f94e4f062f62876a97fc227a34e4496c11956b873ff97ffc37e1c75510775fc	0d1c92e8471e0a46d10bf38acace69da49877394a5b9fa7eceb1ed318667df89
audit-1780543287432467609-394	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 14}	2026-06-04 03:21:27.432469+00	cert_lifecycle	0d1c92e8471e0a46d10bf38acace69da49877394a5b9fa7eceb1ed318667df89	680a56e59915eab742605d654409062d420f29e36575f5fbab1f9ee071eea5d6
audit-1780543299831825094-395	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:21:39.831827+00	cert_lifecycle	680a56e59915eab742605d654409062d420f29e36575f5fbab1f9ee071eea5d6	793d589c0584aba2155528e054c668e2f1ac69c59bfcbc9129df759efcfc0677
audit-1780543328616077280-396	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:22:08.616079+00	cert_lifecycle	793d589c0584aba2155528e054c668e2f1ac69c59bfcbc9129df759efcfc0677	77e6a2149a3d157645b195abc40cd42adf053ea17b28faf09d11ba988f3e1bde
audit-1780543343510006373-397	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 4}	2026-06-04 03:22:23.510059+00	cert_lifecycle	77e6a2149a3d157645b195abc40cd42adf053ea17b28faf09d11ba988f3e1bde	b522a2b70a9cd8290f02c9064336305d1444d47173e57b6317bf1a19f5a1a5fb
audit-1780543360518273177-398	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 6}	2026-06-04 03:22:40.518275+00	cert_lifecycle	b522a2b70a9cd8290f02c9064336305d1444d47173e57b6317bf1a19f5a1a5fb	79fbdcb3e980b485799ba868859644436e740938d2f6558b4ed2d6bdd2bc9e3f
audit-1780543392962487783-399	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 9}	2026-06-04 03:23:12.962491+00	cert_lifecycle	79fbdcb3e980b485799ba868859644436e740938d2f6558b4ed2d6bdd2bc9e3f	94977da52aefabee52a85d0af979329a4a12a7e22b275713eb5e397d9c300de2
audit-1780543405738343947-400	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 5}	2026-06-04 03:23:25.738347+00	cert_lifecycle	94977da52aefabee52a85d0af979329a4a12a7e22b275713eb5e397d9c300de2	672ab0ed75b72ca3a57ae96aa665e2448f2c8d85f665f19c5bf7206188d9ec4c
audit-1780543421608527074-401	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 03:23:41.608529+00	cert_lifecycle	672ab0ed75b72ca3a57ae96aa665e2448f2c8d85f665f19c5bf7206188d9ec4c	96534c41119f0efa847fd62c321e9293c4a366018a83f6c4157a0b51f51818cc
audit-1780543439627370425-402	system	System	job_retry	job	job-1780541450025945339-161	{"attempts": 0, "new_status": "Pending", "old_status": "Failed", "max_attempts": 3}	2026-06-04 03:23:59.627377+00	cert_lifecycle	96534c41119f0efa847fd62c321e9293c4a366018a83f6c4157a0b51f51818cc	b4abad533c88b55ab2746b16fa0312be54aa5475d7a7fc960cece85002d8ca28
audit-1780543451132238528-403	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 15}	2026-06-04 03:24:11.132241+00	cert_lifecycle	b4abad533c88b55ab2746b16fa0312be54aa5475d7a7fc960cece85002d8ca28	af999d67a02140adf9d14a2438d143a5df7fe03f6ba9a9ef92ec9c9fa0216e0a
audit-1780543454691627843-405	system	System	renewal_job_failed	certificate	mc-wildcard-prod	{"error": "failed to create ACME order: 400 urn:ietf:params:acme:error:malformed: Unable to validate JWS :: No Key ID in JWS header", "job_id": "job-1780541450025945339-161"}	2026-06-04 03:24:14.691633+00	cert_lifecycle	af999d67a02140adf9d14a2438d143a5df7fe03f6ba9a9ef92ec9c9fa0216e0a	74bee3ec502e4f6ec91d4e11aaf80155a4a6ec00626c0b117ff5c26520ad4dbb
audit-1780543468151904360-406	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 21}	2026-06-04 03:24:28.151908+00	cert_lifecycle	74bee3ec502e4f6ec91d4e11aaf80155a4a6ec00626c0b117ff5c26520ad4dbb	3db9646f3b685d51b9a4f253623322fbd76d4982d6c9bc2e81eb18ad13109c34
audit-1780543484054728265-407	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 7}	2026-06-04 03:24:44.054734+00	cert_lifecycle	3db9646f3b685d51b9a4f253623322fbd76d4982d6c9bc2e81eb18ad13109c34	7a68c908862f6c5559c3a5bdebca3c135103768815c3b443f211d1bed86938ae
audit-1780543516576665198-408	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 03:25:16.576667+00	cert_lifecycle	7a68c908862f6c5559c3a5bdebca3c135103768815c3b443f211d1bed86938ae	120c9af299d1f975e78af45d134c2a07727a226935fc92ced84aeb8261978e50
audit-1780543530895080537-409	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 7}	2026-06-04 03:25:30.895083+00	cert_lifecycle	120c9af299d1f975e78af45d134c2a07727a226935fc92ced84aeb8261978e50	dc5ab9b6aec15d6c3bfee3c58cb229a9a0fd6e67895def3b5ad4947b19a3b97a
audit-1780543547798493074-410	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 6}	2026-06-04 03:25:47.798495+00	cert_lifecycle	dc5ab9b6aec15d6c3bfee3c58cb229a9a0fd6e67895def3b5ad4947b19a3b97a	b1a425e125fd5d62cd9b4358e16bd081218a0aa659e387335d74f4c538060610
audit-1780543580339249390-411	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 8}	2026-06-04 03:26:20.339251+00	cert_lifecycle	b1a425e125fd5d62cd9b4358e16bd081218a0aa659e387335d74f4c538060610	9e26b6218f069d784161c6a232324ce3a8fc4b2b16747ea0af5338330e1298fd
audit-1780543587311455617-412	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 4}	2026-06-04 03:26:27.311458+00	cert_lifecycle	9e26b6218f069d784161c6a232324ce3a8fc4b2b16747ea0af5338330e1298fd	624dbca0a22f008076a45add1983c65b8702e06647a653675bc0d5bd5432c314
audit-1780543610923953771-413	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 9}	2026-06-04 03:26:50.923956+00	cert_lifecycle	624dbca0a22f008076a45add1983c65b8702e06647a653675bc0d5bd5432c314	f0d40c84b5969f451ce9d21f907a813e44d0e1bfe6117b07d545639dcd7620ae
audit-1780543641647238690-414	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 7}	2026-06-04 03:27:21.647242+00	cert_lifecycle	f0d40c84b5969f451ce9d21f907a813e44d0e1bfe6117b07d545639dcd7620ae	4298c2bc84cf42165a82dd30c35dd5aa0ead791ad97768d46a6e51875f4f6312
audit-1780543647431739816-415	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 3}	2026-06-04 03:27:27.431741+00	cert_lifecycle	4298c2bc84cf42165a82dd30c35dd5aa0ead791ad97768d46a6e51875f4f6312	810b2e2ee9cda277723812da7daf97d5242d53f5c96726632acaa5e2bf20039a
audit-1780543672518744571-416	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 6}	2026-06-04 03:27:52.518747+00	cert_lifecycle	810b2e2ee9cda277723812da7daf97d5242d53f5c96726632acaa5e2bf20039a	4ae6afff928639f635027099d38de58ac7c4cd4eb55c1ca6ad4b40ad0d27c3cf
audit-1780543700365600106-417	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 6}	2026-06-04 03:28:20.365603+00	cert_lifecycle	4ae6afff928639f635027099d38de58ac7c4cd4eb55c1ca6ad4b40ad0d27c3cf	ac945d6e98c8f4e9f1c01a210d9cda09ec1c7c01777cde799d18b098a23dc952
audit-1780543702826358030-418	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 5}	2026-06-04 03:28:22.826361+00	cert_lifecycle	ac945d6e98c8f4e9f1c01a210d9cda09ec1c7c01777cde799d18b098a23dc952	6e4510db8424aaa8425a0fdf5dd3348e7414a8ab7e47f83f48250325e4c65c2e
audit-1780543710094292265-419	system	System	job_retry	job	job-1780541450025945339-161	{"attempts": 0, "new_status": "Pending", "old_status": "Failed", "max_attempts": 3}	2026-06-04 03:28:30.094297+00	cert_lifecycle	6e4510db8424aaa8425a0fdf5dd3348e7414a8ab7e47f83f48250325e4c65c2e	86fa04d9fafd8a718e7e0809d7dacfb87646a5a6fc30bb8d52a9bf524830a0d3
audit-1780543713124795541-420	system	System	job_offline_agent_reap	job	job-ren-150	{"agent_id": "ag-data-prod", "new_status": "Failed", "old_status": "Running", "timeout_reason": "agent_offline"}	2026-06-04 03:28:33.124799+00	cert_lifecycle	86fa04d9fafd8a718e7e0809d7dacfb87646a5a6fc30bb8d52a9bf524830a0d3	8c150dd939bf1f35b420df24e9d1c37769b64eb9ffa3bafde6f59b702eb9f73d
audit-1780543713128939010-421	system	System	job_offline_agent_reap	job	job-approval-01	{"agent_id": "ag-web-prod", "new_status": "Failed", "old_status": "Running", "timeout_reason": "agent_offline"}	2026-06-04 03:28:33.128942+00	cert_lifecycle	8c150dd939bf1f35b420df24e9d1c37769b64eb9ffa3bafde6f59b702eb9f73d	4c2beb615a0a267fb3d8a41f5e27eadb6dcb25bdfb371dd6e2dbdbaf150408a7
audit-1780543713133013434-422	system	System	job_offline_agent_reap	job	job-approval-02	{"agent_id": "ag-web-prod", "new_status": "Failed", "old_status": "Running", "timeout_reason": "agent_offline"}	2026-06-04 03:28:33.133017+00	cert_lifecycle	4c2beb615a0a267fb3d8a41f5e27eadb6dcb25bdfb371dd6e2dbdbaf150408a7	ee4fc7bac41817309b257a14d25941f4018603d7931dd63bd3667a5b8509141e
audit-1780543726829131938-424	system	System	renewal_job_failed	certificate	mc-wildcard-prod	{"error": "failed to create ACME order: 400 urn:ietf:params:acme:error:malformed: Unable to validate JWS :: No Key ID in JWS header", "job_id": "job-1780541450025945339-161"}	2026-06-04 03:28:46.829136+00	cert_lifecycle	ee4fc7bac41817309b257a14d25941f4018603d7931dd63bd3667a5b8509141e	af4e3c8f1af0fd1cd880d0f52efef647fc032b8744dbb370c37d6cd2b82c7210
audit-1780543733204020477-425	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 03:28:53.204022+00	cert_lifecycle	af4e3c8f1af0fd1cd880d0f52efef647fc032b8744dbb370c37d6cd2b82c7210	6319b946964de1df1e79107bb88d2698b45647d73696b35aa3b65b29ab705fc0
audit-1780543764778322179-426	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 5}	2026-06-04 03:29:24.778325+00	cert_lifecycle	6319b946964de1df1e79107bb88d2698b45647d73696b35aa3b65b29ab705fc0	d0bb9907884b570f6c4043707eb4884e493fca25487291c151506ff0a35dc3bb
audit-1780543764967509806-427	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 03:29:24.967512+00	cert_lifecycle	d0bb9907884b570f6c4043707eb4884e493fca25487291c151506ff0a35dc3bb	673ee372079021d70cddfb8856e393762cb8bb9455e35d87e5f35eaccbb018fd
audit-1780543795860281133-428	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 8}	2026-06-04 03:29:55.860284+00	cert_lifecycle	673ee372079021d70cddfb8856e393762cb8bb9455e35d87e5f35eaccbb018fd	412e5b7dff5447216206fd403b9e40348a931dc482c436d1e3cc09d1a9733240
audit-1780543825756259159-429	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 03:30:25.756262+00	cert_lifecycle	412e5b7dff5447216206fd403b9e40348a931dc482c436d1e3cc09d1a9733240	410d412c7f26f17eb07577d516b8ef6fe0b94fb068620350558a9a116fd5eae9
audit-1780543830464803734-430	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 6}	2026-06-04 03:30:30.464807+00	cert_lifecycle	410d412c7f26f17eb07577d516b8ef6fe0b94fb068620350558a9a116fd5eae9	8880aded837463e6b40855b9597d53e41ba39703ce69992ef81e0b0f48d4b4e8
audit-1780543853093402732-431	actor-demo-anon	User	api_get	api	/api/v1/stats/summary	{"path": "/api/v1/stats/summary", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 7}	2026-06-04 03:30:53.093406+00	cert_lifecycle	8880aded837463e6b40855b9597d53e41ba39703ce69992ef81e0b0f48d4b4e8	ea21976a5ef403ac4290f991019e3680de99e916ec0d06760ecebb81afb6c62f
audit-1780543853106125119-433	actor-demo-anon	User	api_get	api	/api/v1/stats/issuance-rate	{"path": "/api/v1/stats/issuance-rate", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 10}	2026-06-04 03:30:53.106127+00	cert_lifecycle	ea21976a5ef403ac4290f991019e3680de99e916ec0d06760ecebb81afb6c62f	1b32f6ea4d19a7710f6932bd2f3e6f6e8a4c1022c4e9e5735dae538330fe7a44
audit-1780543853107543866-434	actor-demo-anon	User	api_get	api	/api/v1/stats/certificates-by-status	{"path": "/api/v1/stats/certificates-by-status", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 13}	2026-06-04 03:30:53.107546+00	cert_lifecycle	1b32f6ea4d19a7710f6932bd2f3e6f6e8a4c1022c4e9e5735dae538330fe7a44	04dd5c22787b2080d6c4fb24b872533677d213c5f3119581540a7b233bfca5c8
audit-1780543853110232071-435	actor-demo-anon	User	api_get	api	/api/v1/stats/job-trends	{"path": "/api/v1/stats/job-trends", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 14}	2026-06-04 03:30:53.110237+00	cert_lifecycle	04dd5c22787b2080d6c4fb24b872533677d213c5f3119581540a7b233bfca5c8	5e2a1a7f1737339f677e120bc420948b15cf2647d0617888bc71d478fc9615d3
audit-1780543853111661985-436	actor-demo-anon	User	api_get	api	/api/v1/jobs	{"path": "/api/v1/jobs", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 16}	2026-06-04 03:30:53.111665+00	cert_lifecycle	5e2a1a7f1737339f677e120bc420948b15cf2647d0617888bc71d478fc9615d3	a50fa9a734e71df6ddbdb06e2991c0a0e0e9f0745d5e4b188cbad617f05b3a4d
audit-1780543853118844864-438	actor-demo-anon	User	api_get	api	/api/v1/stats/expiration-timeline	{"path": "/api/v1/stats/expiration-timeline", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 24}	2026-06-04 03:30:53.118847+00	cert_lifecycle	a50fa9a734e71df6ddbdb06e2991c0a0e0e9f0745d5e4b188cbad617f05b3a4d	e7e493f78774d1470594767854442877050ca5739652faddecfd6220fdfe0ecf
audit-1780543853095853502-432	actor-demo-anon	User	api_get	api	/api/v1/issuers	{"path": "/api/v1/issuers", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 8}	2026-06-04 03:30:53.095856+00	cert_lifecycle	e7e493f78774d1470594767854442877050ca5739652faddecfd6220fdfe0ecf	93f05a0443eb2f4ecbfb3e7649e381690320862982d410b412fa879666751fef
audit-1780543853117078122-437	actor-demo-anon	User	api_get	api	/api/v1/certificates	{"path": "/api/v1/certificates", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 21}	2026-06-04 03:30:53.11708+00	cert_lifecycle	93f05a0443eb2f4ecbfb3e7649e381690320862982d410b412fa879666751fef	b0204b9fbfa91c60fdf94805e7bc0770158aa86c92f8529ed4d0b342eaa418fa
audit-1780543854172397742-439	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 12}	2026-06-04 03:30:54.1724+00	cert_lifecycle	b0204b9fbfa91c60fdf94805e7bc0770158aa86c92f8529ed4d0b342eaa418fa	acf12c7adeacae0c87a7ffa4d67473256f86c0db9d637d06b24a73a34cc9611a
audit-1780543854962421743-440	actor-demo-anon	User	api_get	api	/api/v1/issuers	{"path": "/api/v1/issuers", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:30:54.962424+00	cert_lifecycle	acf12c7adeacae0c87a7ffa4d67473256f86c0db9d637d06b24a73a34cc9611a	50302599a630411ee67ca359111047fb7c89b2a4da9a468cf21447ea3c245ade
audit-1780543854965618758-442	actor-demo-anon	User	api_get	api	/api/v1/teams	{"path": "/api/v1/teams", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 2}	2026-06-04 03:30:54.96562+00	cert_lifecycle	50302599a630411ee67ca359111047fb7c89b2a4da9a468cf21447ea3c245ade	b10464d40e0867c075f222d10811e2ef7a1c859edd7a3407152edd41fd543712
audit-1780543854965536506-441	actor-demo-anon	User	api_get	api	/api/v1/owners	{"path": "/api/v1/owners", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:30:54.965538+00	cert_lifecycle	b10464d40e0867c075f222d10811e2ef7a1c859edd7a3407152edd41fd543712	f494fe5585f2fcc0e36bed2c64ca17d39b5bc87c15a79fda939c71e7338facc1
audit-1780543854968031292-443	actor-demo-anon	User	api_get	api	/api/v1/profiles	{"path": "/api/v1/profiles", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 03:30:54.968033+00	cert_lifecycle	f494fe5585f2fcc0e36bed2c64ca17d39b5bc87c15a79fda939c71e7338facc1	434e703a6a44d0d81e5e92a5f3b92fa98aefd637efe2e83931627229b43edeba
audit-1780543854968515124-444	actor-demo-anon	User	api_get	api	/api/v1/certificates	{"path": "/api/v1/certificates", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 03:30:54.968517+00	cert_lifecycle	434e703a6a44d0d81e5e92a5f3b92fa98aefd637efe2e83931627229b43edeba	d5e5ced0b301c9c663440557c170b0d8cc9230817fd57cb22d5a50f2c2737b83
audit-1780543855438839266-445	actor-demo-anon	User	api_get	api	/api/v1/agents	{"path": "/api/v1/agents", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 03:30:55.438842+00	cert_lifecycle	d5e5ced0b301c9c663440557c170b0d8cc9230817fd57cb22d5a50f2c2737b83	0af7ca5a68b08e5faeb57819303af3a50106ca2ad574fb5e27c4e6f52fb718cd
audit-1780543881514385543-446	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 03:31:21.514388+00	cert_lifecycle	0af7ca5a68b08e5faeb57819303af3a50106ca2ad574fb5e27c4e6f52fb718cd	f81b7013a338821b59f0faf08ee732aca1cf98c1a2f0517a35db217d81ffb7f9
audit-1780543892342715058-447	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 4}	2026-06-04 03:31:32.342717+00	cert_lifecycle	f81b7013a338821b59f0faf08ee732aca1cf98c1a2f0517a35db217d81ffb7f9	b6d0632c087be0b52eeaa35f2eabbad2a157f512d5a3183b3a2091cafca5b2b6
audit-1780543910280384739-448	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 03:31:50.280387+00	cert_lifecycle	b6d0632c087be0b52eeaa35f2eabbad2a157f512d5a3183b3a2091cafca5b2b6	a2da2a3c63572c12a842a2001224623a27bde6f959270e3445239a81563e8c83
audit-1780543937530400298-449	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 03:32:17.530403+00	cert_lifecycle	a2da2a3c63572c12a842a2001224623a27bde6f959270e3445239a81563e8c83	801f98e1ea8c2dc505413b616f821cc265bb5b77972e9818616f078629f0f18f
audit-1780543953296444493-450	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 9}	2026-06-04 03:32:33.296448+00	cert_lifecycle	801f98e1ea8c2dc505413b616f821cc265bb5b77972e9818616f078629f0f18f	21dd5e092b27cd6d0e677379c29589386dc332985f5d26a2ac7ae2c17e616cf4
audit-1780543967696015580-451	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 03:32:47.696018+00	cert_lifecycle	21dd5e092b27cd6d0e677379c29589386dc332985f5d26a2ac7ae2c17e616cf4	6dd2ea274efb986cd4e1bf2b7d4c3fdd3ccf2c30100cb6ca5634c1d7edf21c21
audit-1780543985964264219-452	system	System	job_retry	job	job-1780541450025945339-161	{"attempts": 0, "new_status": "Pending", "old_status": "Failed", "max_attempts": 3}	2026-06-04 03:33:05.964269+00	cert_lifecycle	6dd2ea274efb986cd4e1bf2b7d4c3fdd3ccf2c30100cb6ca5634c1d7edf21c21	608f48cb22825bdd46aef5d4242a31864ffe46331ccb5daf783483ea0131835c
audit-1780543985969384206-453	system	System	job_retry	job	job-approval-02	{"attempts": 0, "new_status": "Pending", "old_status": "Failed", "max_attempts": 3}	2026-06-04 03:33:05.96939+00	cert_lifecycle	608f48cb22825bdd46aef5d4242a31864ffe46331ccb5daf783483ea0131835c	0e20ca6eef611a35c93859f3659250a53089cb7975670ccf59dc9b6d3815276f
audit-1780543985975759411-454	system	System	job_retry	job	job-approval-01	{"attempts": 0, "new_status": "Pending", "old_status": "Failed", "max_attempts": 3}	2026-06-04 03:33:05.975764+00	cert_lifecycle	0e20ca6eef611a35c93859f3659250a53089cb7975670ccf59dc9b6d3815276f	4df523713e72c8b280367c217aacb2477ce7c6cf0c235155c8df42d45a932cad
audit-1780543985980636813-455	system	System	job_retry	job	job-ren-150	{"attempts": 1, "new_status": "Pending", "old_status": "Failed", "max_attempts": 3}	2026-06-04 03:33:05.980639+00	cert_lifecycle	4df523713e72c8b280367c217aacb2477ce7c6cf0c235155c8df42d45a932cad	d02cca051b9b469b9695cd4af858afea372f7479f0b2e39fbfd7235860e40bff
audit-1780543997973983097-456	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 03:33:17.973985+00	cert_lifecycle	d02cca051b9b469b9695cd4af858afea372f7479f0b2e39fbfd7235860e40bff	9f31e145e5e1e343c4cff013af2a6c6e8274ffe3fe19fd3d71b946d41647630b
audit-1780544001695956630-458	system	System	renewal_job_failed	certificate	mc-wildcard-prod	{"error": "failed to create ACME order: 400 urn:ietf:params:acme:error:malformed: Unable to validate JWS :: No Key ID in JWS header", "job_id": "job-1780541450025945339-161"}	2026-06-04 03:33:21.695959+00	cert_lifecycle	9f31e145e5e1e343c4cff013af2a6c6e8274ffe3fe19fd3d71b946d41647630b	6fbbe32070fa82046a7bb24bdfd31f75a596976edfbb59dc1db0eaaff6e538b0
audit-1780544007366041557-459	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 4}	2026-06-04 03:33:27.366043+00	cert_lifecycle	6fbbe32070fa82046a7bb24bdfd31f75a596976edfbb59dc1db0eaaff6e538b0	bd4a92c4cc73fa0c1162911d109eea75ef4bc2383f368375b9d15f8f733b8392
audit-1780544025613568018-460	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 03:33:45.61357+00	cert_lifecycle	bd4a92c4cc73fa0c1162911d109eea75ef4bc2383f368375b9d15f8f733b8392	6f9643d01bb725bafef96febfa7d0bd8a7cc61f79281852260f9f63b44273ce2
audit-1780544035512912234-461	actor-demo-anon	User	api_get	api	/api/v1/admin/est/profiles	{"path": "/api/v1/admin/est/profiles", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 2}	2026-06-04 03:33:55.512914+00	cert_lifecycle	6f9643d01bb725bafef96febfa7d0bd8a7cc61f79281852260f9f63b44273ce2	c44e295141d9f406a4f9a6e208ad36bbf810e8644ac986432879481c9ddb4468
audit-1780544035941184220-462	actor-demo-anon	User	api_get	api	/api/v1/admin/scep/profiles	{"path": "/api/v1/admin/scep/profiles", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 2}	2026-06-04 03:33:55.941187+00	cert_lifecycle	c44e295141d9f406a4f9a6e208ad36bbf810e8644ac986432879481c9ddb4468	2353414c0c43c521f688ab307b5ec97aecd568d080c720fe373a8a39e9dbdc29
audit-1780544036514069599-463	actor-demo-anon	User	api_get	api	/api/v1/renewal-policies	{"path": "/api/v1/renewal-policies", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 13}	2026-06-04 03:33:56.514072+00	cert_lifecycle	2353414c0c43c521f688ab307b5ec97aecd568d080c720fe373a8a39e9dbdc29	44a19a6e614dab0c937724341d1c2ca53d31ab4478d56138aacd172b01f9fb99
audit-1780544037192209717-464	actor-demo-anon	User	api_get	api	/api/v1/policies	{"path": "/api/v1/policies", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 8}	2026-06-04 03:33:57.192213+00	cert_lifecycle	44a19a6e614dab0c937724341d1c2ca53d31ab4478d56138aacd172b01f9fb99	f5829d854b12f63ff5c18428e4bf267830529f0ef7d3cbd1faead1056c27ee22
audit-1780544057981341386-465	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 03:34:17.981344+00	cert_lifecycle	f5829d854b12f63ff5c18428e4bf267830529f0ef7d3cbd1faead1056c27ee22	3b28c8451ca090bdc94f8f4f6915bc6310a057f3ead43d1e4716729ae2bef1c5
audit-1780544070598312983-466	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 3}	2026-06-04 03:34:30.598316+00	cert_lifecycle	3b28c8451ca090bdc94f8f4f6915bc6310a057f3ead43d1e4716729ae2bef1c5	1d0f9e648feb50b0dd6ec6fbb708dee7b32c5a789a21d60548012e9075b71908
audit-1780544087192243612-467	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 03:34:47.192246+00	cert_lifecycle	1d0f9e648feb50b0dd6ec6fbb708dee7b32c5a789a21d60548012e9075b71908	46a7d7e763f27d852d8c11cb6bc4294fa1e8d266067233278a32b2c60899e160
audit-1780544119530479331-468	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 7}	2026-06-04 03:35:19.530482+00	cert_lifecycle	46a7d7e763f27d852d8c11cb6bc4294fa1e8d266067233278a32b2c60899e160	573ede0d1c7ec943c0586bbe87a0850753f0f247fe6aa9eb809adeb760f10b2b
audit-1780544126622967062-469	actor-demo-anon	User	api_get	api	/api/v1/stats/certificates-by-status	{"path": "/api/v1/stats/certificates-by-status", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 6}	2026-06-04 03:35:26.62297+00	cert_lifecycle	573ede0d1c7ec943c0586bbe87a0850753f0f247fe6aa9eb809adeb760f10b2b	f935b4565113be8769bbf5015b39909ff4602f993f341ba91144a9b43e1dceef
audit-1780544126635246766-470	actor-demo-anon	User	api_get	api	/api/v1/stats/summary	{"path": "/api/v1/stats/summary", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 18}	2026-06-04 03:35:26.635249+00	cert_lifecycle	f935b4565113be8769bbf5015b39909ff4602f993f341ba91144a9b43e1dceef	a1268b78f43444538dbb58ffe12e7d67fbda999c561010861583719ae2126b28
audit-1780544158753245773-485	actor-demo-anon	User	api_get	api	/api/v1/network-scan-targets	{"path": "/api/v1/network-scan-targets", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 9}	2026-06-04 03:35:58.753249+00	cert_lifecycle	a089401681ab0867484097d7f3e1adefa3b990c3d05c63abc07d7a3dab25c6be	687d49653e6756007dfc90d9a28153204b2026c3cd3f1193fabe6ffcfc8ff425
audit-1780544163741007483-492	actor-demo-anon	User	api_get	api	/api/v1/auth/breakglass/credentials	{"path": "/api/v1/auth/breakglass/credentials", "method": "GET", "status": 404, "body_hash": "", "latency_ms": 4}	2026-06-04 03:36:03.74101+00	cert_lifecycle	0203092bf52fe4d676e42cb85e282b75bc550e782b2b0a60013de2e412ce3b4c	ae202b209a587adc95b9e01b1bfeda5648508b7a1a5a4277181f1a327aab6439
audit-1780544164261875450-493	actor-demo-anon	User	api_get	api	/api/v1/auth/bootstrap	{"path": "/api/v1/auth/bootstrap", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 0}	2026-06-04 03:36:04.261878+00	cert_lifecycle	ae202b209a587adc95b9e01b1bfeda5648508b7a1a5a4277181f1a327aab6439	54786c5ae6ca71cd0f0214ed8a5ac30fd0475f58d51a7238ef750903d80fadd6
audit-1780544166250354428-498	actor-demo-anon	User	api_get	api	/api/v1/auth/roles	{"path": "/api/v1/auth/roles", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 12}	2026-06-04 03:36:06.250357+00	cert_lifecycle	99da98b78f7de771d847aeabcf4735714eca80c9d318d9d1748a4aca29e57c2c	383e9d86bfa15873d1946169e759ecdd03a9db87149ed9a49cfc8eb34f6a4d04
audit-1780544167845616517-499	actor-demo-anon	Anonymous	auth.user_list	user		{"count": 0, "provider_filter": ""}	2026-06-04 03:36:07.845623+00	auth	383e9d86bfa15873d1946169e759ecdd03a9db87149ed9a49cfc8eb34f6a4d04	c87ad31e152b9b955d0648e245f8b4b05ffb85595453d78a8c123c0a8dd7e095
audit-1780544167848543815-500	actor-demo-anon	User	api_get	api	/api/v1/auth/users	{"path": "/api/v1/auth/users", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 6}	2026-06-04 03:36:07.848546+00	cert_lifecycle	c87ad31e152b9b955d0648e245f8b4b05ffb85595453d78a8c123c0a8dd7e095	8ff4363cdf8e8db4e535eb1cee478687aa04bac1e04aa2cc866f51ff7610a6de
audit-1780544172605096949-501	actor-demo-anon	User	api_get	api	/api/v1/auth/oidc/providers	{"path": "/api/v1/auth/oidc/providers", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:36:12.605099+00	cert_lifecycle	8ff4363cdf8e8db4e535eb1cee478687aa04bac1e04aa2cc866f51ff7610a6de	f143ea4d51c8752705449df894fc6c712d576b42ecd9165869dd06eba57f81e4
audit-1780544174788653101-502	actor-demo-anon	User	api_get	api	/api/v1/auth/sessions	{"path": "/api/v1/auth/sessions", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 7}	2026-06-04 03:36:14.788655+00	cert_lifecycle	f143ea4d51c8752705449df894fc6c712d576b42ecd9165869dd06eba57f81e4	4f59fa452488dd861ffdbf327b8d2e3cf6238c61d7b973bdfe4f97b9a58f80ce
audit-1780544175647668822-503	actor-demo-anon	User	api_get	api	/api/v1/metrics	{"path": "/api/v1/metrics", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 9}	2026-06-04 03:36:15.647671+00	cert_lifecycle	4f59fa452488dd861ffdbf327b8d2e3cf6238c61d7b973bdfe4f97b9a58f80ce	a72e6ef66f030061d7b5d4ca518869cf24e23ef63b99aa7bb783f44043d8de5e
audit-1780544126653908214-471	actor-demo-anon	User	api_get	api	/api/v1/jobs	{"path": "/api/v1/jobs", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 37}	2026-06-04 03:35:26.653911+00	cert_lifecycle	a1268b78f43444538dbb58ffe12e7d67fbda999c561010861583719ae2126b28	a420fe8b7e45f31f693234f6bc43847890801a64d980eac3e2d24caf703fbc90
audit-1780544131317329759-472	actor-demo-anon	User	api_get	api	/api/v1/issuers	{"path": "/api/v1/issuers", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:35:31.317332+00	cert_lifecycle	a420fe8b7e45f31f693234f6bc43847890801a64d980eac3e2d24caf703fbc90	73098283fe10ba8761a48d72cc4cdd91ad93058e1f41c79eb811a386691431f9
audit-1780544132056382140-473	actor-demo-anon	User	api_get	api	/api/v1/issuers	{"path": "/api/v1/issuers", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:35:32.056391+00	cert_lifecycle	73098283fe10ba8761a48d72cc4cdd91ad93058e1f41c79eb811a386691431f9	1172fc625ef165c6adadfc874edddb310de226bd61dfbb24da5be5c5cf3cd4cf
audit-1780544132234845032-474	actor-demo-anon	User	api_get	api	/api/v1/issuers	{"path": "/api/v1/issuers", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:35:32.234847+00	cert_lifecycle	1172fc625ef165c6adadfc874edddb310de226bd61dfbb24da5be5c5cf3cd4cf	115389a43bcfe377e73aae81a8b1aa24d8bb65ee485d4f47865d1bcf5767d6ef
audit-1780544132407013617-475	actor-demo-anon	User	api_get	api	/api/v1/issuers	{"path": "/api/v1/issuers", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 2}	2026-06-04 03:35:32.407016+00	cert_lifecycle	115389a43bcfe377e73aae81a8b1aa24d8bb65ee485d4f47865d1bcf5767d6ef	d3e402f4c022c404dc3b57d8e378debd86902c162c2a213014acf136a6bd095a
audit-1780544132589324129-476	actor-demo-anon	User	api_get	api	/api/v1/issuers	{"path": "/api/v1/issuers", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:35:32.589327+00	cert_lifecycle	d3e402f4c022c404dc3b57d8e378debd86902c162c2a213014acf136a6bd095a	41bb16381e1614dc288afb8e5f109a42b8fc28c98e1ccbbe86aed20980af4a13
audit-1780544132750783621-477	actor-demo-anon	User	api_get	api	/api/v1/issuers	{"path": "/api/v1/issuers", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 03:35:32.750786+00	cert_lifecycle	41bb16381e1614dc288afb8e5f109a42b8fc28c98e1ccbbe86aed20980af4a13	939b4ae30be4ba35dbcc127742768f226ea8f135dc836ed5cba3fe0c79031644
audit-1780544132900774928-478	actor-demo-anon	User	api_get	api	/api/v1/issuers	{"path": "/api/v1/issuers", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 03:35:32.900778+00	cert_lifecycle	939b4ae30be4ba35dbcc127742768f226ea8f135dc836ed5cba3fe0c79031644	f814483e5b9ac25e3c7c9fabd4fd37052050f2584bebbfbe4d96da4e4141c7e2
audit-1780544133087497566-479	actor-demo-anon	User	api_get	api	/api/v1/issuers	{"path": "/api/v1/issuers", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 2}	2026-06-04 03:35:33.0875+00	cert_lifecycle	f814483e5b9ac25e3c7c9fabd4fd37052050f2584bebbfbe4d96da4e4141c7e2	f93bcd2ca0c9c4e5b2aa7c21eed174073894f51dcfa34ecfe474a345c1654b54
audit-1780544133229726993-480	actor-demo-anon	User	api_get	api	/api/v1/issuers	{"path": "/api/v1/issuers", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:35:33.229729+00	cert_lifecycle	f93bcd2ca0c9c4e5b2aa7c21eed174073894f51dcfa34ecfe474a345c1654b54	f6e08fbea4bfec4d03923c6501672e20c416970532cd979f6660e4c6aa011d75
audit-1780544135417823639-481	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 18}	2026-06-04 03:35:35.417827+00	cert_lifecycle	f6e08fbea4bfec4d03923c6501672e20c416970532cd979f6660e4c6aa011d75	6fb05ba1e4a2a8be9486534d013f0ec15618babb85b5597fe4c50ed42b091633
audit-1780544150709750879-482	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 03:35:50.709754+00	cert_lifecycle	6fb05ba1e4a2a8be9486534d013f0ec15618babb85b5597fe4c50ed42b091633	bd995c0a0c4d7d3e2775f0d69834e1cbedfc7b45741e0c56c2b3866bac8c82a1
audit-1780544153731212379-483	actor-demo-anon	User	api_get	api	/api/v1/profiles	{"path": "/api/v1/profiles", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:35:53.731215+00	cert_lifecycle	bd995c0a0c4d7d3e2775f0d69834e1cbedfc7b45741e0c56c2b3866bac8c82a1	ec06bd1d6eac85c03c6100be5f91ea8ad49c3b331cad4e149e80c373adc1fb77
audit-1780544158072540369-484	actor-demo-anon	User	api_get	api	/api/v1/certificates	{"path": "/api/v1/certificates", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 6}	2026-06-04 03:35:58.072543+00	cert_lifecycle	ec06bd1d6eac85c03c6100be5f91ea8ad49c3b331cad4e149e80c373adc1fb77	a089401681ab0867484097d7f3e1adefa3b990c3d05c63abc07d7a3dab25c6be
audit-1780544158757006265-486	actor-demo-anon	User	api_get	api	/api/v1/network-scan/scep-probes	{"path": "/api/v1/network-scan/scep-probes", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 13}	2026-06-04 03:35:58.757009+00	cert_lifecycle	687d49653e6756007dfc90d9a28153204b2026c3cd3f1193fabe6ffcfc8ff425	87348e6ccce24d687f14dede510abf40232ae1addf55efee565ae57361716ae5
audit-1780544159394331700-487	actor-demo-anon	User	api_get	api	/api/v1/policies	{"path": "/api/v1/policies", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 03:35:59.394334+00	cert_lifecycle	87348e6ccce24d687f14dede510abf40232ae1addf55efee565ae57361716ae5	ef96a0c85db37b0272d85649f0a4b07fef475eea85a945d82eb12d45bdd4f0b3
audit-1780544159890850739-488	actor-demo-anon	User	api_get	api	/api/v1/renewal-policies	{"path": "/api/v1/renewal-policies", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 03:35:59.890854+00	cert_lifecycle	ef96a0c85db37b0272d85649f0a4b07fef475eea85a945d82eb12d45bdd4f0b3	837a93e0db10bbfde703eee058c47a64defbf11f7de64139b2386ee951272de7
audit-1780544160660122448-489	actor-demo-anon	User	api_get	api	/api/v1/admin/scep/profiles	{"path": "/api/v1/admin/scep/profiles", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 5}	2026-06-04 03:36:00.660126+00	cert_lifecycle	837a93e0db10bbfde703eee058c47a64defbf11f7de64139b2386ee951272de7	1c88a0bd4b2a2f3dd7dca4e5ce1e389ea5f4888f1c07e2db34503d58ded06a0a
audit-1780544161943286357-490	actor-demo-anon	User	api_get	api	/api/v1/admin/est/profiles	{"path": "/api/v1/admin/est/profiles", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 2}	2026-06-04 03:36:01.943289+00	cert_lifecycle	1c88a0bd4b2a2f3dd7dca4e5ce1e389ea5f4888f1c07e2db34503d58ded06a0a	01e22a0a9752e111eed97b9b237e661d3d5804892028353c1178dfdb2819f3d1
audit-1780544163730177328-491	actor-demo-anon	User	api_get	api	/api/v1/auth/me	{"path": "/api/v1/auth/me", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 12}	2026-06-04 03:36:03.730181+00	cert_lifecycle	01e22a0a9752e111eed97b9b237e661d3d5804892028353c1178dfdb2819f3d1	0203092bf52fe4d676e42cb85e282b75bc550e782b2b0a60013de2e412ce3b4c
audit-1780544164271588269-495	actor-demo-anon	User	api_get	api	/api/v1/auth/runtime-config	{"path": "/api/v1/auth/runtime-config", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 8}	2026-06-04 03:36:04.271591+00	cert_lifecycle	f3cb39ef72c13c7e4cc8b350e8ef261b4d399220da7d3596136184c83fd22e66	39cf2dae593bb3348ad29fb90b11cab1caaf246793ff8659dce57170c5b0e3a9
audit-1780544165473876591-496	actor-demo-anon	User	api_get	api	/api/v1/approvals	{"path": "/api/v1/approvals", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 03:36:05.473879+00	cert_lifecycle	39cf2dae593bb3348ad29fb90b11cab1caaf246793ff8659dce57170c5b0e3a9	0e45317b44cb7ee63ae4976adb0eac1f4f72273d2bdfbdd6b613357d8f6c9443
audit-1780544166236729435-497	actor-demo-anon	User	api_get	api	/api/v1/auth/keys	{"path": "/api/v1/auth/keys", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 11}	2026-06-04 03:36:06.236739+00	cert_lifecycle	0e45317b44cb7ee63ae4976adb0eac1f4f72273d2bdfbdd6b613357d8f6c9443	99da98b78f7de771d847aeabcf4735714eca80c9d318d9d1748a4aca29e57c2c
audit-1780544175664265459-504	actor-demo-anon	User	api_get	api	/api/v1/metrics/prometheus	{"path": "/api/v1/metrics/prometheus", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 15}	2026-06-04 03:36:15.664267+00	cert_lifecycle	a72e6ef66f030061d7b5d4ca518869cf24e23ef63b99aa7bb783f44043d8de5e	3cd8a17536ad8ec0ad131b17dd749d982dbeeb4522f8d8a9aea0ab5946ca72cd
audit-1780544176084558925-505	actor-demo-anon	User	api_get	api	/api/v1/digest/preview	{"path": "/api/v1/digest/preview", "method": "GET", "status": 503, "body_hash": "", "latency_ms": 3}	2026-06-04 03:36:16.084561+00	cert_lifecycle	3cd8a17536ad8ec0ad131b17dd749d982dbeeb4522f8d8a9aea0ab5946ca72cd	0ffc80f1b17b4358d7a8d3deb18e8df0f9f5bdb98ecf43f3078fd8e436fedd6c
audit-1780544176489347731-506	actor-demo-anon	User	api_get	api	/api/v1/notifications	{"path": "/api/v1/notifications", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 3}	2026-06-04 03:36:16.48935+00	cert_lifecycle	0ffc80f1b17b4358d7a8d3deb18e8df0f9f5bdb98ecf43f3078fd8e436fedd6c	aae69786d38625ec8951af0b4d840ea230612fc53f2253317a27679c012a4cfe
audit-1780544182214564187-507	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 7}	2026-06-04 03:36:22.214567+00	cert_lifecycle	aae69786d38625ec8951af0b4d840ea230612fc53f2253317a27679c012a4cfe	1a061cf32790bc94c1ccfe74f1896a31940460b7d9857303ca0ba9bdf589c773
audit-1780544199543259676-508	actor-demo-anon	User	api_get	api	/api/v1/issuers	{"path": "/api/v1/issuers", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 03:36:39.543262+00	cert_lifecycle	1a061cf32790bc94c1ccfe74f1896a31940460b7d9857303ca0ba9bdf589c773	4178313dcd908f57a16fcfc4a2cc1d6f6752c1e1c2a98255b711a25af33bf73c
audit-1780544201193610590-509	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 15}	2026-06-04 03:36:41.193613+00	cert_lifecycle	4178313dcd908f57a16fcfc4a2cc1d6f6752c1e1c2a98255b711a25af33bf73c	cf16a0fec7568b3e2cd84f03b94a33f5d4d8ad34923574ea3e26e76d2304b709
audit-1780544212833501750-510	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 03:36:52.833504+00	cert_lifecycle	cf16a0fec7568b3e2cd84f03b94a33f5d4d8ad34923574ea3e26e76d2304b709	d8cfa756e3ef3cc3c920ed601d498a67cea68cdf4791833a924d2d7af74ec238
audit-1780544245383587543-511	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 03:37:25.38359+00	cert_lifecycle	d8cfa756e3ef3cc3c920ed601d498a67cea68cdf4791833a924d2d7af74ec238	f8370d811b8c9da40d6d0740dff6a41fee0558348643e7a67495b3ba2bdf3d03
audit-1780544261725711899-512	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 5}	2026-06-04 03:37:41.725714+00	cert_lifecycle	f8370d811b8c9da40d6d0740dff6a41fee0558348643e7a67495b3ba2bdf3d03	42d071734407982abf382a9cddb50cdc893cb295bb44dfdcd0535606b67209b5
audit-1780544272753764280-513	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 03:37:52.753766+00	cert_lifecycle	42d071734407982abf382a9cddb50cdc893cb295bb44dfdcd0535606b67209b5	fa171cc8f86e4ca09518f8a5673fb3f38cb081b392205443598bf96dd99ec488
audit-1780544290349698392-514	system	System	job_retry	job	job-1780541450025945339-161	{"attempts": 0, "new_status": "Pending", "old_status": "Failed", "max_attempts": 3}	2026-06-04 03:38:10.349703+00	cert_lifecycle	fa171cc8f86e4ca09518f8a5673fb3f38cb081b392205443598bf96dd99ec488	c714e87b00d44e56b1d4dcdc586ce27d52790fe7414293cdd287a08f1b48a811
audit-1780544299017161337-516	system	System	renewal_job_failed	certificate	mc-wildcard-prod	{"error": "failed to create ACME order: 400 urn:ietf:params:acme:error:malformed: Unable to validate JWS :: No Key ID in JWS header", "job_id": "job-1780541450025945339-161"}	2026-06-04 03:38:19.017167+00	cert_lifecycle	c714e87b00d44e56b1d4dcdc586ce27d52790fe7414293cdd287a08f1b48a811	bb13d5e7539eea4d2ad73dcc42149f731377b8d3255c44fef1c092aa438cac34
audit-1780544302763492214-517	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 03:38:22.763494+00	cert_lifecycle	bb13d5e7539eea4d2ad73dcc42149f731377b8d3255c44fef1c092aa438cac34	06c5fb2d34fc94db63d72f77a4334d92eb9c03369cffef324cd3e401dc3a068e
audit-1780544319188513799-518	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 15}	2026-06-04 03:38:39.188517+00	cert_lifecycle	06c5fb2d34fc94db63d72f77a4334d92eb9c03369cffef324cd3e401dc3a068e	4396c2d27564243a8d19c11742c3a1ff19bdf9cfa98c222e50aec9c3129698ce
audit-1780544333745684285-519	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 03:38:53.745686+00	cert_lifecycle	4396c2d27564243a8d19c11742c3a1ff19bdf9cfa98c222e50aec9c3129698ce	5b8debd7e0629cac2ac0ec581c203b0ae7b4c91cbf47555c157dbe38a414d808
audit-1780544351673143806-520	system	System	job_offline_agent_reap	job	job-ren-150	{"agent_id": "ag-data-prod", "new_status": "Failed", "old_status": "Running", "timeout_reason": "agent_offline"}	2026-06-04 03:39:11.673148+00	cert_lifecycle	5b8debd7e0629cac2ac0ec581c203b0ae7b4c91cbf47555c157dbe38a414d808	e4558bed89e0f4da4b7acf750c9d59c98eb3d2eb37c55c2e0c11127edec6d32a
audit-1780544351678583325-521	system	System	job_offline_agent_reap	job	job-approval-01	{"agent_id": "ag-web-prod", "new_status": "Failed", "old_status": "Running", "timeout_reason": "agent_offline"}	2026-06-04 03:39:11.678588+00	cert_lifecycle	e4558bed89e0f4da4b7acf750c9d59c98eb3d2eb37c55c2e0c11127edec6d32a	3028a8acc3967ad9521b996999601964e49fc5f639c3dff0fdd3c7fc8fc4dbe3
audit-1780544351684825018-522	system	System	job_offline_agent_reap	job	job-approval-02	{"agent_id": "ag-web-prod", "new_status": "Failed", "old_status": "Running", "timeout_reason": "agent_offline"}	2026-06-04 03:39:11.684829+00	cert_lifecycle	3028a8acc3967ad9521b996999601964e49fc5f639c3dff0fdd3c7fc8fc4dbe3	8d21b4a4b82d74c640b48219bbf73aef67e05b15a91c49c4bfe50df6ecab0323
audit-1780544365754634632-523	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 4}	2026-06-04 03:39:25.754637+00	cert_lifecycle	8d21b4a4b82d74c640b48219bbf73aef67e05b15a91c49c4bfe50df6ecab0323	115e307c47c83fecd49a8d414d648ae18fd139c099b9bf6f383a42f93e6d2667
audit-1780544378448636109-524	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 16}	2026-06-04 03:39:38.448639+00	cert_lifecycle	115e307c47c83fecd49a8d414d648ae18fd139c099b9bf6f383a42f93e6d2667	66cbc3cae8a4e15b4c78c9d3c0b1646ae9573a5e4d3d49e33a918b28ad3aa6f7
audit-1780544396298198902-525	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 6}	2026-06-04 03:39:56.298202+00	cert_lifecycle	66cbc3cae8a4e15b4c78c9d3c0b1646ae9573a5e4d3d49e33a918b28ad3aa6f7	e726daa4e36b34e2d4faed0f31717a01944335b47876ef0f93a903e7a2d82533
audit-1780544426764617471-526	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 9}	2026-06-04 03:40:26.76462+00	cert_lifecycle	e726daa4e36b34e2d4faed0f31717a01944335b47876ef0f93a903e7a2d82533	d8e0d3f0936d9e05c9f78365196f8e7e678b27901b5bc84e7ab393e91299f91a
audit-1780544443485297535-527	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 15}	2026-06-04 03:40:43.4853+00	cert_lifecycle	d8e0d3f0936d9e05c9f78365196f8e7e678b27901b5bc84e7ab393e91299f91a	860fc6c55bb663ba91bd9ef0f65514d8dc65a0aaee69fc1312349fef71ee83de
audit-1780544458549355103-528	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 7}	2026-06-04 03:40:58.549358+00	cert_lifecycle	860fc6c55bb663ba91bd9ef0f65514d8dc65a0aaee69fc1312349fef71ee83de	958ee853cc9abdf5b6c38dff60026fdabb871eeea30aef4fb6677d8dd4e12df7
audit-1780544489351916575-529	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 10}	2026-06-04 03:41:29.351919+00	cert_lifecycle	958ee853cc9abdf5b6c38dff60026fdabb871eeea30aef4fb6677d8dd4e12df7	440aa27e075d010d479e61780497cc10a8ca5402f03932577dca54e4dac4a7a1
audit-1780544505176033519-530	actor-demo-anon	User	api_post	api	/api/v1/agents/agent-demo-1/heartbeat	{"path": "/api/v1/agents/agent-demo-1/heartbeat", "method": "POST", "status": 200, "body_hash": "542936e8ea8f1f97cd2fbc793b34403e9e70bf1a15d9e3315eb4fc5c3188f1e8", "latency_ms": 54}	2026-06-04 03:41:45.176037+00	cert_lifecycle	440aa27e075d010d479e61780497cc10a8ca5402f03932577dca54e4dac4a7a1	00e3104882b95e868f1a535aeeceebe64aad5e97da68fea06a575b2b46c4fbcd
audit-1780544521849494677-531	actor-demo-anon	User	api_get	api	/api/v1/agents/agent-demo-1/work	{"path": "/api/v1/agents/agent-demo-1/work", "method": "GET", "status": 200, "body_hash": "", "latency_ms": 8}	2026-06-04 03:42:01.849497+00	cert_lifecycle	00e3104882b95e868f1a535aeeceebe64aad5e97da68fea06a575b2b46c4fbcd	051d7a8d9a30dfbe249d383deddc020a6322090d8ac5580b468190fbcea84f85
audit-1780544764979117861-1	system	System	auth.demo_residual_grants_detected	actor_roles	actor-demo-anon	{"residue": ["r-admin@global (granted 2026-06-04T02:40:21Z)"], "auth_type": "api-key", "residue_count": 1}	2026-06-04 03:46:04.979119+00	auth	051d7a8d9a30dfbe249d383deddc020a6322090d8ac5580b468190fbcea84f85	06933249f02f0c3c8f243c2ff58022e1627a0bd4614fcdb46128d0921901dd2f
audit-1780544765241586017-2	system	System	job_retry	job	job-1780541450025945339-161	{"attempts": 0, "new_status": "Pending", "old_status": "Failed", "max_attempts": 3}	2026-06-04 03:46:05.241593+00	cert_lifecycle	06933249f02f0c3c8f243c2ff58022e1627a0bd4614fcdb46128d0921901dd2f	89bead4df2725e17aa4a6c5663d6a2e13171c730d5ac1ef2117b5602d96e694f
audit-1780544765247490957-3	system	System	job_retry	job	job-approval-02	{"attempts": 0, "new_status": "Pending", "old_status": "Failed", "max_attempts": 3}	2026-06-04 03:46:05.247497+00	cert_lifecycle	89bead4df2725e17aa4a6c5663d6a2e13171c730d5ac1ef2117b5602d96e694f	09e8f6df7d6a87ed4b3cb366f15caafc74f630a9ee3ed1fac8e5823129b8bdaf
audit-1780544765252725561-4	system	System	job_retry	job	job-approval-01	{"attempts": 0, "new_status": "Pending", "old_status": "Failed", "max_attempts": 3}	2026-06-04 03:46:05.252732+00	cert_lifecycle	09e8f6df7d6a87ed4b3cb366f15caafc74f630a9ee3ed1fac8e5823129b8bdaf	016caa6a8a3eea450033ef885d0f114a5965c1b32f0a15b700085712e829d52c
audit-1780544765257728265-5	system	System	job_retry	job	job-ren-150	{"attempts": 1, "new_status": "Pending", "old_status": "Failed", "max_attempts": 3}	2026-06-04 03:46:05.257734+00	cert_lifecycle	016caa6a8a3eea450033ef885d0f114a5965c1b32f0a15b700085712e829d52c	fa05c168c91deedd563f8c54fcdc7307d9c64bdcf7fac7bf2ce324bf7f94bbd8
\.


--
-- Data for Name: breakglass_credentials; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.breakglass_credentials (id, tenant_id, actor_id, password_hash, created_at, last_password_change_at, failure_count, locked_until, last_failure_at) FROM stdin;
\.


--
-- Data for Name: certificate_profiles; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.certificate_profiles (id, name, description, allowed_key_algorithms, max_ttl_seconds, allowed_ekus, required_san_patterns, spiffe_uri_pattern, allow_short_lived, enabled, created_at, updated_at, required_csr_attributes, must_staple, acme_auth_mode, requires_approval) FROM stdin;
prof-standard-tls	Standard TLS	Default profile for web-facing TLS certificates. Requires ECDSA P-256+ or RSA 2048+.	[{"min_size": 256, "algorithm": "ECDSA"}, {"min_size": 2048, "algorithm": "RSA"}]	7776000	["serverAuth"]	[]		f	t	2025-12-06 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	[]	f	trust_authenticated	f
prof-internal-mtls	Internal mTLS	Mutual TLS profile for internal service-to-service communication.	[{"min_size": 256, "algorithm": "ECDSA"}]	2592000	["serverAuth", "clientAuth"]	[".*\\\\.internal\\\\.example\\\\.com$"]		f	t	2026-01-05 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	[]	f	trust_authenticated	f
prof-short-lived	Short-Lived Credential	Ephemeral certificates for CI/CD pipelines and container workloads. TTL under 1 hour, expiry = revocation.	[{"min_size": 256, "algorithm": "ECDSA"}]	300	["serverAuth", "clientAuth"]	[]	spiffe://example.com/workload/*	t	t	2026-02-04 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	[]	f	trust_authenticated	f
prof-high-security	High Security	For PCI-DSS and compliance-sensitive workloads. RSA 4096+ or ECDSA P-384+ only.	[{"min_size": 384, "algorithm": "ECDSA"}, {"min_size": 4096, "algorithm": "RSA"}]	4060800	["serverAuth"]	[".*\\\\.example\\\\.com$"]		f	t	2026-03-06 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	[]	f	trust_authenticated	f
prof-smime	S/MIME Email	S/MIME certificate profile for email signing and encryption. Requires emailProtection EKU.	[{"min_size": 256, "algorithm": "ECDSA"}, {"min_size": 2048, "algorithm": "RSA"}]	31536000	["emailProtection"]	[]		f	t	2026-04-05 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	[]	f	trust_authenticated	f
\.


--
-- Data for Name: certificate_revocations; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.certificate_revocations (id, certificate_id, serial_number, reason, revoked_by, revoked_at, issuer_id, issuer_notified, created_at) FROM stdin;
cr-compro-01	mc-compromised	0A:1B:2C:3D:4E:5F:00:14	keyCompromise	bob@example.com	2026-05-21 02:40:21.589496+00	iss-local	t	2026-05-21 02:40:21.589496+00
\.


--
-- Data for Name: certificate_target_mappings; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.certificate_target_mappings (certificate_id, target_id) FROM stdin;
mc-api-prod	tgt-nginx-prod
mc-api-prod	tgt-haproxy-prod
mc-web-prod	tgt-nginx-prod
mc-web-prod	tgt-haproxy-prod
mc-pay-prod	tgt-nginx-prod
mc-pay-prod	tgt-haproxy-prod
mc-dash-prod	tgt-nginx-prod
mc-data-prod	tgt-nginx-data
mc-auth-prod	tgt-nginx-prod
mc-auth-prod	tgt-haproxy-prod
mc-cdn-prod	tgt-haproxy-prod
mc-mail-prod	tgt-nginx-prod
mc-legacy-prod	tgt-iis-prod
mc-blog-prod	tgt-nginx-prod
mc-docs-prod	tgt-nginx-prod
mc-status-prod	tgt-nginx-prod
mc-grpc-prod	tgt-nginx-prod
mc-vault-prod	tgt-nginx-prod
mc-search-prod	tgt-nginx-data
mc-admin-prod	tgt-nginx-prod
mc-shop-prod	tgt-nginx-prod
mc-shop-prod	tgt-haproxy-prod
mc-ci-prod	tgt-nginx-prod
mc-edge-eu	tgt-caddy-prod
mc-k8s-ingress	tgt-traefik-prod
mc-api-stg	tgt-nginx-staging
mc-web-stg	tgt-nginx-staging
mc-pay-stg	tgt-nginx-staging
mc-grafana-prod	tgt-nginx-data
mc-vpn-prod	tgt-haproxy-prod
mc-wildcard-prod	tgt-nginx-prod
mc-wildcard-prod	tgt-haproxy-prod
mc-wildcard-prod	tgt-nginx-staging
mc-compromised	tgt-nginx-prod
\.


--
-- Data for Name: certificate_versions; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.certificate_versions (id, certificate_id, serial_number, not_before, not_after, fingerprint_sha256, pem_chain, csr_pem, created_at, key_algorithm, key_size) FROM stdin;
cv-api-v3	mc-api-prod	0A:1B:2C:3D:4E:5F:00:01	2026-05-20 02:40:21.589496+00	2026-08-18 02:40:21.589496+00	sha256:ab12cd34ef5600	-----BEGIN CERTIFICATE-----\\nMIIDemoAPI...\\n-----END CERTIFICATE-----	\N	2026-05-20 02:40:21.589496+00		0
cv-api-v2	mc-api-prod	0A:1B:2C:3D:4E:5F:AA:01	2026-02-19 02:40:21.589496+00	2026-05-20 02:40:21.589496+00	sha256:ab12cd34ef5601	-----BEGIN CERTIFICATE-----\\nMIIDemoAPIv2...\\n-----END CERTIFICATE-----	\N	2026-02-19 02:40:21.589496+00		0
cv-web-v2	mc-web-prod	0A:1B:2C:3D:4E:5F:00:02	2026-05-05 02:40:21.589496+00	2026-08-03 02:40:21.589496+00	sha256:cd34ef56ab1200	-----BEGIN CERTIFICATE-----\\nMIIDemoWeb...\\n-----END CERTIFICATE-----	\N	2026-05-05 02:40:21.589496+00		0
cv-pay-v4	mc-pay-prod	0A:1B:2C:3D:4E:5F:00:03	2026-04-15 02:40:21.589496+00	2026-07-14 02:40:21.589496+00	sha256:ef56ab12cd3400	-----BEGIN CERTIFICATE-----\\nMIIDemoPay...\\n-----END CERTIFICATE-----	\N	2026-04-15 02:40:21.589496+00		0
cv-auth-v5	mc-auth-prod	0A:1B:2C:3D:4E:5F:00:04	2026-03-18 02:40:21.589496+00	2026-06-16 02:40:21.589496+00	sha256:1234abcdef5600	-----BEGIN CERTIFICATE-----\\nMIIDemoAuth...\\n-----END CERTIFICATE-----	\N	2026-03-18 02:40:21.589496+00		0
cv-wild-v3	mc-wildcard-prod	0A:1B:2C:3D:4E:5F:00:05	2026-04-25 02:40:21.589496+00	2026-07-24 02:40:21.589496+00	sha256:5678abcdef1200	-----BEGIN CERTIFICATE-----\\nMIIDemoWild...\\n-----END CERTIFICATE-----	\N	2026-04-25 02:40:21.589496+00		0
cv-dash-v2	mc-dash-prod	0A:1B:2C:3D:4E:5F:00:06	2026-05-27 02:40:21.589496+00	2026-08-25 02:40:21.589496+00	sha256:dash12345600	-----BEGIN CERTIFICATE-----\\nMIIDemoDash...\\n-----END CERTIFICATE-----	\N	2026-05-27 02:40:21.589496+00		0
cv-data-v3	mc-data-prod	0A:1B:2C:3D:4E:5F:00:07	2026-04-30 02:40:21.589496+00	2026-07-29 02:40:21.589496+00	sha256:data12345600	-----BEGIN CERTIFICATE-----\\nMIIDemoData...\\n-----END CERTIFICATE-----	\N	2026-04-30 02:40:21.589496+00		0
cv-blog-v2	mc-blog-prod	0A:1B:2C:3D:4E:5F:00:08	2026-04-27 02:40:21.589496+00	2026-07-26 02:40:21.589496+00	sha256:blog12345600	-----BEGIN CERTIFICATE-----\\nMIIDemoBlog...\\n-----END CERTIFICATE-----	\N	2026-04-27 02:40:21.589496+00		0
cv-grpc-v2	mc-grpc-prod	0A:1B:2C:3D:4E:5F:00:09	2026-05-03 02:40:21.589496+00	2026-08-01 02:40:21.589496+00	sha256:grpc12345600	-----BEGIN CERTIFICATE-----\\nMIIDemoGRPC...\\n-----END CERTIFICATE-----	\N	2026-05-03 02:40:21.589496+00		0
cv-shop-v1	mc-shop-prod	0A:1B:2C:3D:4E:5F:00:10	2026-04-19 02:40:21.589496+00	2026-07-18 02:40:21.589496+00	sha256:shop12345600	-----BEGIN CERTIFICATE-----\\nMIIDemoShop...\\n-----END CERTIFICATE-----	\N	2026-04-19 02:40:21.589496+00		0
cv-edge-v1	mc-edge-eu	0A:1B:2C:3D:4E:5F:00:11	2026-05-06 02:40:21.589496+00	2026-08-04 02:40:21.589496+00	sha256:edge12345600	-----BEGIN CERTIFICATE-----\\nMIIDemoEdge...\\n-----END CERTIFICATE-----	\N	2026-05-06 02:40:21.589496+00		0
cv-k8s-v1	mc-k8s-ingress	0A:1B:2C:3D:4E:5F:00:12	2026-05-01 02:40:21.589496+00	2026-07-30 02:40:21.589496+00	sha256:k8si12345600	-----BEGIN CERTIFICATE-----\\nMIIDemoK8s...\\n-----END CERTIFICATE-----	\N	2026-05-01 02:40:21.589496+00		0
cv-vpn-v2	mc-vpn-prod	0A:1B:2C:3D:4E:5F:00:13	2026-03-06 02:40:21.589496+00	2026-06-05 02:40:21.589496+00	sha256:vpn012345600	-----BEGIN CERTIFICATE-----\\nMIIDemoVPN...\\n-----END CERTIFICATE-----	\N	2026-03-06 02:40:21.589496+00		0
cv-compro-v1	mc-compromised	0A:1B:2C:3D:4E:5F:00:14	2026-04-05 02:40:21.589496+00	2026-07-04 02:40:21.589496+00	sha256:comp12345600	-----BEGIN CERTIFICATE-----\\nMIIDemoComp...\\n-----END CERTIFICATE-----	\N	2026-04-05 02:40:21.589496+00		0
cv-smime-v1	mc-smime-bob	0A:1B:2C:3D:4E:5F:00:15	2026-03-31 02:40:21.589496+00	2027-03-31 02:40:21.589496+00	sha256:smime1234560	-----BEGIN CERTIFICATE-----\\nMIIDemoSMIME...\\n-----END CERTIFICATE-----	\N	2026-03-31 02:40:21.589496+00		0
\.


--
-- Data for Name: crl_cache; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.crl_cache (issuer_id, crl_der, crl_number, this_update, next_update, generated_at, generation_duration_ms, revoked_count, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: crl_generation_events; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.crl_generation_events (id, issuer_id, crl_number, duration_ms, revoked_count, started_at, succeeded, error) FROM stdin;
\.


--
-- Data for Name: deployment_targets; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.deployment_targets (id, name, type, agent_id, config, enabled, created_at, updated_at, encrypted_config, last_tested_at, test_status, source, retired_at, retired_reason) FROM stdin;
tgt-nginx-prod	NGINX Production	NGINX	ag-web-prod	{"key_path": "/etc/nginx/ssl/key.pem", "cert_path": "/etc/nginx/ssl/cert.pem", "reload_command": "nginx -s reload"}	t	2026-02-04 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	\N	\N	untested	database	\N	\N
tgt-nginx-staging	NGINX Staging	NGINX	ag-web-staging	{"key_path": "/etc/nginx/ssl/key.pem", "cert_path": "/etc/nginx/ssl/cert.pem", "reload_command": "nginx -s reload"}	t	2026-03-06 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	\N	\N	untested	database	\N	\N
tgt-haproxy-prod	HAProxy Production	HAProxy	ag-lb-prod	{"reload_command": "systemctl reload haproxy", "combined_pem_path": "/etc/haproxy/ssl/site.pem"}	t	2026-01-05 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	\N	\N	untested	database	\N	\N
tgt-apache-prod	Apache Production	Apache	ag-web-prod	{"key_path": "/etc/httpd/ssl/key.pem", "cert_path": "/etc/httpd/ssl/cert.pem", "chain_path": "/etc/httpd/ssl/chain.pem", "reload_command": "apachectl graceful"}	t	2026-02-24 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	\N	\N	untested	database	\N	\N
tgt-iis-prod	IIS Production	IIS	ag-iis-prod	{"site_name": "Default Web Site", "binding_info": "*:443:"}	t	2026-04-05 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	\N	\N	untested	database	\N	\N
tgt-traefik-prod	Traefik Production	Traefik	ag-k8s-prod	{"watch_dir": "/etc/traefik/dynamic/certs"}	t	2026-05-05 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	\N	\N	untested	database	\N	\N
tgt-caddy-prod	Caddy Production	Caddy	ag-edge-01	{"mode": "api", "admin_url": "http://localhost:2019"}	t	2026-04-20 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	\N	\N	untested	database	\N	\N
tgt-nginx-data	NGINX Data Services	NGINX	ag-data-prod	{"key_path": "/etc/nginx/ssl/key.pem", "cert_path": "/etc/nginx/ssl/cert.pem", "reload_command": "nginx -s reload"}	t	2026-03-06 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	\N	\N	untested	database	\N	\N
tgt-aws-acm-prod	AWS ACM Production	AWSACM	cloud-aws-sm	{"tags": {"app": "api-gateway", "env": "production"}, "region": "us-east-1"}	t	2026-05-28 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	\N	\N	untested	database	\N	\N
tgt-azure-kv-prod	Azure KeyVault Prod	AzureKeyVault	cloud-azure-kv	{"tags": {"env": "production"}, "vault_url": "https://prod-vault.vault.azure.net", "credential_mode": "managed_identity", "certificate_name": "api-prod"}	t	2026-05-28 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	\N	\N	untested	database	\N	\N
\.


--
-- Data for Name: discovered_certificates; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.discovered_certificates (id, fingerprint_sha256, common_name, sans, serial_number, issuer_dn, subject_dn, not_before, not_after, key_algorithm, key_size, is_ca, pem_data, source_path, source_format, agent_id, discovery_scan_id, managed_certificate_id, status, first_seen_at, last_seen_at, dismissed_at, created_at, updated_at) FROM stdin;
dc-unmanaged-01	sha256:f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0	internal-service.example.com	{internal-service.example.com,internal-svc.local}	1A:2B:3C:4D:5E:6F:00:11	CN=Example Internal CA,O=Example Corp	CN=internal-service.example.com,O=Example Corp	2025-11-16 02:40:21.589496+00	2026-06-24 02:40:21.589496+00	RSA	2048	f		/etc/pki/tls/certs/internal-svc.pem	PEM	ag-web-prod	ds-web-prod-01	\N	Unmanaged	2026-04-05 02:40:21.589496+00	2026-06-03 23:40:21.589496+00	\N	2026-06-04 02:40:21.589496+00	2026-06-04 02:40:21.589496+00
dc-unmanaged-02	sha256:a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0	monitoring.internal.example.com	{monitoring.internal.example.com,prometheus.internal.example.com}	2B:3C:4D:5E:6F:7A:00:22	CN=Let's Encrypt Authority X3,O=Let's Encrypt	CN=monitoring.internal.example.com	2026-04-05 02:40:21.589496+00	2026-07-04 02:40:21.589496+00	ECDSA	256	f		/opt/certs/monitoring.pem	PEM	ag-data-prod	ds-data-prod-01	\N	Unmanaged	2026-04-20 02:40:21.589496+00	2026-06-04 00:40:21.589496+00	\N	2026-06-04 02:40:21.589496+00	2026-06-04 02:40:21.589496+00
dc-unmanaged-03	sha256:1122334455667788990011223344556677889900	db-replication.example.com	{db-replication.example.com}	3C:4D:5E:6F:7A:8B:00:33	CN=Example Internal CA,O=Example Corp	CN=db-replication.example.com,O=Example Corp	2025-08-08 02:40:21.589496+00	2026-05-25 02:40:21.589496+00	RSA	4096	f		/etc/pki/tls/certs/db-repl.pem	PEM	ag-web-prod	ds-web-prod-01	\N	Unmanaged	2026-04-05 02:40:21.589496+00	2026-06-03 23:40:21.589496+00	\N	2026-06-04 02:40:21.589496+00	2026-06-04 02:40:21.589496+00
dc-unmanaged-04	sha256:aabb001122334455667788990011223344aabb00	redis-tls.internal.example.com	{redis-tls.internal.example.com}	4D:5E:6F:7A:8B:9C:00:44	CN=Example Internal CA,O=Example Corp	CN=redis-tls.internal.example.com,O=Example Corp	2026-03-06 02:40:21.589496+00	2026-08-03 02:40:21.589496+00	ECDSA	256	f		/opt/certs/redis-tls.pem	PEM	ag-data-prod	ds-data-prod-01	\N	Unmanaged	2026-04-20 02:40:21.589496+00	2026-06-04 00:40:21.589496+00	\N	2026-06-04 02:40:21.589496+00	2026-06-04 02:40:21.589496+00
dc-managed-01	sha256:ab12cd34ef56ab12cd34ef56ab12cd34ef56ab12	api.example.com	{api.example.com,api-v2.example.com}	0A:1B:2C:3D:4E:5F:00:01	CN=CertCtl Demo CA	CN=api.example.com	2026-05-20 02:40:21.589496+00	2026-08-18 02:40:21.589496+00	ECDSA	256	f		/etc/nginx/ssl/cert.pem	PEM	ag-web-prod	ds-web-prod-01	mc-api-prod	Managed	2026-04-05 02:40:21.589496+00	2026-06-03 23:40:21.589496+00	\N	2026-06-04 02:40:21.589496+00	2026-06-04 02:40:21.589496+00
dc-managed-02	sha256:cd34ef56ab12cd34ef56ab12cd34ef56ab12cd34	data.example.com	{data.example.com,analytics.example.com}	0A:1B:2C:3D:4E:5F:00:07	CN=CertCtl Demo CA	CN=data.example.com	2026-04-30 02:40:21.589496+00	2026-07-29 02:40:21.589496+00	ECDSA	256	f		/etc/nginx/ssl/cert.pem	PEM	ag-data-prod	ds-data-prod-01	mc-data-prod	Managed	2026-04-20 02:40:21.589496+00	2026-06-04 00:40:21.589496+00	\N	2026-06-04 02:40:21.589496+00	2026-06-04 02:40:21.589496+00
dc-dismissed-01	sha256:9988776655443322110099887766554433221100	test-selfsigned.local	{test-selfsigned.local,localhost}	00:00:00:00:00:00:FF:01	CN=test-selfsigned.local	CN=test-selfsigned.local	2025-06-04 02:40:21.589496+00	2027-06-04 02:40:21.589496+00	RSA	2048	f		/etc/pki/tls/certs/test.pem	PEM	ag-web-prod	ds-web-hist-01	\N	Dismissed	2026-04-05 02:40:21.589496+00	2026-06-03 23:40:21.589496+00	\N	2026-06-04 02:40:21.589496+00	2026-06-04 02:40:21.589496+00
dc-network-01	sha256:net1aabbccdd11223344556677889900aabbccdd	switch-mgmt.example.com	{switch-mgmt.example.com}	5E:6F:7A:8B:9C:0D:00:44	CN=Example Network CA,O=Example Corp	CN=switch-mgmt.example.com,O=Example Corp	2025-12-06 02:40:21.589496+00	2026-06-09 02:40:21.589496+00	RSA	2048	f		10.0.1.50:443	TLS	server-scanner	ds-net-prod-01	\N	Unmanaged	2026-05-28 02:40:21.589496+00	2026-06-04 01:40:21.589496+00	\N	2026-06-04 02:40:21.589496+00	2026-06-04 02:40:21.589496+00
dc-network-02	sha256:net2eeff00112233445566778899aabbccddeeff	printer.example.com	{printer.example.com}	6F:7A:8B:9C:0D:1E:00:55	CN=printer.example.com	CN=printer.example.com	2025-04-30 02:40:21.589496+00	2026-05-05 02:40:21.589496+00	RSA	1024	f		10.0.2.100:443	TLS	server-scanner	ds-net-prod-01	\N	Unmanaged	2026-05-28 02:40:21.589496+00	2026-06-04 01:40:21.589496+00	\N	2026-06-04 02:40:21.589496+00	2026-06-04 02:40:21.589496+00
dc-network-03	sha256:net3001122334455667788990011223344556677	vpn-appliance.example.com	{vpn-appliance.example.com,10.0.1.1}	7A:8B:9C:0D:1E:2F:00:66	CN=Fortinet CA,O=Fortinet	CN=vpn-appliance.example.com	2026-03-06 02:40:21.589496+00	2027-03-06 02:40:21.589496+00	RSA	2048	f		10.0.1.1:443	TLS	server-scanner	ds-net-prod-01	\N	Unmanaged	2026-05-28 02:40:21.589496+00	2026-06-04 01:40:21.589496+00	\N	2026-06-04 02:40:21.589496+00	2026-06-04 02:40:21.589496+00
dc-network-04	sha256:net400112233445566778899001122334455aabb	ilo-server-rack3.example.com	{ilo-server-rack3.example.com}	8B:9C:0D:1E:2F:3A:00:77	CN=iLO Default Issuer	CN=ilo-server-rack3.example.com	2024-06-04 02:40:21.589496+00	2025-06-04 02:40:21.589496+00	RSA	2048	f		10.0.1.80:443	TLS	server-scanner	ds-net-prod-01	\N	Unmanaged	2026-06-04 01:40:21.589496+00	2026-06-04 01:40:21.589496+00	\N	2026-06-04 02:40:21.589496+00	2026-06-04 02:40:21.589496+00
dc-network-05	sha256:net500aabbccdd11223344556677889900112233	nas-backup.example.com	{nas-backup.example.com}	9C:0D:1E:2F:3A:4B:00:88	CN=Synology Inc CA,O=Synology Inc.	CN=nas-backup.example.com	2025-12-06 02:40:21.589496+00	2026-12-01 02:40:21.589496+00	RSA	2048	f		10.0.1.90:5001	TLS	server-scanner	ds-net-prod-01	\N	Unmanaged	2026-06-04 01:40:21.589496+00	2026-06-04 01:40:21.589496+00	\N	2026-06-04 02:40:21.589496+00	2026-06-04 02:40:21.589496+00
\.


--
-- Data for Name: discovery_scans; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.discovery_scans (id, agent_id, directories, certificates_found, certificates_new, errors_count, scan_duration_ms, started_at, completed_at) FROM stdin;
ds-web-hist-01	ag-web-prod	{/etc/nginx/ssl,/etc/pki/tls/certs}	3	3	0	1100	2026-04-05 02:40:21.589496+00	2026-04-05 02:40:22.589496+00
ds-web-hist-02	ag-web-prod	{/etc/nginx/ssl,/etc/pki/tls/certs}	4	1	0	1200	2026-05-05 02:40:21.589496+00	2026-05-05 02:40:22.589496+00
ds-data-hist-01	ag-data-prod	{/etc/nginx/ssl,/opt/certs}	2	2	0	850	2026-04-20 02:40:21.589496+00	2026-04-20 02:40:22.589496+00
ds-web-prod-01	ag-web-prod	{/etc/nginx/ssl,/etc/pki/tls/certs}	4	0	0	1250	2026-06-03 23:40:21.589496+00	2026-06-03 23:40:22.589496+00
ds-data-prod-01	ag-data-prod	{/etc/nginx/ssl,/opt/certs}	3	0	0	980	2026-06-04 00:40:21.589496+00	2026-06-04 00:40:22.589496+00
ds-edge-prod-01	ag-edge-01	{/etc/caddy/certs}	1	0	0	420	2026-06-03 22:40:21.589496+00	2026-06-03 22:40:22.589496+00
ds-net-hist-01	server-scanner	{network-scan}	3	3	0	12500	2026-05-28 02:40:21.589496+00	2026-05-28 02:40:33.589496+00
ds-net-prod-01	server-scanner	{network-scan}	5	2	1	15200	2026-06-04 01:40:21.589496+00	2026-06-04 01:40:36.589496+00
\.


--
-- Data for Name: endpoint_health_checks; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.endpoint_health_checks (id, endpoint, certificate_id, network_scan_target_id, expected_fingerprint, observed_fingerprint, status, consecutive_failures, response_time_ms, tls_version, cipher_suite, cert_subject, cert_issuer, cert_expiry, last_checked_at, last_success_at, last_failure_at, last_transition_at, failure_reason, degraded_threshold, down_threshold, check_interval_seconds, enabled, acknowledged, acknowledged_by, acknowledged_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: endpoint_health_history; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.endpoint_health_history (id, health_check_id, status, response_time_ms, fingerprint, failure_reason, checked_at) FROM stdin;
\.


--
-- Data for Name: group_role_mappings; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.group_role_mappings (id, tenant_id, provider_id, group_name, role_id, created_at) FROM stdin;
\.


--
-- Data for Name: intermediate_cas; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.intermediate_cas (id, owning_issuer_id, parent_ca_id, name, subject, state, cert_pem, key_driver_id, not_before, not_after, path_len_constraint, name_constraints, ocsp_responder_url, metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: issuance_approval_requests; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.issuance_approval_requests (id, certificate_id, job_id, profile_id, requested_by, state, decided_by, decided_at, decision_note, metadata, created_at, updated_at, approval_kind, payload) FROM stdin;
\.


--
-- Data for Name: issuers; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.issuers (id, name, type, config, enabled, created_at, updated_at, encrypted_config, last_tested_at, test_status, source, hierarchy_mode) FROM stdin;
iss-local	Local Dev CA	GenericCA	{"validity_days": 90, "ca_common_name": "CertCtl Demo CA"}	t	2025-12-06 02:40:21.589496+00	2025-12-06 02:40:21.589496+00	\N	\N	untested	database	single
iss-acme-le	Let's Encrypt Staging	ACME	{"email": "admin@example.com", "directory_url": "https://acme-staging-v02.api.letsencrypt.org/directory", "challenge_type": "http-01"}	t	2026-01-05 02:40:21.589496+00	2026-01-05 02:40:21.589496+00	\N	\N	untested	database	single
iss-stepca	step-ca Internal	StepCA	{"ca_url": "https://ca.internal:9000", "validity_days": 90, "provisioner_name": "certctl"}	t	2026-02-04 02:40:21.589496+00	2026-02-04 02:40:21.589496+00	\N	\N	untested	database	single
iss-acme-zs	ZeroSSL (EAB)	ACME	{"email": "admin@example.com", "directory_url": "https://acme.zerossl.com/v2/DV90", "challenge_type": "http-01"}	t	2026-04-05 02:40:21.589496+00	2026-04-05 02:40:21.589496+00	\N	\N	untested	database	single
iss-openssl	Custom OpenSSL CA	OpenSSL	{"sign_script": "/opt/ca/sign.sh", "timeout_seconds": 30}	f	2026-05-05 02:40:21.589496+00	2026-05-05 02:40:21.589496+00	\N	\N	untested	database	single
iss-vault	HashiCorp Vault PKI	VaultPKI	{"ttl": "8760h", "addr": "https://vault.internal:8200", "role": "web-certs", "mount": "pki"}	t	2026-05-15 02:40:21.589496+00	2026-05-15 02:40:21.589496+00	\N	\N	untested	database	single
iss-ejbca	EJBCA Enterprise	EJBCA	{"api_url": "https://ejbca.internal:8443/ejbca/ejbca-rest-api/v1", "ca_name": "DemoCA", "auth_mode": "mtls"}	f	2026-06-03 02:40:21.589496+00	2026-06-03 02:40:21.589496+00	\N	\N	untested	database	single
issuer-1780541565882073177-179	my-local-ca-edited	GenericCA	{}	t	2026-06-04 02:52:45.88208+00	2026-06-04 02:55:03.458302+00	\\x03dcd11b5287b60957e04c5c2de8ffa7072f96c3d4405537d65e94749d34359738d71f6b027e96974eac07371929c6	\N		database	single
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.jobs (id, type, certificate_id, target_id, agent_id, status, attempts, max_attempts, last_error, deployment_result, scheduled_at, started_at, completed_at, created_at, verification_status, verified_at, verification_fingerprint, verification_error) FROM stdin;
job-iss-001	issuance	mc-api-prod	\N	ag-web-prod	Completed	1	3	\N	\N	2026-03-06 02:40:21.589496+00	2026-03-06 02:40:21.589496+00	2026-03-06 02:40:31.589496+00	2026-03-06 02:40:21.589496+00	success	\N	\N	\N
job-dep-001	deployment	mc-api-prod	tgt-nginx-prod	ag-web-prod	Completed	1	3	\N	\N	2026-03-06 02:40:21.589496+00	2026-03-06 02:40:36.589496+00	2026-03-06 02:40:46.589496+00	2026-03-06 02:40:21.589496+00	success	\N	\N	\N
job-ren-010	renewal	mc-web-prod	\N	ag-web-prod	Completed	1	3	\N	\N	2026-03-19 02:40:21.589496+00	2026-03-19 02:40:21.589496+00	2026-03-19 02:40:33.589496+00	2026-03-19 02:40:21.589496+00	success	\N	\N	\N
job-dep-010	deployment	mc-web-prod	tgt-nginx-prod	ag-web-prod	Completed	1	3	\N	\N	2026-03-19 02:40:21.589496+00	2026-03-19 02:40:36.589496+00	2026-03-19 02:40:43.589496+00	2026-03-19 02:40:21.589496+00	success	\N	\N	\N
job-dep-011	deployment	mc-web-prod	tgt-haproxy-prod	ag-lb-prod	Completed	1	3	\N	\N	2026-03-19 02:40:21.589496+00	2026-03-19 02:40:36.589496+00	2026-03-19 02:40:45.589496+00	2026-03-19 02:40:21.589496+00	success	\N	\N	\N
job-ren-020	renewal	mc-grpc-prod	\N	ag-web-prod	Completed	1	3	\N	\N	2026-04-02 02:40:21.589496+00	2026-04-02 02:40:21.589496+00	2026-04-02 02:40:29.589496+00	2026-04-02 02:40:21.589496+00	success	\N	\N	\N
job-dep-020	deployment	mc-grpc-prod	tgt-nginx-prod	ag-web-prod	Completed	1	3	\N	\N	2026-04-02 02:40:21.589496+00	2026-04-02 02:40:31.589496+00	2026-04-02 02:40:39.589496+00	2026-04-02 02:40:21.589496+00	success	\N	\N	\N
job-ren-030	renewal	mc-vpn-prod	\N	ag-lb-prod	Failed	3	3	ACME challenge failed: DNS timeout after 30s	\N	2026-04-09 02:40:21.589496+00	2026-04-09 02:40:21.589496+00	2026-04-09 02:40:56.589496+00	2026-04-09 02:40:21.589496+00	\N	\N	\N	\N
job-ren-040	renewal	mc-pay-prod	\N	ag-web-prod	Completed	1	3	\N	\N	2026-04-15 02:40:21.589496+00	2026-04-15 02:40:21.589496+00	2026-04-15 02:40:32.589496+00	2026-04-15 02:40:21.589496+00	success	\N	\N	\N
job-dep-040	deployment	mc-pay-prod	tgt-nginx-prod	ag-web-prod	Completed	1	3	\N	\N	2026-04-15 02:40:21.589496+00	2026-04-15 02:40:35.589496+00	2026-04-15 02:40:43.589496+00	2026-04-15 02:40:21.589496+00	success	\N	\N	\N
job-dep-041	deployment	mc-pay-prod	tgt-haproxy-prod	ag-lb-prod	Completed	1	3	\N	\N	2026-04-15 02:40:21.589496+00	2026-04-15 02:40:35.589496+00	2026-04-15 02:40:46.589496+00	2026-04-15 02:40:21.589496+00	success	\N	\N	\N
job-iss-050	issuance	mc-shop-prod	\N	ag-web-prod	Completed	1	3	\N	\N	2026-04-19 02:40:21.589496+00	2026-04-19 02:40:21.589496+00	2026-04-19 02:40:39.589496+00	2026-04-19 02:40:21.589496+00	success	\N	\N	\N
job-dep-050	deployment	mc-shop-prod	tgt-nginx-prod	ag-web-prod	Completed	1	3	\N	\N	2026-04-19 02:40:21.589496+00	2026-04-19 02:40:41.589496+00	2026-04-19 02:40:49.589496+00	2026-04-19 02:40:21.589496+00	success	\N	\N	\N
job-ren-060	renewal	mc-docs-prod	\N	ag-web-prod	Completed	1	3	\N	\N	2026-04-22 02:40:21.589496+00	2026-04-22 02:40:21.589496+00	2026-04-22 02:40:36.589496+00	2026-04-22 02:40:21.589496+00	success	\N	\N	\N
job-dep-060	deployment	mc-docs-prod	tgt-nginx-prod	ag-web-prod	Completed	1	3	\N	\N	2026-04-22 02:40:21.589496+00	2026-04-22 02:40:39.589496+00	2026-04-22 02:40:47.589496+00	2026-04-22 02:40:21.589496+00	success	\N	\N	\N
job-ren-070	renewal	mc-wildcard-prod	\N	ag-web-prod	Completed	1	3	\N	\N	2026-04-25 02:40:21.589496+00	2026-04-25 02:40:21.589496+00	2026-04-25 02:41:06.589496+00	2026-04-25 02:40:21.589496+00	success	\N	\N	\N
job-dep-070	deployment	mc-wildcard-prod	tgt-nginx-prod	ag-web-prod	Completed	1	3	\N	\N	2026-04-25 02:40:21.589496+00	2026-04-25 02:41:09.589496+00	2026-04-25 02:41:16.589496+00	2026-04-25 02:40:21.589496+00	success	\N	\N	\N
job-ren-075	renewal	mc-blog-prod	\N	ag-web-prod	Completed	1	3	\N	\N	2026-04-27 02:40:21.589496+00	2026-04-27 02:40:21.589496+00	2026-04-27 02:40:35.589496+00	2026-04-27 02:40:21.589496+00	success	\N	\N	\N
job-dep-075	deployment	mc-blog-prod	tgt-nginx-prod	ag-web-prod	Completed	1	3	\N	\N	2026-04-27 02:40:21.589496+00	2026-04-27 02:40:37.589496+00	2026-04-27 02:40:45.589496+00	2026-04-27 02:40:21.589496+00	success	\N	\N	\N
job-ren-080	renewal	mc-data-prod	\N	ag-data-prod	Completed	1	3	\N	\N	2026-04-30 02:40:21.589496+00	2026-04-30 02:40:21.589496+00	2026-04-30 02:40:30.589496+00	2026-04-30 02:40:21.589496+00	success	\N	\N	\N
job-dep-080	deployment	mc-data-prod	tgt-nginx-data	ag-data-prod	Completed	1	3	\N	\N	2026-04-30 02:40:21.589496+00	2026-04-30 02:40:33.589496+00	2026-04-30 02:40:40.589496+00	2026-04-30 02:40:21.589496+00	success	\N	\N	\N
job-iss-085	issuance	mc-k8s-ingress	\N	ag-k8s-prod	Completed	1	3	\N	\N	2026-05-01 02:40:21.589496+00	2026-05-01 02:40:21.589496+00	2026-05-01 02:40:37.589496+00	2026-05-01 02:40:21.589496+00	success	\N	\N	\N
job-dep-085	deployment	mc-k8s-ingress	tgt-traefik-prod	ag-k8s-prod	Completed	1	3	\N	\N	2026-05-01 02:40:21.589496+00	2026-05-01 02:40:39.589496+00	2026-05-01 02:40:45.589496+00	2026-05-01 02:40:21.589496+00	success	\N	\N	\N
job-ren-090	renewal	mc-web-prod	\N	ag-web-prod	Completed	1	3	\N	\N	2026-05-05 02:40:21.589496+00	2026-05-05 02:40:21.589496+00	2026-05-05 02:40:32.589496+00	2026-05-05 02:40:21.589496+00	success	\N	\N	\N
job-dep-090	deployment	mc-web-prod	tgt-nginx-prod	ag-web-prod	Completed	1	3	\N	\N	2026-05-05 02:40:21.589496+00	2026-05-05 02:40:35.589496+00	2026-05-05 02:40:42.589496+00	2026-05-05 02:40:21.589496+00	success	\N	\N	\N
job-dep-091	deployment	mc-web-prod	tgt-haproxy-prod	ag-lb-prod	Completed	1	3	\N	\N	2026-05-05 02:40:21.589496+00	2026-05-05 02:40:35.589496+00	2026-05-05 02:40:44.589496+00	2026-05-05 02:40:21.589496+00	success	\N	\N	\N
job-iss-093	issuance	mc-edge-eu	\N	ag-edge-01	Completed	1	3	\N	\N	2026-05-06 02:40:21.589496+00	2026-05-06 02:40:21.589496+00	2026-05-06 02:40:34.589496+00	2026-05-06 02:40:21.589496+00	success	\N	\N	\N
job-dep-093	deployment	mc-edge-eu	tgt-caddy-prod	ag-edge-01	Completed	1	3	\N	\N	2026-05-06 02:40:21.589496+00	2026-05-06 02:40:36.589496+00	2026-05-06 02:40:41.589496+00	2026-05-06 02:40:21.589496+00	success	\N	\N	\N
job-ren-095	renewal	mc-consul-prod	\N	ag-web-prod	Completed	1	3	\N	\N	2026-05-08 02:40:21.589496+00	2026-05-08 02:40:21.589496+00	2026-05-08 02:40:30.589496+00	2026-05-08 02:40:21.589496+00	success	\N	\N	\N
job-ren-100	renewal	mc-search-prod	\N	ag-data-prod	Completed	1	3	\N	\N	2026-05-13 02:40:21.589496+00	2026-05-13 02:40:21.589496+00	2026-05-13 02:40:31.589496+00	2026-05-13 02:40:21.589496+00	success	\N	\N	\N
job-dep-100	deployment	mc-search-prod	tgt-nginx-data	ag-data-prod	Completed	1	3	\N	\N	2026-05-13 02:40:21.589496+00	2026-05-13 02:40:34.589496+00	2026-05-13 02:40:41.589496+00	2026-05-13 02:40:21.589496+00	success	\N	\N	\N
job-ren-105	renewal	mc-status-prod	\N	ag-web-prod	Completed	1	3	\N	\N	2026-05-16 02:40:21.589496+00	2026-05-16 02:40:21.589496+00	2026-05-16 02:40:33.589496+00	2026-05-16 02:40:21.589496+00	success	\N	\N	\N
job-dep-105	deployment	mc-status-prod	tgt-nginx-prod	ag-web-prod	Completed	1	3	\N	\N	2026-05-16 02:40:21.589496+00	2026-05-16 02:40:36.589496+00	2026-05-16 02:40:43.589496+00	2026-05-16 02:40:21.589496+00	success	\N	\N	\N
job-ren-110	renewal	mc-api-prod	\N	ag-web-prod	Completed	1	3	\N	\N	2026-05-20 02:40:21.589496+00	2026-05-20 02:40:21.589496+00	2026-05-20 02:40:31.589496+00	2026-05-20 02:40:21.589496+00	success	\N	\N	\N
job-dep-110	deployment	mc-api-prod	tgt-nginx-prod	ag-web-prod	Completed	1	3	\N	\N	2026-05-20 02:40:21.589496+00	2026-05-20 02:40:34.589496+00	2026-05-20 02:40:41.589496+00	2026-05-20 02:40:21.589496+00	success	\N	\N	\N
job-dep-111	deployment	mc-api-prod	tgt-haproxy-prod	ag-lb-prod	Completed	1	3	\N	\N	2026-05-20 02:40:21.589496+00	2026-05-20 02:40:34.589496+00	2026-05-20 02:40:43.589496+00	2026-05-20 02:40:21.589496+00	success	\N	\N	\N
job-rev-120	validation	mc-compromised	\N	ag-web-prod	Completed	1	1	\N	\N	2026-05-21 02:40:21.589496+00	2026-05-21 02:40:21.589496+00	2026-05-21 02:40:23.589496+00	2026-05-21 02:40:21.589496+00	\N	\N	\N	\N
job-ren-130	renewal	mc-dash-prod	\N	ag-web-prod	Completed	1	3	\N	\N	2026-05-27 02:40:21.589496+00	2026-05-27 02:40:21.589496+00	2026-05-27 02:40:30.589496+00	2026-05-27 02:40:21.589496+00	success	\N	\N	\N
job-dep-130	deployment	mc-dash-prod	tgt-nginx-prod	ag-web-prod	Completed	1	3	\N	\N	2026-05-27 02:40:21.589496+00	2026-05-27 02:40:32.589496+00	2026-05-27 02:40:39.589496+00	2026-05-27 02:40:21.589496+00	success	\N	\N	\N
job-ren-140	renewal	mc-vpn-prod	\N	ag-lb-prod	Failed	3	3	ACME HTTP-01 challenge: connection refused on port 80	\N	2026-06-01 02:40:21.589496+00	2026-06-01 02:40:21.589496+00	2026-06-01 02:40:53.589496+00	2026-06-01 02:40:21.589496+00	\N	\N	\N	\N
job-iss-160	issuance	mc-api-dev	\N	ag-mac-dev	Completed	1	3	\N	\N	2026-05-30 02:40:21.589496+00	2026-05-30 02:40:21.589496+00	2026-05-30 02:40:27.589496+00	2026-05-30 02:40:21.589496+00	skipped	\N	\N	\N
job-1780541450025945339-161	Renewal	mc-wildcard-prod	\N	\N	Pending	0	3	\N	\N	2026-06-04 02:50:50.025976+00	\N	\N	2026-06-04 02:50:50.025976+00	pending	\N	\N	\N
job-approval-02	renewal	mc-pay-prod	\N	ag-web-prod	Pending	0	3	\N	\N	2026-06-04 02:10:21.589496+00	2026-06-04 02:10:21.589496+00	\N	2026-06-04 02:10:21.589496+00	\N	\N	\N	\N
job-approval-01	renewal	mc-auth-prod	\N	ag-web-prod	Pending	0	3	\N	\N	2026-06-04 01:40:21.589496+00	2026-06-04 01:40:21.589496+00	\N	2026-06-04 01:40:21.589496+00	\N	\N	\N	\N
job-ren-150	renewal	mc-grafana-prod	\N	ag-data-prod	Pending	1	3	\N	\N	2026-06-04 00:40:21.589496+00	2026-06-04 00:40:21.589496+00	\N	2026-06-04 00:40:21.589496+00	\N	\N	\N	\N
\.


--
-- Data for Name: managed_certificates; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.managed_certificates (id, name, common_name, sans, environment, owner_id, team_id, issuer_id, renewal_policy_id, status, expires_at, tags, last_renewal_at, last_deployment_at, created_at, updated_at, certificate_profile_id, revoked_at, revocation_reason, source) FROM stdin;
mc-api-prod	api-production	api.example.com	{api.example.com,api-v2.example.com}	production	o-alice	t-platform	iss-local	rp-standard	Active	2026-08-18 02:40:21.589496+00	{"tier": "critical", "service": "api-gateway"}	2026-05-20 02:40:21.589496+00	2026-05-20 02:40:21.589496+00	2025-12-06 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	\N	\N	\N	
mc-web-prod	web-production	www.example.com	{www.example.com,example.com}	production	o-dave	t-frontend	iss-local	rp-standard	Active	2026-08-03 02:40:21.589496+00	{"tier": "critical", "service": "web-app"}	2026-05-05 02:40:21.589496+00	2026-05-05 02:40:21.589496+00	2025-06-04 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	\N	\N	\N	
mc-pay-prod	payments-production	pay.example.com	{pay.example.com,checkout.example.com}	production	o-carol	t-payments	iss-local	rp-urgent	Active	2026-07-14 02:40:21.589496+00	{"pci": "true", "tier": "critical", "service": "payments"}	2026-04-15 02:40:21.589496+00	2026-04-15 02:40:21.589496+00	2025-11-16 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	\N	\N	\N	
mc-dash-prod	dashboard-production	dashboard.example.com	{dashboard.example.com}	production	o-dave	t-frontend	iss-local	rp-standard	Active	2026-08-25 02:40:21.589496+00	{"tier": "high", "service": "dashboard"}	2026-05-27 02:40:21.589496+00	2026-05-27 02:40:21.589496+00	2026-02-24 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	\N	\N	\N	
mc-data-prod	data-api-production	data.example.com	{data.example.com,analytics.example.com}	production	o-eve	t-data	iss-local	rp-standard	Active	2026-07-29 02:40:21.589496+00	{"tier": "high", "service": "data-api"}	2026-04-30 02:40:21.589496+00	2026-04-30 02:40:21.589496+00	2026-01-05 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	\N	\N	\N	
mc-search-prod	search-production	search.example.com	{search.example.com,es.example.com}	production	o-eve	t-data	iss-local	rp-standard	Active	2026-08-11 02:40:21.589496+00	{"tier": "high", "service": "search"}	2026-05-13 02:40:21.589496+00	2026-05-13 02:40:21.589496+00	2026-01-25 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	\N	\N	\N	
mc-admin-prod	admin-production	admin.example.com	{admin.example.com}	production	o-bob	t-security	iss-local	rp-urgent	Active	2026-07-09 02:40:21.589496+00	{"tier": "critical", "service": "admin-panel"}	2026-04-10 02:40:21.589496+00	2026-04-10 02:40:21.589496+00	2025-11-16 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	\N	\N	\N	
mc-blog-prod	blog-production	blog.example.com	{blog.example.com}	production	o-dave	t-frontend	iss-acme-le	rp-standard	Active	2026-07-26 02:40:21.589496+00	{"tier": "medium", "service": "blog"}	2026-04-27 02:40:21.589496+00	2026-04-27 02:40:21.589496+00	2025-12-26 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	\N	\N	\N	
mc-docs-prod	docs-production	docs.example.com	{docs.example.com,help.example.com}	production	o-dave	t-frontend	iss-acme-le	rp-standard	Active	2026-07-21 02:40:21.589496+00	{"tier": "medium", "service": "docs"}	2026-04-22 02:40:21.589496+00	2026-04-22 02:40:21.589496+00	2026-01-15 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	\N	\N	\N	
mc-status-prod	status-production	status.example.com	{status.example.com}	production	o-frank	t-devops	iss-acme-le	rp-standard	Active	2026-08-14 02:40:21.589496+00	{"tier": "high", "service": "status-page"}	2026-05-16 02:40:21.589496+00	2026-05-16 02:40:21.589496+00	2026-03-16 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	\N	\N	\N	
mc-grpc-prod	grpc-internal	grpc.internal.example.com	{grpc.internal.example.com}	production	o-alice	t-platform	iss-stepca	rp-standard	Active	2026-08-01 02:40:21.589496+00	{"tier": "high", "service": "grpc-gateway"}	2026-05-03 02:40:21.589496+00	2026-05-03 02:40:21.589496+00	2026-02-24 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	\N	\N	\N	
mc-vault-prod	vault-internal	vault.internal.example.com	{vault.internal.example.com}	production	o-bob	t-security	iss-stepca	rp-urgent	Active	2026-07-09 02:40:21.589496+00	{"tier": "critical", "service": "vault"}	2026-03-31 02:40:21.589496+00	2026-03-31 02:40:21.589496+00	2026-02-04 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	\N	\N	\N	
mc-consul-prod	consul-internal	consul.internal.example.com	{consul.internal.example.com}	production	o-alice	t-platform	iss-stepca	rp-standard	Active	2026-08-06 02:40:21.589496+00	{"tier": "high", "service": "consul"}	2026-05-08 02:40:21.589496+00	2026-05-08 02:40:21.589496+00	2026-03-06 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	\N	\N	\N	
mc-shop-prod	shop-production	shop.example.com	{shop.example.com,store.example.com}	production	o-carol	t-payments	iss-acme-zs	rp-urgent	Active	2026-07-18 02:40:21.589496+00	{"pci": "true", "tier": "critical", "service": "shop"}	2026-04-19 02:40:21.589496+00	2026-04-19 02:40:21.589496+00	2026-04-05 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	\N	\N	\N	
mc-auth-prod	auth-production	auth.example.com	{auth.example.com,login.example.com,sso.example.com}	production	o-bob	t-security	iss-local	rp-urgent	Expiring	2026-07-06 02:40:21.589496+00	{"tier": "critical", "service": "auth"}	2026-03-18 02:40:21.589496+00	2026-03-18 02:40:21.589496+00	2025-08-08 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	\N	\N	\N	
mc-cdn-prod	cdn-production	cdn.example.com	{cdn.example.com,static.example.com}	production	o-alice	t-platform	iss-local	rp-standard	Expiring	2026-07-08 02:40:21.589496+00	{"tier": "high", "service": "cdn"}	2026-03-14 02:40:21.589496+00	2026-03-14 02:40:21.589496+00	2025-09-27 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	\N	\N	\N	
mc-mail-prod	mail-production	mail.example.com	{mail.example.com,smtp.example.com}	production	o-bob	t-security	iss-local	rp-standard	Expiring	2026-07-07 02:40:21.589496+00	{"tier": "medium", "service": "email"}	2026-03-11 02:40:21.589496+00	2026-03-11 02:40:21.589496+00	2025-04-30 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	\N	\N	\N	
mc-ci-prod	ci-production	ci.example.com	{ci.example.com,jenkins.example.com}	production	o-frank	t-devops	iss-acme-le	rp-standard	Expiring	2026-07-12 02:40:21.589496+00	{"tier": "high", "service": "ci"}	2026-03-24 02:40:21.589496+00	2026-03-24 02:40:21.589496+00	2026-02-24 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	\N	\N	\N	
mc-legacy-prod	legacy-app	legacy.example.com	{legacy.example.com}	production	o-alice	t-platform	iss-local	rp-manual	Expired	2026-06-01 02:40:21.589496+00	{"tier": "low", "decom": "planned", "service": "legacy"}	2026-03-03 02:40:21.589496+00	2026-03-03 02:40:21.589496+00	2025-01-20 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	\N	\N	\N	
mc-old-api	old-api-v1	api-v1.example.com	{api-v1.example.com}	production	o-alice	t-platform	iss-local	rp-manual	Expired	2026-05-20 02:40:21.589496+00	{"tier": "low", "service": "api-v1", "deprecated": "true"}	\N	\N	2024-10-12 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	\N	\N	\N	
mc-wiki-prod	wiki-production	wiki.example.com	{wiki.example.com}	production	o-dave	t-frontend	iss-acme-le	rp-manual	Expired	2026-05-28 02:40:21.589496+00	{"tier": "low", "service": "wiki"}	2026-02-27 02:40:21.589496+00	2026-02-27 02:40:21.589496+00	2025-08-08 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	\N	\N	\N	
mc-api-stg	api-staging	api.staging.example.com	{api.staging.example.com}	staging	o-alice	t-platform	iss-local	rp-standard	Active	2026-08-08 02:40:21.589496+00	{"tier": "low", "service": "api-gateway"}	2026-05-10 02:40:21.589496+00	2026-05-10 02:40:21.589496+00	2026-02-04 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	\N	\N	\N	
mc-web-stg	web-staging	www.staging.example.com	{www.staging.example.com,staging.example.com}	staging	o-dave	t-frontend	iss-local	rp-standard	Active	2026-08-13 02:40:21.589496+00	{"tier": "low", "service": "web-app"}	2026-05-15 02:40:21.589496+00	2026-05-15 02:40:21.589496+00	2026-02-24 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	\N	\N	\N	
mc-pay-stg	payments-staging	pay.staging.example.com	{pay.staging.example.com}	staging	o-carol	t-payments	iss-local	rp-standard	Active	2026-08-15 02:40:21.589496+00	{"tier": "low", "service": "payments"}	2026-05-17 02:40:21.589496+00	2026-05-17 02:40:21.589496+00	2026-03-16 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	\N	\N	\N	
mc-api-dev	api-development	api.dev.example.com	{api.dev.example.com}	development	o-alice	t-platform	iss-local	rp-standard	Active	2026-08-28 02:40:21.589496+00	{"tier": "low", "service": "api-gateway"}	2026-05-30 02:40:21.589496+00	2026-05-30 02:40:21.589496+00	2026-04-20 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	\N	\N	\N	
mc-grafana-prod	grafana-production	grafana.example.com	{grafana.example.com,metrics.example.com}	production	o-eve	t-data	iss-local	rp-standard	RenewalInProgress	2026-07-07 02:40:21.589496+00	{"tier": "high", "service": "monitoring"}	2026-03-09 02:40:21.589496+00	2026-03-09 02:40:21.589496+00	2025-12-06 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	\N	\N	\N	
mc-vpn-prod	vpn-production	vpn.example.com	{vpn.example.com}	production	o-bob	t-security	iss-acme-le	rp-urgent	Failed	2026-07-06 02:40:21.589496+00	{"tier": "critical", "service": "vpn"}	\N	\N	2026-03-06 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	\N	\N	\N	
mc-edge-eu	edge-eu-production	eu.cdn.example.com	{eu.cdn.example.com,eu-assets.example.com}	production	o-alice	t-platform	iss-acme-le	rp-standard	Active	2026-08-04 02:40:21.589496+00	{"tier": "high", "region": "eu-west-1", "service": "cdn-eu"}	2026-05-06 02:40:21.589496+00	2026-05-06 02:40:21.589496+00	2026-04-20 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	\N	\N	\N	
mc-k8s-ingress	k8s-ingress	ingress.example.com	{ingress.example.com,app.example.com}	production	o-frank	t-devops	iss-acme-le	rp-standard	Active	2026-07-30 02:40:21.589496+00	{"tier": "critical", "service": "k8s-ingress"}	2026-05-01 02:40:21.589496+00	2026-05-01 02:40:21.589496+00	2026-05-05 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	\N	\N	\N	
mc-smime-bob	bob-email-signing	bob@example.com	{bob@example.com}	production	o-bob	t-security	iss-local	rp-standard	Active	2027-03-31 02:40:21.589496+00	{"tier": "medium", "type": "smime"}	2026-03-31 02:40:21.589496+00	\N	2026-03-31 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	\N	\N	\N	
mc-compromised	compromised-cert	old-service.example.com	{old-service.example.com}	production	o-bob	t-security	iss-local	rp-standard	Revoked	2026-07-19 02:40:21.589496+00	{"tier": "low", "service": "decommissioned"}	2026-04-05 02:40:21.589496+00	2026-04-05 02:40:21.589496+00	2026-02-04 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	\N	2026-05-21 02:40:21.589496+00	keyCompromise	
mc-wildcard-prod	wildcard-production	*.example.com	{*.example.com,example.com}	production	o-alice	t-platform	iss-acme-le	rp-standard	RenewalInProgress	2026-07-24 02:40:21.589496+00	{"tier": "critical", "service": "wildcard"}	2026-04-25 02:40:21.589496+00	2026-04-25 02:40:21.589496+00	2025-06-04 02:40:21.589496+00	2026-06-04 02:40:21.589496+00	\N	\N	\N	
\.


--
-- Data for Name: network_scan_targets; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.network_scan_targets (id, name, cidrs, ports, enabled, scan_interval_hours, timeout_ms, last_scan_at, last_scan_duration_ms, last_scan_certs_found, created_at, updated_at) FROM stdin;
nst-dmz	DMZ Public Endpoints	{192.168.100.0/24}	{443,8443,9443}	t	12	3000	2026-06-04 02:42:04.817539+00	48028	0	2026-04-20 02:40:21.589496+00	2026-06-04 02:42:04.817539+00
nst-dc1-web	DC1 Web Servers	{10.0.1.0/24}	{443,8443}	t	6	5000	2026-06-04 02:42:59.848455+00	55018	0	2026-04-05 02:40:21.589496+00	2026-06-04 02:42:59.848456+00
nst-dc2-apps	DC2 Application Tier	{10.0.2.0/24,10.0.3.0/24}	{443}	t	6	5000	2026-06-04 02:43:54.88176+00	55022	0	2026-04-05 02:40:21.589496+00	2026-06-04 02:43:54.881761+00
nst-edge	Edge Locations	{10.0.5.0/24,10.0.6.0/24}	{443}	t	6	5000	2026-06-04 02:47:00.754355+00	55030	0	2026-05-05 02:40:21.589496+00	2026-06-04 02:47:00.754355+00
\.


--
-- Data for Name: notification_events; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.notification_events (id, type, certificate_id, channel, recipient, message, sent_at, status, error, retry_count, next_retry_at, last_error, created_at) FROM stdin;
ne-001	expiration_warning	mc-auth-prod	email	bob@example.com	Certificate auth-production expires in 12 days	2026-06-04 02:10:21.589496+00	sent	\N	0	\N	\N	2026-06-04 02:40:21.589496+00
ne-002	expiration_warning	mc-cdn-prod	email	alice@example.com	Certificate cdn-production expires in 8 days	2026-06-04 02:15:21.589496+00	sent	\N	0	\N	\N	2026-06-04 02:40:21.589496+00
ne-003	expiration_warning	mc-mail-prod	email	bob@example.com	Certificate mail-production expires in 5 days	2026-06-04 02:20:21.589496+00	sent	\N	0	\N	\N	2026-06-04 02:40:21.589496+00
ne-004	expiration_warning	mc-ci-prod	email	frank@example.com	Certificate ci-production expires in 18 days	2026-06-04 02:25:21.589496+00	sent	\N	0	\N	\N	2026-06-04 02:40:21.589496+00
ne-010	renewal_success	mc-api-prod	email	alice@example.com	Certificate api-production renewed successfully	2026-05-20 02:40:21.589496+00	sent	\N	0	\N	\N	2026-06-04 02:40:21.589496+00
ne-011	renewal_success	mc-web-prod	email	dave@example.com	Certificate web-production renewed successfully	2026-05-05 02:40:21.589496+00	sent	\N	0	\N	\N	2026-06-04 02:40:21.589496+00
ne-012	renewal_success	mc-pay-prod	email	carol@example.com	Certificate payments-production renewed successfully	2026-04-15 02:40:21.589496+00	sent	\N	0	\N	\N	2026-06-04 02:40:21.589496+00
ne-013	renewal_failure	mc-vpn-prod	webhook	https://hooks.example.com/certctl	Renewal failed for vpn-production after 3 attempts	2026-06-01 02:40:21.589496+00	sent	\N	0	\N	\N	2026-06-04 02:40:21.589496+00
ne-014	renewal_failure	mc-vpn-prod	email	bob@example.com	Renewal failed for vpn-production after 3 attempts	2026-06-01 02:40:21.589496+00	sent	\N	0	\N	\N	2026-06-04 02:40:21.589496+00
ne-020	deployment_success	mc-api-prod	webhook	https://hooks.example.com/certctl	Certificate api-production deployed to NGINX Production	2026-05-20 02:40:21.589496+00	sent	\N	0	\N	\N	2026-06-04 02:40:21.589496+00
ne-021	deployment_success	mc-dash-prod	email	dave@example.com	Certificate dashboard-production deployed successfully	2026-05-27 02:40:21.589496+00	sent	\N	0	\N	\N	2026-06-04 02:40:21.589496+00
ne-022	deployment_success	mc-k8s-ingress	email	frank@example.com	Certificate k8s-ingress deployed to Traefik	2026-05-01 02:40:21.589496+00	sent	\N	0	\N	\N	2026-06-04 02:40:21.589496+00
ne-030	revocation	mc-compromised	email	bob@example.com	Certificate old-service.example.com revoked: keyCompromise	2026-05-21 02:40:21.589496+00	sent	\N	0	\N	\N	2026-06-04 02:40:21.589496+00
ne-040	expiration_warning	mc-auth-prod	slack	#ops-alerts	Certificate auth-production expires in 12 days	2026-06-04 02:10:21.589496+00	sent	\N	0	\N	\N	2026-06-04 02:40:21.589496+00
ne-041	renewal_failure	mc-vpn-prod	slack	#ops-alerts	Renewal failed: vpn-production (ACME HTTP-01 refused)	2026-06-01 02:40:21.589496+00	sent	\N	0	\N	\N	2026-06-04 02:40:21.589496+00
notif-1780541453418485898-166	RenewalFailure	mc-wildcard-prod	Email	alice@example.com	The certificate for *.example.com failed to renew.\n\nError: ACME client init: failed to register ACME account: 400 urn:ietf:params:acme:error:invalidContact: Error validating contact(s) :: contact email has forbidden domain "example.com" (get existing: acme: account does not exist)\n\nPlease investigate.	2026-06-04 02:50:53.425736+00	sent	\N	0	\N	\N	2026-06-04 02:50:53.4194+00
notif-1780541724218100460-199	RenewalFailure	mc-wildcard-prod	Email	alice@example.com	The certificate for *.example.com failed to renew.\n\nError: ACME client init: failed to register ACME account: 400 urn:ietf:params:acme:error:invalidContact: Error validating contact(s) :: contact email has forbidden domain "example.com" (get existing: acme: account does not exist)\n\nPlease investigate.	2026-06-04 02:55:24.223059+00	sent	\N	0	\N	\N	2026-06-04 02:55:24.219355+00
notif-1780542003033402571-221	RenewalFailure	mc-wildcard-prod	Email	alice@example.com	The certificate for *.example.com failed to renew.\n\nError: failed to create ACME order: 400 urn:ietf:params:acme:error:malformed: Unable to validate JWS :: No Key ID in JWS header\n\nPlease investigate.	2026-06-04 03:00:03.035924+00	sent	\N	0	\N	\N	2026-06-04 03:00:03.033987+00
notif-1780542302011427709-239	RenewalFailure	mc-wildcard-prod	Email	alice@example.com	The certificate for *.example.com failed to renew.\n\nError: failed to create ACME order: 400 urn:ietf:params:acme:error:malformed: Unable to validate JWS :: No Key ID in JWS header\n\nPlease investigate.	2026-06-04 03:05:02.013834+00	sent	\N	0	\N	\N	2026-06-04 03:05:02.011945+00
notif-1780542565389289077-313	RenewalFailure	mc-wildcard-prod	Email	alice@example.com	The certificate for *.example.com failed to renew.\n\nError: failed to create ACME order: 400 urn:ietf:params:acme:error:malformed: Unable to validate JWS :: No Key ID in JWS header\n\nPlease investigate.	2026-06-04 03:09:25.392492+00	sent	\N	0	\N	\N	2026-06-04 03:09:25.390367+00
notif-1780542889308946619-338	RenewalFailure	mc-wildcard-prod	Email	alice@example.com	The certificate for *.example.com failed to renew.\n\nError: failed to create ACME order: 400 urn:ietf:params:acme:error:malformed: Unable to validate JWS :: No Key ID in JWS header\n\nPlease investigate.	2026-06-04 03:14:49.311681+00	sent	\N	0	\N	\N	2026-06-04 03:14:49.309705+00
notif-1780543163669213067-386	RenewalFailure	mc-wildcard-prod	Email	alice@example.com	The certificate for *.example.com failed to renew.\n\nError: failed to create ACME order: 400 urn:ietf:params:acme:error:malformed: Unable to validate JWS :: No Key ID in JWS header\n\nPlease investigate.	2026-06-04 03:19:23.671843+00	sent	\N	0	\N	\N	2026-06-04 03:19:23.669715+00
notif-1780543454678754812-404	RenewalFailure	mc-wildcard-prod	Email	alice@example.com	The certificate for *.example.com failed to renew.\n\nError: failed to create ACME order: 400 urn:ietf:params:acme:error:malformed: Unable to validate JWS :: No Key ID in JWS header\n\nPlease investigate.	2026-06-04 03:24:14.688181+00	sent	\N	0	\N	\N	2026-06-04 03:24:14.681964+00
notif-1780543726824079100-423	RenewalFailure	mc-wildcard-prod	Email	alice@example.com	The certificate for *.example.com failed to renew.\n\nError: failed to create ACME order: 400 urn:ietf:params:acme:error:malformed: Unable to validate JWS :: No Key ID in JWS header\n\nPlease investigate.	2026-06-04 03:28:46.827298+00	sent	\N	0	\N	\N	2026-06-04 03:28:46.82489+00
notif-1780544001690736781-457	RenewalFailure	mc-wildcard-prod	Email	alice@example.com	The certificate for *.example.com failed to renew.\n\nError: failed to create ACME order: 400 urn:ietf:params:acme:error:malformed: Unable to validate JWS :: No Key ID in JWS header\n\nPlease investigate.	2026-06-04 03:33:21.693934+00	sent	\N	0	\N	\N	2026-06-04 03:33:21.691617+00
notif-1780544299011456011-515	RenewalFailure	mc-wildcard-prod	Email	alice@example.com	The certificate for *.example.com failed to renew.\n\nError: failed to create ACME order: 400 urn:ietf:params:acme:error:malformed: Unable to validate JWS :: No Key ID in JWS header\n\nPlease investigate.	2026-06-04 03:38:19.014799+00	sent	\N	0	\N	\N	2026-06-04 03:38:19.012297+00
\.


--
-- Data for Name: ocsp_responders; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.ocsp_responders (issuer_id, cert_pem, cert_serial, key_path, key_alg, not_before, not_after, rotated_from, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ocsp_response_cache; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.ocsp_response_cache (issuer_id, serial_hex, response_der, cert_status, revocation_reason, revoked_at, this_update, next_update, generated_at) FROM stdin;
\.


--
-- Data for Name: oidc_bcl_consumed_jtis; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.oidc_bcl_consumed_jtis (jti, issuer_url, consumed_at, expires_at) FROM stdin;
\.


--
-- Data for Name: oidc_pre_login_sessions; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.oidc_pre_login_sessions (id, tenant_id, signing_key_id, oidc_provider_id, state, nonce, pkce_verifier, created_at, absolute_expires_at, state_enc, nonce_enc, pkce_verifier_enc, client_ip, user_agent) FROM stdin;
\.


--
-- Data for Name: oidc_providers; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.oidc_providers (id, tenant_id, name, issuer_url, client_id, client_secret_encrypted, redirect_uri, groups_claim_path, groups_claim_format, fetch_userinfo, scopes, allowed_email_domains, iat_window_seconds, jwks_cache_ttl_seconds, created_at, updated_at, enabled) FROM stdin;
\.


--
-- Data for Name: owners; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.owners (id, name, email, team_id, created_at, updated_at) FROM stdin;
o-alice	Alice Chen	alice@example.com	t-platform	2025-12-06 02:40:21.589496+00	2025-12-06 02:40:21.589496+00
o-bob	Bob Martinez	bob@example.com	t-security	2025-12-06 02:40:21.589496+00	2025-12-06 02:40:21.589496+00
o-carol	Carol Williams	carol@example.com	t-payments	2026-01-05 02:40:21.589496+00	2026-01-05 02:40:21.589496+00
o-dave	Dave Kim	dave@example.com	t-frontend	2026-01-05 02:40:21.589496+00	2026-01-05 02:40:21.589496+00
o-eve	Eve Johnson	eve@example.com	t-data	2026-02-04 02:40:21.589496+00	2026-02-04 02:40:21.589496+00
o-frank	Frank Torres	frank@example.com	t-devops	2026-03-06 02:40:21.589496+00	2026-03-06 02:40:21.589496+00
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.permissions (id, name, namespace) FROM stdin;
p-cert-read	cert.read	cert
p-cert-issue	cert.issue	cert
p-cert-revoke	cert.revoke	cert
p-cert-delete	cert.delete	cert
p-profile-read	profile.read	profile
p-profile-edit	profile.edit	profile
p-profile-delete	profile.delete	profile
p-issuer-read	issuer.read	issuer
p-issuer-edit	issuer.edit	issuer
p-issuer-delete	issuer.delete	issuer
p-target-read	target.read	target
p-target-edit	target.edit	target
p-target-delete	target.delete	target
p-agent-read	agent.read	agent
p-agent-edit	agent.edit	agent
p-agent-retire	agent.retire	agent
p-agent-heartbeat	agent.heartbeat	agent
p-agent-job-poll	agent.job.poll	agent.job
p-agent-job-complete	agent.job.complete	agent.job
p-agent-job-report	agent.job.report	agent.job
p-audit-read	audit.read	audit
p-audit-export	audit.export	audit
p-auth-role-list	auth.role.list	auth.role
p-auth-role-create	auth.role.create	auth.role
p-auth-role-edit	auth.role.edit	auth.role
p-auth-role-delete	auth.role.delete	auth.role
p-auth-role-assign	auth.role.assign	auth.role
p-auth-role-revoke	auth.role.revoke	auth.role
p-auth-key-list	auth.key.list	auth.key
p-auth-key-create	auth.key.create	auth.key
p-auth-key-rotate	auth.key.rotate	auth.key
p-auth-key-delete	auth.key.delete	auth.key
p-auth-bootstrap-use	auth.bootstrap.use	auth.bootstrap
p-cert-bulk-revoke	cert.bulk_revoke	cert
p-crl-admin	crl.admin	crl
p-scep-admin	scep.admin	scep
p-est-admin	est.admin	est
p-ca-hierarchy-manage	ca.hierarchy.manage	ca.hierarchy
p-auth-session-list	auth.session.list	auth.session
p-auth-session-list-all	auth.session.list.all	auth.session
p-auth-session-revoke	auth.session.revoke	auth.session
p-auth-oidc-list	auth.oidc.list	auth.oidc
p-auth-oidc-create	auth.oidc.create	auth.oidc
p-auth-oidc-edit	auth.oidc.edit	auth.oidc
p-auth-oidc-delete	auth.oidc.delete	auth.oidc
p-auth-breakglass-admin	auth.breakglass.admin	auth.breakglass
p-auth-breakglass-login	auth.breakglass.login	auth.breakglass
p-cert-edit	cert.edit	cert
p-job-read	job.read	job
p-job-cancel	job.cancel	job
p-approval-read	approval.read	approval
p-approval-approve	approval.approve	approval
p-approval-reject	approval.reject	approval
p-policy-read	policy.read	policy
p-policy-edit	policy.edit	policy
p-policy-delete	policy.delete	policy
p-team-read	team.read	team
p-team-edit	team.edit	team
p-team-delete	team.delete	team
p-owner-read	owner.read	owner
p-owner-edit	owner.edit	owner
p-owner-delete	owner.delete	owner
p-notification-read	notification.read	notification
p-notification-edit	notification.edit	notification
p-discovery-read	discovery.read	discovery
p-discovery-run	discovery.run	discovery
p-discovery-claim	discovery.claim	discovery
p-network-scan-read	network_scan.read	network_scan
p-network-scan-edit	network_scan.edit	network_scan
p-network-scan-run	network_scan.run	network_scan
p-healthcheck-read	healthcheck.read	healthcheck
p-healthcheck-edit	healthcheck.edit	healthcheck
p-healthcheck-delete	healthcheck.delete	healthcheck
p-healthcheck-acknowledge	healthcheck.acknowledge	healthcheck
p-digest-read	digest.read	digest
p-digest-send	digest.send	digest
p-verification-read	verification.read	verification
p-verification-run	verification.run	verification
p-stats-read	stats.read	stats
p-metrics-read	metrics.read	metrics
p-auth-user-read	auth.user.read	auth.user
p-auth-user-deactivate	auth.user.deactivate	auth.user
\.


--
-- Data for Name: policy_rules; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.policy_rules (id, name, type, config, enabled, created_at, updated_at, severity) FROM stdin;
pr-require-owner	require-owner	RequiredMetadata	{"required_keys": ["owner"]}	t	2026-06-04 02:40:21.585217+00	2026-06-04 02:40:21.585217+00	Warning
pr-allowed-environments	allowed-environments	AllowedEnvironments	{"allowed": ["production", "staging", "development"]}	t	2026-06-04 02:40:21.585217+00	2026-06-04 02:40:21.585217+00	Error
pr-max-certificate-lifetime	max-certificate-lifetime	CertificateLifetime	{"max_days": 90}	t	2026-06-04 02:40:21.585217+00	2026-06-04 02:40:21.585217+00	Critical
pr-min-renewal-window	min-renewal-window	RenewalLeadTime	{"lead_time_days": 14}	t	2026-06-04 02:40:21.585217+00	2026-06-04 02:40:21.585217+00	Warning
\.


--
-- Data for Name: policy_violations; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.policy_violations (id, certificate_id, rule_id, message, severity, created_at) FROM stdin;
pv-001	mc-legacy-prod	pr-max-certificate-lifetime	Certificate has expired and exceeds maximum lifetime policy	Critical	2026-06-01 02:40:21.589496+00
pv-002	mc-old-api	pr-max-certificate-lifetime	Certificate expired 15 days ago	Critical	2026-05-20 02:40:21.589496+00
pv-003	mc-vpn-prod	pr-min-renewal-window	Renewal failed within minimum renewal window	Error	2026-06-01 02:40:21.589496+00
pv-004	mc-mail-prod	pr-min-renewal-window	Certificate expiring in 5 days, below 14-day minimum window	Warning	2026-06-04 02:20:21.589496+00
pv-005	mc-wiki-prod	pr-max-certificate-lifetime	Certificate expired 7 days ago	Critical	2026-05-28 02:40:21.589496+00
pv-006	mc-compromised	pr-min-renewal-window	Certificate revoked due to key compromise	Critical	2026-05-21 02:40:21.589496+00
\.


--
-- Data for Name: rate_limit_buckets; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.rate_limit_buckets (bucket_key, timestamps, updated_at) FROM stdin;
\.


--
-- Data for Name: renewal_policies; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.renewal_policies (id, name, renewal_window_days, auto_renew, max_retries, retry_interval_seconds, alert_thresholds_days, created_at, updated_at, certificate_profile_id, agent_group_id, alert_channels, alert_severity_map) FROM stdin;
rp-default	default	30	t	3	60	[30, 14, 7, 0]	2026-06-04 02:40:21.585217+00	2026-06-04 02:40:21.585217+00	\N	\N	{}	{}
rp-standard	Standard 30-day	30	t	3	60	[30, 14, 7, 0]	2025-12-06 02:40:21.589496+00	2025-12-06 02:40:21.589496+00	\N	\N	{}	{}
rp-urgent	Urgent 14-day	14	t	5	30	[14, 7, 3, 0]	2025-12-06 02:40:21.589496+00	2025-12-06 02:40:21.589496+00	\N	\N	{}	{}
rp-manual	Manual Only	30	f	0	0	[30, 14, 7, 0]	2025-12-06 02:40:21.589496+00	2025-12-06 02:40:21.589496+00	\N	\N	{}	{}
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.role_permissions (id, role_id, permission_id, scope_type, scope_id) FROM stdin;
1	r-admin	p-cert-read	global	\N
2	r-admin	p-cert-issue	global	\N
3	r-admin	p-cert-revoke	global	\N
4	r-admin	p-cert-delete	global	\N
5	r-admin	p-profile-read	global	\N
6	r-admin	p-profile-edit	global	\N
7	r-admin	p-profile-delete	global	\N
8	r-admin	p-issuer-read	global	\N
9	r-admin	p-issuer-edit	global	\N
10	r-admin	p-issuer-delete	global	\N
11	r-admin	p-target-read	global	\N
12	r-admin	p-target-edit	global	\N
13	r-admin	p-target-delete	global	\N
14	r-admin	p-agent-read	global	\N
15	r-admin	p-agent-edit	global	\N
16	r-admin	p-agent-retire	global	\N
17	r-admin	p-agent-heartbeat	global	\N
18	r-admin	p-agent-job-poll	global	\N
19	r-admin	p-agent-job-complete	global	\N
20	r-admin	p-agent-job-report	global	\N
21	r-admin	p-audit-read	global	\N
22	r-admin	p-audit-export	global	\N
23	r-admin	p-auth-role-list	global	\N
24	r-admin	p-auth-role-create	global	\N
25	r-admin	p-auth-role-edit	global	\N
26	r-admin	p-auth-role-delete	global	\N
27	r-admin	p-auth-role-assign	global	\N
28	r-admin	p-auth-role-revoke	global	\N
29	r-admin	p-auth-key-list	global	\N
30	r-admin	p-auth-key-create	global	\N
31	r-admin	p-auth-key-rotate	global	\N
32	r-admin	p-auth-key-delete	global	\N
33	r-admin	p-auth-bootstrap-use	global	\N
34	r-operator	p-cert-read	global	\N
35	r-operator	p-cert-issue	global	\N
36	r-operator	p-cert-revoke	global	\N
37	r-operator	p-cert-delete	global	\N
38	r-operator	p-profile-read	global	\N
39	r-operator	p-profile-edit	global	\N
40	r-operator	p-issuer-read	global	\N
41	r-operator	p-issuer-edit	global	\N
42	r-operator	p-target-read	global	\N
43	r-operator	p-target-edit	global	\N
44	r-operator	p-target-delete	global	\N
45	r-operator	p-agent-read	global	\N
46	r-operator	p-agent-edit	global	\N
47	r-operator	p-audit-read	global	\N
48	r-viewer	p-cert-read	global	\N
49	r-viewer	p-profile-read	global	\N
50	r-viewer	p-issuer-read	global	\N
51	r-viewer	p-target-read	global	\N
52	r-viewer	p-agent-read	global	\N
53	r-viewer	p-audit-read	global	\N
54	r-agent	p-cert-read	global	\N
55	r-agent	p-agent-heartbeat	global	\N
56	r-agent	p-agent-job-poll	global	\N
57	r-agent	p-agent-job-complete	global	\N
58	r-agent	p-agent-job-report	global	\N
59	r-mcp	p-cert-read	global	\N
60	r-mcp	p-cert-issue	global	\N
61	r-mcp	p-cert-revoke	global	\N
62	r-mcp	p-profile-read	global	\N
63	r-mcp	p-profile-edit	global	\N
64	r-mcp	p-issuer-read	global	\N
65	r-mcp	p-issuer-edit	global	\N
66	r-mcp	p-target-read	global	\N
67	r-mcp	p-target-edit	global	\N
68	r-mcp	p-agent-read	global	\N
69	r-mcp	p-audit-read	global	\N
70	r-cli	p-cert-read	global	\N
71	r-cli	p-cert-issue	global	\N
72	r-cli	p-cert-revoke	global	\N
73	r-cli	p-cert-delete	global	\N
74	r-cli	p-profile-read	global	\N
75	r-cli	p-profile-edit	global	\N
76	r-cli	p-issuer-read	global	\N
77	r-cli	p-issuer-edit	global	\N
78	r-cli	p-target-read	global	\N
79	r-cli	p-target-edit	global	\N
80	r-cli	p-target-delete	global	\N
81	r-cli	p-agent-read	global	\N
82	r-cli	p-agent-edit	global	\N
83	r-cli	p-audit-read	global	\N
84	r-cli	p-auth-key-list	global	\N
85	r-cli	p-auth-key-create	global	\N
86	r-cli	p-auth-key-rotate	global	\N
87	r-auditor	p-audit-read	global	\N
88	r-auditor	p-audit-export	global	\N
89	r-admin	p-cert-bulk-revoke	global	\N
90	r-admin	p-crl-admin	global	\N
91	r-admin	p-scep-admin	global	\N
92	r-admin	p-est-admin	global	\N
93	r-admin	p-ca-hierarchy-manage	global	\N
94	r-admin	p-auth-session-list	global	\N
95	r-admin	p-auth-session-list-all	global	\N
96	r-admin	p-auth-session-revoke	global	\N
97	r-admin	p-auth-oidc-list	global	\N
98	r-admin	p-auth-oidc-create	global	\N
99	r-admin	p-auth-oidc-edit	global	\N
100	r-admin	p-auth-oidc-delete	global	\N
101	r-admin	p-auth-breakglass-admin	global	\N
102	r-admin	p-auth-breakglass-login	global	\N
103	r-admin	p-cert-edit	global	\N
104	r-admin	p-job-read	global	\N
105	r-admin	p-job-cancel	global	\N
106	r-admin	p-approval-read	global	\N
107	r-admin	p-approval-approve	global	\N
108	r-admin	p-approval-reject	global	\N
109	r-admin	p-policy-read	global	\N
110	r-admin	p-policy-edit	global	\N
111	r-admin	p-policy-delete	global	\N
112	r-admin	p-team-read	global	\N
113	r-admin	p-team-edit	global	\N
114	r-admin	p-team-delete	global	\N
115	r-admin	p-owner-read	global	\N
116	r-admin	p-owner-edit	global	\N
117	r-admin	p-owner-delete	global	\N
118	r-admin	p-notification-read	global	\N
119	r-admin	p-notification-edit	global	\N
120	r-admin	p-discovery-read	global	\N
121	r-admin	p-discovery-run	global	\N
122	r-admin	p-discovery-claim	global	\N
123	r-admin	p-network-scan-read	global	\N
124	r-admin	p-network-scan-edit	global	\N
125	r-admin	p-network-scan-run	global	\N
126	r-admin	p-healthcheck-read	global	\N
127	r-admin	p-healthcheck-edit	global	\N
128	r-admin	p-healthcheck-delete	global	\N
129	r-admin	p-healthcheck-acknowledge	global	\N
130	r-admin	p-digest-read	global	\N
131	r-admin	p-digest-send	global	\N
132	r-admin	p-verification-read	global	\N
133	r-admin	p-verification-run	global	\N
134	r-admin	p-stats-read	global	\N
135	r-admin	p-metrics-read	global	\N
136	r-operator	p-cert-edit	global	\N
137	r-operator	p-job-read	global	\N
138	r-operator	p-job-cancel	global	\N
139	r-operator	p-approval-read	global	\N
140	r-operator	p-approval-approve	global	\N
141	r-operator	p-approval-reject	global	\N
142	r-operator	p-policy-read	global	\N
143	r-operator	p-policy-edit	global	\N
144	r-operator	p-policy-delete	global	\N
145	r-operator	p-team-read	global	\N
146	r-operator	p-team-edit	global	\N
147	r-operator	p-team-delete	global	\N
148	r-operator	p-owner-read	global	\N
149	r-operator	p-owner-edit	global	\N
150	r-operator	p-owner-delete	global	\N
151	r-operator	p-notification-read	global	\N
152	r-operator	p-notification-edit	global	\N
153	r-operator	p-discovery-read	global	\N
154	r-operator	p-discovery-run	global	\N
155	r-operator	p-discovery-claim	global	\N
156	r-operator	p-network-scan-read	global	\N
157	r-operator	p-network-scan-edit	global	\N
158	r-operator	p-network-scan-run	global	\N
159	r-operator	p-healthcheck-read	global	\N
160	r-operator	p-healthcheck-edit	global	\N
161	r-operator	p-healthcheck-delete	global	\N
162	r-operator	p-healthcheck-acknowledge	global	\N
163	r-operator	p-digest-read	global	\N
164	r-operator	p-digest-send	global	\N
165	r-operator	p-verification-read	global	\N
166	r-operator	p-verification-run	global	\N
167	r-operator	p-stats-read	global	\N
168	r-operator	p-metrics-read	global	\N
169	r-viewer	p-job-read	global	\N
170	r-viewer	p-approval-read	global	\N
171	r-viewer	p-policy-read	global	\N
172	r-viewer	p-team-read	global	\N
173	r-viewer	p-owner-read	global	\N
174	r-viewer	p-notification-read	global	\N
175	r-viewer	p-discovery-read	global	\N
176	r-viewer	p-network-scan-read	global	\N
177	r-viewer	p-healthcheck-read	global	\N
178	r-viewer	p-digest-read	global	\N
179	r-viewer	p-verification-read	global	\N
180	r-viewer	p-stats-read	global	\N
181	r-viewer	p-metrics-read	global	\N
182	r-mcp	p-cert-edit	global	\N
183	r-mcp	p-job-read	global	\N
184	r-mcp	p-job-cancel	global	\N
185	r-mcp	p-approval-read	global	\N
186	r-mcp	p-approval-approve	global	\N
187	r-mcp	p-approval-reject	global	\N
188	r-mcp	p-policy-read	global	\N
189	r-mcp	p-team-read	global	\N
190	r-mcp	p-owner-read	global	\N
191	r-mcp	p-notification-read	global	\N
192	r-mcp	p-notification-edit	global	\N
193	r-mcp	p-discovery-read	global	\N
194	r-mcp	p-discovery-claim	global	\N
195	r-mcp	p-network-scan-read	global	\N
196	r-mcp	p-network-scan-run	global	\N
197	r-mcp	p-healthcheck-read	global	\N
198	r-mcp	p-healthcheck-acknowledge	global	\N
199	r-mcp	p-digest-read	global	\N
200	r-mcp	p-verification-read	global	\N
201	r-mcp	p-verification-run	global	\N
202	r-mcp	p-stats-read	global	\N
203	r-mcp	p-metrics-read	global	\N
204	r-cli	p-cert-edit	global	\N
205	r-cli	p-job-read	global	\N
206	r-cli	p-job-cancel	global	\N
207	r-cli	p-approval-read	global	\N
208	r-cli	p-approval-approve	global	\N
209	r-cli	p-approval-reject	global	\N
210	r-cli	p-policy-read	global	\N
211	r-cli	p-policy-edit	global	\N
212	r-cli	p-policy-delete	global	\N
213	r-cli	p-team-read	global	\N
214	r-cli	p-team-edit	global	\N
215	r-cli	p-owner-read	global	\N
216	r-cli	p-owner-edit	global	\N
217	r-cli	p-notification-read	global	\N
218	r-cli	p-notification-edit	global	\N
219	r-cli	p-discovery-read	global	\N
220	r-cli	p-discovery-run	global	\N
221	r-cli	p-discovery-claim	global	\N
222	r-cli	p-network-scan-read	global	\N
223	r-cli	p-network-scan-edit	global	\N
224	r-cli	p-network-scan-run	global	\N
225	r-cli	p-healthcheck-read	global	\N
226	r-cli	p-healthcheck-edit	global	\N
227	r-cli	p-healthcheck-acknowledge	global	\N
228	r-cli	p-digest-read	global	\N
229	r-cli	p-digest-send	global	\N
230	r-cli	p-verification-read	global	\N
231	r-cli	p-verification-run	global	\N
232	r-cli	p-stats-read	global	\N
233	r-cli	p-metrics-read	global	\N
234	r-agent	p-discovery-run	global	\N
235	r-admin	p-auth-user-read	global	\N
236	r-operator	p-auth-user-read	global	\N
237	r-auditor	p-auth-user-read	global	\N
238	r-admin	p-auth-user-deactivate	global	\N
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.roles (id, tenant_id, name, description, created_at, updated_at) FROM stdin;
r-admin	t-default	admin	Full access. All permissions, global scope.	2026-06-04 02:40:21.259856+00	2026-06-04 02:40:21.259856+00
r-operator	t-default	operator	Cert lifecycle + read access. No RBAC management.	2026-06-04 02:40:21.259856+00	2026-06-04 02:40:21.259856+00
r-viewer	t-default	viewer	Read-only access across cert / profile / issuer / target / agent / audit.	2026-06-04 02:40:21.259856+00	2026-06-04 02:40:21.259856+00
r-agent	t-default	agent	certctl-agent identity. cert.read + agent.heartbeat + agent.job.* perms.	2026-06-04 02:40:21.259856+00	2026-06-04 02:40:21.259856+00
r-mcp	t-default	mcp	MCP server identity. Operator-equivalent minus destructive verbs.	2026-06-04 02:40:21.259856+00	2026-06-04 02:40:21.259856+00
r-cli	t-default	cli	CLI user. Operator-equivalent plus auth.key.* for self-management.	2026-06-04 02:40:21.259856+00	2026-06-04 02:40:21.259856+00
r-auditor	t-default	auditor	Read-only audit access. Phase 8 splits this from admin for compliance reviewers.	2026-06-04 02:40:21.259856+00	2026-06-04 02:40:21.259856+00
\.


--
-- Data for Name: scep_probe_results; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.scep_probe_results (id, target_url, reachable, advertised_caps, supports_rfc8894, supports_aes, supports_post_operation, supports_renewal, supports_sha256, supports_sha512, ca_cert_subject, ca_cert_issuer, ca_cert_not_before, ca_cert_not_after, ca_cert_expired, ca_cert_algorithm, ca_cert_chain_length, probed_at, probe_duration_ms, error, created_at) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.schema_migrations (version, applied_at) FROM stdin;
000001_initial_schema.up.sql	2026-06-04 02:40:20.773312+00
000002_agent_metadata.up.sql	2026-06-04 02:40:20.785421+00
000003_certificate_profiles.up.sql	2026-06-04 02:40:20.809495+00
000004_agent_groups.up.sql	2026-06-04 02:40:20.841233+00
000005_revocation.up.sql	2026-06-04 02:40:20.862417+00
000006_discovery.up.sql	2026-06-04 02:40:20.908433+00
000007_network_discovery.up.sql	2026-06-04 02:40:20.921692+00
000008_verification.up.sql	2026-06-04 02:40:20.932073+00
000009_issuer_config.up.sql	2026-06-04 02:40:20.936784+00
000010_target_config.up.sql	2026-06-04 02:40:20.940951+00
000011_health_checks.up.sql	2026-06-04 02:40:20.977772+00
000012_revocation_index_scope.up.sql	2026-06-04 02:40:20.98833+00
000013_policy_rule_severity.up.sql	2026-06-04 02:40:20.992165+00
000014_policy_violation_severity_check.up.sql	2026-06-04 02:40:20.995809+00
000015_agent_retire.up.sql	2026-06-04 02:40:21.009349+00
000016_notification_retry.up.sql	2026-06-04 02:40:21.016648+00
000017_db_coupling_cleanup.up.sql	2026-06-04 02:40:21.029773+00
000018_audit_events_worm.up.sql	2026-06-04 02:40:21.034622+00
000019_crl_cache.up.sql	2026-06-04 02:40:21.059736+00
000020_ocsp_responder.up.sql	2026-06-04 02:40:21.074238+00
000021_scep_probe_results.up.sql	2026-06-04 02:40:21.093045+00
000022_certificate_profiles_csrattrs.up.sql	2026-06-04 02:40:21.097068+00
000023_managed_certificates_source.up.sql	2026-06-04 02:40:21.101104+00
000024_ocsp_response_cache.up.sql	2026-06-04 02:40:21.118875+00
000025_acme_server.up.sql	2026-06-04 02:40:21.194382+00
000026_renewal_policy_channel_matrix.up.sql	2026-06-04 02:40:21.198443+00
000027_approval_workflow.up.sql	2026-06-04 02:40:21.225212+00
000028_intermediate_ca_hierarchy.up.sql	2026-06-04 02:40:21.257899+00
000029_rbac.up.sql	2026-06-04 02:40:21.331117+00
000030_rbac_admin_perms.up.sql	2026-06-04 02:40:21.336061+00
000031_api_keys.up.sql	2026-06-04 02:40:21.358866+00
000032_audit_category.up.sql	2026-06-04 02:40:21.368775+00
000033_approval_kinds.up.sql	2026-06-04 02:40:21.382092+00
000034_oidc_providers.up.sql	2026-06-04 02:40:21.40961+00
000035_sessions.up.sql	2026-06-04 02:40:21.444238+00
000036_users.up.sql	2026-06-04 02:40:21.462618+00
000037_oidc_phase5.up.sql	2026-06-04 02:40:21.482698+00
000038_breakglass_credentials.up.sql	2026-06-04 02:40:21.501166+00
000039_audit_crit1_perms.up.sql	2026-06-04 02:40:21.511532+00
000040_bcl_replay_cache.up.sql	2026-06-04 02:40:21.524753+00
000041_prelogin_encrypted.up.sql	2026-06-04 02:40:21.528537+00
000042_oidc_provider_enabled.up.sql	2026-06-04 02:40:21.531982+00
000043_actor_role_scope.up.sql	2026-06-04 02:40:21.543274+00
000044_prelogin_uaip.up.sql	2026-06-04 02:40:21.54745+00
000045_users_deactivated_at.up.sql	2026-06-04 02:40:21.551126+00
000046_rate_limit_buckets.up.sql	2026-06-04 02:40:21.564122+00
000047_audit_events_hash_chain.up.sql	2026-06-04 02:40:21.582817+00
\.


--
-- Data for Name: session_signing_keys; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.session_signing_keys (id, tenant_id, key_material_encrypted, created_at, retired_at) FROM stdin;
sk-0pSsoKpxSWaLpCCav1lubQ	t-default	\\x034f73fd81ca470d6934b678cd7f19e60bdacdc67c70ea210179347b04d5827f3aaea50e4c6ea15e7155c456936a99692abaed56518aa270e7b04618b2f6f562e80023c5f865914ad3662fddc6	2026-06-04 02:40:21.737051+00	\N
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.sessions (id, tenant_id, actor_id, actor_type, signing_key_id, is_pre_login, csrf_token_hash, idle_expires_at, absolute_expires_at, created_at, last_seen_at, ip_address, user_agent, revoked_at) FROM stdin;
\.


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.teams (id, name, description, created_at, updated_at) FROM stdin;
t-platform	Platform Engineering	Core infrastructure and platform services	2025-12-06 02:40:21.589496+00	2025-12-06 02:40:21.589496+00
t-security	Security Operations	Security tooling and compliance	2025-12-06 02:40:21.589496+00	2025-12-06 02:40:21.589496+00
t-payments	Payments	Payment processing services	2026-01-05 02:40:21.589496+00	2026-01-05 02:40:21.589496+00
t-frontend	Frontend	Web and mobile applications	2026-01-05 02:40:21.589496+00	2026-01-05 02:40:21.589496+00
t-data	Data Engineering	Data pipelines and analytics	2026-02-04 02:40:21.589496+00	2026-02-04 02:40:21.589496+00
t-devops	DevOps	CI/CD and release engineering	2026-03-06 02:40:21.589496+00	2026-03-06 02:40:21.589496+00
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.tenants (id, name, description, created_at, updated_at) FROM stdin;
t-default	default	Single-tenant default; future multi-tenant managed offering activates by inserting additional tenants.	2026-06-04 02:40:21.259856+00	2026-06-04 02:40:21.259856+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: certctl
--

COPY public.users (id, tenant_id, email, display_name, oidc_subject, oidc_provider_id, last_login_at, webauthn_credentials, created_at, updated_at, deactivated_at) FROM stdin;
\.


--
-- Name: crl_generation_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: certctl
--

SELECT pg_catalog.setval('public.crl_generation_events_id_seq', 1, false);


--
-- Name: role_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: certctl
--

SELECT pg_catalog.setval('public.role_permissions_id_seq', 238, true);


--
-- Name: acme_accounts acme_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.acme_accounts
    ADD CONSTRAINT acme_accounts_pkey PRIMARY KEY (account_id);


--
-- Name: acme_accounts acme_accounts_profile_id_jwk_thumbprint_key; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.acme_accounts
    ADD CONSTRAINT acme_accounts_profile_id_jwk_thumbprint_key UNIQUE (profile_id, jwk_thumbprint);


--
-- Name: acme_authorizations acme_authorizations_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.acme_authorizations
    ADD CONSTRAINT acme_authorizations_pkey PRIMARY KEY (authz_id);


--
-- Name: acme_challenges acme_challenges_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.acme_challenges
    ADD CONSTRAINT acme_challenges_pkey PRIMARY KEY (challenge_id);


--
-- Name: acme_nonces acme_nonces_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.acme_nonces
    ADD CONSTRAINT acme_nonces_pkey PRIMARY KEY (nonce);


--
-- Name: acme_orders acme_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.acme_orders
    ADD CONSTRAINT acme_orders_pkey PRIMARY KEY (order_id);


--
-- Name: actor_roles actor_roles_actor_role_scope_unique; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.actor_roles
    ADD CONSTRAINT actor_roles_actor_role_scope_unique UNIQUE (actor_id, actor_type, role_id, scope_type, scope_id, tenant_id);


--
-- Name: actor_roles actor_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.actor_roles
    ADD CONSTRAINT actor_roles_pkey PRIMARY KEY (id);


--
-- Name: agent_group_members agent_group_members_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.agent_group_members
    ADD CONSTRAINT agent_group_members_pkey PRIMARY KEY (agent_group_id, agent_id);


--
-- Name: agent_groups agent_groups_name_key; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.agent_groups
    ADD CONSTRAINT agent_groups_name_key UNIQUE (name);


--
-- Name: agent_groups agent_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.agent_groups
    ADD CONSTRAINT agent_groups_pkey PRIMARY KEY (id);


--
-- Name: agents agents_name_key; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.agents
    ADD CONSTRAINT agents_name_key UNIQUE (name);


--
-- Name: agents agents_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.agents
    ADD CONSTRAINT agents_pkey PRIMARY KEY (id);


--
-- Name: api_keys api_keys_key_hash_key; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_key_hash_key UNIQUE (key_hash);


--
-- Name: api_keys api_keys_name_key; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_name_key UNIQUE (name);


--
-- Name: api_keys api_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_pkey PRIMARY KEY (id);


--
-- Name: audit_chain_head audit_chain_head_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.audit_chain_head
    ADD CONSTRAINT audit_chain_head_pkey PRIMARY KEY (id);


--
-- Name: audit_events audit_events_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.audit_events
    ADD CONSTRAINT audit_events_pkey PRIMARY KEY (id);


--
-- Name: breakglass_credentials breakglass_credentials_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.breakglass_credentials
    ADD CONSTRAINT breakglass_credentials_pkey PRIMARY KEY (id);


--
-- Name: certificate_profiles certificate_profiles_name_key; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.certificate_profiles
    ADD CONSTRAINT certificate_profiles_name_key UNIQUE (name);


--
-- Name: certificate_profiles certificate_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.certificate_profiles
    ADD CONSTRAINT certificate_profiles_pkey PRIMARY KEY (id);


--
-- Name: certificate_revocations certificate_revocations_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.certificate_revocations
    ADD CONSTRAINT certificate_revocations_pkey PRIMARY KEY (id);


--
-- Name: certificate_target_mappings certificate_target_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.certificate_target_mappings
    ADD CONSTRAINT certificate_target_mappings_pkey PRIMARY KEY (certificate_id, target_id);


--
-- Name: certificate_versions certificate_versions_fingerprint_sha256_key; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.certificate_versions
    ADD CONSTRAINT certificate_versions_fingerprint_sha256_key UNIQUE (fingerprint_sha256);


--
-- Name: certificate_versions certificate_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.certificate_versions
    ADD CONSTRAINT certificate_versions_pkey PRIMARY KEY (id);


--
-- Name: crl_cache crl_cache_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.crl_cache
    ADD CONSTRAINT crl_cache_pkey PRIMARY KEY (issuer_id);


--
-- Name: crl_generation_events crl_generation_events_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.crl_generation_events
    ADD CONSTRAINT crl_generation_events_pkey PRIMARY KEY (id);


--
-- Name: deployment_targets deployment_targets_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.deployment_targets
    ADD CONSTRAINT deployment_targets_pkey PRIMARY KEY (id);


--
-- Name: discovered_certificates discovered_certificates_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.discovered_certificates
    ADD CONSTRAINT discovered_certificates_pkey PRIMARY KEY (id);


--
-- Name: discovery_scans discovery_scans_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.discovery_scans
    ADD CONSTRAINT discovery_scans_pkey PRIMARY KEY (id);


--
-- Name: endpoint_health_checks endpoint_health_checks_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.endpoint_health_checks
    ADD CONSTRAINT endpoint_health_checks_pkey PRIMARY KEY (id);


--
-- Name: endpoint_health_history endpoint_health_history_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.endpoint_health_history
    ADD CONSTRAINT endpoint_health_history_pkey PRIMARY KEY (id);


--
-- Name: group_role_mappings group_role_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.group_role_mappings
    ADD CONSTRAINT group_role_mappings_pkey PRIMARY KEY (id);


--
-- Name: group_role_mappings group_role_mappings_provider_id_group_name_role_id_key; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.group_role_mappings
    ADD CONSTRAINT group_role_mappings_provider_id_group_name_role_id_key UNIQUE (provider_id, group_name, role_id);


--
-- Name: intermediate_cas intermediate_cas_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.intermediate_cas
    ADD CONSTRAINT intermediate_cas_pkey PRIMARY KEY (id);


--
-- Name: issuance_approval_requests issuance_approval_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.issuance_approval_requests
    ADD CONSTRAINT issuance_approval_requests_pkey PRIMARY KEY (id);


--
-- Name: issuers issuers_name_key; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.issuers
    ADD CONSTRAINT issuers_name_key UNIQUE (name);


--
-- Name: issuers issuers_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.issuers
    ADD CONSTRAINT issuers_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: managed_certificates managed_certificates_name_key; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.managed_certificates
    ADD CONSTRAINT managed_certificates_name_key UNIQUE (name);


--
-- Name: managed_certificates managed_certificates_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.managed_certificates
    ADD CONSTRAINT managed_certificates_pkey PRIMARY KEY (id);


--
-- Name: network_scan_targets network_scan_targets_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.network_scan_targets
    ADD CONSTRAINT network_scan_targets_pkey PRIMARY KEY (id);


--
-- Name: notification_events notification_events_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.notification_events
    ADD CONSTRAINT notification_events_pkey PRIMARY KEY (id);


--
-- Name: ocsp_responders ocsp_responders_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.ocsp_responders
    ADD CONSTRAINT ocsp_responders_pkey PRIMARY KEY (issuer_id);


--
-- Name: ocsp_response_cache ocsp_response_cache_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.ocsp_response_cache
    ADD CONSTRAINT ocsp_response_cache_pkey PRIMARY KEY (issuer_id, serial_hex);


--
-- Name: oidc_bcl_consumed_jtis oidc_bcl_consumed_jtis_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.oidc_bcl_consumed_jtis
    ADD CONSTRAINT oidc_bcl_consumed_jtis_pkey PRIMARY KEY (jti, issuer_url);


--
-- Name: oidc_pre_login_sessions oidc_pre_login_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.oidc_pre_login_sessions
    ADD CONSTRAINT oidc_pre_login_sessions_pkey PRIMARY KEY (id);


--
-- Name: oidc_providers oidc_providers_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.oidc_providers
    ADD CONSTRAINT oidc_providers_pkey PRIMARY KEY (id);


--
-- Name: oidc_providers oidc_providers_tenant_id_name_key; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.oidc_providers
    ADD CONSTRAINT oidc_providers_tenant_id_name_key UNIQUE (tenant_id, name);


--
-- Name: owners owners_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.owners
    ADD CONSTRAINT owners_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_name_key; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_name_key UNIQUE (name);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: policy_rules policy_rules_name_key; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.policy_rules
    ADD CONSTRAINT policy_rules_name_key UNIQUE (name);


--
-- Name: policy_rules policy_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.policy_rules
    ADD CONSTRAINT policy_rules_pkey PRIMARY KEY (id);


--
-- Name: policy_violations policy_violations_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.policy_violations
    ADD CONSTRAINT policy_violations_pkey PRIMARY KEY (id);


--
-- Name: rate_limit_buckets rate_limit_buckets_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.rate_limit_buckets
    ADD CONSTRAINT rate_limit_buckets_pkey PRIMARY KEY (bucket_key);


--
-- Name: renewal_policies renewal_policies_name_key; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.renewal_policies
    ADD CONSTRAINT renewal_policies_name_key UNIQUE (name);


--
-- Name: renewal_policies renewal_policies_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.renewal_policies
    ADD CONSTRAINT renewal_policies_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_unique; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_unique UNIQUE NULLS NOT DISTINCT (role_id, permission_id, scope_type, scope_id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: roles roles_tenant_id_name_key; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_tenant_id_name_key UNIQUE (tenant_id, name);


--
-- Name: scep_probe_results scep_probe_results_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.scep_probe_results
    ADD CONSTRAINT scep_probe_results_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: session_signing_keys session_signing_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.session_signing_keys
    ADD CONSTRAINT session_signing_keys_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: teams teams_name_key; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_name_key UNIQUE (name);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: users users_oidc_provider_id_oidc_subject_key; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_oidc_provider_id_oidc_subject_key UNIQUE (oidc_provider_id, oidc_subject);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_acme_accounts_jwk_thumb; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_acme_accounts_jwk_thumb ON public.acme_accounts USING btree (profile_id, jwk_thumbprint);


--
-- Name: idx_acme_accounts_status; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_acme_accounts_status ON public.acme_accounts USING btree (status) WHERE (status = 'valid'::text);


--
-- Name: idx_acme_authz_order; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_acme_authz_order ON public.acme_authorizations USING btree (order_id);


--
-- Name: idx_acme_authz_status; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_acme_authz_status ON public.acme_authorizations USING btree (status) WHERE (status = ANY (ARRAY['pending'::text, 'processing'::text]));


--
-- Name: idx_acme_challenges_authz; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_acme_challenges_authz ON public.acme_challenges USING btree (authz_id);


--
-- Name: idx_acme_nonces_expires; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_acme_nonces_expires ON public.acme_nonces USING btree (expires_at) WHERE (used = false);


--
-- Name: idx_acme_orders_account; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_acme_orders_account ON public.acme_orders USING btree (account_id);


--
-- Name: idx_acme_orders_expires; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_acme_orders_expires ON public.acme_orders USING btree (expires_at);


--
-- Name: idx_acme_orders_status; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_acme_orders_status ON public.acme_orders USING btree (status) WHERE (status = ANY (ARRAY['pending'::text, 'ready'::text, 'processing'::text]));


--
-- Name: idx_actor_roles_actor; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_actor_roles_actor ON public.actor_roles USING btree (actor_id, actor_type, tenant_id);


--
-- Name: idx_actor_roles_role; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_actor_roles_role ON public.actor_roles USING btree (role_id);


--
-- Name: idx_actor_roles_scope; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_actor_roles_scope ON public.actor_roles USING btree (scope_type, scope_id) WHERE (scope_id IS NOT NULL);


--
-- Name: idx_agent_group_members_agent; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_agent_group_members_agent ON public.agent_group_members USING btree (agent_id);


--
-- Name: idx_agent_groups_enabled; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_agent_groups_enabled ON public.agent_groups USING btree (enabled);


--
-- Name: idx_agent_groups_name; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_agent_groups_name ON public.agent_groups USING btree (name);


--
-- Name: idx_agents_architecture; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_agents_architecture ON public.agents USING btree (architecture);


--
-- Name: idx_agents_hostname; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_agents_hostname ON public.agents USING btree (hostname);


--
-- Name: idx_agents_last_heartbeat_at; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_agents_last_heartbeat_at ON public.agents USING btree (last_heartbeat_at);


--
-- Name: idx_agents_online_heartbeat; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_agents_online_heartbeat ON public.agents USING btree (status, last_heartbeat_at) WHERE ((status)::text = 'online'::text);


--
-- Name: idx_agents_os; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_agents_os ON public.agents USING btree (os);


--
-- Name: idx_agents_retired_at; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_agents_retired_at ON public.agents USING btree (retired_at) WHERE (retired_at IS NOT NULL);


--
-- Name: idx_agents_status; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_agents_status ON public.agents USING btree (status);


--
-- Name: idx_api_keys_created_by; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_api_keys_created_by ON public.api_keys USING btree (created_by);


--
-- Name: idx_api_keys_tenant_id; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_api_keys_tenant_id ON public.api_keys USING btree (tenant_id);


--
-- Name: idx_approval_certificate; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_approval_certificate ON public.issuance_approval_requests USING btree (certificate_id);


--
-- Name: idx_approval_kind; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_approval_kind ON public.issuance_approval_requests USING btree (approval_kind);


--
-- Name: idx_approval_pending_age; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_approval_pending_age ON public.issuance_approval_requests USING btree (created_at) WHERE ((state)::text = 'pending'::text);


--
-- Name: idx_approval_pending_per_job; Type: INDEX; Schema: public; Owner: certctl
--

CREATE UNIQUE INDEX idx_approval_pending_per_job ON public.issuance_approval_requests USING btree (job_id) WHERE ((state)::text = 'pending'::text);


--
-- Name: idx_approval_state; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_approval_state ON public.issuance_approval_requests USING btree (state);


--
-- Name: idx_audit_events_action; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_audit_events_action ON public.audit_events USING btree (action);


--
-- Name: idx_audit_events_actor; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_audit_events_actor ON public.audit_events USING btree (actor);


--
-- Name: idx_audit_events_category_timestamp; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_audit_events_category_timestamp ON public.audit_events USING btree (event_category, "timestamp" DESC);


--
-- Name: idx_audit_events_event_category; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_audit_events_event_category ON public.audit_events USING btree (event_category);


--
-- Name: idx_audit_events_resource_type_id; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_audit_events_resource_type_id ON public.audit_events USING btree (resource_type, resource_id);


--
-- Name: idx_audit_events_timestamp; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_audit_events_timestamp ON public.audit_events USING btree ("timestamp");


--
-- Name: idx_audit_events_timestamp_desc; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_audit_events_timestamp_desc ON public.audit_events USING btree ("timestamp" DESC);


--
-- Name: idx_breakglass_credentials_actor_id; Type: INDEX; Schema: public; Owner: certctl
--

CREATE UNIQUE INDEX idx_breakglass_credentials_actor_id ON public.breakglass_credentials USING btree (actor_id);


--
-- Name: idx_breakglass_credentials_locked_until; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_breakglass_credentials_locked_until ON public.breakglass_credentials USING btree (locked_until) WHERE (locked_until IS NOT NULL);


--
-- Name: idx_certificate_profiles_enabled; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_certificate_profiles_enabled ON public.certificate_profiles USING btree (enabled);


--
-- Name: idx_certificate_profiles_name; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_certificate_profiles_name ON public.certificate_profiles USING btree (name);


--
-- Name: idx_certificate_revocations_cert_id; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_certificate_revocations_cert_id ON public.certificate_revocations USING btree (certificate_id);


--
-- Name: idx_certificate_revocations_issuer_serial; Type: INDEX; Schema: public; Owner: certctl
--

CREATE UNIQUE INDEX idx_certificate_revocations_issuer_serial ON public.certificate_revocations USING btree (issuer_id, serial_number);


--
-- Name: idx_certificate_revocations_revoked_at; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_certificate_revocations_revoked_at ON public.certificate_revocations USING btree (revoked_at);


--
-- Name: idx_certificate_revocations_serial_lookup; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_certificate_revocations_serial_lookup ON public.certificate_revocations USING btree (serial_number);


--
-- Name: idx_certificate_target_mappings_target_id; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_certificate_target_mappings_target_id ON public.certificate_target_mappings USING btree (target_id);


--
-- Name: idx_certificate_versions_cert_created; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_certificate_versions_cert_created ON public.certificate_versions USING btree (certificate_id, created_at DESC);


--
-- Name: idx_certificate_versions_certificate_id; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_certificate_versions_certificate_id ON public.certificate_versions USING btree (certificate_id);


--
-- Name: idx_certificate_versions_fingerprint; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_certificate_versions_fingerprint ON public.certificate_versions USING btree (fingerprint_sha256);


--
-- Name: idx_crl_cache_next_update; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_crl_cache_next_update ON public.crl_cache USING btree (next_update);


--
-- Name: idx_crl_generation_events_issuer_started; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_crl_generation_events_issuer_started ON public.crl_generation_events USING btree (issuer_id, started_at DESC);


--
-- Name: idx_deployment_targets_agent_id; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_deployment_targets_agent_id ON public.deployment_targets USING btree (agent_id);


--
-- Name: idx_deployment_targets_agent_name; Type: INDEX; Schema: public; Owner: certctl
--

CREATE UNIQUE INDEX idx_deployment_targets_agent_name ON public.deployment_targets USING btree (agent_id, name);


--
-- Name: idx_deployment_targets_enabled; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_deployment_targets_enabled ON public.deployment_targets USING btree (enabled);


--
-- Name: idx_deployment_targets_name; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_deployment_targets_name ON public.deployment_targets USING btree (name);


--
-- Name: idx_deployment_targets_retired_at; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_deployment_targets_retired_at ON public.deployment_targets USING btree (retired_at) WHERE (retired_at IS NOT NULL);


--
-- Name: idx_discovered_certs_agent_id; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_discovered_certs_agent_id ON public.discovered_certificates USING btree (agent_id);


--
-- Name: idx_discovered_certs_fingerprint; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_discovered_certs_fingerprint ON public.discovered_certificates USING btree (fingerprint_sha256);


--
-- Name: idx_discovered_certs_fingerprint_agent_path; Type: INDEX; Schema: public; Owner: certctl
--

CREATE UNIQUE INDEX idx_discovered_certs_fingerprint_agent_path ON public.discovered_certificates USING btree (fingerprint_sha256, agent_id, source_path);


--
-- Name: idx_discovered_certs_managed_id; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_discovered_certs_managed_id ON public.discovered_certificates USING btree (managed_certificate_id) WHERE (managed_certificate_id IS NOT NULL);


--
-- Name: idx_discovered_certs_not_after; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_discovered_certs_not_after ON public.discovered_certificates USING btree (not_after);


--
-- Name: idx_discovered_certs_status; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_discovered_certs_status ON public.discovered_certificates USING btree (status);


--
-- Name: idx_discovery_scans_agent_id; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_discovery_scans_agent_id ON public.discovery_scans USING btree (agent_id);


--
-- Name: idx_discovery_scans_started_at; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_discovery_scans_started_at ON public.discovery_scans USING btree (started_at DESC);


--
-- Name: idx_group_role_mappings_provider_id; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_group_role_mappings_provider_id ON public.group_role_mappings USING btree (provider_id);


--
-- Name: idx_health_checks_certificate; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_health_checks_certificate ON public.endpoint_health_checks USING btree (certificate_id) WHERE (certificate_id IS NOT NULL);


--
-- Name: idx_health_checks_enabled; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_health_checks_enabled ON public.endpoint_health_checks USING btree (enabled) WHERE (enabled = true);


--
-- Name: idx_health_checks_endpoint; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_health_checks_endpoint ON public.endpoint_health_checks USING btree (endpoint);


--
-- Name: idx_health_checks_status; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_health_checks_status ON public.endpoint_health_checks USING btree (status);


--
-- Name: idx_health_history_check_time; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_health_history_check_time ON public.endpoint_health_history USING btree (health_check_id, checked_at DESC);


--
-- Name: idx_intermediate_ca_active_root_per_issuer; Type: INDEX; Schema: public; Owner: certctl
--

CREATE UNIQUE INDEX idx_intermediate_ca_active_root_per_issuer ON public.intermediate_cas USING btree (owning_issuer_id) WHERE ((parent_ca_id IS NULL) AND ((state)::text = 'active'::text));


--
-- Name: idx_intermediate_ca_expiring; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_intermediate_ca_expiring ON public.intermediate_cas USING btree (not_after) WHERE ((state)::text = 'active'::text);


--
-- Name: idx_intermediate_ca_owning_issuer; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_intermediate_ca_owning_issuer ON public.intermediate_cas USING btree (owning_issuer_id);


--
-- Name: idx_intermediate_ca_parent; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_intermediate_ca_parent ON public.intermediate_cas USING btree (parent_ca_id);


--
-- Name: idx_intermediate_ca_state; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_intermediate_ca_state ON public.intermediate_cas USING btree (state);


--
-- Name: idx_intermediate_ca_unique_name_per_issuer; Type: INDEX; Schema: public; Owner: certctl
--

CREATE UNIQUE INDEX idx_intermediate_ca_unique_name_per_issuer ON public.intermediate_cas USING btree (owning_issuer_id, name);


--
-- Name: idx_issuers_enabled; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_issuers_enabled ON public.issuers USING btree (enabled);


--
-- Name: idx_issuers_name; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_issuers_name ON public.issuers USING btree (name);


--
-- Name: idx_jobs_agent_id; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_jobs_agent_id ON public.jobs USING btree (agent_id);


--
-- Name: idx_jobs_certificate_id; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_jobs_certificate_id ON public.jobs USING btree (certificate_id);


--
-- Name: idx_jobs_scheduled_at; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_jobs_scheduled_at ON public.jobs USING btree (scheduled_at);


--
-- Name: idx_jobs_status; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_jobs_status ON public.jobs USING btree (status);


--
-- Name: idx_jobs_status_scheduled_at; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_jobs_status_scheduled_at ON public.jobs USING btree (status, scheduled_at);


--
-- Name: idx_jobs_verification_status; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_jobs_verification_status ON public.jobs USING btree (verification_status);


--
-- Name: idx_jobs_verified_at; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_jobs_verified_at ON public.jobs USING btree (verified_at);


--
-- Name: idx_managed_certificates_expires_at; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_managed_certificates_expires_at ON public.managed_certificates USING btree (expires_at);


--
-- Name: idx_managed_certificates_issuer_id; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_managed_certificates_issuer_id ON public.managed_certificates USING btree (issuer_id);


--
-- Name: idx_managed_certificates_name; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_managed_certificates_name ON public.managed_certificates USING btree (name);


--
-- Name: idx_managed_certificates_owner_id; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_managed_certificates_owner_id ON public.managed_certificates USING btree (owner_id);


--
-- Name: idx_managed_certificates_profile_id; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_managed_certificates_profile_id ON public.managed_certificates USING btree (certificate_profile_id);


--
-- Name: idx_managed_certificates_status; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_managed_certificates_status ON public.managed_certificates USING btree (status);


--
-- Name: idx_managed_certificates_team_id; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_managed_certificates_team_id ON public.managed_certificates USING btree (team_id);


--
-- Name: idx_network_scan_targets_enabled; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_network_scan_targets_enabled ON public.network_scan_targets USING btree (enabled) WHERE (enabled = true);


--
-- Name: idx_notification_events_certificate_id; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_notification_events_certificate_id ON public.notification_events USING btree (certificate_id);


--
-- Name: idx_notification_events_retry_sweep; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_notification_events_retry_sweep ON public.notification_events USING btree (next_retry_at) WHERE (((status)::text = 'failed'::text) AND (next_retry_at IS NOT NULL));


--
-- Name: idx_notification_events_status; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_notification_events_status ON public.notification_events USING btree (status);


--
-- Name: idx_notification_events_type; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_notification_events_type ON public.notification_events USING btree (type);


--
-- Name: idx_ocsp_responders_not_after; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_ocsp_responders_not_after ON public.ocsp_responders USING btree (not_after);


--
-- Name: idx_ocsp_response_cache_issuer; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_ocsp_response_cache_issuer ON public.ocsp_response_cache USING btree (issuer_id);


--
-- Name: idx_ocsp_response_cache_next_update; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_ocsp_response_cache_next_update ON public.ocsp_response_cache USING btree (next_update);


--
-- Name: idx_oidc_bcl_consumed_jtis_expires; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_oidc_bcl_consumed_jtis_expires ON public.oidc_bcl_consumed_jtis USING btree (expires_at);


--
-- Name: idx_oidc_pre_login_expires; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_oidc_pre_login_expires ON public.oidc_pre_login_sessions USING btree (absolute_expires_at);


--
-- Name: idx_oidc_pre_login_provider; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_oidc_pre_login_provider ON public.oidc_pre_login_sessions USING btree (oidc_provider_id);


--
-- Name: idx_owners_email; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_owners_email ON public.owners USING btree (email);


--
-- Name: idx_owners_team_id; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_owners_team_id ON public.owners USING btree (team_id);


--
-- Name: idx_policy_rules_enabled; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_policy_rules_enabled ON public.policy_rules USING btree (enabled);


--
-- Name: idx_policy_rules_name; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_policy_rules_name ON public.policy_rules USING btree (name);


--
-- Name: idx_policy_violations_certificate_id; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_policy_violations_certificate_id ON public.policy_violations USING btree (certificate_id);


--
-- Name: idx_policy_violations_rule_id; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_policy_violations_rule_id ON public.policy_violations USING btree (rule_id);


--
-- Name: idx_policy_violations_severity; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_policy_violations_severity ON public.policy_violations USING btree (severity);


--
-- Name: idx_renewal_policies_name; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_renewal_policies_name ON public.renewal_policies USING btree (name);


--
-- Name: idx_role_permissions_role; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_role_permissions_role ON public.role_permissions USING btree (role_id);


--
-- Name: idx_scep_probe_results_probed_at; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_scep_probe_results_probed_at ON public.scep_probe_results USING btree (probed_at DESC);


--
-- Name: idx_scep_probe_results_target_url; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_scep_probe_results_target_url ON public.scep_probe_results USING btree (target_url, probed_at DESC);


--
-- Name: idx_session_signing_keys_active; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_session_signing_keys_active ON public.session_signing_keys USING btree (tenant_id, created_at DESC) WHERE (retired_at IS NULL);


--
-- Name: idx_sessions_absolute_expires_at; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_sessions_absolute_expires_at ON public.sessions USING btree (absolute_expires_at);


--
-- Name: idx_sessions_active; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_sessions_active ON public.sessions USING btree (id) WHERE (revoked_at IS NULL);


--
-- Name: idx_sessions_actor_id; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_sessions_actor_id ON public.sessions USING btree (actor_id, actor_type) WHERE ((revoked_at IS NULL) AND (is_pre_login = false));


--
-- Name: idx_sessions_pre_login_gc; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_sessions_pre_login_gc ON public.sessions USING btree (created_at) WHERE (is_pre_login = true);


--
-- Name: idx_teams_name; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_teams_name ON public.teams USING btree (name);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX idx_users_email ON public.users USING btree (tenant_id, email);


--
-- Name: rate_limit_buckets_updated_at_idx; Type: INDEX; Schema: public; Owner: certctl
--

CREATE INDEX rate_limit_buckets_updated_at_idx ON public.rate_limit_buckets USING btree (updated_at);


--
-- Name: audit_events audit_events_hash_chain_trigger; Type: TRIGGER; Schema: public; Owner: certctl
--

CREATE TRIGGER audit_events_hash_chain_trigger BEFORE INSERT ON public.audit_events FOR EACH ROW EXECUTE FUNCTION public.audit_events_compute_hash_chain();


--
-- Name: audit_events audit_events_worm_trigger; Type: TRIGGER; Schema: public; Owner: certctl
--

CREATE TRIGGER audit_events_worm_trigger BEFORE DELETE OR UPDATE ON public.audit_events FOR EACH ROW EXECUTE FUNCTION public.audit_events_block_modification();


--
-- Name: acme_accounts acme_accounts_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.acme_accounts
    ADD CONSTRAINT acme_accounts_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.owners(id);


--
-- Name: acme_accounts acme_accounts_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.acme_accounts
    ADD CONSTRAINT acme_accounts_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.certificate_profiles(id);


--
-- Name: acme_authorizations acme_authorizations_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.acme_authorizations
    ADD CONSTRAINT acme_authorizations_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.acme_orders(order_id);


--
-- Name: acme_challenges acme_challenges_authz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.acme_challenges
    ADD CONSTRAINT acme_challenges_authz_id_fkey FOREIGN KEY (authz_id) REFERENCES public.acme_authorizations(authz_id);


--
-- Name: acme_orders acme_orders_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.acme_orders
    ADD CONSTRAINT acme_orders_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.acme_accounts(account_id);


--
-- Name: acme_orders acme_orders_certificate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.acme_orders
    ADD CONSTRAINT acme_orders_certificate_id_fkey FOREIGN KEY (certificate_id) REFERENCES public.managed_certificates(id);


--
-- Name: actor_roles actor_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.actor_roles
    ADD CONSTRAINT actor_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE RESTRICT;


--
-- Name: actor_roles actor_roles_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.actor_roles
    ADD CONSTRAINT actor_roles_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: agent_group_members agent_group_members_agent_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.agent_group_members
    ADD CONSTRAINT agent_group_members_agent_group_id_fkey FOREIGN KEY (agent_group_id) REFERENCES public.agent_groups(id) ON DELETE CASCADE;


--
-- Name: agent_group_members agent_group_members_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.agent_group_members
    ADD CONSTRAINT agent_group_members_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE CASCADE;


--
-- Name: api_keys api_keys_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: breakglass_credentials breakglass_credentials_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.breakglass_credentials
    ADD CONSTRAINT breakglass_credentials_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: breakglass_credentials breakglass_credentials_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.breakglass_credentials
    ADD CONSTRAINT breakglass_credentials_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: certificate_revocations certificate_revocations_certificate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.certificate_revocations
    ADD CONSTRAINT certificate_revocations_certificate_id_fkey FOREIGN KEY (certificate_id) REFERENCES public.managed_certificates(id);


--
-- Name: certificate_revocations certificate_revocations_issuer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.certificate_revocations
    ADD CONSTRAINT certificate_revocations_issuer_id_fkey FOREIGN KEY (issuer_id) REFERENCES public.issuers(id);


--
-- Name: certificate_target_mappings certificate_target_mappings_certificate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.certificate_target_mappings
    ADD CONSTRAINT certificate_target_mappings_certificate_id_fkey FOREIGN KEY (certificate_id) REFERENCES public.managed_certificates(id) ON DELETE CASCADE;


--
-- Name: certificate_target_mappings certificate_target_mappings_target_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.certificate_target_mappings
    ADD CONSTRAINT certificate_target_mappings_target_id_fkey FOREIGN KEY (target_id) REFERENCES public.deployment_targets(id) ON DELETE CASCADE;


--
-- Name: certificate_versions certificate_versions_certificate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.certificate_versions
    ADD CONSTRAINT certificate_versions_certificate_id_fkey FOREIGN KEY (certificate_id) REFERENCES public.managed_certificates(id) ON DELETE CASCADE;


--
-- Name: crl_cache crl_cache_issuer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.crl_cache
    ADD CONSTRAINT crl_cache_issuer_id_fkey FOREIGN KEY (issuer_id) REFERENCES public.issuers(id) ON DELETE CASCADE;


--
-- Name: deployment_targets deployment_targets_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.deployment_targets
    ADD CONSTRAINT deployment_targets_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE RESTRICT;


--
-- Name: discovered_certificates discovered_certificates_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.discovered_certificates
    ADD CONSTRAINT discovered_certificates_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(id);


--
-- Name: discovered_certificates discovered_certificates_discovery_scan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.discovered_certificates
    ADD CONSTRAINT discovered_certificates_discovery_scan_id_fkey FOREIGN KEY (discovery_scan_id) REFERENCES public.discovery_scans(id);


--
-- Name: discovered_certificates discovered_certificates_managed_certificate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.discovered_certificates
    ADD CONSTRAINT discovered_certificates_managed_certificate_id_fkey FOREIGN KEY (managed_certificate_id) REFERENCES public.managed_certificates(id);


--
-- Name: discovery_scans discovery_scans_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.discovery_scans
    ADD CONSTRAINT discovery_scans_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(id);


--
-- Name: endpoint_health_checks endpoint_health_checks_certificate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.endpoint_health_checks
    ADD CONSTRAINT endpoint_health_checks_certificate_id_fkey FOREIGN KEY (certificate_id) REFERENCES public.managed_certificates(id);


--
-- Name: endpoint_health_checks endpoint_health_checks_network_scan_target_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.endpoint_health_checks
    ADD CONSTRAINT endpoint_health_checks_network_scan_target_id_fkey FOREIGN KEY (network_scan_target_id) REFERENCES public.network_scan_targets(id);


--
-- Name: endpoint_health_history endpoint_health_history_health_check_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.endpoint_health_history
    ADD CONSTRAINT endpoint_health_history_health_check_id_fkey FOREIGN KEY (health_check_id) REFERENCES public.endpoint_health_checks(id) ON DELETE CASCADE;


--
-- Name: group_role_mappings group_role_mappings_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.group_role_mappings
    ADD CONSTRAINT group_role_mappings_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.oidc_providers(id) ON DELETE CASCADE;


--
-- Name: group_role_mappings group_role_mappings_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.group_role_mappings
    ADD CONSTRAINT group_role_mappings_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE RESTRICT;


--
-- Name: group_role_mappings group_role_mappings_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.group_role_mappings
    ADD CONSTRAINT group_role_mappings_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: intermediate_cas intermediate_cas_owning_issuer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.intermediate_cas
    ADD CONSTRAINT intermediate_cas_owning_issuer_id_fkey FOREIGN KEY (owning_issuer_id) REFERENCES public.issuers(id) ON DELETE RESTRICT;


--
-- Name: intermediate_cas intermediate_cas_parent_ca_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.intermediate_cas
    ADD CONSTRAINT intermediate_cas_parent_ca_id_fkey FOREIGN KEY (parent_ca_id) REFERENCES public.intermediate_cas(id) ON DELETE RESTRICT;


--
-- Name: issuance_approval_requests issuance_approval_requests_certificate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.issuance_approval_requests
    ADD CONSTRAINT issuance_approval_requests_certificate_id_fkey FOREIGN KEY (certificate_id) REFERENCES public.managed_certificates(id) ON DELETE CASCADE;


--
-- Name: issuance_approval_requests issuance_approval_requests_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.issuance_approval_requests
    ADD CONSTRAINT issuance_approval_requests_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: issuance_approval_requests issuance_approval_requests_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.issuance_approval_requests
    ADD CONSTRAINT issuance_approval_requests_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.certificate_profiles(id) ON DELETE RESTRICT;


--
-- Name: jobs jobs_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE SET NULL;


--
-- Name: jobs jobs_certificate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_certificate_id_fkey FOREIGN KEY (certificate_id) REFERENCES public.managed_certificates(id) ON DELETE CASCADE;


--
-- Name: jobs jobs_target_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_target_id_fkey FOREIGN KEY (target_id) REFERENCES public.deployment_targets(id) ON DELETE SET NULL;


--
-- Name: managed_certificates managed_certificates_certificate_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.managed_certificates
    ADD CONSTRAINT managed_certificates_certificate_profile_id_fkey FOREIGN KEY (certificate_profile_id) REFERENCES public.certificate_profiles(id) ON DELETE SET NULL;


--
-- Name: managed_certificates managed_certificates_issuer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.managed_certificates
    ADD CONSTRAINT managed_certificates_issuer_id_fkey FOREIGN KEY (issuer_id) REFERENCES public.issuers(id) ON DELETE RESTRICT;


--
-- Name: managed_certificates managed_certificates_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.managed_certificates
    ADD CONSTRAINT managed_certificates_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.owners(id) ON DELETE RESTRICT;


--
-- Name: managed_certificates managed_certificates_renewal_policy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.managed_certificates
    ADD CONSTRAINT managed_certificates_renewal_policy_id_fkey FOREIGN KEY (renewal_policy_id) REFERENCES public.renewal_policies(id) ON DELETE RESTRICT;


--
-- Name: managed_certificates managed_certificates_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.managed_certificates
    ADD CONSTRAINT managed_certificates_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- Name: notification_events notification_events_certificate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.notification_events
    ADD CONSTRAINT notification_events_certificate_id_fkey FOREIGN KEY (certificate_id) REFERENCES public.managed_certificates(id) ON DELETE CASCADE;


--
-- Name: ocsp_responders ocsp_responders_issuer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.ocsp_responders
    ADD CONSTRAINT ocsp_responders_issuer_id_fkey FOREIGN KEY (issuer_id) REFERENCES public.issuers(id) ON DELETE CASCADE;


--
-- Name: ocsp_response_cache ocsp_response_cache_issuer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.ocsp_response_cache
    ADD CONSTRAINT ocsp_response_cache_issuer_id_fkey FOREIGN KEY (issuer_id) REFERENCES public.issuers(id) ON DELETE CASCADE;


--
-- Name: oidc_pre_login_sessions oidc_pre_login_sessions_oidc_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.oidc_pre_login_sessions
    ADD CONSTRAINT oidc_pre_login_sessions_oidc_provider_id_fkey FOREIGN KEY (oidc_provider_id) REFERENCES public.oidc_providers(id) ON DELETE CASCADE;


--
-- Name: oidc_pre_login_sessions oidc_pre_login_sessions_signing_key_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.oidc_pre_login_sessions
    ADD CONSTRAINT oidc_pre_login_sessions_signing_key_id_fkey FOREIGN KEY (signing_key_id) REFERENCES public.session_signing_keys(id) ON DELETE RESTRICT;


--
-- Name: oidc_pre_login_sessions oidc_pre_login_sessions_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.oidc_pre_login_sessions
    ADD CONSTRAINT oidc_pre_login_sessions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: oidc_providers oidc_providers_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.oidc_providers
    ADD CONSTRAINT oidc_providers_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: owners owners_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.owners
    ADD CONSTRAINT owners_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- Name: policy_violations policy_violations_certificate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.policy_violations
    ADD CONSTRAINT policy_violations_certificate_id_fkey FOREIGN KEY (certificate_id) REFERENCES public.managed_certificates(id) ON DELETE CASCADE;


--
-- Name: policy_violations policy_violations_rule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.policy_violations
    ADD CONSTRAINT policy_violations_rule_id_fkey FOREIGN KEY (rule_id) REFERENCES public.policy_rules(id) ON DELETE CASCADE;


--
-- Name: renewal_policies renewal_policies_agent_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.renewal_policies
    ADD CONSTRAINT renewal_policies_agent_group_id_fkey FOREIGN KEY (agent_group_id) REFERENCES public.agent_groups(id) ON DELETE SET NULL;


--
-- Name: renewal_policies renewal_policies_certificate_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.renewal_policies
    ADD CONSTRAINT renewal_policies_certificate_profile_id_fkey FOREIGN KEY (certificate_profile_id) REFERENCES public.certificate_profiles(id) ON DELETE SET NULL;


--
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE RESTRICT;


--
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: roles roles_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: session_signing_keys session_signing_keys_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.session_signing_keys
    ADD CONSTRAINT session_signing_keys_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_signing_key_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_signing_key_id_fkey FOREIGN KEY (signing_key_id) REFERENCES public.session_signing_keys(id) ON DELETE RESTRICT;


--
-- Name: sessions sessions_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: users users_oidc_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_oidc_provider_id_fkey FOREIGN KEY (oidc_provider_id) REFERENCES public.oidc_providers(id) ON DELETE RESTRICT;


--
-- Name: users users_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: certctl
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: TABLE audit_events; Type: ACL; Schema: public; Owner: certctl
--

REVOKE ALL ON TABLE public.audit_events FROM certctl;
GRANT SELECT,INSERT,REFERENCES,TRIGGER,TRUNCATE ON TABLE public.audit_events TO certctl;


--
-- PostgreSQL database dump complete
--

\unrestrict rG5wGIczaozvGIGJ1PITYWfK110GLHIaePYSdP1P5SP0bNfgnNfScUEpgf2gcWR

