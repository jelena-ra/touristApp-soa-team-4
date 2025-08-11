package handler

import (
	"context"
	"log"

	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/service"
	stakeholder_proto "github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/proto"
)


type StakeholderHandler struct {
	stakeholder_proto.UnimplementedStakeholderServiceServer
	service *service.StakeholderService
}

func NewStakeholderHandler(service *service.StakeholderService) *StakeholderHandler {
	return &StakeholderHandler{service: service}
}


func (h *StakeholderHandler) GetAllStakeholders(ctx context.Context, req *stakeholder_proto.GetAllStakeholdersRequest) (*stakeholder_proto.GetAllStakeholdersResponse, error) {
	// Ovdje će ići logika za pozivanje service sloja 
	log.Println("Handling GetAllStakeholders request")
	return &stakeholder_proto.GetAllStakeholdersResponse{}, nil
}


func (h *StakeholderHandler) CreateStakeholder(ctx context.Context, req *stakeholder_proto.CreateStakeholderRequest) (*stakeholder_proto.CreateStakeholderResponse, error) {
	log.Println("Handling CreateStakeholder request")
	return &stakeholder_proto.CreateStakeholderResponse{}, nil
}


func (h *StakeholderHandler) GetStakeholder(ctx context.Context, req *stakeholder_proto.GetStakeholderRequest) (*stakeholder_proto.GetStakeholderResponse, error) {
	log.Println("Handling GetStakeholder request")
	return &stakeholder_proto.GetStakeholderResponse{}, nil
}