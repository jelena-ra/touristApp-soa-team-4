module github.com/jelena-ra/touristApp/soa-team-4/Blog

go 1.25.0

replace github.com/jelena-ra/touristApp/soa-team-4/Blog => .


require (
	github.com/jelena-ra/touristApp/soa-team-4/Following v0.0.0-00010101000000-000000000000
	github.com/jelena-ra/touristApp/soa-team-4/Messages v0.0.0-00010101000000-000000000000
	github.com/joho/godotenv v1.5.1
	go.mongodb.org/mongo-driver v1.17.4
	google.golang.org/grpc v1.75.1
	google.golang.org/protobuf v1.36.9
)

require (
	github.com/davecgh/go-spew v1.1.2-0.20180830191138-d8f796af33cc // indirect
	github.com/golang/snappy v0.0.4 // indirect
	github.com/klauspost/compress v1.16.7 // indirect
	github.com/montanaflynn/stats v0.7.1 // indirect
	github.com/streadway/amqp v1.1.0
	github.com/xdg-go/pbkdf2 v1.0.0 // indirect
	github.com/xdg-go/scram v1.1.2 // indirect
	github.com/xdg-go/stringprep v1.0.4 // indirect
	github.com/youmark/pkcs8 v0.0.0-20240726163527-a2c0da244d78 // indirect
	go.opentelemetry.io/otel v1.38.0 // indirect
	go.opentelemetry.io/otel/sdk/metric v1.38.0 // indirect
	golang.org/x/crypto v0.42.0 // indirect
	golang.org/x/net v0.44.0 // indirect
	golang.org/x/sync v0.17.0 // indirect
	golang.org/x/sys v0.36.0 // indirect
	golang.org/x/text v0.29.0 // indirect
	google.golang.org/genproto/googleapis/rpc v0.0.0-20250908214217-97024824d090 // indirect
)

replace github.com/jelena-ra/touristApp/soa-team-4/Following => ../Following

replace github.com/jelena-ra/touristApp/soa-team-4/Stakeholders => ../Stakeholders

replace github.com/jelena-ra/touristApp/soa-team-4/API_Gateway => ../API_Gateway

replace github.com/jelena-ra/touristApp/soa-team-4/Messages => ../Messages