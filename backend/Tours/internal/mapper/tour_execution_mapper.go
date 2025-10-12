package mapper

import (
	"time"

	"github.com/jelena-ra/touristApp/soa-team-4/Tours/internal/model"
	tourProto "github.com/jelena-ra/touristApp/soa-team-4/Tours/proto"
)

func PositionProtoToModel(pos *tourProto.TouristPosition) *model.TouristPosition {
	if pos == nil {
		return nil
	}
	return &model.TouristPosition{
		Latitude:  pos.GetLatitude(),
		Longitude: pos.GetLongitude(),
	}
}

func PositionModelToProto(pos *model.TouristPosition) *tourProto.TouristPosition {
	if pos == nil {
		return nil
	}
	return &tourProto.TouristPosition{
		Latitude:  pos.Latitude,
		Longitude: pos.Longitude,
	}
}

func CompletedKeyPointModelToProto(ckp *model.CompletedKeyPoint) *tourProto.CompletedKeyPoint {
	if ckp == nil {
		return nil
	}
	return &tourProto.CompletedKeyPoint{
		KeyPointId:     ckp.KeyPointId.Hex(),
		CompletionTime: ckp.CompletionTime.Format(time.RFC3339),
	}
}

func TourExecutionModelToProto(execution *model.TourExecution) *tourProto.TourExecutionResponse {
	if execution == nil {
		return nil
	}

	completedKPsProto := make([]*tourProto.CompletedKeyPoint, len(execution.CompletedKeyPoints))
	for i, ckp := range execution.CompletedKeyPoints {
		completedKPsProto[i] = CompletedKeyPointModelToProto(&ckp)
	}

	completionTimeStr := ""
	if execution.CompletionTime != nil {
		completionTimeStr = execution.CompletionTime.Format(time.RFC3339)
	}

	return &tourProto.TourExecutionResponse{
		Id:                 execution.ID.Hex(),
		TourId:             execution.TourId.Hex(),
		TouristId:          execution.TouristId,
		Status:             string(execution.Status),
		StartTime:          execution.StartTime.Format(time.RFC3339),
		LastActivity:       execution.LastActivity.Format(time.RFC3339),
		CompletionTime:     completionTimeStr,
		CompletedKeyPoints: completedKPsProto,
		CurrentPosition:    PositionModelToProto(&execution.CurrentPosition),
	}
}
