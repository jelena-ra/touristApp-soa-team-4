package model

import "go.mongodb.org/mongo-driver/bson/primitive"

type KeyPoint struct {
	ID          primitive.ObjectID `bson:"_id,omitempty"`
	TourID      primitive.ObjectID `bson:"tour_id"`
	Longitude   float64            `bson:"longitude"`
	Latitude    float64            `bson:"latitude"`
	Name        string             `bson:"name"`
	Description string             `bson:"description"`
	ImageID     primitive.ObjectID `bson:"image_id,omitempty"`
	Order       int                `bson:"order"`
}
