FROM golang:1.24-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o /stakeholder-service ./cmd/main.go

FROM alpine:latest

COPY --from=builder /stakeholder-service /stakeholder-service

EXPOSE 8081

CMD ["/stakeholder-service"]
