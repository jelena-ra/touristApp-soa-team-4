FROM golang:1.25-alpine AS builder

WORKDIR /app

#COPY go.mod go.sum ./

#COPY vendor ./vendor

#COPY . .

#
#COPY go.mod go.sum ./

#


COPY . .


# Now change the WORKDIR to the specific service we want to build
WORKDIR /app/Blog

# Run go mod tidy to clean up and ensure go.mod is consistent
RUN go mod tidy

# Now, generate the vendor directory *inside the container*
# This step is crucial for `-mod=vendor` to work correctly.
RUN GOWORK=off go mod vendor



RUN CGO_ENABLED=0 GOOS=linux go build -mod=vendor -o /app/blog-service ./cmd/main.go

FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/blog-service .

COPY --from=builder /app/.env .

EXPOSE 8082

CMD ["./blog-service"]