package repository

import (
	"go.mongodb.org/mongo-driver/mongo"
	"github.com/jelena-ra/touristApp/soa-team-4/Blog/internal/model" 
	"context"
)

type BlogRepository struct {
	client         *mongo.Client
	dbName         string
	collectionName string
}

func NewBlogRepository(client *mongo.Client, dbName, collectionName string) *BlogRepository {
	return &BlogRepository{
		client:         client,
		dbName:         dbName,
		collectionName: collectionName,
	}
}

func (r *BlogRepository) CreateBlog(ctx context.Context, blog *model.Blog) error {
	collection := r.client.Database(r.dbName).Collection(r.collectionName)
	_, err := collection.InsertOne(ctx, blog)
	if err != nil {
		return err
	}
	return nil
}