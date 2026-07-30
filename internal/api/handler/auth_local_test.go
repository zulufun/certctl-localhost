package handler

import (
	"bytes"
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	userdomain "github.com/zulufun/certctl-localhost/internal/auth/user/domain"
	"github.com/zulufun/certctl-localhost/internal/domain"
	"github.com/zulufun/certctl-localhost/internal/repository"
	"github.com/zulufun/certctl-localhost/internal/service"
	"golang.org/x/crypto/bcrypt"
)

type mockUserRepoLocal struct {
	repository.UserRepository
	users map[string]*userdomain.User
}

func (m *mockUserRepoLocal) GetByEmail(ctx context.Context, tenantID, email string) (*userdomain.User, error) {
	for _, u := range m.users {
		if u.TenantID == tenantID && u.Email == email {
			return u, nil
		}
	}
	return nil, repository.ErrUserNotFound
}

func (m *mockUserRepoLocal) Create(ctx context.Context, u *userdomain.User) error {
	m.users[u.ID] = u
	return nil
}

func (m *mockUserRepoLocal) Update(ctx context.Context, u *userdomain.User) error {
	if _, ok := m.users[u.ID]; !ok {
		return repository.ErrUserNotFound
	}
	m.users[u.ID] = u
	return nil
}

func (m *mockUserRepoLocal) Get(ctx context.Context, id string) (*userdomain.User, error) {
	u, ok := m.users[id]
	if !ok {
		return nil, repository.ErrUserNotFound
	}
	return u, nil
}

type stubAuditRecorderLocal struct{}
func (r *stubAuditRecorderLocal) RecordEventWithCategory(ctx context.Context, actorID string, actorType domain.ActorType, action, category, resourceType, resourceID string, meta map[string]interface{}) error { return nil }
func (r *stubAuditRecorderLocal) RecordEvent(ctx context.Context, actorID string, actorType domain.ActorType, action, resourceType, resourceID string, meta map[string]interface{}) error { return nil }

func setupLocalAuthHandler() (*AuthLocalHandler, *mockUserRepoLocal) {
	repo := &mockUserRepoLocal{users: make(map[string]*userdomain.User)}
	localAuth := service.NewLocalAuthService(repo)
	audit := &stubAuditRecorderLocal{}
	
	attrs := SessionCookieAttrs{
		Secure: false,
		SameSite: http.SameSiteLaxMode,
	}
	return NewAuthLocalHandler(localAuth, audit, nil, attrs), repo
}

func TestAuthLocalHandler_Login(t *testing.T) {
	h, repo := setupLocalAuthHandler()
	
	hash, _ := bcrypt.GenerateFromPassword([]byte("validpassword"), bcrypt.DefaultCost)
	repo.users["u-1"] = &userdomain.User{
		ID:           "u-1",
		TenantID:     "t-default",
		Email:        "test@example.com",
		PasswordHash: string(hash),
	}

	body := bytes.NewBufferString(`{"email":"test@example.com","password":"validpassword"}`)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/local/login", body)
	rec := httptest.NewRecorder()
	
	h.Login(rec, req)
	
	if rec.Code != http.StatusOK {
		t.Errorf("Login code = %d; want 200", rec.Code)
	}
}

func TestAuthLocalHandler_Login_InvalidCredentials(t *testing.T) {
	h, repo := setupLocalAuthHandler()
	
	hash, _ := bcrypt.GenerateFromPassword([]byte("validpassword"), bcrypt.DefaultCost)
	repo.users["u-1"] = &userdomain.User{
		ID:           "u-1",
		TenantID:     "t-default",
		Email:        "test@example.com",
		PasswordHash: string(hash),
	}

	body := bytes.NewBufferString(`{"email":"test@example.com","password":"wrongpassword"}`)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/local/login", body)
	rec := httptest.NewRecorder()
	
	h.Login(rec, req)
	
	if rec.Code != http.StatusUnauthorized {
		t.Errorf("Login invalid code = %d; want 401", rec.Code)
	}
}
