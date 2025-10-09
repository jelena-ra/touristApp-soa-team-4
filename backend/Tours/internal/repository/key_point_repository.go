package repository

import (
	"context"
	"errors"
	"log"

	"github.com/jelena-ra/touristApp/soa-team-4/Tours/internal/model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type KeyPointRepository interface {
	CreateKeyPoint(ctx context.Context, keyPoint *model.KeyPoint) (*model.KeyPoint, error)
	GetKeyPointByTourId(ctx context.Context, tourId string) ([]*model.KeyPoint, error)
}

type KeyPointRepositoryMongo struct {
	client         *mongo.Client
	dbName         string
	collectionName string
}

func NewKeyPointRepositoryMongo(client *mongo.Client, dbName string, collectionName string) *KeyPointRepositoryMongo {
	return &KeyPointRepositoryMongo{
		client:         client,
		dbName:         dbName,
		collectionName: collectionName,
	}
}

func (r *KeyPointRepositoryMongo) CreateKeyPoint(ctx context.Context, keyPoint *model.KeyPoint) (*model.KeyPoint, error) {
	collection := r.client.Database(r.dbName).Collection(r.collectionName)

	var lastKP model.KeyPoint
	opts := options.FindOne().SetSort(bson.M{"order": -1}) // descending
	err := collection.FindOne(ctx, bson.M{"tour_id": keyPoint.TourID}, opts).Decode(&lastKP)
	if err != nil && !errors.Is(err, mongo.ErrNoDocuments) {
		return nil, err
	}
	if errors.Is(err, mongo.ErrNoDocuments) {
		keyPoint.Order = 1
	} else {
		keyPoint.Order = lastKP.Order + 1
	}

	newKeyPoint, err := collection.InsertOne(ctx, keyPoint)
	if err != nil {
		return nil, err
	}
	keyPoint.ID = newKeyPoint.InsertedID.(primitive.ObjectID)
	return keyPoint, nil
}

func (r *KeyPointRepositoryMongo) GetKeyPointByTourId(ctx context.Context, tourId string) ([]*model.KeyPoint, error) {
	oid, err := primitive.ObjectIDFromHex(tourId)
	if err != nil {
		return nil, err
	}

	collection := r.client.Database(r.dbName).Collection(r.collectionName)
	opts := options.Find().SetSort(bson.M{"order": 1})
	cursor, err := collection.Find(ctx, bson.M{"tour_id": oid}, opts)
	if err != nil {
		return nil, err
	}
	defer func(cursor *mongo.Cursor, ctx context.Context) {
		err := cursor.Close(ctx)
		if err != nil {
			log.Println(err)
		}
	}(cursor, ctx)

	var keyPoints []*model.KeyPoint
	if err := cursor.All(ctx, &keyPoints); err != nil {
		return nil, err
	}

	return keyPoints, nil
}
