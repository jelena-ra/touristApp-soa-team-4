FROM golang:1.25-alpine AS builder

WORKDIR /app


COPY . .
COPY .env .env

WORKDIR /app/Stakeholders

RUN go mod tidy

RUN GOWORK=off go mod vendor

RUN CGO_ENABLED=0 GOOS=linux go build -mod=vendor -o /stakeholder-service ./cmd/main.go

FROM alpine:latest

WORKDIR /app

COPY --from=builder /stakeholder-service /stakeholder-service
COPY --from=builder /app/.env .env
EXPOSE 8081

CMD ["/stakeholder-service"]