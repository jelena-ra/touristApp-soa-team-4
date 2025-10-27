package model

type OrderItem struct {
	Id     string  `json:"id"`
	TourID string  `json:"tour_id"`
	CartID string  `json:"cart_id"`
	Name   string  `json:"name"`
	Price  float64 `json:"price"`
}
