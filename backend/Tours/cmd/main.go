package main

import (
	"context"
	"log"
	"net"
	"os"
	"time"

	"github.com/jelena-ra/touristApp/soa-team-4/Tours/internal/handler"
	"github.com/jelena-ra/touristApp/soa-team-4/Tours/internal/repository"
	"github.com/jelena-ra/touristApp/soa-team-4/Tours/internal/service"
	tourProto "github.com/jelena-ra/touristApp/soa-team-4/Tours/proto"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"google.golang.org/grpc"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Error loading .env file, using default values.")
	}

	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		mongoURI = "mongodb://localhost:27017"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoURI))
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}
	defer func(client *mongo.Client, ctx context.Context) {
		err := client.Disconnect(ctx)
		if err != nil {
			log.Fatalf("Failed to disconnect from MongoDB: %v", err)
		}
	}(client, ctx)

	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatalf("Failed to ping MongoDB: %v", err)
	}

	log.Println("Successfully connected to MongoDB.")

	dbName := os.Getenv("MONGO_DB_NAME")
	if dbName == "" {
		dbName = "tour_db"
	}
	collectionName := os.Getenv("MONGO_COLLECTION_NAME")
	if collectionName == "" {
		collectionName = "tours"
	}

	tourRepo := repository.NewTourRepository(client, dbName, collectionName)
	tourService := service.NewTourService(tourRepo)
	blogHandler := handler.NewTourHandler(tourService)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8083"
	}

	listen, err := net.Listen("tcp", ":"+port)
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	grpcServer := grpc.NewServer()

	tourProto.RegisterTourServiceServer(grpcServer, blogHandler)

	log.Println("Tour gRPC service is running on port 8083...")
	log.Fatal(grpcServer.Serve(listen))
}
