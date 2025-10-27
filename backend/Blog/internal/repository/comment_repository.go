package repository

import (
	"context"
	"fmt"
	"log"

	"github.com/jelena-ra/touristApp/soa-team-4/Blog/internal/model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type CommentRepository interface {
	CreateComment(ctx context.Context, blog *model.Comment) (*model.Comment, error)
	Update(ctx context.Context, comment *model.Comment) (*model.Comment, error)
	GetById(ctx context.Context, id string) (*model.Comment, error)
	DeleteAllCommentsByUserID(ctx context.Context, userID string) error
	DeleteComment(ctx context.Context, id string) error
	GetByBlogId(ctx context.Context, blogId string) ([]*model.Comment, error)
	DeleteByBlogId(ctx context.Context, blogId string) error
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

func (r *CommentRepositoryMongo) GetByBlogId(ctx context.Context, blogId string) ([]*model.Comment, error) {
	collection := r.client.Database(r.dbName).Collection(r.collectionName)
	filter := bson.M{"blogId": blogId}

	cursor, err := collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var comments []*model.Comment
	if err = cursor.All(ctx, &comments); err != nil {
		return nil, err
	}

	return comments, nil
}

func (r *CommentRepositoryMongo) DeleteByBlogId(ctx context.Context, blogId string) error {
	collection := r.client.Database(r.dbName).Collection(r.collectionName)
	filter := bson.M{"blogId": blogId}

	_, err := collection.DeleteMany(ctx, filter)
	return err
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

// DeleteAllCommentsByUserID briše sve komentare koje je objavio dati korisnik.
func (r *CommentRepositoryMongo) DeleteAllCommentsByUserID(ctx context.Context, userID string) error {
	collection := r.client.Database(r.dbName).Collection(r.collectionName)
	filter := bson.M{"userid": userID} // Pretpostavljamo da je UserID string

	result, err := collection.DeleteMany(ctx, filter)
	if err != nil {
		return fmt.Errorf("failed to delete comments for user %s: %w", userID, err)
	}
	log.Printf("Deleted %d comments for user %s", result.DeletedCount, userID)
	return nil
}

func (r *CommentRepositoryMongo) DeleteComment(ctx context.Context, id string) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return fmt.Errorf("invalid comment ID: %w", err)
	}
	collection := r.client.Database(r.dbName).Collection(r.collectionName)
	_, err = collection.DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil {
		return fmt.Errorf("failed to delete comment: %w", err)
	}
	return nil
}
