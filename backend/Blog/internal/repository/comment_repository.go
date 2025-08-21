package repository

import (
	"context"

	"github.com/jelena-ra/touristApp/soa-team-4/Blog/internal/model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type CommentRepository interface {
	CreateComment(ctx context.Context, blog *model.Comment) (*model.Comment, error)
	Update(ctx context.Context, comment *model.Comment) (*model.Comment, error)
	GetById(ctx context.Context, id string) (*model.Comment, error)
}

type CommentRepositoryMongo struct {
	client         *mongo.Client
	dbName         string
	collectionName string
}

func NewCommentRepository(client *mongo.Client, dbName, collectionName string) CommentRepository {
	return &CommentRepositoryMongo{
		client:         client,
		dbName:         dbName,
		collectionName: collectionName,
	}
}

func (r *CommentRepositoryMongo) GetById(ctx context.Context, id string) (*model.Comment, error) {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	filter := bson.M{"_id": objID}
	var comment model.Comment
	err = r.client.Database(r.dbName).Collection(r.collectionName).FindOne(ctx, filter).Decode(&comment)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}

	return &comment, nil
}

func (r *CommentRepositoryMongo) CreateComment(ctx context.Context, comment *model.Comment) (*model.Comment, error) {
	collection := r.client.Database(r.dbName).Collection(r.collectionName)

	result, err := collection.InsertOne(ctx, comment)
	if err != nil {
		return nil, err
	}
	comment.ID = result.InsertedID.(primitive.ObjectID)
	return comment, nil
}

func (r *CommentRepositoryMongo) Update(ctx context.Context, comment *model.Comment) (*model.Comment, error) {
	collection := r.client.Database(r.dbName).Collection(r.collectionName)

	filter := bson.M{"_id": comment.ID}
	update := bson.M{"$set": comment}
	_, err := collection.UpdateOne(ctx, filter, update)

	if err != nil {
		return nil, err
	}
	return comment, nil
}
