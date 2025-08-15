package repository

import (
	"context"

	"github.com/jelena-ra/touristApp/soa-team-4/Blog/internal/model"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type BlogRepository interface {
	CreateBlog(ctx context.Context, blog *model.Blog) (*model.Blog, error)
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
