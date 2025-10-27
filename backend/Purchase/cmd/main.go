package main

import (
	"fmt"
	"log"
	"net/http"

	_ "github.com/lib/pq"

	"github.com/jelena-ra/touristApp/soa-team-4/Purchase/internal/config"
	"github.com/jelena-ra/touristApp/soa-team-4/Purchase/internal/handler"
	"github.com/jelena-ra/touristApp/soa-team-4/Purchase/internal/repository"
	"github.com/jelena-ra/touristApp/soa-team-4/Purchase/internal/service"
)

func main() {
	fmt.Println("Starting Purchase Service...")

	db := config.ConnectPostgres()
	defer db.Close()

	cartRepo := repository.NewShoppingCartRepository(db)
	itemRepo := repository.NewOrderItemRepository(db)
	tokenRepo := repository.NewTourPurchaseTokenRepository(db)

	purchaseService := service.NewPurchaseService(cartRepo, itemRepo, tokenRepo)

	purchaseHandler := handler.NewPurchaseHandler(purchaseService)

	http.HandleFunc("/add", purchaseHandler.AddItemHandler)
	http.HandleFunc("/remove", purchaseHandler.RemoveItemHandler)
	http.HandleFunc("/view", purchaseHandler.ViewCartHandler)
	http.HandleFunc("/checkout", purchaseHandler.CheckoutHandler)
	http.HandleFunc("/tokens", purchaseHandler.GetTokensByUserHandler)

	port := ":8085"
	fmt.Printf("Purchase service running at http://localhost%s\n", port)
	if err := http.ListenAndServe(port, nil); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
