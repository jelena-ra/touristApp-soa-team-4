# Tours Mikroservis - Docker Setup

## Preduslovi
- Docker i Docker Compose instalirani

## Struktura projekta
- `.env` - Environment varijable za Tours servis
- `Dockerfile` - Optimizovan Docker build fajl
- `docker-compose.yml` - Orkestrator za celokupni stack

## Pokretanje

### Pokretanje celog stack-a (preporučeno)
```bash
# Iz Tours direktorija
docker-compose up --build
```

### Manuelno build i pokretanje
```bash
# Build Tours servisa iz parent direktorija
cd ..
docker build -f Tours/Dockerfile -t tours-service .

# Pokretanje Tours servisa
docker run -p 8083:8083 tours-service
```

## Servisi u stack-u:
- **MongoDB**: port 27017
- **Stakeholders Service**: port 8081
- **Tours Service**: port 8083

## Environment varijable (.env):
Sve environment varijable su definirane u `.env` fajlu i automatski se učitavaju u docker-compose.

## Optimizacije:
- ✅ Jedan Dockerfile umesto duplikata
- ✅ Multi-stage build za manji finalni image
- ✅ Optimizovano Docker layer caching
- ✅ Korišćenje env_file umesto inline environment varijabli
- ✅ Alpine Linux za manji image
- ✅ Uklonjena duplikat Tours/proto struktura