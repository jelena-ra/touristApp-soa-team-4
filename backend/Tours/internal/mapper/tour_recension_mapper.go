package mapper

import (
	"time"

	"github.com/jelena-ra/touristApp/soa-team-4/Tours/internal/model"
	tourProto "github.com/jelena-ra/touristApp/soa-team-4/Tours/proto"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func RecensionModelToProto(recension *model.Recension) *tourProto.Recension {
	return &tourProto.Recension{
		Id:        recension.ID.Hex(),
		AuthorId:  recension.AuthorId.Hex(),
		TourId:    recension.TourId.Hex(),
		Rating:    int32(recension.Rating),
		VisitDate: recension.VisitDate.Format(time.RFC3339),
		Comment:   recension.Comment,
		CreatedAt: recension.CreatedAt.Format(time.RFC3339),
		Pictures:  recension.Pictures,
	}
}

func RecensionProtoToModel(protoRecension *tourProto.Recension) (*model.Recension, error) {
	var err error
	recension := &model.Recension{}

	if protoRecension.Id != "" {
		recension.ID, err = primitive.ObjectIDFromHex(protoRecension.Id)
		if err != nil {
			return nil, err
		}
	}

	if protoRecension.AuthorId != "" {
		recension.AuthorId, err = primitive.ObjectIDFromHex(protoRecension.AuthorId)
		if err != nil {
			return nil, err
		}
	}

	if protoRecension.TourId != "" {
		recension.TourId, err = primitive.ObjectIDFromHex(protoRecension.TourId)
		if err != nil {
			return nil, err
		}
	}

	recension.Rating = int(protoRecension.Rating)
	recension.Comment = protoRecension.Comment
	recension.Pictures = protoRecension.Pictures

	if protoRecension.VisitDate != "" {
		recension.VisitDate, err = time.Parse(time.RFC3339, protoRecension.VisitDate)
		if err != nil {
			return nil, err
		}
	}

	if protoRecension.CreatedAt != "" {
		recension.CreatedAt, err = time.Parse(time.RFC3339, protoRecension.CreatedAt)
		if err != nil {
			return nil, err
		}
	} else {
		recension.CreatedAt = time.Now()
	}

	return recension, nil
}
