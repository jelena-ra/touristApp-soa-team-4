package main

import (
	"context"
	"log"
	"net"
	"os"
	"time"

	"google.golang.org/grpc"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/jelena-ra/touristApp/soa-team-4/Blog/internal/client"
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

	// ISPRAVKA #1: Promenjeno ime promenljive
	mongoClient, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoURI))
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}
	defer mongoClient.Disconnect(ctx)

	err = mongoClient.Ping(ctx, nil)
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

	followingServiceAddr := os.Getenv("FOLLOWING_SERVICE_ADDR")
	if followingServiceAddr == "" {
		followingServiceAddr = "localhost:8083"
	}
	followingClient, err := client.NewFollowingClient(followingServiceAddr)
	if err != nil {
		log.Fatalf("Nije moguće povezati se sa Following servisom: %v", err)
	}

	blogRepo := repository.NewBlogRepository(mongoClient, dbName, collectionName)
	blogService := service.NewBlogService(blogRepo, followingClient)
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
