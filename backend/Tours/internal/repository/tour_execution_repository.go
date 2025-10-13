package repository

import (
	"context"

	"github.com/jelena-ra/touristApp/soa-team-4/Tours/internal/model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type TourExecutionRepository struct {
	Collection *mongo.Collection
}

func (r *TourExecutionRepository) GetById(id primitive.ObjectID) (*model.TourExecution, error) {
	var execution model.TourExecution
	err := r.Collection.FindOne(context.Background(), bson.M{"_id": id}).Decode(&execution)
	if err != nil {
		return nil, err
	}
	return &execution, nil
}
func NewTourExecutionRepository(client *mongo.Client, dbName, collectionName string) *TourExecutionRepository {
	collection := client.Database(dbName).Collection(collectionName)
	return &TourExecutionRepository{
		Collection: collection,
	}
}

func (r *TourExecutionRepository) GetActiveByTourist(touristId string) (*model.TourExecution, error) {
	var execution model.TourExecution
	filter := bson.M{
		"touristId": touristId,
		"status":    model.StatusActive,
	}
	err := r.Collection.FindOne(context.Background(), filter).Decode(&execution)
	return &execution, err
}
func (r *TourExecutionRepository) GetByTouristAndTour(touristId string, tourId primitive.ObjectID) ([]*model.TourExecution, error) {
	filter := bson.M{
		"touristId": touristId,
		"tourId":    tourId,
	}

	cursor, err := r.Collection.Find(context.Background(), filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var executions []*model.TourExecution
	if err = cursor.All(context.Background(), &executions); err != nil {
		return nil, err
	}

	return executions, nil
}

func (r *TourExecutionRepository) Create(execution *model.TourExecution) error {
	_, err := r.Collection.InsertOne(context.Background(), execution)
	return err
}

func (r *TourExecutionRepository) Update(execution *model.TourExecution) error {
	_, err := r.Collection.UpdateOne(
		context.Background(),
		bson.M{"_id": execution.ID},
		bson.M{"$set": execution},
	)
	return err
}
