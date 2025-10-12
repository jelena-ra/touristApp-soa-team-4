FROM golang:1.25-alpine AS builder

WORKDIR /app

# Copy go mod files first for better caching
COPY Tours/go.mod Tours/go.sum ./Tours/
COPY Stakeholders/go.mod Stakeholders/go.sum ./Stakeholders/

# Download dependencies
WORKDIR /app/Tours
RUN go mod download

# Copy source code
COPY Tours/ ./
COPY Stakeholders/ ../Stakeholders/

# Tidy dependencies
RUN go mod tidy

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o tour-service ./cmd/main.go

# Final stage
FROM alpine:latest

# Install ca-certificates for HTTPS requests
RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy the binary and environment file
COPY --from=builder /app/Tours/tour-service .
COPY --from=builder /app/Tours/.env .

EXPOSE 8083

CMD ["./tour-service"]