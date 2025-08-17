package main

import (
	"context"
	"log"
	"os"
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

	router.HandleFunc("/image", imageHandler.UploadImageHandler).Methods("POST")
	router.HandleFunc("/image/{id}", imageHandler.GetImageHandler).Methods("GET")
	router.HandleFunc("/image/filename/{filename}", imageHandler.GetImageHandlerFilename).Methods("GET")

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

	//router.Handle("/api/users", handler.AuthMiddleware(userHandler.FindAll)).Methods("GET")
	// Lančano povezivanje middleware-a za zaštićene rute
	router.Handle(
		"/api/users/{id}/block",
		authenticationMiddleware.AuthenticationPolicy()(authorizationMiddleware.AdministratorPolicy()(http.HandlerFunc(userHandler.BlockUser))),
	).Methods("PUT")

	authenticationHandler.RegisterRoutes(router)
	//userHandler.RegisterRoutes(router)
	startServer(userHandler, imageHandler, profileHandler, router, authenticationMiddleware, authorizationMiddleware)

}
