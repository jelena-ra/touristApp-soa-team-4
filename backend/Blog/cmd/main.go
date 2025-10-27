package main

import (
	"context"
	"log"
	"net"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/jelena-ra/touristApp/soa-team-4/Blog/internal/saga"
	"github.com/streadway/amqp"
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

	blogHandler := handler.NewBlogHandler(blogService)

	// Inicijalizacija RabbitMQ konekcije za Blog servis
	rabbitConn, err := amqp.Dial("amqp://guest:guest@rabbitmq:5672/")
	if err != nil {
		log.Fatalf("Failed to connect to RabbitMQ from Blog service: %v", err)
	}
	defer rabbitConn.Close()

	// --- POČETAK IZMENA ZA DUGOTRAJNI KONTEKST I GRACIOZNO GAŠENJE ---
	// Kreiraj dugovečni kontekst za celu aplikaciju
	appCtx, appCancel := context.WithCancel(context.Background())
	defer appCancel() // Osiguraj da se kontekst otkaže kada main izađe

	// Postavi osluškivač za OS signale (Ctrl+C, SIGTERM)
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		sig := <-sigChan
		log.Printf("Received signal %v. Shutting down Blog-Service...", sig)
		appCancel() // Otkaži kontekst kada se primi signal, što će zaustaviti listenere
	}()
	// --- KRAJ IZMENA ZA DUGOTRAJNI KONTEKST I GRACIOZNO GAŠENJE ---

	// Inicijalizacija i pokretanje SagaConsumer-a
	sagaConsumer := saga.NewSagaConsumer(rabbitConn, blogService)
	if err := sagaConsumer.SetupRabbitMQ(); err != nil {
		log.Fatalf("Failed to setup RabbitMQ for Blog Saga Consumer: %v", err)
	}
	go sagaConsumer.StartListening(appCtx) // Pokreni slušanje u gorutini

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

	log.Println("Blog gRPC service is running on port " + port + "...")
	go func() {
		if err := grpcServer.Serve(listen); err != nil {
			log.Printf("gRPC server stopped with error: %v", err)
			appCancel() // Ako gRPC server padne, otkaži appCtx da zaustavi i ostale komponente
		}
	}()

	// Blokiraj glavnu gorutinu dok se appCtx ne otkaže
	<-appCtx.Done()
	log.Println("Blog-Service application stopped. Performing graceful shutdown...")

	grpcServer = grpc.NewServer()

	blog_proto.RegisterBlogServiceServer(grpcServer, blogHandler)

	log.Println("Blog gRPC service is running on port 8082...")
	log.Fatal(grpcServer.Serve(listen))
}
