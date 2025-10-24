package main

import (
	"context"
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

	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.24.0"
)

var (
	//stakeholdersServiceURL, _ = url.Parse("http://localhost:8081")
	stakeholdersServiceURL, _ = url.Parse("http://stakeholder-service:8081")
	purchaseServiceURL, _     = url.Parse("http://purchase-service:8085")
)

func NewReverseProxy(targetURL *url.URL) *httputil.ReverseProxy {
	return httputil.NewSingleHostReverseProxy(targetURL)
}

func initTracer(serviceName string, jaegerAddress string) (*sdktrace.TracerProvider, error) {
	conn, err := grpc.Dial(jaegerAddress, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, err
	}

	traceExporter, err := otlptracegrpc.New(context.Background(), otlptracegrpc.WithGRPCConn(conn))
	if err != nil {
		return nil, err
	}

	res, _ := resource.New(context.Background(), resource.WithAttributes(semconv.ServiceNameKey.String(serviceName)))

	tp := sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(traceExporter),
		sdktrace.WithResource(res),
	)
	otel.SetTracerProvider(tp)
	otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(propagation.TraceContext{}, propagation.Baggage{}))
	return tp, nil
}

func main() {

	if err := godotenv.Load(); err != nil {
		log.Println("Error loading .env file")
	}

	jaegerAddress := os.Getenv("JAEGER_ADDRESS")
	tp, err := initTracer("api-gateway", jaegerAddress)
	if err != nil {
		log.Fatal(err)
	}
	defer func() {
		if err := tp.Shutdown(context.Background()); err != nil {
			log.Printf("Error shutting down tracer provider: %v", err)
		}
	}()

	//blogGRPCAddr := "localhost:8082"
	blogGRPCAddr := "blog-service:8082"
	blogGRPCConn, err := grpc.Dial(blogGRPCAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("did not connect to blog service: %v", err)
	}
	defer blogGRPCConn.Close()
	blogGRPCClient := blog_proto.NewBlogServiceClient(blogGRPCConn)
	blogHandler := handler.NewBlogHandler(blogGRPCClient)

	/*tourGRPCAddr := "tour-service:8083"
	tourGRPCConn, err := grpc.Dial(tourGRPCAddr, grpc.WithTransportCredentials(insecure.NewCredentials()), otelgrpc.Clien)*/
	tourGRPCAddr := "tour-service:8083"
	tourGRPCConn, err := grpc.Dial(tourGRPCAddr,
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithStatsHandler(otelgrpc.NewClientHandler()),
	)
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
	purchaseProxy := NewReverseProxy(purchaseServiceURL)

	authenticationMiddleware := middleware.NewAuthenticationMiddleware(jwtConfig)
	authorizationMiddleware := middleware.NewAuthorizationMiddleware()

	router.Handle("/api/cart/add", (http.StripPrefix("/api/cart", purchaseProxy))).Methods("POST")
	router.Handle("/api/cart/tokens", (http.StripPrefix("/api/cart", purchaseProxy))).Methods("GET")
	router.Handle("/api/cart/remove", (http.StripPrefix("/api/cart", purchaseProxy))).Methods("POST")
	router.Handle("/api/cart/view", (http.StripPrefix("/api/cart", purchaseProxy))).Methods("GET")
	router.Handle("/api/cart/checkout", (http.StripPrefix("/api/cart", purchaseProxy))).Methods("POST")
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
	//router.Handle("/api/tours", http.HandlerFunc(tourHandler.CreateTourHandle)).Methods("POST")
	router.Handle(
		"/api/tours",
		authenticationMiddleware.AuthenticationPolicy()(
			authorizationMiddleware.AuthorPolicy()(http.HandlerFunc(tourHandler.CreateTourHandle)),
		),
	).Methods("POST", "OPTIONS")
	router.Handle("/api/tours/update", http.HandlerFunc(tourHandler.UpdateTourHandle)).Methods("POST")
	//router.Handle("/api/key-point", http.HandlerFunc(tourHandler.CreateKeyPointHandle)).Methods("POST")
	router.Handle(
		"/api/key-point",
		authenticationMiddleware.AuthenticationPolicy()(
			authorizationMiddleware.AuthorPolicy()(http.HandlerFunc(tourHandler.CreateKeyPointHandle)),
		),
	).Methods("POST", "OPTIONS")

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

	router.Handle(
		"/api/tour-executions/{id}/abandon",
		authenticationMiddleware.AuthenticationPolicy()(
			authorizationMiddleware.TouristPolicy()(http.HandlerFunc(tourHandler.AbandonTourHandle)),
		),
	).Methods("PUT", "OPTIONS")

	router.Handle(
		"/api/tour-executions/active",
		authenticationMiddleware.AuthenticationPolicy()(
			http.HandlerFunc(tourHandler.GetActiveTourHandle),
		),
	).Methods("GET", "OPTIONS")
	router.Handle(
		"/api/key-point",
		authenticationMiddleware.AuthenticationPolicy()(
			authorizationMiddleware.AuthorPolicy()(http.HandlerFunc(tourHandler.UpdateKeyPointHandle)),
		),
	).Methods("PUT", "OPTIONS")

	router.Handle(
		"/api/key-point/{id}",
		authenticationMiddleware.AuthenticationPolicy()(
			authorizationMiddleware.AuthorPolicy()(http.HandlerFunc(tourHandler.DeleteKeyPointHandle)),
		),
	).Methods("DELETE", "OPTIONS")

	corsObj := handlers.CORS(
		handlers.AllowedOrigins([]string{"http://localhost:4200"}),
		handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
		handlers.AllowedHeaders([]string{"Content-Type", "Authorization"}))

	log.Println("API Gateway is running on port :8000...")
	log.Fatal(http.ListenAndServe(":8000", corsObj(router)))

	//log.Fatal(http.ListenAndServe(":8000", router))
}
