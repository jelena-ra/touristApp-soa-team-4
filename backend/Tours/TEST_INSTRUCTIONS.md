# 🧪 Test Instrukcije za Tours Mikroservis

## 📋 Potrebno pre testiranja:

1. **MongoDB mora biti pokrenut** (port 27017)
2. **Stakeholders servis mora biti pokrenut** (port 8081)  
3. **Tours servis** (port 8083)

## 🚀 Kako testirati funkcionalnost:

### 1️⃣ **Pokretanje Tours servisa lokalno:**
```bash
# Pređi u Tours direktorij
cd c:\Teo\8.semestar\SOA\touristApp-soa-team-4\backend\Tours

# Koristi lokalni .env
Copy-Item .env.local .env

# Pokretanje servisa
go run ./cmd/main.go
```

### 2️⃣ **Pokretanje test klijenta:**
```bash
# U drugom terminalu
go run test_client.go
```

## ✅ **Šta test radi:**

1. **Kreira novu turu** sa osnovnim informacijama
2. **Kreira recenziju** za tu turu sa ocenom 5
3. **Dobija sve recenzije** za turu
4. **Dobija detalje ture**

## 📊 **Očekivani rezultat:**
```
🚀 Test 1: Kreiranje nove ture...
✅ Kreirana tura sa ID: <tour_id>

📝 Test 2: Kreiranje recenzije...
✅ Kreirana recenzija sa ID: <recension_id>

📋 Test 3: Dobijanje svih recenzija za turu...
✅ Pronađeno 1 recenzija:
   1. Autor: user123, Ocena: 5, Komentar: Odličan tour! Preporučujem svima koji vole istoriju.

🎯 Test 4: Dobijanje detalja ture...
✅ Pronađena tura: Test Tura - Beograd - Ova tura prolazi kroz centar Beograda

🎉 Svi testovi uspešno završeni!
```

## 🔧 **Troubleshooting:**

### MongoDB nije pokrenut:
```bash
docker run -d --name test-mongo -p 27017:27017 -e MONGO_INITDB_DATABASE=tour_db mongo:latest
```

### Stakeholders servis nije pokrenut:
Proveriti da li radi: `netstat -an | findstr :8081`

### Tours servis se prekida:
Problema sa verzijama Go-a ili gRPC konfigracijom - koristiti Docker verziju.

## 🐳 **Docker Alternativa:**
```bash
docker-compose up --build
```

Sada imaš sve potrebno da testiraš funkcionalnost!