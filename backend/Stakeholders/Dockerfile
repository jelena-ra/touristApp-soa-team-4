FROM golang:1.25-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./

# 1. OBRISANA je linija 'RUN go mod download'

# 2. DODATA je linija za kopiranje 'vendor' foldera
COPY vendor ./vendor

COPY . .
COPY .env .env


# 3. DODAT je '-mod=vendor' fleg u 'go build' komandu
RUN CGO_ENABLED=0 GOOS=linux go build -mod=vendor -o /stakeholder-service ./cmd/main.go

FROM alpine:latest

COPY --from=builder /stakeholder-service /stakeholder-service
COPY --from=builder /app/.env .env
EXPOSE 8081

CMD ["/stakeholder-service"]