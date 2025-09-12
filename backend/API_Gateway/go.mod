module github.com/jelena-ra/touristApp/soa-team-4/API_Gateway

go 1.25

require (
	github.com/golang-jwt/jwt/v5 v5.3.0
	github.com/gorilla/handlers v1.5.2
	github.com/gorilla/mux v1.8.1
	github.com/jelena-ra/touristApp/soa-team-4/Tours v0.0.0-00010101000000-000000000000
	github.com/joho/godotenv v1.5.1
	google.golang.org/grpc v1.75.1
)

require (
	github.com/felixge/httpsnoop v1.0.4 // indirect
	github.com/jelena-ra/touristApp/soa-team-4/Blog v0.0.0
	golang.org/x/net v0.41.0 // indirect
	golang.org/x/sys v0.33.0 // indirect
	golang.org/x/text v0.26.0 // indirect
	google.golang.org/genproto/googleapis/rpc v0.0.0-20250908214217-97024824d090 // indirect
	google.golang.org/protobuf v1.36.9 // indirect
)

replace github.com/jelena-ra/touristApp/soa-team-4/Blog => ../Blog

replace github.com/jelena-ra/touristApp/soa-team-4/Tours => ../Tours
