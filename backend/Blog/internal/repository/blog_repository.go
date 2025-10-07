package repository

import (
	"context"

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
