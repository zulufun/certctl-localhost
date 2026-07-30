package handler

import (
	"encoding/json"
	"errors"
	"net/http"

	userdomain "github.com/zulufun/certctl-localhost/internal/auth/user/domain"
	"github.com/zulufun/certctl-localhost/internal/domain"
	"github.com/zulufun/certctl-localhost/internal/service"
	"github.com/google/uuid"
	sessiondomain "github.com/zulufun/certctl-localhost/internal/auth/session/domain"
	sessionsvc "github.com/zulufun/certctl-localhost/internal/auth/session"
)

type AuthLocalHandler struct {
	localAuth *service.LocalAuthService
	audit     AuditRecorder
	sessions  *sessionsvc.Service
	cookieAttrs SessionCookieAttrs
}

func NewAuthLocalHandler(localAuth *service.LocalAuthService, audit AuditRecorder, sessions *sessionsvc.Service, cookieAttrs SessionCookieAttrs) *AuthLocalHandler {
	return &AuthLocalHandler{localAuth: localAuth, audit: audit, sessions: sessions, cookieAttrs: cookieAttrs}
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h *AuthLocalHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	u, err := h.localAuth.Authenticate(r.Context(), "t-default", req.Email, req.Password)
	if err != nil {
		if errors.Is(err, service.ErrInvalidCredentials) {
			_ = h.audit.RecordEventWithCategory(r.Context(), req.Email, "User", "auth.local_login_failed", domain.EventCategoryAuth, "user", "", map[string]interface{}{"reason": "invalid_credentials"})
			Error(w, http.StatusUnauthorized, "invalid email or password")
			return
		}
		Error(w, http.StatusInternalServerError, "login error")
		return
	}

	clientIP := r.Header.Get("X-Forwarded-For")
	if clientIP == "" {
		clientIP = r.RemoteAddr
	}

	// Create a session for the user
	if h.sessions != nil {
		res, cerr := h.sessions.Create(r.Context(), u.ID, string(domain.ActorTypeUser), clientIP, r.UserAgent())
		if cerr != nil {
			Error(w, http.StatusInternalServerError, "could not create session")
			return
		}

		http.SetCookie(w, &http.Cookie{
			Name:     sessiondomain.PostLoginCookieName,
			Value:    res.CookieValue,
			Path:     "/",
			Expires:  res.Session.AbsoluteExpiresAt,
			Secure:   h.cookieAttrs.Secure,
			HttpOnly: true,
			SameSite: h.cookieAttrs.SameSite,
		})
		http.SetCookie(w, &http.Cookie{
			Name:     sessiondomain.CSRFCookieName,
			Value:    res.CSRFToken,
			Path:     "/",
			Expires:  res.Session.AbsoluteExpiresAt,
			Secure:   h.cookieAttrs.Secure,
			HttpOnly: false, // GUI reads this to echo in headers
			SameSite: h.cookieAttrs.SameSite,
		})
	}

	_ = h.audit.RecordEventWithCategory(r.Context(), u.ID, "User", "auth.local_login_success", domain.EventCategoryAuth, "user", u.ID, nil)

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"message": "login successful",
		"user":    userToResponse(u),
	})
}

type createUserRequest struct {
	Email       string `json:"email"`
	DisplayName string `json:"display_name"`
	Password    string `json:"password"`
}

func (h *AuthLocalHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
	caller, err := callerFromRequest(r)
	if err != nil {
		writeAuthError(w, err)
		return
	}

	var req createUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	u := &userdomain.User{
		ID:          "u-" + uuid.New().String()[:8],
		TenantID:    "t-default",
		Email:       req.Email,
		DisplayName: req.DisplayName,
	}

	err = h.localAuth.CreateUser(r.Context(), u, req.Password)
	if err != nil {
		if errors.Is(err, service.ErrPasswordTooShort) {
			Error(w, http.StatusBadRequest, "password too short")
			return
		}
		Error(w, http.StatusInternalServerError, "could not create user")
		return
	}

	_ = h.audit.RecordEventWithCategory(r.Context(), caller.ActorID, caller.ActorType, "auth.user_created", domain.EventCategoryAuth, "user", u.ID, nil)

	writeJSON(w, http.StatusCreated, userToResponse(u))
}

type updatePasswordRequest struct {
	Password string `json:"password"`
}

func (h *AuthLocalHandler) UpdatePassword(w http.ResponseWriter, r *http.Request) {
	caller, err := callerFromRequest(r)
	if err != nil {
		writeAuthError(w, err)
		return
	}

	id := r.PathValue("id")
	if id == "" {
		Error(w, http.StatusBadRequest, "missing user id")
		return
	}

	var req updatePasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	err = h.localAuth.UpdatePassword(r.Context(), id, req.Password)
	if err != nil {
		Error(w, http.StatusInternalServerError, "could not update password")
		return
	}

	_ = h.audit.RecordEventWithCategory(r.Context(), caller.ActorID, caller.ActorType, "auth.user_password_updated", domain.EventCategoryAuth, "user", id, nil)

	w.WriteHeader(http.StatusNoContent)
}
