package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type TourExecutionStatus string

const (
	StatusActive    TourExecutionStatus = "Active"
	StatusCompleted TourExecutionStatus = "Completed"
	StatusAbandoned TourExecutionStatus = "Abandoned"
)

type CompletedKeyPoint struct {
	KeyPointId     primitive.ObjectID `bson:"keyPointId"`
	CompletionTime time.Time          `bson:"completionTime"`
}

type TourExecution struct {
	ID                 primitive.ObjectID  `bson:"_id,omitempty"`
	TourId             primitive.ObjectID  `bson:"tourId"`
	TouristId          primitive.ObjectID  `bson:"touristId"`
	Status             TourExecutionStatus `bson:"status"`
	StartTime          time.Time           `bson:"startTime"`
	LastActivity       time.Time           `bson:"lastActivity"`
	CompletionTime     *time.Time          `bson:"completionTime,omitempty"`
	CompletedKeyPoints []CompletedKeyPoint `bson:"completedKeyPoints,omitempty"`
	CurrentPosition    TouristPosition     `bson:"currentPosition"`
}

type TouristPosition struct {
	Latitude  float64 `json:"lat"`
	Longitude float64 `json:"log"`
}
