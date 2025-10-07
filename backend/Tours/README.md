# Tours Mikroservis - Docker Setup

## Preduslovi
- Docker i Docker Compose instalirani

## Fajlovi koje sam kreirao:
- `.env` - Environment varijable za Tours servis
- `Dockerfile.parent` - Docker build fajl koji radi iz parent direktorija
- `docker-compose.yml` - Orkestrator za celokupni stack
- `build.ps1` / `build.sh` - Build skriptovi

## Pokretanje

### Opcija 1: Pokretanje celog stack-a sa docker-compose
```bash
# Iz Tours direktorija
docker-compose up --build
```

### Opcija 2: Manuelno build i pokretanje
```bash
# Build Tours servisa
./build.ps1  # na Windows
# ili
./build.sh   # na Linux/Mac

# Pokretanje samo Tours servisa
docker run -p 8083:8083 tours-service
```

## Servisi u stack-u:
- **MongoDB**: port 27017
- **Stakeholders Service**: port 8081 (zavisi od postojanja Stakeholders Dockerfile-a)
- **Tours Service**: port 8083

## Environment varijable (.env):
- MONGO_URI=mongodb://mongo:27017
- MONGO_DB_NAME=tour_db
- MONGO_COLLECTION_NAME=tours
- MONGO_KEYPOINT_COLLECTION_NAME=key_points
- STAKEHOLDERS_PORT=8081
- PORT=8083

## Napomene:
- Tours servis zavisi od Stakeholders servisa
- Možda treba da se napravi Dockerfile i za Stakeholders servis
- Oba servisa koriste istu MongoDB instancu