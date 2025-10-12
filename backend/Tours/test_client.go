package main

import (
	"context"
	"fmt"
	"log"
	"time"

	tourProto "github.com/jelena-ra/touristApp/soa-team-4/Tours/proto"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func main() {
	// Povezivanje sa Tours servisom
	conn, err := grpc.Dial("localhost:8083", grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("Failed to connect: %v", err)
	}
	defer conn.Close()

	client := tourProto.NewTourServiceClient(conn)
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*30)
	defer cancel()

	// Test 1: Kreiranje ture
	fmt.Println("🚀 Test 1: Kreiranje nove ture...")
	tourReq := &tourProto.CreateTourRequest{
		Tour: &tourProto.Tour{
			AuthorId:    "guide123",
			Name:        "Test Tura - Beograd",
			Description: "Ova tura prolazi kroz centar Beograda",
			Price:       1500.0,
			Difficulty:  tourProto.TourDifficulty_EASY,
			Tags:        []tourProto.TourTag{tourProto.TourTag_Cultural, tourProto.TourTag_Historical},
			Status:      tourProto.TourStatus_DRAFT,
		},
	}

	tourResp, err := client.CreateTour(ctx, tourReq)
	if err != nil {
		log.Fatalf("Failed to create tour: %v", err)
	}
	fmt.Printf("✅ Kreirana tura sa ID: %s\n", tourResp.Tour.Id)
	tourID := tourResp.Tour.Id

	// Test 2: Kreiranje recenzije
	fmt.Println("\n📝 Test 2: Kreiranje recenzije...")
	recReq := &tourProto.CreateRecensionRequest{
		Recension: &tourProto.Recension{
			AuthorId:  "user123",
			TourId:    tourID,
			Rating:    5,
			VisitDate: "2025-10-08T20:00:00Z",
			Comment:   "Odličan tour! Preporučujem svima koji vole istoriju.",
			Pictures:  []string{"slika1.jpg", "slika2.jpg"},
		},
	}

	recResp, err := client.CreateRecension(ctx, recReq)
	if err != nil {
		log.Fatalf("Failed to create recension: %v", err)
	}
	fmt.Printf("✅ Kreirana recenzija sa ID: %s\n", recResp.Recension.Id)

	// Test 3: Dobijanje recenzija za turu
	fmt.Println("\n📋 Test 3: Dobijanje svih recenzija za turu...")
	getRecReq := &tourProto.TourIDRequest{
		Id: tourID,
	}

	getRecResp, err := client.GetRecensionsByTourID(ctx, getRecReq)
	if err != nil {
		log.Fatalf("Failed to get recensions: %v", err)
	}

	fmt.Printf("✅ Pronađeno %d recenzija:\n", len(getRecResp.Recensions))
	for i, rec := range getRecResp.Recensions {
		fmt.Printf("   %d. Autor: %s, Ocena: %d, Komentar: %s\n",
			i+1, rec.AuthorId, rec.Rating, rec.Comment)
	}

	// Test 4: Dobijanje detalja ture
	fmt.Println("\n🎯 Test 4: Dobijanje detalja ture...")
	getTourReq := &tourProto.TourIDRequest{
		Id: tourID,
	}

	getTourResp, err := client.GetTourByID(ctx, getTourReq)
	if err != nil {
		log.Fatalf("Failed to get tour: %v", err)
	}
	fmt.Printf("✅ Pronađena tura: %s - %s\n", getTourResp.Tour.Name, getTourResp.Tour.Description)

	fmt.Println("\n🎉 Svi testovi uspešno završeni!")
}
