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

type BlogRepository interface {
	CreateBlog(ctx context.Context, blog *model.Blog) (*model.Blog, error)
	GetById(ctx context.Context, id string) (*model.Blog, error)
	Update(ctx context.Context, blog *model.Blog) (*model.Blog, error)
	GetAll(ctx context.Context) ([]model.Blog, error)
	GetAllBlogsForUsers(ctx context.Context, userIds []string) ([]model.Blog, error)
	DeleteAllBlogsByUserID(ctx context.Context, userID string) error
	RemoveUserLikesFromAllBlogs(ctx context.Context, userID string) error
	DeleteBlog(ctx context.Context, id string) error
	RecoverAllBlogsByUserID(ctx context.Context, userID string) error
}

type BlogRepositoryMongo struct {
	client         *mongo.Client
	dbName         string
	collectionName string
}

func NewBlogRepository(client *mongo.Client, dbName, collectionName string) BlogRepository {
	return &BlogRepositoryMongo{
		client:         client,
		dbName:         dbName,
		collectionName: collectionName,
	}
}

func (r *BlogRepositoryMongo) CreateBlog(ctx context.Context, blog *model.Blog) (*model.Blog, error) {
	collection := r.client.Database(r.dbName).Collection(r.collectionName)
	result, err := collection.InsertOne(ctx, blog)
	if err != nil {
		return nil, err
	}
	blog.ID = result.InsertedID.(primitive.ObjectID)
	return blog, nil
}

func (r *BlogRepositoryMongo) GetById(ctx context.Context, id string) (*model.Blog, error) {

	objectId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	collection := r.client.Database(r.dbName).Collection(r.collectionName)
	var blog model.Blog
	err = collection.FindOne(ctx, bson.M{"_id": objectId}).Decode(&blog)
	if err != nil {
		return nil, err
	}

	return &blog, nil
}

func (r *BlogRepositoryMongo) Update(ctx context.Context, blog *model.Blog) (*model.Blog, error) {
	collection := r.client.Database(r.dbName).Collection(r.collectionName)

	filter := bson.M{"_id": blog.ID}
	update := bson.M{"$set": blog}
	_, err := collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return nil, err
	}

	return blog, nil
}

func (r *BlogRepositoryMongo) GetAll(ctx context.Context) ([]model.Blog, error) {
	collection := r.client.Database(r.dbName).Collection(r.collectionName)

	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var blogs []model.Blog
	if err = cursor.All(ctx, &blogs); err != nil {
		return nil, err
	}

	return blogs, nil
}

func (r *BlogRepositoryMongo) GetAllBlogsForUsers(ctx context.Context, userIds []string) ([]model.Blog, error) {
	collection := r.client.Database(r.dbName).Collection(r.collectionName)

	filter := bson.M{"authorId": bson.M{"$in": userIds}}

	cursor, err := collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var blogs []model.Blog
	if err = cursor.All(ctx, &blogs); err != nil {
		return nil, err
	}

	return blogs, nil
}

/*
	func (r *BlogRepositoryMongo) DeleteAllBlogsByUserID(ctx context.Context, userID string) error {
		collection := r.client.Database(r.dbName).Collection(r.collectionName)
		filter := bson.M{"authorid": userID}

		result, err := collection.DeleteMany(ctx, filter)
		if err != nil {
			return fmt.Errorf("failed to delete blogs for user %s: %w", userID, err)
		}
		log.Printf("Deleted %d blogs for user %s", result.DeletedCount, userID)
		return nil
	}
*/
func (r *BlogRepositoryMongo) DeleteAllBlogsByUserID(ctx context.Context, userID string) error {
	filter := bson.M{"author_id": userID} // Koristi "author_id" kako je definisano u modelu
	update := bson.M{
		"$set": bson.M{
			"deleted": true,
		},
	}
	collection := r.client.Database(r.dbName).Collection(r.collectionName)
	result, err := collection.UpdateMany(ctx, filter, update)
	if err != nil {
		return fmt.Errorf("failed to soft delete blogs for user %s: %w", userID, err)
	}
	log.Printf("Soft deleted %d blogs for user %s", result.ModifiedCount, userID)
	return nil
}

func (r *BlogRepositoryMongo) RecoverAllBlogsByUserID(ctx context.Context, userID string) error {
	// Pronađi sve blogove ovog korisnika koji su označeni kao "deleted: true"
	filter := bson.M{
		"author_id": userID,
		"deleted":   true,
	}

	// Postavi "deleted" na false i ažuriraj "updated_at"
	update := bson.M{
		"$set": bson.M{
			"deleted": false,
		},
	}

	collection := r.client.Database(r.dbName).Collection(r.collectionName)
	result, err := collection.UpdateMany(ctx, filter, update)
	if err != nil {
		return fmt.Errorf("failed to recover blogs for user %s: %w", userID, err)
	}

	log.Printf("Recovered %d blogs for user %s (soft-deleted status reverted)", result.ModifiedCount, userID)
	return nil
}

// uklanja userID iz polja 'Likes' u svim blogovima gde se taj userID nalazi.
func (r *BlogRepositoryMongo) RemoveUserLikesFromAllBlogs(ctx context.Context, userID string) error {
	collection := r.client.Database(r.dbName).Collection(r.collectionName)
	filter := bson.M{"likes": userID}
	update := bson.M{"$pull": bson.M{"likes": userID}}

	result, err := collection.UpdateMany(ctx, filter, update)
	if err != nil {
		return fmt.Errorf("failed to remove user %s likes from all blogs: %w", userID, err)
	}
	log.Printf("Removed user %s likes from %d blogs", userID, result.ModifiedCount)
	return nil
}

func (r *BlogRepositoryMongo) DeleteBlog(ctx context.Context, id string) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return fmt.Errorf("invalid blog ID: %w", err)
	}
	collection := r.client.Database(r.dbName).Collection(r.collectionName)
	_, err = collection.DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil {
		return fmt.Errorf("failed to delete blog: %w", err)
	}
	return nil
}
