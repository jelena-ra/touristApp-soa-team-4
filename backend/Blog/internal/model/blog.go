package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Blog struct {
	ID        primitive.ObjectID `bson:"_id,omitempty"`
	Title     string             `bson:"title"`
	Content   string             `bson:"content"`
	AuthorID  int                `bson:"authorId"`
	CreatedAt time.Time          `bson:"createdAt"`
	Likes     []int              `bson:"likes"`
}
