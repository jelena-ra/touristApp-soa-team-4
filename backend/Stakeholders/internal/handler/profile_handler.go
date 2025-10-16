package handler

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/model"
	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/service"
)

type ProfileHandler struct {
	service *service.ProfileService
}

func NewProfileHandler(service *service.ProfileService) *ProfileHandler {
	return &ProfileHandler{service: service}
}

func (h *ProfileHandler) GetProfileByUserId(w http.ResponseWriter, r *http.Request) {

	vars := mux.Vars(r)
	userId := vars["userId"]

	profile, err := h.service.GetByUserID(r.Context(), userId)
	if err != nil {
		log.Printf("Error retrieving profile for user %d: %v", userId, err)

		http.Error(w, "Profile not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(profile); err != nil {
		log.Printf("Error encoding response: %v", err)
	}
}

func (h *ProfileHandler) CreateProfile(w http.ResponseWriter, r *http.Request) {

	var newProfile model.Profile
	if err := json.NewDecoder(r.Body).Decode(&newProfile); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		log.Printf("Error decoding request body: %v", err)
		return
	}

	createdProfile, err := h.service.CreateNewProfile(r.Context(), newProfile)
	if err != nil {
		log.Printf("Error creating profile: %v", err)

		http.Error(w, "Failed to create profile", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(createdProfile); err != nil {
		log.Printf("Error encoding response: %v", err)
	}
}

func (h *ProfileHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {

	var updatedProfile model.Profile
	if err := json.NewDecoder(r.Body).Decode(&updatedProfile); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		log.Printf("Error decoding request body: %v", err)
		return
	}

	createdProfile, err := h.service.UpdateProfile(r.Context(), updatedProfile)
	if err != nil {
		log.Printf("Error updating profile: %v", err)

		http.Error(w, "Failed to update profile", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(createdProfile); err != nil {
		log.Printf("Error encoding response: %v", err)
	}
}
