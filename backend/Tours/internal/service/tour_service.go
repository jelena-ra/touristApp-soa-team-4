package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/jelena-ra/touristApp/soa-team-4/Tours/internal/model"
	"github.com/jelena-ra/touristApp/soa-team-4/Tours/internal/repository"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type TourService struct {
	tourRepo      repository.TourRepository
	keyPointRepo  repository.KeyPointRepository
	recensionRepo *repository.RecensionRepository
}

func NewTourService(tourRepo repository.TourRepository, keyPointRepo repository.KeyPointRepository, recensionRepo *repository.RecensionRepository) *TourService {
	return &TourService{
		tourRepo:      tourRepo,
		keyPointRepo:  keyPointRepo,
		recensionRepo: recensionRepo,
	}
}

func (s *TourService) GetAll(ctx context.Context) ([]*model.Tour, error) {
	return s.tourRepo.GetAll(ctx)
}

func (s *TourService) GetByID(ctx context.Context, id string) (*model.Tour, error) {
	//return s.tourRepo.GetByID(ctx, id)
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, fmt.Errorf("invalid tour ID: %w", err)
	}
	return s.tourRepo.GetByIDVerified(ctx, objID)
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

func (s *TourService) CreateRecension(ctx context.Context, recension *model.Recension) (*model.Recension, error) {
	_, err := s.tourRepo.GetByID(ctx, recension.TourId.Hex())
	if err != nil {
		return nil, err
	}

	return s.recensionRepo.Create(ctx, recension)
}

func (s *TourService) GetRecensionsByTourID(ctx context.Context, tourID string) ([]*model.Recension, error) {
	_, err := s.tourRepo.GetByID(ctx, tourID)
	if err != nil {
		return nil, err
	}

	return s.recensionRepo.GetByTourID(ctx, tourID)
}
