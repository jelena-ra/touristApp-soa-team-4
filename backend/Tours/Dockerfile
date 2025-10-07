FROM golang:latest AS builder

WORKDIR /app

# Copy both Tours and Stakeholders directories
COPY ../Stakeholders /app/Stakeholders
COPY . /app/Tours

WORKDIR /app/Tours

RUN go mod tidy

RUN CGO_ENABLED=0 GOOS=linux go build -o /tour-service ./cmd/main.go

FROM alpine:latest

COPY --from=builder /tour-service /tour-service
COPY --from=builder /app/Tours/.env ./.env
EXPOSE 8083

CMD ["/tour-service"]