package repository

import (
	"context"
	"log"

	"github.com/jelena-ra/touristApp/soa-team-4/Tours/internal/model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type TourRepository interface {
	GetAll(ctx context.Context) ([]*model.Tour, error)
	GetByID(ctx context.Context, id string) (*model.Tour, error)
	CreateTour(ctx context.Context, tour *model.Tour) (*model.Tour, error)
}

type TourRepositoryMongo struct {
	client         *mongo.Client
	dbName         string
	collectionName string
}

func NewTourRepository(client *mongo.Client, dbName string, collectionName string) TourRepository {
	return &TourRepositoryMongo{
		client:         client,
		dbName:         dbName,
		collectionName: collectionName,
	}
}

func (t TourRepositoryMongo) GetAll(ctx context.Context) ([]*model.Tour, error) {
	collection := t.client.Database(t.dbName).Collection(t.collectionName)
	cursor, err := collection.Find(ctx, bson.D{})
	if err != nil {
		return nil, err
	}
	defer func(cursor *mongo.Cursor, ctx context.Context) {
		err := cursor.Close(ctx)
		if err != nil {
			log.Println(err)
		}
	}(cursor, ctx)

	var tours []*model.Tour
	if err := cursor.All(ctx, &tours); err != nil {
		return nil, err
	}

	return tours, nil
}

func (t TourRepositoryMongo) CreateTour(ctx context.Context, tour *model.Tour) (*model.Tour, error) {
	collection := t.client.Database(t.dbName).Collection(t.collectionName)
	newTour, err := collection.InsertOne(ctx, tour)
	if err != nil {
		return nil, err
	}
	tour.ID = newTour.InsertedID.(primitive.ObjectID)
	return tour, nil
}

func (t TourRepositoryMongo) GetByID(ctx context.Context, id string) (*model.Tour, error) {
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	collection := t.client.Database(t.dbName).Collection(t.collectionName)
	var tour model.Tour
	if err := collection.FindOne(ctx, bson.M{"_id": oid}).Decode(&tour); err != nil {
		return nil, err
	}

	return &tour, nil
}
