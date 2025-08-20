package service

import (
	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/repository"
	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/model"
	"fmt"
	"context"
	"errors"
)

type UserService struct {
	repo *repository.UserRepository
}

func NewUserService(repo *repository.UserRepository) *UserService {
	return &UserService{repo: repo}
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

func (service *UserService) Block(id string) (*model.User, error) {

	user, err := service.repo.GetByID(id)
	if err != nil {
		return nil, errors.New("korisnik nije pronađen")
	}

	//log.Printf("Blocking user: %s", user.ID)

	user.Blocked = true


	updatedUser, err := service.repo.Update(user)
	if err != nil {
		//log.Printf("Error updating user: %v", err)
		return nil, errors.New("greška prilikom ažuriranja korisnika")
	}

	return updatedUser, nil
}
