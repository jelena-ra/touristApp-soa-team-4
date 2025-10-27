package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Blog struct {
	ID        primitive.ObjectID `bson:"_id,omitempty"`
	Title     string             `bson:"title"`
	Content   string             `bson:"content"`
	AuthorID  string             `bson:"authorId"`
	CreatedAt time.Time          `bson:"createdAt"`
	Likes     []string           `bson:"likes"`
	Images    []string           `bson:"images"`
	Comments  []Comment          `bson:"comments,omitempty"`
	Deleted   bool               `bson:"deleted"`
}

type Comment struct {
	ID           primitive.ObjectID `bson:"_id,omitempty"`
	BlogID       string             `bson:"blogId"`
	UserID       string             `bson:"userId"`
	Content      string             `bson:"content"`
	CreatedAt    time.Time          `bson:"createdAt"`
	LastModified time.Time          `bson:"lastModified"`
	Deleted      bool               `bson:"deleted"`
}
