package service

import (
	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/repository"
	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/model"
	"fmt"
	"context"
)

type StakeholderService struct {
	repo *repository.StakeholderRepository
}

func NewStakeholderService(repo *repository.StakeholderRepository) *StakeholderService {
	return &StakeholderService{repo: repo}
}

func (service *StakeholderService) GetAllStakeholders(ctx context.Context) ([]model.Stakeholder, error) {

	stakeholders, err := service.repo.FindAll(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve all stakeholders: %w", err)
	}
	return stakeholders, nil
}