package main

import (
	"context"
	"log"
	"net"
	"os"
	"time"

	stakeholdersProto "github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/proto"
	"github.com/jelena-ra/touristApp/soa-team-4/Tours/internal/handler"
	"github.com/jelena-ra/touristApp/soa-team-4/Tours/internal/repository"
	"github.com/jelena-ra/touristApp/soa-team-4/Tours/internal/service"
	tourProto "github.com/jelena-ra/touristApp/soa-team-4/Tours/proto"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.24.0"
)

func initTracer(serviceName string, jaegerAddress string) (*sdktrace.TracerProvider, error) {
	conn, err := grpc.Dial(jaegerAddress, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, err
	}

	traceExporter, err := otlptracegrpc.New(context.Background(), otlptracegrpc.WithGRPCConn(conn))
	if err != nil {
		return nil, err
	}

	res, err := resource.New(context.Background(), resource.WithAttributes(semconv.ServiceNameKey.String(serviceName)))
	if err != nil {
		return nil, err
	}

	tp := sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(traceExporter),
		sdktrace.WithResource(res),
	)
	otel.SetTracerProvider(tp)
	otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(propagation.TraceContext{}, propagation.Baggage{}))
	return tp, nil
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Error loading .env file, using default values.")
	}

	jaegerAddress := os.Getenv("JAEGER_ADDRESS")
	tp, err := initTracer("tour-service", jaegerAddress)
	if err != nil {
		log.Fatal(err)
	}
	defer func() {
		if err := tp.Shutdown(context.Background()); err != nil {
			log.Printf("Error shutting down tracer provider: %v", err)
		}
	}()

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
	tourCollectionName := os.Getenv("MONGO_COLLECTION_NAME")
	if tourCollectionName == "" {
		tourCollectionName = "tours"
	}
	keyPointCollectionName := os.Getenv("MONGO_KEYPOINT_COLLECTION_NAME")
	if keyPointCollectionName == "" {
		keyPointCollectionName = "key_points"
	}

	recensionCollectionName := os.Getenv("MONGO_RECENSION_COLLECTION_NAME")
	if recensionCollectionName == "" {
		recensionCollectionName = "recensions"
	}

	stakeholdersPort := os.Getenv("STAKEHOLDERS_PORT")
	if stakeholdersPort == "" {
		stakeholdersPort = "8081"
	}
	stakeholdersAddress := "localhost:" + stakeholdersPort

	stakeholdersConn, err := grpc.Dial(stakeholdersAddress, grpc.WithInsecure())
	if err != nil {
		log.Fatalf("Failed to connect to Stakeholders service: %v", err)
	}
	defer func(stakeholdersConn *grpc.ClientConn) {
		err := stakeholdersConn.Close()
		if err != nil {
			log.Fatalf("Failed to close connection to Stakeholders service: %v", err)
		}
	}(stakeholdersConn)

	stakeholdersClient := stakeholdersProto.NewStakeholderServiceClient(stakeholdersConn)

	tourRepo := repository.NewTourRepository(client, dbName, tourCollectionName)
	keyPointRepo := repository.NewKeyPointRepositoryMongo(client, dbName, keyPointCollectionName)
	tourExecutionCollectionName := "tour_executions"
	tourExecutionRepo := repository.NewTourExecutionRepository(client, dbName, tourExecutionCollectionName)
	recensionRepo := repository.NewRecensionRepository(client, dbName, recensionCollectionName)
	tourService := service.NewTourService(tourRepo, keyPointRepo, recensionRepo)
	tourExecutionService := service.NewTourExecutionService(tourExecutionRepo, tourService)
	tourHandler := handler.NewTourHandler(tourService, stakeholdersClient, tourExecutionService)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8083"
	}

	listen, err := net.Listen("tcp", ":"+port)
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	//grpcServer := grpc.NewServer()
	grpcServer := grpc.NewServer(
		grpc.StatsHandler(otelgrpc.NewServerHandler()),
	)

	tourProto.RegisterTourServiceServer(grpcServer, tourHandler)

	log.Println("Tour gRPC service is running on port 8083...")
	log.Fatal(grpcServer.Serve(listen))
}
