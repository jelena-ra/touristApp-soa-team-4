package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/model"
	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/repository"
	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/saga"
)

type UserService struct {
	repo         *repository.UserRepository
	profileRepo  *repository.ProfileRepository // Dodaj ProfileRepository
	orchestrator *saga.SagaOrchestrator
}

func NewUserService(repo *repository.UserRepository, profileRepo *repository.ProfileRepository, orchestrator *saga.SagaOrchestrator) *UserService {
	return &UserService{
		repo:         repo,
		profileRepo:  profileRepo,
		orchestrator: orchestrator,
	}
}
func (service *UserService) GetAllUsers(ctx context.Context) ([]model.User, error) {

	users, err := service.repo.FindAll(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve all users: %w", err)
	}
	return users, nil
}

func (service *UserService) GetUser(ctx context.Context, id string) (*model.User, error) {

	user, err := service.repo.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve user: %w", err)
	}
	return user, nil
}

/*
func (service *UserService) Block(id string) (*model.User, error) {

	user, err := service.repo.GetByID(id)
	if err != nil {
		return nil, errors.New("korisnik nije pronađen")
	}

	user.Blocked = true

	updatedUser, err := service.repo.Update(user)
	if err != nil {
		//log.Printf("Error updating user: %v", err)
		return nil, errors.New("greška prilikom ažuriranja korisnika")
	}

	return updatedUser, nil
}*/

func (service *UserService) Block(ctx context.Context, id string) (*model.User, string, error) {
	userID := id
	/*if err != nil {
		return nil, "", fmt.Errorf("invalid user ID format: %w", err)
	}*/

	sagaID, err := service.orchestrator.InitiateUserBlockingSaga(ctx, userID)
	if err != nil {
		fmt.Printf("Error initiating saga for user %d: %v\n", userID, err)
		return nil, "", fmt.Errorf("error with saga initiation: %w", err)
	}

	user, err := service.repo.GetByid(id)
	if err != nil {
		return nil, "", errors.New("user not found after saga initiation")
	}

	return user, sagaID, nil
}

func (service *UserService) CheckIfUserExists(id string) (bool, error) {
	return service.repo.ExistsById(id)
}
