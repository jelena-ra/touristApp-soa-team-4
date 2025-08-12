package repository

import (
	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/model"
	"context"
	)

type StakeholderRepository struct {
	dbDriver neo4j.DriverWithContext
}

func NewStakeholderRepository(driver neo4j.DriverWithContext) *StakeholderRepository {
	return &StakeholderRepository{dbDriver: driver}
}

func (repo *StakeholderRepository) FindAll(ctx context.Context) ([]model.Stakeholder, error) {
	var stakeholders []model.Stakeholder

	session := repo.dbDriver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	// Execute a Cypher query to find all Stakeholder nodes
	// "s" is an alias for the node
	// The result is a slice of records
	result, err := session.ExecuteRead(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
		query := "MATCH (s:Stakeholder) RETURN s"
		records, err := tx.Run(ctx, query, nil)
		if err != nil {
			return nil, err
		}

		var foundStakeholders []model.Stakeholder
		for records.Next(ctx) {
			record := records.Record()
			node := record.Values[0].(neo4j.Node)
			props := node.Props

			// Map Neo4j node properties to the Go struct
			// You'll need to adjust this mapping based on your model
			stakeholder := model.Stakeholder{
				ID:    props["id"].(string),

			}
			foundStakeholders = append(foundStakeholders, stakeholder)
		}
		if err = records.Err(); err != nil {
			return nil, err
		}

		return foundStakeholders, nil
	})

	if err != nil {
		return nil, err
	}

	// Cast the result from any to the expected type
	stakeholders, _ = result.([]model.Stakeholder)
	return stakeholders, nil
}