package repository

import (
	"context"
	"errors"

	"github.com/google/uuid"

	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/model"
	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

type UserRepository struct {
	dbDriver neo4j.DriverWithContext
}

func NewUserRepository(driver neo4j.DriverWithContext) *UserRepository {
	return &UserRepository{dbDriver: driver}
}

func (repo *UserRepository) FindAll(ctx context.Context) ([]model.User, error) {
	var users []model.User

	session := repo.dbDriver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	result, err := session.ExecuteRead(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
		query := "MATCH (s:User) RETURN s"
		records, err := tx.Run(ctx, query, nil)
		if err != nil {
			return nil, err
		}

		var foundUsers []model.User
		for records.Next(ctx) {
			record := records.Record()
			node := record.Values[0].(neo4j.Node)
			props := node.Props

			user := model.User{
				ID:       props["id"].(string),
				Username: props["username"].(string),
				Password: props["password"].(string),
				Email:    props["email"].(string),
				Role:     props["role"].(string),
				Blocked:  props["blocked"].(bool),
			}
			foundUsers = append(foundUsers, user)
		}
		if err = records.Err(); err != nil {
			return nil, err
		}

		return foundUsers, nil
	})

	if err != nil {
		return nil, err
	}

	users, _ = result.([]model.User)
	return users, nil
}

func (repo *UserRepository) GetActiveByName(username string) (*model.User, error) {
	ctx := context.Background()
	session := repo.dbDriver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	result, err := session.ExecuteRead(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
		query := `
			MATCH (s:User)
			WHERE s.username = $username AND s.blocked = false
			RETURN s
		`
		params := map[string]any{"username": username}

		records, err := tx.Run(ctx, query, params)
		if err != nil {
			return nil, err
		}

		if records.Next(ctx) {
			record := records.Record()
			node := record.Values[0].(neo4j.Node)
			props := node.Props

			user := model.User{
				ID:       props["id"].(string),
				Username: props["username"].(string),
				Password: props["password"].(string),
				Email:    props["email"].(string),
				Role:     props["role"].(string),
				Blocked:  props["blocked"].(bool),
			}
			return &user, nil
		}

		return nil, errors.New("user not found")
	})

	if err != nil {
		return nil, err
	}

	if result == nil {
		return nil, errors.New("user not found")
	}

	return result.(*model.User), nil
}

func (repo *UserRepository) GetByID(id string) (*model.User, error) {
	ctx := context.Background()
	session := repo.dbDriver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	result, err := session.ExecuteRead(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
		query := `
			MATCH (s:User)
			WHERE s.id = $id AND s.blocked = false
			RETURN s
		`
		params := map[string]any{"id": id}

		records, err := tx.Run(ctx, query, params)
		if err != nil {
			return nil, err
		}

		if records.Next(ctx) {
			record := records.Record()
			node := record.Values[0].(neo4j.Node)
			props := node.Props

			user := model.User{
				ID:       props["id"].(string),
				Username: props["username"].(string),
				Password: props["password"].(string),
				Email:    props["email"].(string),
				Role:     props["role"].(string),
				Blocked:  props["blocked"].(bool),
			}
			return &user, nil
		}

		return nil, errors.New("user not found")
	})

	if err != nil {
		return nil, err
	}

	if result == nil {
		return nil, errors.New("user not found")
	}

	return result.(*model.User), nil
}

func (repo *UserRepository) Exists(username string) (bool, error) {
	ctx := context.Background()
	session := repo.dbDriver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	result, err := session.ExecuteRead(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
		query := `
			MATCH (s:User)
			WHERE s.username = $username AND s.blocked = false
			RETURN count(s) AS count
		`
		params := map[string]any{"username": username}

		records, err := tx.Run(ctx, query, params)
		if err != nil {
			return false, err
		}

		if records.Next(ctx) {
			record := records.Record()
			count := record.Values[0].(int64)
			return count > 0, nil
		}
		return false, nil
	})

	if err != nil {
		return false, err
	}

	return result.(bool), nil
}

func (repo *UserRepository) ExistsById(id string) (bool, error) {
	ctx := context.Background()
	session := repo.dbDriver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	result, err := session.ExecuteRead(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
		query := `
			MATCH (s:User)
			WHERE s.id = $id AND s.blocked = false
			RETURN count(s) AS count
		`
		params := map[string]any{"id": id}

		records, err := tx.Run(ctx, query, params)
		if err != nil {
			return false, err
		}

		if records.Next(ctx) {
			record := records.Record()
			count := record.Values[0].(int64)
			return count > 0, nil
		}
		return false, nil
	})

	if err != nil {
		return false, err
	}

	return result.(bool), nil
}

func (repo *UserRepository) Create(user *model.User) (*model.User, error) {
	ctx := context.Background()
	session := repo.dbDriver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close(ctx)

	result, err := session.ExecuteWrite(ctx, func(tx neo4j.ManagedTransaction) (any, error) {

		id := uuid.New().String()
		user.ID = id

		query := `
			CREATE (s:User {
				id: $id,
				username: $username,
				password: $password,
				email: $email,
				role: $role,
				blocked: $blocked
			})
			RETURN s
		`
		params := map[string]any{
			"id":       user.ID,
			"username": user.Username,
			"password": user.Password,
			"email":    user.Email,
			"role":     user.Role,
			"blocked":  user.Blocked,
		}

		records, err := tx.Run(ctx, query, params)
		if err != nil {
			return nil, err
		}

		record, err := records.Single(ctx)
		if err != nil {
			return nil, err
		}

		node := record.Values[0].(neo4j.Node)
		props := node.Props

		createdUser := &model.User{
			ID:       props["id"].(string),
			Username: props["username"].(string),
			Password: props["password"].(string),
			Email:    props["email"].(string),
			Role:     props["role"].(string),
			Blocked:  props["blocked"].(bool),
		}

		return createdUser, nil
	})

	if err != nil {
		return nil, err
	}

	return result.(*model.User), nil
}

func (repo *UserRepository) Update(user *model.User) (*model.User, error) {
	ctx := context.Background()
	session := repo.dbDriver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close(ctx)

	result, err := session.ExecuteWrite(ctx, func(tx neo4j.ManagedTransaction) (any, error) {

		query := `
			MATCH (s:User {id: $id})
			SET
				s.username = $username,
				s.password = $password,
				s.email = $email,
				s.role = $role,
				s.blocked = $blocked
			RETURN s
		`
		params := map[string]any{
			"id":       user.ID,
			"username": user.Username,
			"password": user.Password,
			"email":    user.Email,
			"role":     user.Role,
			"blocked":  user.Blocked,
		}

		records, err := tx.Run(ctx, query, params)
		if err != nil {
			return nil, err
		}

		record, err := records.Single(ctx)
		if err != nil {
			return nil, err
		}

		node := record.Values[0].(neo4j.Node)
		props := node.Props

		createdUser := &model.User{
			ID:       props["id"].(string),
			Username: props["username"].(string),
			Password: props["password"].(string),
			Email:    props["email"].(string),
			Role:     props["role"].(string),
			Blocked:  props["blocked"].(bool),
		}

		return createdUser, nil
	})

	if err != nil {
		return nil, err
	}

	return result.(*model.User), nil
}
