package service

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/zulufun/certctl-localhost/internal/auth/user/domain"
	"github.com/zulufun/certctl-localhost/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

type mockUserRepo struct {
	repository.UserRepository
	users map[string]*domain.User
}

func (m *mockUserRepo) GetByEmail(ctx context.Context, tenantID, email string) (*domain.User, error) {
	for _, u := range m.users {
		if u.TenantID == tenantID && u.Email == email {
			return u, nil
		}
	}
	return nil, repository.ErrUserNotFound
}

func (m *mockUserRepo) Create(ctx context.Context, u *domain.User) error {
	m.users[u.ID] = u
	return nil
}

func (m *mockUserRepo) Update(ctx context.Context, u *domain.User) error {
	if _, ok := m.users[u.ID]; !ok {
		return repository.ErrUserNotFound
	}
	m.users[u.ID] = u
	return nil
}

func (m *mockUserRepo) Get(ctx context.Context, id string) (*domain.User, error) {
	u, ok := m.users[id]
	if !ok {
		return nil, repository.ErrUserNotFound
	}
	return u, nil
}

func TestLocalAuthService_Authenticate(t *testing.T) {
	repo := &mockUserRepo{users: make(map[string]*domain.User)}
	svc := NewLocalAuthService(repo)

	hash, _ := bcrypt.GenerateFromPassword([]byte("validpassword"), bcrypt.DefaultCost)
	repo.users["u-1"] = &domain.User{
		ID:           "u-1",
		TenantID:     "t-default",
		Email:        "test@example.com",
		PasswordHash: string(hash),
	}
	
	deactivatedAt := time.Now()
	repo.users["u-2"] = &domain.User{
		ID:           "u-2",
		TenantID:     "t-default",
		Email:        "deactivated@example.com",
		PasswordHash: string(hash),
		DeactivatedAt: &deactivatedAt,
	}

	tests := []struct {
		name    string
		email   string
		pass    string
		wantErr error
	}{
		{"Valid Credentials", "test@example.com", "validpassword", nil},
		{"Invalid Password", "test@example.com", "wrongpassword", ErrInvalidCredentials},
		{"Unknown User", "unknown@example.com", "password", ErrInvalidCredentials},
		{"Empty Email", "", "password", ErrInvalidCredentials},
		{"Empty Password", "test@example.com", "", ErrInvalidCredentials},
		{"Deactivated User", "deactivated@example.com", "validpassword", ErrInvalidCredentials},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := svc.Authenticate(context.Background(), "t-default", tt.email, tt.pass)
			if !errors.Is(err, tt.wantErr) {
				t.Errorf("Authenticate() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestLocalAuthService_CreateUser(t *testing.T) {
	repo := &mockUserRepo{users: make(map[string]*domain.User)}
	svc := NewLocalAuthService(repo)

	u := &domain.User{
		ID:       "u-3",
		TenantID: "t-default",
		Email:    "new@example.com",
	}

	err := svc.CreateUser(context.Background(), u, "short")
	if !errors.Is(err, ErrPasswordTooShort) {
		t.Errorf("CreateUser() short password error = %v, want %v", err, ErrPasswordTooShort)
	}

	err = svc.CreateUser(context.Background(), u, "validpassword")
	if err != nil {
		t.Errorf("CreateUser() valid password error = %v", err)
	}

	if u.PasswordHash == "" {
		t.Errorf("CreateUser() did not set PasswordHash")
	}
}
