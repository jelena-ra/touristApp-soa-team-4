module github.com/jelena-ra/touristApp/soa-team-4/API_Gateway

go 1.25.0

require (
	github.com/golang-jwt/jwt/v5 v5.3.0
	github.com/gorilla/handlers v1.5.2
	github.com/gorilla/mux v1.8.1
	github.com/joho/godotenv v1.5.1
	google.golang.org/grpc v1.75.1
)

require (
	github.com/jelena-ra/touristApp/soa-team-4/Following v0.0.0-00010101000000-000000000000
	github.com/jelena-ra/touristApp/soa-team-4/Tours v0.0.0-00010101000000-000000000000
	go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc v0.63.0
	go.opentelemetry.io/otel v1.38.0
	go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc v1.38.0
	go.opentelemetry.io/otel/sdk v1.38.0
)

require (
	github.com/cenkalti/backoff/v5 v5.0.3 // indirect
	github.com/go-logr/logr v1.4.3 // indirect
	github.com/go-logr/stdr v1.2.2 // indirect
	github.com/google/uuid v1.6.0 // indirect
	github.com/grpc-ecosystem/grpc-gateway/v2 v2.27.2 // indirect
	go.opentelemetry.io/auto/sdk v1.1.0 // indirect
	go.opentelemetry.io/otel/exporters/otlp/otlptrace v1.38.0 // indirect
	go.opentelemetry.io/otel/metric v1.38.0 // indirect
	go.opentelemetry.io/otel/trace v1.38.0 // indirect
	go.opentelemetry.io/proto/otlp v1.7.1 // indirect
	google.golang.org/genproto/googleapis/api v0.0.0-20250825161204-c5933d9347a5 // indirect
)

require (
	github.com/felixge/httpsnoop v1.0.3 // indirect
	github.com/jelena-ra/touristApp/soa-team-4/Blog v0.0.0
	golang.org/x/net v0.44.0 // indirect
	golang.org/x/sys v0.36.0 // indirect
	golang.org/x/text v0.29.0 // indirect
	google.golang.org/genproto/googleapis/rpc v0.0.0-20250908214217-97024824d090 // indirect
	google.golang.org/protobuf v1.36.9
)

replace (
	github.com/jelena-ra/touristApp/soa-team-4/Blog => ../Blog
	github.com/jelena-ra/touristApp/soa-team-4/Following => ../Following
	github.com/jelena-ra/touristApp/soa-team-4/Tours => ../Tours
)
