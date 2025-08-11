package repository

import "github.com/neo4j/neo4j-go-driver/v5/neo4j"

type StakeholderRepository struct {
	dbDriver neo4j.DriverWithContext
}

func NewStakeholderRepository(driver neo4j.DriverWithContext) *StakeholderRepository {
	return &StakeholderRepository{dbDriver: driver}
}