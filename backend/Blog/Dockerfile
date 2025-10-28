FROM golang:1.25-alpine AS builder

WORKDIR /app

COPY . .

WORKDIR /app/Blog

RUN go mod tidy

RUN GOWORK=off go mod vendor

RUN CGO_ENABLED=0 GOOS=linux go build -mod=vendor -o /app/blog-service ./cmd/main.go

FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/blog-service .

COPY --from=builder /app/.env .

EXPOSE 8082

CMD ["./blog-service"]