package repository

import (
	"database/sql"
	"math"

	"github.com/google/uuid"
	"github.com/jelena-ra/touristApp/soa-team-4/Purchase/internal/model"
)

type OrderItemRepository struct {
	DB *sql.DB
}

func NewOrderItemRepository(db *sql.DB) *OrderItemRepository {
	return &OrderItemRepository{DB: db}
}

func (r *OrderItemRepository) AddItem(item model.OrderItem) error {
	item.Id = uuid.New().String()
	_, err := r.DB.Exec(`
		INSERT INTO order_items (id, cart_id, tour_id, name, price)
		VALUES ($1, $2, $3, $4, $5)
	`, item.Id, item.CartID, item.TourID, item.Name, item.Price)
	return err
}

func (r *OrderItemRepository) RemoveItem(cartID, tourID string) error {
	_, err := r.DB.Exec(`
		DELETE FROM order_items WHERE cart_id = $1 AND tour_id = $2
	`, cartID, tourID)
	return err
}

func (r *OrderItemRepository) GetItems(cartID string) ([]model.OrderItem, error) {
	rows, err := r.DB.Query(`
		SELECT id, cart_id, tour_id, name, price
		FROM order_items
		WHERE cart_id = $1
	`, cartID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []model.OrderItem{}
	for rows.Next() {
		var it model.OrderItem
		if err := rows.Scan(&it.Id, &it.CartID, &it.TourID, &it.Name, &it.Price); err != nil {
			return nil, err
		}
		items = append(items, it)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return items, nil
}

func (r *OrderItemRepository) CalculateTotal(cartID string) (float64, error) {
	row := r.DB.QueryRow(`
		SELECT COALESCE(SUM(price), 0) FROM order_items WHERE cart_id = $1
	`, cartID)

	var total float64
	if err := row.Scan(&total); err != nil {
		return 0, err
	}

	return math.Round(total*100) / 100, nil
}

func (r *OrderItemRepository) ClearItems(cartID string) error {
	_, err := r.DB.Exec(`
		DELETE FROM order_items WHERE cart_id = $1
	`, cartID)
	return err
}
