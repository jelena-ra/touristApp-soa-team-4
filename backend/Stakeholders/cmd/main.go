/*package main

import (
	"context"
	"database/sql"
	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/saga"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
	"github.com/streadway/amqp"
	"log"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

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
/*	router.HandleFunc("/profile/{userId}", profileHandler.GetProfileByUserId).Methods("GET")
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
	// --- POČETAK IZMENA ZA DUGOTRAJNI KONTEKST I GRACIOZNO GAŠENJE ---
	// Kreiraj dugovečni kontekst za celu aplikaciju
	appCtx, appCancel := context.WithCancel(context.Background())
	defer appCancel() // Osiguraj da se kontekst otkaže kada main izađe

	// Postavi osluškivač za OS signale (Ctrl+C, SIGTERM)
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		sig := <-sigChan
		log.Printf("Received signal %v. Shutting down Stakeholder-Service...", sig)
		appCancel() // Otkaži kontekst kada se primi signal, što će zaustaviti listenere
	}()
	// --- KRAJ IZMENA ZA DUGOTRAJNI KONTEKST I GRACIOZNO GAŠENJE ---
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

	// Učitavanje JWT konfiguracije
	jwtSecretKey := os.Getenv("JWT_SECRET_KEY")
	if jwtSecretKey == "" {
		log.Fatalf("JWT_SECRET_KEY is not set in .env file or environment variables.")
	}
	jwtIssuer := os.Getenv("JWT_ISSUER")
	jwtAudience := os.Getenv("JWT_AUDIENCE")
	jwtDurationStr := os.Getenv("JWT_DURATION")

	///pretplata na rabbit konekciju
	rabbitConn, err := amqp.Dial("amqp://guest:guest@rabbitmq:5672/")
	if err != nil {
		log.Fatalf("Failed to connect to RabbitMQ: %v", err)
	}
	defer rabbitConn.Close()

	pgConnStr := "postgres://postgres:super@saga-db:5432/saga?sslmode=disable"
	db, err := sql.Open("postgres", pgConnStr)
	if err != nil {
		log.Fatalf("Failed to connect to PostgreSQL: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("PostgreSQL ping failed: %v", err)
	}

	log.Println("Connected to PostgreSQL for Saga state.")

	// Kreiraj tabelu ako ne postoji
	if err := repository.InitSagaStateTable(db); err != nil {
		log.Fatalf("Failed to initialize saga_states table: %v", err)
	}

	sagaRepo := repository.NewPostgresSagaRepository(db)
	orchestrator := saga.NewSagaOrchestrator(rabbitConn, sagaRepo)
	if err := orchestrator.SetupRabbitMQ(); err != nil {
		log.Fatalf("Failed to setup RabbitMQ for Orchestrator: %v", err)
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	go orchestrator.StartListening(appCtx)

	profileRepo := repository.NewProfileRepository(driver)
	userRepo := repository.NewUserRepository(driver)

	stakeholdersSagaHandler := handler.NewStakeholdersSagaHandler(rabbitConn, userRepo, profileRepo) // Koristi isti rabbitConn, userRepo, profileRepo
	if err := stakeholdersSagaHandler.SetupRabbitMQ(); err != nil {
		log.Fatalf("Failed to setup RabbitMQ for Stakeholders Saga Handler: %v", err)
	}
	go stakeholdersSagaHandler.StartListening(ctx) // Handler počinje da sluša KOMANDE (koje mu orkestrator šalje)
	log.Println("StakeholdersSagaHandler started listening for commands.")

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

	userService := service.NewUserService(userRepo, profileRepo, orchestrator)
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
}*/
package main

import (
	"context"
	"database/sql"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	"github.com/glebarez/sqlite"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
	"github.com/streadway/amqp"
	"gorm.io/gorm"

	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/auth"
	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/config"
	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/handler"
	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/middleware"
	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/repository"
	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/saga"
	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/service"
)

// startServer funkcija sada samo konfiguriše rute.
// Pokretanje servera se dešava u main funkciji radi bolje kontrole gracioznog gašenja.
func setupRoutes(userHandler *handler.UserHandler, imageHandler *handler.ImageHandler, profileHandler *handler.ProfileHandler, router *mux.Router, authenticationMiddleware *middleware.AuthenticationMiddleware, authorizationMiddleware *middleware.AuthorizationMiddleware, authenticationHandler *handler.AuthenticationHandler) {

	router.HandleFunc("/users", userHandler.GetAllUsers).Methods("GET")
	router.HandleFunc("/exists/{id}", userHandler.CheckIfUserExists).Methods("GET")
	router.HandleFunc("/profile/{userId}", profileHandler.GetProfileByUserId).Methods("GET")
	router.HandleFunc("/profile", profileHandler.CreateProfile).Methods("POST")
	router.HandleFunc("/profile-update", profileHandler.UpdateProfile).Methods("POST")

	router.HandleFunc("/image", imageHandler.UploadImageHandler).Methods("POST")
	router.HandleFunc("/image/{id}", imageHandler.GetImageHandler).Methods("GET")
	router.HandleFunc("/image/filename/{filename}", imageHandler.GetImageHandlerFilename).Methods("GET")
	router.HandleFunc("/users/{id}/block", userHandler.BlockUser).Methods("PUT", "OPTIONS")
	router.HandleFunc("/users/{id}", userHandler.GetUser).Methods("GET", "OPTIONS")

	router.Handle(
		"/api/users/{id}/block",
		authenticationMiddleware.AuthenticationPolicy()(authorizationMiddleware.AdministratorPolicy()(http.HandlerFunc(userHandler.BlockUser))),
	).Methods("PUT", "OPTIONS")

	authenticationHandler.RegisterRoutes(router)
}

func main() {

	err := godotenv.Load()
	if err != nil {
		log.Println("Error loading .env file, using default values.")
	}

	appCtx, appCancel := context.WithCancel(context.Background())
	defer appCancel()
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		sig := <-sigChan
		log.Printf("Received signal %v. Shutting down Stakeholder-Service...", sig)
		appCancel()
	}()

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
	defer driver.Close(appCtx) // Koristi appCtx za zatvaranje drajvera

	err = driver.VerifyConnectivity(appCtx) // Koristi appCtx za verifikaciju konekcije
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

	jwtSecretKey := os.Getenv("JWT_SECRET_KEY")
	if jwtSecretKey == "" {
		log.Fatalf("JWT_SECRET_KEY is not set in .env file or environment variables.")
	}
	jwtIssuer := os.Getenv("JWT_ISSUER")
	jwtAudience := os.Getenv("JWT_AUDIENCE")
	jwtDurationStr := os.Getenv("JWT_DURATION")

	///pretplata na rabbit konekciju
	rabbitConn, err := amqp.Dial("amqp://guest:guest@rabbitmq:5672/")
	if err != nil {
		log.Fatalf("Failed to connect to RabbitMQ: %v", err)
	}
	defer rabbitConn.Close()

	pgConnStr := "postgres://postgres:super@saga-db:5432/saga?sslmode=disable"
	db, err := sql.Open("postgres", pgConnStr)
	if err != nil {
		log.Fatalf("Failed to connect to PostgreSQL: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("PostgreSQL ping failed: %v", err)
	}

	log.Println("Connected to PostgreSQL for Saga state.")

	// Kreiraj tabelu ako ne postoji
	if err := repository.InitSagaStateTable(db); err != nil {
		log.Fatalf("Failed to initialize saga_states table: %v", err)
	}

	sagaRepo := repository.NewPostgresSagaRepository(db)
	orchestrator := saga.NewSagaOrchestrator(rabbitConn, sagaRepo)
	if err := orchestrator.SetupRabbitMQ(); err != nil {
		log.Fatalf("Failed to setup RabbitMQ for Orchestrator: %v", err)
	}

	go orchestrator.StartListening(appCtx)

	profileRepo := repository.NewProfileRepository(driver)
	userRepo := repository.NewUserRepository(driver)

	stakeholdersSagaHandler := handler.NewStakeholdersSagaHandler(rabbitConn, userRepo, profileRepo)
	if err := stakeholdersSagaHandler.SetupRabbitMQ(); err != nil {
		log.Fatalf("Failed to setup RabbitMQ for Stakeholders Saga Handler: %v", err)
	}

	go stakeholdersSagaHandler.StartListening(appCtx) // Handler počinje da sluša KOMANDE (koje mu orkestrator šalje)
	log.Println("StakeholdersSagaHandler started listening for commands.")

	profileService := service.NewProfileService(profileRepo)
	profileHandler := handler.NewProfileHandler(profileService)

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

	userService := service.NewUserService(userRepo, profileRepo, orchestrator)
	jwtGenerator := auth.NewJWTGenerator(jwtConfig)
	authenticationService := service.NewAuthenticationService(userRepo, jwtGenerator, profileRepo)
	userHandler := handler.NewUserHandler(userService)
	authenticationHandler := handler.NewAuthenticationHandler(authenticationService)

	// Postavljanje ruta preko nove funkcije setupRoutes
	setupRoutes(userHandler, imageHandler, profileHandler, router, authenticationMiddleware, authorizationMiddleware, authenticationHandler)

	port := os.Getenv("STAKEHOLDER_PORT") // Koristi specifičniji ENV var za port
	if port == "" {
		port = "8081"
	}

	// Kreiranje i pokretanje HTTP servera u gorutini
	server := &http.Server{Addr: ":" + port, Handler: router}
	go func() {
		log.Println("Stakeholder HTTP service is running on port " + port + "...")
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("HTTP server failed: %v", err)
			appCancel() // Ako HTTP server padne (ne zbog zatvaranja), otkaži appCtx
		}
	}()

	// Blokiraj glavnu gorutinu dok se appCtx ne otkaže
	<-appCtx.Done()
	log.Println("Stakeholder-Service application stopped. Performing graceful shutdown...")

	// Graciozno zaustavljanje HTTP servera
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdownCancel()
	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Printf("HTTP server Shutdown failed: %v", err)
	} else {
		log.Println("HTTP server stopped gracefully.")
	}

	// Daj malo vremena za čišćenje resursa (npr. RabbitMQ konekcije)
	time.Sleep(2 * time.Second)
	log.Println("Stakeholder-Service shutdown complete.")
}
