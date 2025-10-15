# Koristi zvanični Go image
FROM golang:1.25-alpine

# Postavi radni direktorijum
WORKDIR /app

# Kopiraj go.mod i go.sum (za caching)
COPY go.mod go.sum ./

# Instaliraj dependencies
RUN go mod download

# Kopiraj ostatak koda
COPY . .

RUN go mod tidy

RUN CGO_ENABLED=0 GOOS=linux go build -o /purchase-service ./cmd/main.go

# Expose port
EXPOSE 8085


CMD ["/purchase-service"]
