FROM golang:1.25-alpine AS builder

WORKDIR /app

COPY . .

WORKDIR /app/API_Gateway

RUN ls -l

RUN go mod download


RUN CGO_ENABLED=0 GOOS=linux go build -o /api-gateway ./cmd/main.go

FROM alpine:latest

WORKDIR /app

COPY --from=builder /api-gateway .

COPY --from=builder /app/API_Gateway/.env .env

EXPOSE 8000

CMD ["./api-gateway"]
