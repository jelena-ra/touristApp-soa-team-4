package main

import (
	"context"
	"log" 
	"os"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
	"github.com/joho/godotenv"

	"net/http"

	"github.com/gorilla/mux"

	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/handler"
	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/repository"
	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/service"
	
	"github.com/glebarez/sqlite" 
    "gorm.io/gorm"

)

func startServer(stakeholderHandler *handler.StakeholderHandler, imageHandler *handler.ImageHandler,profileHandler *handler.ProfileHandler) {
    router := mux.NewRouter().StrictSlash(true)

    router.HandleFunc("/stakeholders", stakeholderHandler.GetAllStakeholders).Methods("GET")

	router.HandleFunc("/profile/{userId}", profileHandler.GetProfileByUserId).Methods("GET")
	router.HandleFunc("/profile", profileHandler.CreateProfile).Methods("POST")

    router.HandleFunc("/image", imageHandler.UploadImageHandler).Methods("POST")
    router.HandleFunc("/image/{id}", imageHandler.GetImageHandler).Methods("GET")

    log.Println("Server starting on port :8081...")
    log.Fatal(http.ListenAndServe(":8081", router))
}

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


	 imageDB, err := gorm.Open(sqlite.Open("images.db"), &gorm.Config{})
    if err != nil {
        log.Fatalf("Failed to connect to image database: %v", err)
    }

	
    imageDB.AutoMigrate(&repository.Image{})

	
    imageRepo := repository.NewImageRepository(imageDB)
    imageService := service.NewImageService(imageRepo)
    imageHandler := handler.NewImageHandler(imageService)

	stakeholderRepo := repository.NewStakeholderRepository(driver)	
	stakeholderService := service.NewStakeholderService(stakeholderRepo)
	stakeholderHandler := handler.NewStakeholderHandler(stakeholderService)

	
	profileRepo := repository.NewProfileRepository(driver)	
	profileService := service.NewProfileService(profileRepo)
	profileHandler := handler.NewProfileHandler(profileService)


	startServer(stakeholderHandler,imageHandler,profileHandler)

}