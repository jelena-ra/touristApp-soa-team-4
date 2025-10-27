package service

import (
	"context"
	"fmt"

	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/model"
	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/repository"
)

type ProfileService struct {
	r *repository.ProfileRepository
}

func NewProfileService(repo *repository.ProfileRepository) *ProfileService {
	return &ProfileService{r: repo}
}

func (s *ProfileService) GetByUserID(ctx context.Context, userId string) (model.Profile, error) {

	profile, err := s.r.GetByUserID(userId, ctx)
	if err != nil {
		return model.Profile{}, fmt.Errorf("failed to retrieve profile: %w", err)
	}
	return profile, nil
}

func (s *ProfileService) CreateNewProfile(ctx context.Context, profile model.Profile) (model.Profile, error) {
	profile, err := s.r.CreateProfile(profile, ctx)
	if err != nil {
		return model.Profile{}, fmt.Errorf("failed to retrieve profile: %w", err)
	}
	return profile, nil
}

func (s *ProfileService) UpdateProfile(ctx context.Context, profile model.Profile) (model.Profile, error) {

	profile, err := s.r.UpdateProfile(profile, ctx)
	if err != nil {
		return model.Profile{}, fmt.Errorf("failed to update profile: %w", err)
	}
	return profile, nil
}
