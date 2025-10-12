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
	conn, err := grpc.Dial("localhost:8083", grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("❌ Failed to connect: %v", err)
	}
	defer conn.Close()

	client := tourProto.NewTourServiceClient(conn)
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()

	fmt.Println("📋 Testing GetAllTours...")
	resp, err := client.GetAllTours(ctx, &tourProto.Empty{})
	if err != nil {
		log.Printf("❌ GetAllTours failed: %v", err)
	} else {
		fmt.Printf("✅ GetAllTours successful! Found %d tours\n", len(resp.Tours))
		for i, tour := range resp.Tours {
			fmt.Printf("   %d. ID: %s, Name: %s\n", i+1, tour.Id, tour.Name)
		}
	}
}
