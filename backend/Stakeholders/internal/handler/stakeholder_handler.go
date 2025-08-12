package handler

import (
	//"context"
	"log"
	"net/http"
	"encoding/json"
	//"github.com/gorilla/mux"
	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/service"
	//stakeholder_proto "github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/proto"
)


type StakeholderHandler struct {
	//stakeholder_proto.UnimplementedStakeholderServiceServer
	service *service.StakeholderService
}

func NewStakeholderHandler(service *service.StakeholderService) *StakeholderHandler {
	return &StakeholderHandler{service: service}
}

func (h *StakeholderHandler) GetAllStakeholders(writer http.ResponseWriter, req *http.Request) {
	log.Println("Handling GetAllStakeholders request")

	stakeholders, err := h.service.GetAllStakeholders(req.Context())

	if err != nil {
		http.Error(writer, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	writer.Header().Set("Content-Type", "application/json")
	writer.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(writer).Encode(stakeholders); err != nil {
		log.Printf("Error encoding response: %v", err)
	}
}