package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Recension struct {
	ID        primitive.ObjectID `bson:"_id,omitempty"`
	AuthorId  primitive.ObjectID `bson:"authorId"`
	TourId    primitive.ObjectID `bson:"tourId"`
	Rating    int                `bson:"rating"`
	VisitDate time.Time          `bson:"visitDate"`
	Comment   string             `bson:"comment"`
	CreatedAt time.Time          `bson:"createdAt"`
	Pictures  []string           `bson:"pictures"`
}
