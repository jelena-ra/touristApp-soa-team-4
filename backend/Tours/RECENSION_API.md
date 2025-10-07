# Test API pozivi za recenzije

## Kreiranje recenzije
```bash
# gRPC poziv za kreiranje recenzije
grpcurl -plaintext -d '{
  "recension": {
    "authorId": "507f1f77bcf86cd799439011",
    "tourId": "507f1f77bcf86cd799439012", 
    "rating": 5,
    "visitDate": "2023-06-15T10:30:00Z",
    "comment": "Odličan tour, preporučujem svima!",
    "pictures": ["photo1.jpg", "photo2.jpg"]
  }
}' localhost:8083 tour.TourService/CreateRecension
```

## Dobijanje recenzija za turu
```bash
# gRPC poziv za dobijanje svih recenzija za određenu turu
grpcurl -plaintext -d '{
  "id": "507f1f77bcf86cd799439012"
}' localhost:8083 tour.TourService/GetRecensionsByTourID
```

## Struktura recenzije
- **ID**: Jedinstveni identifikator recenzije
- **AuthorID**: ID korisnika koji je napisao recenziju
- **TourID**: ID ture na koju se recenzija odnosi  
- **Rating**: Ocena od 1 do 5
- **VisitDate**: Datum kada je korisnik posetio turu
- **Comment**: Tekstualni komentar
- **CreatedAt**: Datum kada je recenzija kreirana
- **Pictures**: Lista URL-ova slika