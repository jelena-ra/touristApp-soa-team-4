package main

import (
	"context"
	"log"
	"net"
	"net/http"
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

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Accept")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func startImageServer() {
	mux := http.NewServeMux()
	fileServer := http.FileServer(http.Dir("/app/images"))
	mux.Handle("/images/", http.StripPrefix("/images/", fileServer))

	log.Println("Pokrećem server za slike na portu :8086 sa CORS podrškom")

	if err := http.ListenAndServe(":8086", corsMiddleware(mux)); err != nil {
		log.Fatalf("Nije uspelo pokretanje HTTP servera: %v", err)
	}
}

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
	commentRepo := repository.NewCommentRepository(mongoClient, dbName, "comments")
	blogService := service.NewBlogService(blogRepo, commentRepo, followingClient)
	imageService := service.NewImageService(blogRepo)

	blogHandler := handler.NewBlogHandler(blogService, imageService)

	go startImageServer()

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
