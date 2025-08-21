FROM golang:1.25-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./

COPY vendor ./vendor

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -mod=vendor -o /app/blog-service ./cmd/main.go

FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/blog-service .

COPY --from=builder /app/.env .

EXPOSE 8082

CMD ["./blog-service"]