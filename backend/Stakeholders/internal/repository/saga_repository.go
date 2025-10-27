package repository

import (
	"database/sql"
	"fmt"
	_ "time"

	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/model"
)

type SagaRepository interface {
	CreateSagaState(saga *model.SagaState) error
	GetSagaState(sagaID string) (*model.SagaState, error)
	UpdateSagaState(saga *model.SagaState) error
}

type PostgresSagaRepository struct {
	db *sql.DB
}

func NewPostgresSagaRepository(db *sql.DB) *PostgresSagaRepository {
	return &PostgresSagaRepository{db: db}
}

func (r *PostgresSagaRepository) CreateSagaState(saga *model.SagaState) error {
	query := `INSERT INTO saga_states (saga_id, user_id, status, last_update) VALUES ($1, $2, $3, $4)`
	_, err := r.db.Exec(query, saga.SagaID, saga.UserID, saga.Status, saga.LastUpdate)
	if err != nil {
		return fmt.Errorf("failed to insert saga state: %w", err)
	}
	return nil
}

func (r *PostgresSagaRepository) GetSagaState(sagaID string) (*model.SagaState, error) {
	saga := &model.SagaState{}
	query := `SELECT saga_id, user_id, status, error_message, last_update FROM saga_states WHERE saga_id = $1`
	var errorMessage sql.NullString // Koristi sql.NullString za nullable kolone
	err := r.db.QueryRow(query, sagaID).Scan(&saga.SagaID, &saga.UserID, &saga.Status, &errorMessage, &saga.LastUpdate)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("saga state with ID %s not found", sagaID)
		}
		return nil, fmt.Errorf("failed to get saga state: %w", err)
	}
	if errorMessage.Valid {
		saga.ErrorMessage = &errorMessage.String
	}
	return saga, nil
}

func (r *PostgresSagaRepository) UpdateSagaState(saga *model.SagaState) error {
	query := `UPDATE saga_states SET user_id = $1, status = $2, error_message = $3, last_update = $4 WHERE saga_id = $5`
	// Convert *string to sql.NullString for DB update
	var errorMessage sql.NullString
	if saga.ErrorMessage != nil {
		errorMessage = sql.NullString{String: *saga.ErrorMessage, Valid: true}
	} else {
		errorMessage = sql.NullString{Valid: false}
	}

	_, err := r.db.Exec(query, saga.UserID, saga.Status, errorMessage, saga.LastUpdate, saga.SagaID)
	if err != nil {
		return fmt.Errorf("failed to update saga state: %w", err)
	}
	return nil
}

// ... (funkcija za inicijalizaciju baze, npr. kreiranje tabele)
func InitSagaStateTable(db *sql.DB) error {
	createTableSQL := `
    CREATE TABLE IF NOT EXISTS saga_states (
        saga_id VARCHAR(255) PRIMARY KEY,
        user_id UUID NOT NULL,
        status VARCHAR(50) NOT NULL,
        error_message TEXT,
        last_update TIMESTAMP NOT NULL DEFAULT NOW()
    );`
	_, err := db.Exec(createTableSQL)
	if err != nil {
		return fmt.Errorf("failed to create saga_states table: %w", err)
	}
	return nil
}
