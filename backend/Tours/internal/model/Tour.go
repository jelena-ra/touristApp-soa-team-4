package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Tour struct {
	ID          primitive.ObjectID   `bson:"_id,omitempty"`
	AuthorId    string               `bson:"authorId"`
	Name        string               `bson:"name"`
	Description string               `bson:"description"`
	Difficulty  TourDifficulty       `bson:"difficulty"`
	Tags        []TourTag            `bson:"tags"`
	Status      TourStatus           `bson:"status"`
	Price       float64              `bson:"price"`
	TravelTimes map[Transport]string `bson:"travelTimes"`
	PublishedAt *time.Time           `bson:"publishedAt,omitempty"`
	ArchivedAt  *time.Time           `bson:"archivedAt,omitempty"`
	Length      float64              `bson:"length"`
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
	Draft     TourStatus = "Draft"
	Published TourStatus = "Published"
	Archived  TourStatus = "Archived"
)

type Transport string

const (
	WALKING Transport = "WALKING"
	BICYCLE Transport = "BICYCLE"
	CAR     Transport = "CAR"
)

func (t *Tour) Publish() {
	now := time.Now()
	t.PublishedAt = &now
	t.Status = "Published"
}

func (t *Tour) Archive() {
	now := time.Now()
	t.PublishedAt = &now
	t.Status = "Archived"
}
