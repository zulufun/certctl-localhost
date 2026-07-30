package service

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"

	userdomain "github.com/zulufun/certctl-localhost/internal/auth/user/domain"
	"github.com/zulufun/certctl-localhost/internal/repository"
)

var (
	ErrInvalidCredentials  = errors.New("invalid email or password")
	ErrPasswordTooShort    = errors.New("password must be at least 8 characters")
)

type LocalAuthService struct {
	users repository.UserRepository
}

func NewLocalAuthService(users repository.UserRepository) *LocalAuthService {
	return &LocalAuthService{users: users}
}

// Authenticate verifies the email and password, and returns the User if successful.
func (s *LocalAuthService) Authenticate(ctx context.Context, tenantID, email, password string) (*userdomain.User, error) {
	email = strings.TrimSpace(email)
	if email == "" || password == "" {
		return nil, ErrInvalidCredentials
	}

	u, err := s.users.GetByEmail(ctx, tenantID, email)
	if err != nil {
		if errors.Is(err, repository.ErrUserNotFound) {
			// Prevent timing attacks by hashing a dummy password?
			// For an internal tool, standard bcrypt is usually enough without constant-time dummy hash,
			// but returning ErrInvalidCredentials masks the existence of the user.
			return nil, ErrInvalidCredentials
		}
		return nil, fmt.Errorf("auth db error: %w", err)
	}

	if u.DeactivatedAt != nil {
		return nil, ErrInvalidCredentials // Treat deactivated as invalid login
	}

	if err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(password)); err != nil {
		return nil, ErrInvalidCredentials
	}

	// Update last login
	u.LastLoginAt = time.Now().UTC()
	_ = s.users.Update(ctx, u)

	return u, nil
}

// CreateUser creates a new local user with a password.
func (s *LocalAuthService) CreateUser(ctx context.Context, u *userdomain.User, password string) error {
	if len(password) < 8 {
		return ErrPasswordTooShort
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}
	
	u.PasswordHash = string(hash)
	
	// Local users must not have OIDC fields
	u.OIDCSubject = ""
	u.OIDCProviderID = ""
	
	if err := u.Validate(); err != nil {
		return err
	}
	
	if err := s.users.Create(ctx, u); err != nil {
		return fmt.Errorf("create user: %w", err)
	}
	return nil
}

// UpdatePassword updates a user's password.
func (s *LocalAuthService) UpdatePassword(ctx context.Context, userID, newPassword string) error {
	if len(newPassword) < 8 {
		return ErrPasswordTooShort
	}
	
	u, err := s.users.Get(ctx, userID)
	if err != nil {
		return fmt.Errorf("get user: %w", err)
	}
	
	hash, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("hash password: %w", err)
	}
	
	u.PasswordHash = string(hash)
	if err := s.users.Update(ctx, u); err != nil {
		return fmt.Errorf("update user: %w", err)
	}
	return nil
}
