FROM golang:1.24-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .
COPY .env .env


RUN CGO_ENABLED=0 GOOS=linux go build -o /stakeholder-service ./cmd/main.go

FROM alpine:latest

COPY --from=builder /stakeholder-service /stakeholder-service
COPY --from=builder /app/.env .env
EXPOSE 8081

CMD ["/stakeholder-service"]
