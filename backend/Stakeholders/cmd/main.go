package main

import (
	"context"
	"log"
	"os"
	"path/filepath"
	"time"

	"github.com/joho/godotenv"
	"github.com/neo4j/neo4j-go-driver/v5/neo4j"

	"net/http"

	"github.com/gorilla/mux"

	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/auth"
	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/config"
	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/handler"
	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/middleware"
	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/repository"
	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/service"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

func startServer(userHandler *handler.UserHandler, imageHandler *handler.ImageHandler, profileHandler *handler.ProfileHandler, router *mux.Router, authenticationMiddleware *middleware.AuthenticationMiddleware, authorizationMiddleware *middleware.AuthorizationMiddleware) {

	router.HandleFunc("/users", userHandler.GetAllUsers).Methods("GET")
	router.HandleFunc("/exists/{id}", userHandler.CheckIfUserExists).Methods("GET")
	/* router.Handle(
	    "/users",
	    authenticationMiddleware.AuthenticationPolicy()(authorizationMiddleware.AdministratorPolicy()(http.HandlerFunc(userHandler.GetAllUsers))),
	).Methods("GET", "OPTIONS")*/
	router.HandleFunc("/profile/{userId}", profileHandler.GetProfileByUserId).Methods("GET")
	router.HandleFunc("/profile", profileHandler.CreateProfile).Methods("POST")
	router.HandleFunc("/profile-update", profileHandler.UpdateProfile).Methods("POST")

	// Integrisane rute iz obe verzije
	router.HandleFunc("/image", imageHandler.UploadImageHandler).Methods("POST")
	router.HandleFunc("/image/{id}", imageHandler.GetImageHandler).Methods("GET")
	router.HandleFunc("/image/filename/{filename}", imageHandler.GetImageHandlerFilename).Methods("GET")
	router.HandleFunc("/users/{id}/block", userHandler.BlockUser).Methods("PUT", "OPTIONS")
	router.HandleFunc("/users/{id}", userHandler.GetUser).Methods("GET", "OPTIONS")

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

	const sqliteBaseDir = "/data/sqlite"
	dbFileName := "images.db"
	dbPath := filepath.Join(sqliteBaseDir, dbFileName)

	if _, err := os.Stat(sqliteBaseDir); os.IsNotExist(err) {
		err = os.MkdirAll(sqliteBaseDir, 0755)
		if err != nil {
			log.Fatalf("Failed to create directory for SQLite database at %s: %v", sqliteBaseDir, err)
		}
	}

	imageDB, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to image database: %v", err)
	}
	log.Printf("Successfully connected to SQLite database at: %s", dbPath)
	err = imageDB.AutoMigrate(&repository.Image{})
	if err != nil {
		log.Fatalf("Failed to auto migrate image database: %v", err)
	}
	log.Println("Image database auto migration complete.")

	imageRepo := repository.NewImageRepository(imageDB)
	imageService := service.NewImageService(imageRepo)
	imageHandler := handler.NewImageHandler(imageService)

	// Učitavanje JWT konfiguracije iz promenljivih okruženja
	jwtSecretKey := os.Getenv("JWT_SECRET_KEY")
	if jwtSecretKey == "" {
		log.Fatalf("JWT_SECRET_KEY is not set in .env file or environment variables.")
	}
	jwtIssuer := os.Getenv("JWT_ISSUER")
	jwtAudience := os.Getenv("JWT_AUDIENCE")
	jwtDurationStr := os.Getenv("JWT_DURATION")

	profileRepo := repository.NewProfileRepository(driver)
	profileService := service.NewProfileService(profileRepo)
	profileHandler := handler.NewProfileHandler(profileService)
	// Parsiranje trajanja, sa podrazumevanom vrednošću ako nije definisano
	jwtDuration, err := time.ParseDuration(jwtDurationStr)
	if err != nil {
		log.Println("Error parsing JWT_DURATION from .env, using default of 24h.")
		jwtDuration = 24 * time.Hour
	}

	jwtConfig := &config.JWTConfig{
		SecretKey: jwtSecretKey,
		Issuer:    jwtIssuer,
		Audience:  jwtAudience,
		Duration:  jwtDuration,
	}

	router := mux.NewRouter().StrictSlash(true)

	authenticationMiddleware := middleware.NewAuthenticationMiddleware(jwtConfig)
	authorizationMiddleware := middleware.NewAuthorizationMiddleware()

	userRepo := repository.NewUserRepository(driver)
	userService := service.NewUserService(userRepo)
	jwtGenerator := auth.NewJWTGenerator(jwtConfig)
	authenticationService := service.NewAuthenticationService(userRepo, jwtGenerator)
	userHandler := handler.NewUserHandler(userService)
	authenticationHandler := handler.NewAuthenticationHandler(authenticationService)

	// Lančano povezivanje middleware-a za zaštićene rute
	// Rešen konflikt: middleware je aktivan i podržava PUT i OPTIONS
	router.Handle(
		"/api/users/{id}/block",
		authenticationMiddleware.AuthenticationPolicy()(authorizationMiddleware.AdministratorPolicy()(http.HandlerFunc(userHandler.BlockUser))),
	).Methods("PUT", "OPTIONS")

	authenticationHandler.RegisterRoutes(router)
	startServer(userHandler, imageHandler, profileHandler, router, authenticationMiddleware, authorizationMiddleware)
}
