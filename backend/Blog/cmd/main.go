package main

import (
	"context"
	"log"
	"net" // net je potreban za gRPC listen
	"os"
	"time"

	"google.golang.org/grpc" // Uvozimo gRPC

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/jelena-ra/touristApp/soa-team-4/Blog/internal/handler"
	"github.com/jelena-ra/touristApp/soa-team-4/Blog/internal/repository"
	"github.com/jelena-ra/touristApp/soa-team-4/Blog/internal/service"
	blog_proto "github.com/jelena-ra/touristApp/soa-team-4/Blog/proto"
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
	defer client.Disconnect(ctx)

	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatalf("Failed to ping MongoDB: %v", err)
	}

	log.Println("Successfully connected to MongoDB.")

	dbName := os.Getenv("MONGO_DB_NAME")
	if dbName == "" {
		dbName = "blog_db"
	}
	collectionName := os.Getenv("MONGO_COLLECTION_NAME")
	if collectionName == "" {
		collectionName = "blogs"
	}

	//Obrisati
	//log.Printf("!!! APLIKACIJA KORISTI BAZU: %s", dbName)
	//log.Printf("!!! APLIKACIJA KORISTI KOLEKCIJU: %s", collectionName)

	blogRepo := repository.NewBlogRepository(client, dbName, collectionName)
	commentRepo := repository.NewCommentRepository(client, dbName, "comments")

	blogService := service.NewBlogService(blogRepo, commentRepo)
	blogHandler := handler.NewBlogHandler(blogService)

	port := os.Getenv("MONGO_PORT")
	if port == "" {
		port = "8082"
	}

	listen, err := net.Listen("tcp", ":"+port)
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	grpcServer := grpc.NewServer()

	blog_proto.RegisterBlogServiceServer(grpcServer, blogHandler)

	log.Println("Blog gRPC service is running on port 8082...")
	log.Fatal(grpcServer.Serve(listen))
}
