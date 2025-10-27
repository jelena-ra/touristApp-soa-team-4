package handler

import (
	"encoding/json"
	//"context"
	"log"
	"net/http"
	//"github.com/gorilla/mux"
	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/service"
	//stakeholder_proto "github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/proto"
	"github.com/gorilla/mux"
)

type UserHandler struct {
	//stakeholder_proto.UnimplementedStakeholderServiceServer
	service *service.UserService
}

func NewUserHandler(service *service.UserService) *UserHandler {
	return &UserHandler{service: service}
}

func (h *UserHandler) GetAllUsers(writer http.ResponseWriter, req *http.Request) {
	log.Println("Handling GetAllUsers request")

	users, err := h.service.GetAllUsers(req.Context())

	if err != nil {
		http.Error(writer, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	writer.Header().Set("Content-Type", "application/json")
	writer.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(writer).Encode(users); err != nil {
		log.Printf("Error encoding response: %v", err)
	}
}

func (h *UserHandler) GetUser(writer http.ResponseWriter, req *http.Request) {

	user, err := h.service.GetUser(req.Context(), mux.Vars(req)["id"])

	if err != nil {
		http.Error(writer, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	writer.Header().Set("Content-Type", "application/json")
	writer.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(writer).Encode(user); err != nil {
		log.Printf("Error encoding response: %v", err)
	}
}

func (h *UserHandler) BlockUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	if id == "" {
		http.Error(w, "Nedostaje ID korisnika.", http.StatusBadRequest)
		return
	}

	_, updatedUser, err := h.service.Block((r.Context()), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updatedUser)
}

func (h *UserHandler) CheckIfUserExists(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	if id == "" {
		http.Error(w, "Nedostaje ID korisnika.", http.StatusBadRequest)
		return
	}

	exists, err := h.service.CheckIfUserExists(id)
	if err != nil {
		http.Error(w, "Greška na serveru.", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	if !exists {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"message": "User wasn't found"})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "User exists"})
}
