package model

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Tour struct {
	ID          primitive.ObjectID `bson:"_id,omitempty"`
	AuthorId    primitive.ObjectID `bson:"authorId"`
	Name        string             `bson:"name"`
	Description string             `bson:"description"`
	Difficulty  TourDifficulty     `bson:"difficulty"`
	Tags        []TourTag          `bson:"tags"`
	Status      TourStatus         `bson:"status"`
	Price       float64            `bson:"price"`
}

type TourDifficulty string

const (
	Easy   TourDifficulty = "Easy"
	Medium TourDifficulty = "Medium"
	Hard   TourDifficulty = "Hard"
)

type TourTag string

const (
	Nature     TourTag = "Nature"
	Historical TourTag = "Historical"
	Adventure  TourTag = "Adventure"
	Cultural   TourTag = "Cultural"
	Wildlife   TourTag = "Wildlife"
	Relaxation TourTag = "Relaxation"
	Beach      TourTag = "Beach"
	Mountain   TourTag = "Mountain"
	Urban      TourTag = "Urban"
)

type TourStatus string

const (
	Draft TourStatus = "Draft"
)
