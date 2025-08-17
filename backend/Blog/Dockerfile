# GO - "instalacija"
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Skinemo potrebne zavisnosti
COPY go.mod go.sum ./
RUN go mod download

COPY .env .env

# . . = ostatak koda
COPY . .

# Kompajliramo Go aplikaciju
RUN CGO_ENABLED=0 GOOS=linux go build -o /blog-service ./cmd/main.go

FROM alpine:latest

# kompajlira ono iz prvog koraka 
COPY --from=builder /blog-service /blog-service
COPY --from=builder /app/.env .env
EXPOSE 8082

CMD ["/blog-service"]