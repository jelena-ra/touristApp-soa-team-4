package model

import "go.mongodb.org/mongo-driver/bson/primitive"

type KeyPoint struct {
	ID          primitive.ObjectID `bson:"_id,omitempty"`
	TourID      primitive.ObjectID `bson:"tour_id"`
	Longitude   float64            `bson:"longitude"`
	Latitude    float64            `bson:"latitude"`
	Name        string             `bson:"name"`
	Description string             `bson:"description"`
	ImageURL    string             `bson:"image_url,omitempty"`
	Order       int                `bson:"order"`
}
