package main

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"

	"github.com/gorilla/mux"
	"google.golang.org/grpc"

	"google.golang.org/grpc/credentials/insecure"

	"os"
	"time"

	"github.com/jelena-ra/touristApp/soa-team-4/API_Gateway/config"
	"github.com/jelena-ra/touristApp/soa-team-4/API_Gateway/handler"
	"github.com/jelena-ra/touristApp/soa-team-4/API_Gateway/middleware"

	"github.com/gorilla/handlers"
	"github.com/joho/godotenv"

	blog_proto "github.com/jelena-ra/touristApp/soa-team-4/Blog/proto"
	tourProto "github.com/jelena-ra/touristApp/soa-team-4/Tours/proto"
)

var (
	//stakeholdersServiceURL, _ = url.Parse("http://localhost:8081")
	stakeholdersServiceURL, _ = url.Parse("http://stakeholder-service:8081")
)

func NewReverseProxy(targetURL *url.URL) *httputil.ReverseProxy {
	return httputil.NewSingleHostReverseProxy(targetURL)
}

func main() {

	if err := godotenv.Load(); err != nil {
		log.Println("Error loading .env file")
	}

	//blogGRPCAddr := "localhost:8082"
	blogGRPCAddr := "blog-service:8082"
	blogGRPCConn, err := grpc.Dial(blogGRPCAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("did not connect to blog service: %v", err)
	}
	defer blogGRPCConn.Close()
	blogGRPCClient := blog_proto.NewBlogServiceClient(blogGRPCConn)
	blogHandler := handler.NewBlogHandler(blogGRPCClient)

	tourGRPCAddr := "tour-service:8083"
	tourGRPCConn, err := grpc.Dial(tourGRPCAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("did not connect to tour service: %v", err)
	}
	defer tourGRPCConn.Close()
	tourGRPCClient := tourProto.NewTourServiceClient(tourGRPCConn)
	tourHandler := handler.NewTourHandler(tourGRPCClient)

	router := mux.NewRouter()

	jwtSecretKey := os.Getenv("JWT_SECRET_KEY")
	jwtIssuer := os.Getenv("JWT_ISSUER")
	jwtAudience := os.Getenv("JWT_AUDIENCE")
	jwtDurationStr := os.Getenv("JWT_DURATION")
	jwtDuration, _ := time.ParseDuration(jwtDurationStr)

	jwtConfig := &config.JWTConfig{
		SecretKey: jwtSecretKey,
		Issuer:    jwtIssuer,
		Audience:  jwtAudience,
		Duration:  jwtDuration,
	}

	stakeholdersProxy := NewReverseProxy(stakeholdersServiceURL)

	authenticationMiddleware := middleware.NewAuthenticationMiddleware(jwtConfig)
	authorizationMiddleware := middleware.NewAuthorizationMiddleware()

	router.Handle(
		"/api/users/{id}/block",
		authenticationMiddleware.AuthenticationPolicy()(authorizationMiddleware.AdministratorPolicy()(http.StripPrefix("/api", stakeholdersProxy))),
	).Methods("PUT", "OPTIONS")
	router.Handle("/api/image", (http.StripPrefix("/api", stakeholdersProxy))).Methods("POST")
	router.Handle("/api/image/{id}", (http.StripPrefix("/api", stakeholdersProxy))).Methods("GET")
	router.Handle("/api/image/filename/{filename}", (http.StripPrefix("/api", stakeholdersProxy))).Methods("GET")
	router.Handle("/api/users/login", stakeholdersProxy).Methods("POST", "OPTIONS")
	router.Handle("/api/users", stakeholdersProxy).Methods("POST", "OPTIONS")
	router.Handle(
		"/api/users",
		authenticationMiddleware.AuthenticationPolicy()(authorizationMiddleware.AdministratorPolicy()(http.StripPrefix("/api", stakeholdersProxy))),
	).Methods("GET", "OPTIONS")
	router.Handle(
		"/api/profile/{userId}",
		authenticationMiddleware.AuthenticationPolicy()(http.StripPrefix("/api", stakeholdersProxy)),
	).Methods("GET", "OPTIONS")
	router.Handle(
		"/api/profile",
		authenticationMiddleware.AuthenticationPolicy()(http.StripPrefix("/api", stakeholdersProxy)),
	).Methods("POST", "OPTIONS")
	router.Handle(
		"/api/users/{id}",
		authenticationMiddleware.AuthenticationPolicy()(authorizationMiddleware.AdministratorPolicy()(http.StripPrefix("/api", stakeholdersProxy))),
	).Methods("GET", "OPTIONS")

	router.Handle("/api/blogs", http.HandlerFunc(blogHandler.GetAllBlogsHandler)).Methods("GET")
	router.Handle("/api/blogs", http.HandlerFunc(blogHandler.CreateBlogHandler)).Methods("POST")
	router.Handle("/api/blogs/{blogId}/like/{userId}", http.HandlerFunc(blogHandler.LikeBlogHandler)).Methods("PUT")
	router.Handle("/api/blogs/{blogId}/unlike/{userId}", http.HandlerFunc(blogHandler.UnlikeBlogHandler)).Methods("DELETE")
	router.Handle("/api/comments", http.HandlerFunc(blogHandler.CreateCommentHandler)).Methods("POST")
	router.Handle("/api/comments/update", http.HandlerFunc(blogHandler.UpdateCommentHandler)).Methods("POST")

	router.Handle("/api/tours", http.HandlerFunc(tourHandler.GetAllToursHandle)).Methods("GET")
	router.Handle("/api/tours/{tourId}", http.HandlerFunc(tourHandler.GetByIdHandle)).Methods("GET")
	router.Handle("/api/tours", http.HandlerFunc(tourHandler.CreateTourHandle)).Methods("POST")
	router.Handle("/api/tours/update", http.HandlerFunc(tourHandler.UpdateTourHandle)).Methods("POST")
	router.Handle("/api/key-point", http.HandlerFunc(tourHandler.CreateKeyPointHandle)).Methods("POST")

	//router.Handle("/api/tour-executions/{tourId}", http.HandlerFunc(tourHandler.StartTourHandle)).Methods("POST", "OPTIONS")
	//router.Handle("/api/tour-executions/{id}/check-proximity", http.HandlerFunc(tourHandler.CheckProximityHandle)).Methods("PUT", "OPTIONS")
	router.Handle(
		"/api/tour-executions/{tourId}",
		authenticationMiddleware.AuthenticationPolicy()(
			authorizationMiddleware.TouristPolicy()(http.HandlerFunc(tourHandler.StartTourHandle)),
		),
	).Methods("POST", "OPTIONS")

	router.Handle(
		"/api/tour-executions/{id}/check-proximity",
		authenticationMiddleware.AuthenticationPolicy()(
			authorizationMiddleware.TouristPolicy()(http.HandlerFunc(tourHandler.CheckProximityHandle)),
		),
	).Methods("PUT", "OPTIONS")

	corsObj := handlers.CORS(
		handlers.AllowedOrigins([]string{"http://localhost:4200"}),
		handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
		handlers.AllowedHeaders([]string{"Content-Type", "Authorization"}))

	log.Println("API Gateway is running on port :8000...")
	log.Fatal(http.ListenAndServe(":8000", corsObj(router)))

	//log.Fatal(http.ListenAndServe(":8000", router))
}
