package service

import (
	"context"
	"errors"
	"math"
	"time"

	"github.com/jelena-ra/touristApp/soa-team-4/Tours/internal/model"
	"github.com/jelena-ra/touristApp/soa-team-4/Tours/internal/repository"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Definišemo radijus u metrima unutar kog smatramo da je turista posetio tačku.
// 50 metara je razumna vrednost.
const PROXIMITY_RADIUS_METERS = 50.0

type TourExecutionService struct {
	ExecutionRepo *repository.TourExecutionRepository
	TourServ      *TourService
}

func NewTourExecutionService(executionRepo *repository.TourExecutionRepository, tourServ *TourService) *TourExecutionService {
	return &TourExecutionService{
		ExecutionRepo: executionRepo,
		TourServ:      tourServ,
	}
}

func (s *TourExecutionService) StartTour(tourId, touristId primitive.ObjectID, startPosition model.TouristPosition) (*model.TourExecution, error) {
	// 1. Poslovno pravilo: Proveriti da li turista već ima aktivnu turu.
	/*_, err := s.ExecutionRepo.GetActiveByTourist(touristId)
	// Ako ne dobijemo grešku, znači da je aktivna tura pronađena, što nije dozvoljeno.
	if err == nil {
		return nil, errors.New("user already has an active tour")
	}*/

	// 2. Kreiranje novog objekta sesije.
	execution := &model.TourExecution{
		ID:              primitive.NewObjectID(),
		TourId:          tourId,
		TouristId:       touristId,
		Status:          model.StatusActive,
		StartTime:       time.Now().UTC(),
		LastActivity:    time.Now().UTC(),
		CurrentPosition: startPosition,
	}

	err := s.ExecutionRepo.Create(execution)
	if err != nil {
		return nil, err
	}
	return execution, nil
}

// AbandonTour postavlja status sesije na "Abandoned".
/*func (s *TourExecutionService) AbandonTour(executionId, touristId primitive.ObjectID) (*model.TourExecution, error) {
	// 1. Pronađi sesiju.
	execution, err := s.ExecutionRepo.GetById(executionId)
	if err != nil {
		return nil, errors.New("tour execution not found")
	}

	// 2. Poslovno pravilo: Proveri da li je to sesija ovog turiste.
	if execution.TouristId != touristId {
		return nil, errors.New("this is not your tour execution")
	}

	// 3. Poslovno pravilo: Tura se može napustiti samo ako je aktivna.
	if execution.Status != model.StatusActive {
		return nil, errors.New("tour is not active")
	}

	// 4. Ažuriranje statusa i vremena.
	now := time.Now().UTC()
	execution.Status = model.StatusAbandoned
	execution.CompletionTime = &now
	execution.LastActivity = now

	// 5. Čuvanje promena u bazi.
	err = s.ExecutionRepo.Update(execution)
	return execution, err
}*/

func (s *TourExecutionService) CheckProximity(executionId, touristId primitive.ObjectID, position model.TouristPosition) (*model.TourExecution, error) {

	execution, err := s.ExecutionRepo.GetById(executionId)
	if err != nil {
		return nil, errors.New("tour execution not found")
	}

	if execution.TouristId != touristId {
		return nil, errors.New("this is not your tour execution")
	}

	execution.LastActivity = time.Now().UTC()
	execution.CurrentPosition = position

	ctx := context.Background()
	keyPoints, err := s.TourServ.GetKeyPoints(ctx, execution.TourId.Hex())
	if err != nil {
		return nil, err
	}

	for _, keyPoint := range keyPoints {
		if !isKeyPointCompleted(keyPoint.ID, execution.CompletedKeyPoints) {
			distance := calculateDistance(position.Latitude, position.Longitude, keyPoint.Latitude, keyPoint.Longitude)
			if distance <= PROXIMITY_RADIUS_METERS {
				completedKP := model.CompletedKeyPoint{
					KeyPointId:     keyPoint.ID,
					CompletionTime: time.Now().UTC(),
				}
				execution.CompletedKeyPoints = append(execution.CompletedKeyPoints, completedKP)
			}
		}
	}

	if len(execution.CompletedKeyPoints) == len(keyPoints) {
		now := time.Now().UTC()
		execution.Status = model.StatusCompleted
		execution.CompletionTime = &now
	}

	err = s.ExecutionRepo.Update(execution)
	return execution, err
}

func isKeyPointCompleted(keyPointId primitive.ObjectID, completedKeyPoints []model.CompletedKeyPoint) bool {
	for _, ckp := range completedKeyPoints {
		if ckp.KeyPointId == keyPointId {
			return true
		}
	}
	return false
}

func calculateDistance(lat1, lon1, lat2, lon2 float64) float64 {
	const R = 6371e3
	φ1 := lat1 * math.Pi / 180
	φ2 := lat2 * math.Pi / 180
	Δφ := (lat2 - lat1) * math.Pi / 180
	Δλ := (lon2 - lon1) * math.Pi / 180

	a := math.Sin(Δφ/2)*math.Sin(Δφ/2) +
		math.Cos(φ1)*math.Cos(φ2)*
			math.Sin(Δλ/2)*math.Sin(Δλ/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))

	return R * c
}
