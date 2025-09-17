package service

import (
	"context"

	"github.com/jelena-ra/touristApp/soa-team-4/Tours/internal/model"
	"github.com/jelena-ra/touristApp/soa-team-4/Tours/internal/repository"
)

type TourService struct {
	tourRepo     repository.TourRepository
	keyPointRepo repository.KeyPointRepository
}

func NewTourService(tourRepo repository.TourRepository, keyPointRepo repository.KeyPointRepository) *TourService {
	return &TourService{
		tourRepo:     tourRepo,
		keyPointRepo: keyPointRepo,
	}
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

func (s *TourService) GetKeyPoints(ctx context.Context, id string) ([]*model.KeyPoint, error) {
	return s.keyPointRepo.GetKeyPointByTourId(ctx, id)
}

func (s *TourService) CreateKeyPoint(ctx context.Context, keyPoint *model.KeyPoint) (*model.KeyPoint, error) {
	_, err := s.tourRepo.GetByID(ctx, keyPoint.TourID.Hex())
	if err != nil {
		return nil, err
	}

	return s.keyPointRepo.CreateKeyPoint(ctx, keyPoint)
}
