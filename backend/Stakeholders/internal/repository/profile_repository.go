package repository

import (
	"context"
	"fmt"

	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/model"
	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

type ProfileRepository struct {
	dbDriver neo4j.DriverWithContext
}

func NewProfileRepository(driver neo4j.DriverWithContext) *ProfileRepository {
	return &ProfileRepository{dbDriver: driver}
}

func (r *ProfileRepository) CreateProfile(profile model.Profile, ctx context.Context) (model.Profile, error) {

	session := r.dbDriver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close(ctx)

	result, err := session.ExecuteWrite(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
		query := `CREATE (p:Person {
		userId: $userId,
		name: $name,
		surname: $surname,
		biography: $biography,
		moto: $moto,
		photoId: $photoId,
		money: 20000.0
		}) RETURN p `

		params := map[string]any{
			"userId":    profile.UserId,
			"name":      profile.Name,
			"surname":   profile.Surname,
			"biography": profile.Biography,
			"moto":      profile.Moto,
			"photoId":   profile.PhotoId,
		}
		records, err := tx.Run(ctx, query, params)

		record, err := records.Single(ctx)
		if err != nil {
			return nil, err
		}
		node, ok := record.Values[0].(neo4j.Node)
		if !ok {
			return nil, fmt.Errorf("result is not a node")
		}
		props := node.Props
		newProfile := model.Profile{
			UserId:    props["userId"].(string),
			Name:      props["name"].(string),
			Surname:   props["surname"].(string),
			Biography: props["biography"].(string),
			Moto:      props["moto"].(string),
			PhotoId:   props["photoId"].(string),
			Money:     props["money"].(float64),
		}

		return newProfile, nil
	})

	if err != nil {
		return model.Profile{}, err
	}

	profile, ok := result.(model.Profile)
	if !ok {
		return model.Profile{}, fmt.Errorf("failed to cast result to model.Profile")
	}

	return profile, nil

}

func (r *ProfileRepository) GetByUserID(userId string, ctx context.Context) (model.Profile, error) {
	var profile model.Profile

	session := r.dbDriver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	result, err := session.ExecuteRead(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
		query := "MATCH (p:Person{userId: $userId}) RETURN p"
		params := map[string]any{"userId": userId}
		records, err := tx.Run(ctx, query, params)

		record, err := records.Single(ctx)
		if err != nil {
			return nil, err
		}

		node, ok := record.Values[0].(neo4j.Node)
		if !ok {
			return nil, fmt.Errorf("result is not a node")
		}

		props := node.Props
		foundProfile := model.Profile{

			UserId:    props["userId"].(string),
			Name:      props["name"].(string),
			Surname:   props["surname"].(string),
			Biography: props["biography"].(string),
			Moto:      props["moto"].(string),
			PhotoId:   props["photoId"].(string),
			Money:     props["money"].(float64),
		}

		return foundProfile, nil
	})

	if err != nil {
		return model.Profile{}, err
	}

	profile, ok := result.(model.Profile)
	if !ok {
		return model.Profile{}, fmt.Errorf("failed to cast result to model.Profile")
	}

	return profile, nil
}

func (r *ProfileRepository) UpdateProfile(profile model.Profile, ctx context.Context) (model.Profile, error) {
	session := r.dbDriver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close(ctx)

	result, err := session.ExecuteWrite(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
		query := `
			MATCH (p:Person {userId: $userId})
			SET p.name = $name,
				p.surname = $surname,
				p.biography = $biography,
				p.moto = $moto,
				p.photoId = $photoId,
				p.money = $money
			RETURN p
		`

		params := map[string]any{
			"userId":    profile.UserId,
			"name":      profile.Name,
			"surname":   profile.Surname,
			"biography": profile.Biography,
			"moto":      profile.Moto,
			"photoId":   profile.PhotoId,
			"money":     profile.Money,
		}

		records, err := tx.Run(ctx, query, params)
		if err != nil {
			return nil, err
		}

		record, err := records.Single(ctx)
		if err != nil {
			return nil, err
		}

		node, ok := record.Values[0].(neo4j.Node)
		if !ok {
			return nil, fmt.Errorf("result is not a node")
		}

		props := node.Props
		updatedProfile := model.Profile{
			UserId:    props["userId"].(string),
			Name:      props["name"].(string),
			Surname:   props["surname"].(string),
			Biography: props["biography"].(string),
			Moto:      props["moto"].(string),
			PhotoId:   props["photoId"].(string),
			Money:     props["money"].(float64),
		}

		return updatedProfile, nil
	})

	if err != nil {
		return model.Profile{}, err
	}

	profile, ok := result.(model.Profile)
	if !ok {
		return model.Profile{}, fmt.Errorf("failed to cast result to model.Profile")
	}

	return profile, nil
}
func (r *ProfileRepository) DeleteProfile(userId string, ctx context.Context) error {
	session := r.dbDriver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close(ctx)

	_, err := session.ExecuteWrite(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
		query := `
			MATCH (p:Person {userId: $userId})
			DETACH DELETE p
		`
		params := map[string]any{
			"userId": userId,
		}

		// Run the delete query
		result, err := tx.Run(ctx, query, params)
		if err != nil {
			return nil, fmt.Errorf("failed to execute delete query: %w", err)
		}

		// Optionally check number of deleted nodes
		summary, err := result.Consume(ctx)
		if err != nil {
			return nil, fmt.Errorf("failed to consume result: %w", err)
		}

		if summary.Counters().NodesDeleted() == 0 {
			return nil, fmt.Errorf("no profile found with userId %s", userId)
		}

		return nil, nil
	})

	if err != nil {
		return fmt.Errorf("failed to delete profile: %w", err)
	}

	return nil
}
