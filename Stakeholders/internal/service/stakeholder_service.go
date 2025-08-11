package service

import "github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/repository"

type StakeholderService struct {
	repo *repository.StakeholderRepository
}

func NewStakeholderService(repo *repository.StakeholderRepository) *StakeholderService {
	return &StakeholderService{repo: repo}
}