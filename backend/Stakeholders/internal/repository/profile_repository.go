package repository

import (
	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/model"
	"context"
	"fmt"
	)

type ProfileRepository struct{
	dbDriver neo4j.DriverWithContext
}

func NewProfileRepository(driver neo4j.DriverWithContext) *ProfileRepository{
	return &ProfileRepository{dbDriver : driver}
}

func(r *ProfileRepository)CreateProfile(profile model.Profile, ctx context.Context) (model.Profile, error){

	session := r.dbDriver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close(ctx)

	result, err := session.ExecuteWrite(ctx, func(tx neo4j.ManagedTransaction) (any, error){
		query := `CREATE (p:Person {
		userId: $userId,
		name: $name,
		surname: $surname,
		biography: $biography,
		moto: $moto,
		photoId: $photoId
		}) RETURN p `

	params := map[string]any{
			"userId":    profile.UserId,
			"name":      profile.Name,
			"surname":   profile.Surname,
			"biography": profile.Biography,
			"moto":      profile.Moto,
			"photoId":   profile.PhotoId,
	}
	records,err := tx.Run(ctx,query,params)

	record,err := records.Single(ctx)
	if err != nil {
			return  nil, err
		}
	node, ok := record.Values[0].(neo4j.Node)
	if !ok {
		return nil, fmt.Errorf("result is not a node")
	}
	props := node.Props
	newProfile := model.Profile{
				UserId:    props["userId"].(string),
				Name:    props["name"].(string),
				Surname:    props["surname"].(string),
				Biography:    props["biography"].(string),
				Moto:    props["moto"].(string),
				PhotoId:    props["photoId"].(string),
	}

	return newProfile, nil
	})

	if err != nil {
		return  model.Profile{}, err
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
			return  nil, err
		}

		node, ok := record.Values[0].(neo4j.Node)
		if !ok {
			return  nil, fmt.Errorf("result is not a node")
		}

		props := node.Props
		foundProfile := model.Profile{

				UserId:    props["userId"].(string),
				Name:    props["name"].(string),
				Surname:    props["surname"].(string),
				Biography:    props["biography"].(string),
				Moto:    props["moto"].(string),
				PhotoId:    props["photoId"].(string),

			}


		return foundProfile, nil
	})

	if err != nil {
		return  model.Profile{}, err
	}

	 profile, ok := result.(model.Profile)
    if !ok {
        return model.Profile{}, fmt.Errorf("failed to cast result to model.Profile")
    }

    return profile, nil
}