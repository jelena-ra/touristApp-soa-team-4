package handler

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/jelena-ra/touristApp/soa-team-4/Purchase/internal/model"
	"github.com/jelena-ra/touristApp/soa-team-4/Purchase/internal/service"
)

type PurchaseHandler struct {
	cartService *service.PurchaseService
}

func NewPurchaseHandler(cartService *service.PurchaseService) *PurchaseHandler {
	return &PurchaseHandler{cartService}
}

func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if data != nil {
		if err := json.NewEncoder(w).Encode(data); err != nil {
			w.Write([]byte(`{"error":"failed to encode response"}`))
		}
	}
}

func (h *PurchaseHandler) AddItemHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req struct {
		UserID string          `json:"user_id"`
		Item   model.OrderItem `json:"item"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body: " + err.Error()})
		return
	}

	if err := h.cartService.AddItem(req.UserID, req.Item); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"status": "item added"})
}

func (h *PurchaseHandler) RemoveItemHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req struct {
		UserID string `json:"user_id"`
		TourID string `json:"tour_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body: " + err.Error()})
		return
	}

	if err := h.cartService.RemoveItem(req.UserID, req.TourID); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"status": "item removed"})
}

func (h *PurchaseHandler) ViewCartHandler(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	userID := r.URL.Query().Get("user_id")
	if userID == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "user_id is required"})
		return
	}

	fmt.Println("ViewCartHandler called for userID:", userID)

	cart, items, err := h.cartService.GetCartWithItems(userID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	if cart == nil {
		cart = &model.ShoppingCart{
			UserID: userID,
			CartID: "",
			Total:  0,
		}
	}

	if items == nil {
		items = []model.OrderItem{}
	}

	resp := struct {
		Cart  *model.ShoppingCart `json:"cart"`
		Items []model.OrderItem   `json:"items"`
	}{
		Cart:  cart,
		Items: items,
	}
	writeJSON(w, http.StatusOK, resp)
}

func (h *PurchaseHandler) CheckoutHandler(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		http.Error(w, "Missing Authorization header", http.StatusUnauthorized)
		return
	}
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req struct {
		UserID string `json:"user_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body: " + err.Error()})
		return
	}

	tokens, err := h.cartService.Checkout(req.UserID, authHeader)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, tokens)
}

func (h *PurchaseHandler) GetTokensByUserHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID := r.URL.Query().Get("user_id")
	if userID == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "user_id is required"})
		return
	}

	fmt.Printf("Fetching tokens for userID: %s\n", userID)

	tokens, err := h.cartService.GetTokensByUser(userID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": fmt.Sprintf("failed to get tokens: %v", err)})
		return
	}

	if tokens == nil {
		tokens = []model.TourPurchaseToken{}
	}

	writeJSON(w, http.StatusOK, tokens)
}
