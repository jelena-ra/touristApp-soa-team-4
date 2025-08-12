package handler

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"

	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/model"
	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/service"
)


type AuthenticationHandler struct {
	authenticationService *service.AuthenticationService
}


func NewAuthenticationHandler(service *service.AuthenticationService) *AuthenticationHandler {
	return &AuthenticationHandler{
		authenticationService: service,
	}
}


func (h *AuthenticationHandler) Register(w http.ResponseWriter, r *http.Request) {
	var account model.AccountRegistrationDto
	err := json.NewDecoder(r.Body).Decode(&account)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	result, err := h.authenticationService.RegisterTourist(&account)
	if err != nil {
		if err == service.ErrUsernameNotUnique {
			http.Error(w, "Username not unique", http.StatusBadRequest)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}


func (h *AuthenticationHandler) Login(w http.ResponseWriter, r *http.Request) {
	var credentials model.CredentialsDto
	err := json.NewDecoder(r.Body).Decode(&credentials)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	result, err := h.authenticationService.Login(&credentials)
	if err != nil {
		if err == service.ErrUserNotFound {
			http.Error(w, "Invalid credentials", http.StatusUnauthorized)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}


func (h *AuthenticationHandler) RegisterRoutes(router *mux.Router) {
	router.HandleFunc("/api/users", h.Register).Methods("POST")
	router.HandleFunc("/api/users/login", h.Login).Methods("POST")
}
