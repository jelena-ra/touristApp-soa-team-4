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

type RecensionRepository struct {
	cli        *mongo.Client
	collection *mongo.Collection
}

func NewRecensionRepository(cli *mongo.Client, database, collection string) *RecensionRepository {
	recensionCollection := cli.Database(database).Collection(collection)
	return &RecensionRepository{
		cli:        cli,
		collection: recensionCollection,
	}
}

func (r *RecensionRepository) Create(ctx context.Context, recension *model.Recension) (*model.Recension, error) {
	recension.ID = primitive.NewObjectID()

	result, err := r.collection.InsertOne(ctx, recension)
	if err != nil {
		log.Printf("Error creating recension: %v", err)
		return nil, err
	}

	recension.ID = result.InsertedID.(primitive.ObjectID)
	return recension, nil
}

func (r *RecensionRepository) GetByTourID(ctx context.Context, tourID string) ([]*model.Recension, error) {
	objectID, err := primitive.ObjectIDFromHex(tourID)
	if err != nil {
		log.Printf("Error converting tourID to ObjectID: %v", err)
		return nil, errors.New("invalid tour ID format")
	}

	filter := bson.M{"tourId": objectID}

	// Sort by creation date (newest first)
	opts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}})

	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		log.Printf("Error finding recensions: %v", err)
		return nil, err
	}
	defer cursor.Close(ctx)

	var recensions []*model.Recension
	for cursor.Next(ctx) {
		var recension model.Recension
		if err := cursor.Decode(&recension); err != nil {
			log.Printf("Error decoding recension: %v", err)
			continue
		}
		recensions = append(recensions, &recension)
	}

	if err := cursor.Err(); err != nil {
		log.Printf("Cursor error: %v", err)
		return nil, err
	}

	return recensions, nil
}

func (r *RecensionRepository) GetByID(ctx context.Context, id string) (*model.Recension, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		log.Printf("Error converting id to ObjectID: %v", err)
		return nil, errors.New("invalid recension ID format")
	}

	var recension model.Recension
	err = r.collection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&recension)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("recension not found")
		}
		log.Printf("Error finding recension: %v", err)
		return nil, err
	}

	return &recension, nil
}

func (r *RecensionRepository) Update(ctx context.Context, recension *model.Recension) (*model.Recension, error) {
	filter := bson.M{"_id": recension.ID}
	update := bson.M{
		"$set": bson.M{
			"rating":    recension.Rating,
			"visitDate": recension.VisitDate,
			"comment":   recension.Comment,
			"pictures":  recension.Pictures,
		},
	}

	_, err := r.collection.UpdateOne(ctx, filter, update)
	if err != nil {
		log.Printf("Error updating recension: %v", err)
		return nil, err
	}

	return recension, nil
}

func (r *RecensionRepository) Delete(ctx context.Context, id string) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		log.Printf("Error converting id to ObjectID: %v", err)
		return errors.New("invalid recension ID format")
	}

	result, err := r.collection.DeleteOne(ctx, bson.M{"_id": objectID})
	if err != nil {
		log.Printf("Error deleting recension: %v", err)
		return err
	}

	if result.DeletedCount == 0 {
		return errors.New("recension not found")
	}

	return nil
}
