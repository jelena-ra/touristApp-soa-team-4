package model

type ShoppingCart struct {
	CartID string  `json:"cart_id"`
	UserID string  `json:"user_id"`
	Total  float64 `json:"total"`
}
