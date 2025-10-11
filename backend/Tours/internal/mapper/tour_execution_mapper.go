package mapper

import (
	"time"

	"github.com/jelena-ra/touristApp/soa-team-4/Tours/internal/model"
	tourProto "github.com/jelena-ra/touristApp/soa-team-4/Tours/proto"
)

// Dodaj ovaj kod na kraj fajla 'mapper/tour_mapper.go'

// ==========================================================
// Maperi za TourExecution
// ==========================================================

// PositionProtoToModel pretvara gRPC poruku za poziciju u Go model.
func PositionProtoToModel(pos *tourProto.TouristPosition) *model.TouristPosition {
	if pos == nil {
		return nil
	}
	return &model.TouristPosition{
		Latitude:  pos.GetLatitude(),
		Longitude: pos.GetLongitude(),
	}
}

// PositionModelToProto pretvara Go model za poziciju u gRPC poruku.
func PositionModelToProto(pos *model.TouristPosition) *tourProto.TouristPosition {
	if pos == nil {
		return nil
	}
	return &tourProto.TouristPosition{
		Latitude:  pos.Latitude,
		Longitude: pos.Longitude,
	}
}

// CompletedKeyPointModelToProto pretvara jedan Go model završene tačke u gRPC poruku.
func CompletedKeyPointModelToProto(ckp *model.CompletedKeyPoint) *tourProto.CompletedKeyPoint {
	if ckp == nil {
		return nil
	}
	return &tourProto.CompletedKeyPoint{
		KeyPointId:     ckp.KeyPointId.Hex(),
		CompletionTime: ckp.CompletionTime.Format(time.RFC3339), // Koristimo standardni format za vreme
	}
}

// TourExecutionModelToProto je glavna funkcija koja pretvara celu sesiju u gRPC odgovor.
func TourExecutionModelToProto(execution *model.TourExecution) *tourProto.TourExecutionResponse {
	if execution == nil {
		return nil
	}

	// Konvertujemo niz završenih tačaka
	completedKPsProto := make([]*tourProto.CompletedKeyPoint, len(execution.CompletedKeyPoints))
	for i, ckp := range execution.CompletedKeyPoints {
		completedKPsProto[i] = CompletedKeyPointModelToProto(&ckp)
	}

	// Konvertujemo vreme završetka (CompletionTime), koje može biti nil
	completionTimeStr := ""
	if execution.CompletionTime != nil {
		completionTimeStr = execution.CompletionTime.Format(time.RFC3339)
	}

	return &tourProto.TourExecutionResponse{
		Id:                 execution.ID.Hex(),
		TourId:             execution.TourId.Hex(),
		TouristId:          execution.TouristId.Hex(),
		Status:             string(execution.Status),
		StartTime:          execution.StartTime.Format(time.RFC3339),
		LastActivity:       execution.LastActivity.Format(time.RFC3339),
		CompletionTime:     completionTimeStr,
		CompletedKeyPoints: completedKPsProto,
		CurrentPosition:    PositionModelToProto(&execution.CurrentPosition),
	}
}

// Napomena: Ne treba nam 'TourExecutionProtoToModel' jer nikada ne primamo
// ceo TourExecution objekat kao zahtev, već samo delove (kao što je pozicija).
