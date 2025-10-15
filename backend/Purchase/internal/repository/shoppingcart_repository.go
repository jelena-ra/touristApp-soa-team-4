package repository

import (
	"database/sql"
	"math"

	"github.com/google/uuid"
	"github.com/jelena-ra/touristApp/soa-team-4/Purchase/internal/model"
)

type ShoppingCartRepository struct {
	DB *sql.DB
}

func NewShoppingCartRepository(db *sql.DB) *ShoppingCartRepository {
	return &ShoppingCartRepository{DB: db}
}

func (r *ShoppingCartRepository) CreateCart(userID string) error {
	id := uuid.New().String()
	_, err := r.DB.Exec(`
        INSERT INTO shopping_carts (id, user_id, total)
        VALUES ($1, $2, 0)
        ON CONFLICT (user_id) DO NOTHING;
    `, id, userID)
	return err
}

func (r *ShoppingCartRepository) GetCartByUserID(userID string) (*model.ShoppingCart, error) {
	row := r.DB.QueryRow(`SELECT id, user_id, total FROM shopping_carts WHERE user_id = $1`, userID)

	var cart model.ShoppingCart
	if err := row.Scan(&cart.CartID, &cart.UserID, &cart.Total); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &cart, nil
}

func (r *ShoppingCartRepository) UpdateTotal(cartID string, total float64) error {
	total = math.Round(total*100) / 100
	_, err := r.DB.Exec(`UPDATE shopping_carts SET total = $1 WHERE id = $2`, total, cartID)
	return err
}
