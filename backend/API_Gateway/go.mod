module github.com/jelena-ra/touristApp/soa-team-4/API_Gateway

go 1.24.6

require (
	github.com/golang-jwt/jwt/v5 v5.3.0
	github.com/gorilla/handlers v1.5.2
	github.com/gorilla/mux v1.8.1
	github.com/joho/godotenv v1.5.1
	google.golang.org/grpc v1.74.2
)

require (
	github.com/felixge/httpsnoop v1.0.3 // indirect
	github.com/jelena-ra/touristApp/soa-team-4/Blog v0.0.0
	golang.org/x/net v0.40.0 // indirect
	golang.org/x/sys v0.33.0 // indirect
	golang.org/x/text v0.25.0 // indirect
	google.golang.org/genproto/googleapis/rpc v0.0.0-20250528174236-200df99c418a // indirect
	google.golang.org/protobuf v1.36.7 // indirect
)

replace github.com/jelena-ra/touristApp/soa-team-4/Blog => ../Blog
