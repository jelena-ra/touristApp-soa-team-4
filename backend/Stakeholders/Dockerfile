FROM golang:1.25-alpine AS builder

WORKDIR /app

# COPY go.mod go.sum ./

# 1. OBRISANA je linija 'RUN go mod download'

# 2. DODATA je linija za kopiranje 'vendor' foldera
#COPY vendor ./vendor
# ovo valjda ne trebaa COPY go.mod go.sum ./

#

#COPY ../../ .
COPY . .
COPY .env .env



# Now change the WORKDIR to the specific service we want to build
# This will be /app/Stakeholders
WORKDIR /app/Stakeholders

# Run go mod tidy to clean up and ensure go.mod is consistent
RUN go mod tidy

# Now, generate the vendor directory *inside the container*
RUN GOWORK=off go mod vendor


# 3. DODAT je '-mod=vendor' fleg u 'go build' komandu
RUN CGO_ENABLED=0 GOOS=linux go build -mod=vendor -o /stakeholder-service ./cmd/main.go

FROM alpine:latest

WORKDIR /app
#

COPY --from=builder /stakeholder-service /stakeholder-service
COPY --from=builder /app/.env .env
EXPOSE 8081

CMD ["/stakeholder-service"]