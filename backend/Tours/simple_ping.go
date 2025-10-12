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
	fmt.Println("🔌 Testing gRPC connection...")

	conn, err := grpc.Dial("localhost:8083", grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("Failed to connect: %v", err)
	}
	defer conn.Close()

	fmt.Println("✅ gRPC connection established")

	client := tourProto.NewTourServiceClient(conn)
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()

	fmt.Println("📋 Testiram GetAllTours...")
	resp, err := client.GetAllTours(ctx, &tourProto.Empty{})
	if err != nil {
		log.Printf("GetAllTours failed: %v", err)
	} else {
		fmt.Printf("✅ GetAllTours uspešan! Pronađeno %d tura\n", len(resp.Tours))
	}
}
