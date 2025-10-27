package model

type TourPurchaseToken struct {
	id     int    `json:"id"`
	UserID string `json:"user_id"`
	TourID string `json:"tour_id"`
	Token  string `json:"token"`
}
