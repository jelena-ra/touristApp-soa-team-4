package service

import (
	"context"
	"errors"

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

func (s *TourService) Update(ctx context.Context, tour *model.Tour) (*model.Tour, error) {
	oldData, err := s.tourRepo.GetByID(ctx, tour.ID.String())
	if err != nil {
		return nil, err
	}

	if oldData.Status != tour.Status {
		if tour.Status == model.Published {
			oldData.Publish()
		} else if tour.Status == model.Archived {
			oldData.Archive()
		} else {
			return nil, errors.New("cannot change tour status bach to draft")
		}

		updateTour, err := s.tourRepo.UpdateTour(ctx, tour)
		if err != nil {
			return nil, err
		}
		return updateTour, nil
	}

	updateTour, err := s.tourRepo.UpdateTour(ctx, tour)
	if err != nil {
		return nil, err
	}
	return updateTour, nil
}

func (s *TourService) GetKeyPoints(ctx context.Context, id string) ([]*model.KeyPoint, error) {
	return s.keyPointRepo.GetKeyPointByTourId(ctx, id)
}

func (s *TourService) CreateKeyPoint(ctx context.Context, keyPoint *model.KeyPoint) (*model.KeyPoint, error) {
	tour, err := s.tourRepo.GetByID(ctx, keyPoint.TourID.Hex())
	if err != nil {
		return nil, err
	}

	if tour.Status != model.Draft {
		return nil, errors.New("tour status is not draft")
	}

	return s.keyPointRepo.CreateKeyPoint(ctx, keyPoint)
}
