package main

import (
	"context"
	"log"
	"net" 
	"os"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
	"github.com/joho/godotenv"
	"google.golang.org/grpc"


	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/handler"
	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/repository"
	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/service"
	stakeholder_proto "github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/proto" 

)

func main() {
	
	err := godotenv.Load()
	if err != nil {
		log.Println("Error loading .env file, using default values.")
	}

	
	dbUri := os.Getenv("NEO4J_URI")
	dbUser := os.Getenv("NEO4J_USER")
	dbPassword := os.Getenv("NEO4J_PASSWORD")

	if dbUri == "" {
    dbUri = "bolt://localhost:7687"
	}
	if dbUser == "" {
		dbUser = "neo4j"
	}
	if dbPassword == "" {
		log.Fatalf("NEO4J_PASSWORD is not set in .env file or environment variables.")
	}
	driver, err := neo4j.NewDriverWithContext(dbUri, neo4j.BasicAuth(dbUser, dbPassword, ""))
	if err != nil {
		log.Fatalf("Failed to create Neo4j driver: %v", err)
	}
	defer driver.Close(context.Background())

	err = driver.VerifyConnectivity(context.Background())
	if err != nil {
		log.Fatalf("Failed to connect to Neo4j: %v", err)
	}

	log.Println("Successfully connected to Neo4j.")


	stakeholderRepo := repository.NewStakeholderRepository(driver)	
	stakeholderService := service.NewStakeholderService(stakeholderRepo)
	stakeholderHandler := handler.NewStakeholderHandler(stakeholderService)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081" 
	}

	 listen, err := net.Listen("tcp", ":" + port)
    if err != nil {
        log.Fatalf("failed to listen: %v", err)
    }


   	grpcServer := grpc.NewServer()

    
    stakeholder_proto.RegisterStakeholderServiceServer(grpcServer, stakeholderHandler)

    log.Println("Stakeholder gRPC service is running on port 8081...")
    log.Fatal(grpcServer.Serve(listen))


}