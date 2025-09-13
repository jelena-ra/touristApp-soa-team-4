package mapper

import (
	"fmt"

	"github.com/jelena-ra/touristApp/soa-team-4/Tours/internal/model"
	tourProto "github.com/jelena-ra/touristApp/soa-team-4/Tours/proto"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func KeyPointModelToProto(kp *model.KeyPoint) *tourProto.KeyPoint {
	return &tourProto.KeyPoint{
		Id:          kp.ID.Hex(),
		TourId:      kp.TourID.Hex(),
		Longitude:   float32(kp.Longitude),
		Latitude:    float32(kp.Latitude),
		Name:        kp.Name,
		Description: kp.Description,
		ImageId:     kp.ImageID.Hex(),
	}
}

func KeyPointProtoToModel(kp *tourProto.KeyPoint) (*model.KeyPoint, error) {
	m := &model.KeyPoint{}
	var err error

	m.TourID, err = primitive.ObjectIDFromHex(kp.TourId)
	if err != nil {
		return nil, fmt.Errorf("tourId is required")
	}

	m.Longitude = float64(kp.Longitude)
	m.Latitude = float64(kp.Latitude)
	m.Name = kp.Name
	m.Description = kp.Description

	return m, nil
}
