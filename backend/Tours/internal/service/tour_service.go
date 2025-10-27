package service

import (
	"context"
	"errors"
	"fmt"
	"log"
	"time"

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
	log.Println("Uslo u update")
	oldData, err := s.tourRepo.GetByID(ctx, tour.ID.Hex())
	log.Println("DObijeno po id-u")
	if err != nil {
		return nil, err
	}

	oldData.Name = tour.Name
	oldData.Description = tour.Description
	oldData.Price = tour.Price
	oldData.Difficulty = tour.Difficulty
	oldData.Tags = tour.Tags
	oldData.Length = tour.Length
	oldData.TravelTimes = tour.TravelTimes

	updateTour, err := s.tourRepo.UpdateTour(ctx, oldData)
	if err != nil {
		return nil, err
	}
	log.Println("USPESNO ODRADJEN UPDATE")
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
func (s *TourService) UpdateKeyPoint(ctx context.Context, keyPoint *model.KeyPoint) (*model.KeyPoint, error) {
	if keyPoint == nil {
		return nil, errors.New("keyPoint cannot be nil")
	}

	if keyPoint.Name == "" {
		return nil, errors.New("key point name cannot be empty")
	}
	if keyPoint.Description == "" {
		return nil, errors.New("key point description cannot be empty")
	}

	if keyPoint.Latitude < -90 || keyPoint.Latitude > 90 {
		return nil, errors.New("invalid latitude: must be between -90 and 90")
	}
	if keyPoint.Longitude < -180 || keyPoint.Longitude > 180 {
		return nil, errors.New("invalid longitude: must be between -180 and 180")
	}
	return s.keyPointRepo.UpdateKeyPoint(ctx, keyPoint)
}

func (s *TourService) PublishTour(ctx context.Context, tourID string) (string, error) {
	log.Println("Uslo u publish")
	oid, err := primitive.ObjectIDFromHex(tourID)
	if err != nil {
		return "", errors.New("invalid tour ID")
	}

	tour, err := s.tourRepo.GetByID(ctx, oid.Hex())
	if err != nil {
		return "Could not find tour", err
	}
	log.Println("Pronadjen id")

	if tour.Status == model.Published {
		return "", errors.New("tour already published")
	}

	keyPoints, err := s.keyPointRepo.GetKeyPointByTourId(ctx, tourID)
	if err != nil {
		return "Could not find keyPoint for the tour", err
	}
	log.Println("Pronadjeni keypoints")

	if len(keyPoints) < 2 {
		return "", errors.New("tour does not have enough key points")
	}

	tour.Status = model.Published
	t := time.Now()
	tour.PublishedAt = &t

	_, err = s.tourRepo.UpdateTour(ctx, tour)
	if err != nil {
		return "", err
	}
	log.Println("USPESNO ODRADJEN UPDATE")

	return "Tour successfully published", nil
}

func (s *TourService) ArchiveTour(ctx context.Context, tourID string) (string, error) {
	oid, err := primitive.ObjectIDFromHex(tourID)
	if err != nil {
		return "", errors.New("invalid tour ID")
	}
	//log.Printf("[Archive tour] Status: %s", tour.Status)
	log.Printf("[Archive tour] ID: %s", tourID)

	tour, err := s.tourRepo.GetByID(ctx, oid.Hex())
	if err != nil {
		return "Could not find tour", err
	}

	if tour.Status != model.Published {
		return "", errors.New("tour cannot be archived")
	}
	log.Println("Publisovana je sad je setujem na archived")

	tour.Status = model.Archived
	t := time.Now()
	tour.ArchivedAt = &t

	_, err = s.tourRepo.UpdateTour(ctx, tour)
	if err != nil {
		return "", err
	}
	log.Printf("[Archive tour] Status: %s", tour.Status)
	log.Printf("[Archive tour] ID: %s", tour.ID)

	return "Tour successfully archived", nil
}

func (s *TourService) DeleteKeyPoint(ctx context.Context, id string) error {

	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("invalid key point ID format")
	}

	// TODO: Provjeriti da li korisnik koji briše ima dozvolu (npr. da li je autor ture).

	return s.keyPointRepo.DeleteKeyPoint(ctx, oid)
}
