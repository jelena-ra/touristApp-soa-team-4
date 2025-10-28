package mapper

import (
	"fmt"
	"time"

	"github.com/jelena-ra/touristApp/soa-team-4/Tours/internal/model"
	tourProto "github.com/jelena-ra/touristApp/soa-team-4/Tours/proto"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func RecensionModelToProto(recension *model.Recension) *tourProto.Recension {
	pictures := make([]string, 0)
	if recension.Pictures != nil {
		pictures = recension.Pictures
	}
	return &tourProto.Recension{
		Id:        recension.ID.Hex(),
		AuthorId:  recension.AuthorId,
		TourId:    recension.TourId.Hex(),
		Rating:    int32(recension.Rating),
		VisitDate: recension.VisitDate.Format(time.RFC3339),
		Comment:   recension.Comment,
		CreatedAt: recension.CreatedAt.Format(time.RFC3339),
		Pictures:  pictures,
	}
}

func RecensionProtoToModel(protoRecension *tourProto.Recension) (*model.Recension, error) {
	var err error
	recension := &model.Recension{}

	if protoRecension.AuthorId != "" {
		recension.AuthorId = protoRecension.AuthorId
	} else {
		return nil, fmt.Errorf("AuthorId is required")
	}

	if protoRecension.TourId != "" {
		recension.TourId, err = primitive.ObjectIDFromHex(protoRecension.TourId)
		if err != nil {
			return nil, fmt.Errorf("invalid format for TourId: %w", err)
		}
	} else {
		return nil, fmt.Errorf("TourId is required")
	}

	recension.Rating = int(protoRecension.Rating)
	recension.Comment = protoRecension.Comment
	recension.Pictures = protoRecension.Pictures

	if protoRecension.VisitDate != "" {
		recension.VisitDate, err = time.Parse(time.RFC3339, protoRecension.VisitDate)
		if err != nil {
			return nil, fmt.Errorf("invalid format for VisitDate: %w", err)
		}
	}

	recension.CreatedAt = time.Now()

	return recension, nil
}
