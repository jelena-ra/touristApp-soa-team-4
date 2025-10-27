package repository

import (
	"database/sql"

	"github.com/jelena-ra/touristApp/soa-team-4/Purchase/internal/model"
)

type TourPurchaseTokenRepository struct {
	DB *sql.DB
}

func NewTourPurchaseTokenRepository(db *sql.DB) *TourPurchaseTokenRepository {
	return &TourPurchaseTokenRepository{DB: db}
}

func (r *TourPurchaseTokenRepository) SaveToken(token model.TourPurchaseToken) error {
	_, err := r.DB.Exec(`
		INSERT INTO tour_purchase_tokens (user_id, tour_id, token)
		VALUES ($1, $2, $3)
	`, token.UserID, token.TourID, token.Token)
	return err
}

func (r *TourPurchaseTokenRepository) GetTokensByUser(userID string) ([]model.TourPurchaseToken, error) {
	rows, err := r.DB.Query(`SELECT user_id, tour_id, token FROM tour_purchase_tokens WHERE user_id = $1`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tokens []model.TourPurchaseToken
	for rows.Next() {
		var t model.TourPurchaseToken
		if err := rows.Scan(&t.UserID, &t.TourID, &t.Token); err != nil {
			return nil, err
		}
		tokens = append(tokens, t)
	}
	return tokens, nil
}
