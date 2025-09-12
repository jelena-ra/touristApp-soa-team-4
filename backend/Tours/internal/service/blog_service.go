package service

import (
	"Tours/internal/model"
	"Tours/internal/repository"
	"context"
)

type TourService struct {
	tourRepo repository.TourRepository
}

func NewTourService(tourRepo repository.TourRepository) *TourService {
	return &TourService{tourRepo: tourRepo}
}

func (s *TourService) GetAll(ctx context.Context) ([]*model.Tour, error) {
	return s.tourRepo.GetAll(ctx)
}

func (s *TourService) GetByID(ctx context.Context, id string) (*model.Tour, error) {
	return s.tourRepo.GetByID(ctx, id)
}

func (s *TourService) Create(ctx context.Context, tour *model.Tour) (*model.Tour, error) {
	tour.Status = model.Draft
	tour.Price = 0.00

	return s.tourRepo.CreateTour(ctx, tour)
}
