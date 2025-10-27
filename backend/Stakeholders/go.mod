module github.com/jelena-ra/touristApp/soa-team-4/Stakeholders

go 1.25.0

require (
	github.com/glebarez/sqlite v1.11.0
	github.com/golang-jwt/jwt/v5 v5.3.0
	github.com/google/uuid v1.6.0
	github.com/gorilla/mux v1.8.1
	github.com/jelena-ra/touristApp/soa-team-4/Messages v0.0.0-00010101000000-000000000000
	github.com/joho/godotenv v1.5.1
	github.com/neo4j/neo4j-go-driver/v5 v5.28.2
	github.com/streadway/amqp v1.1.0
	google.golang.org/grpc v1.75.1
	google.golang.org/protobuf v1.36.9
	gorm.io/gorm v1.30.1
)

require (
	github.com/dustin/go-humanize v1.0.1 // indirect
	github.com/glebarez/go-sqlite v1.21.2 // indirect
	github.com/jinzhu/inflection v1.0.0 // indirect
	github.com/jinzhu/now v1.1.5 // indirect
	github.com/mattn/go-isatty v0.0.17 // indirect
	github.com/remyoudompheng/bigfft v0.0.0-20230129092748-24d4a6f8daec // indirect
	go.opentelemetry.io/otel v1.38.0 // indirect
	go.opentelemetry.io/otel/sdk/metric v1.38.0 // indirect
	golang.org/x/net v0.44.0 // indirect
	golang.org/x/sys v0.36.0 // indirect
	golang.org/x/text v0.29.0 // indirect
	google.golang.org/genproto/googleapis/rpc v0.0.0-20250908214217-97024824d090 // indirect
	modernc.org/libc v1.22.5 // indirect
	modernc.org/mathutil v1.5.0 // indirect
	modernc.org/memory v1.5.0 // indirect
	modernc.org/sqlite v1.23.1 // indirect
)

replace github.com/jelena-ra/touristApp/soa-team-4/Messages => ../Messages
