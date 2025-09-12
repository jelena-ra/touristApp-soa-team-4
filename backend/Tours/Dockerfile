FROM golang:latest AS builder

# DODAJ OVDE SVOJE IME
#LABEL authors="radoj"

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY .env .env

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o /tour-service ./cmd/main.go

FROM alpine:latest

COPY --from=builder /tour-service /tour-service
COPY --from=builder /app/.env .env
EXPOSE 8083

CMD ["/tour-service"]