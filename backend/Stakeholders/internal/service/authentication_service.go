package service

import (
	"errors"
	//"net/http" 
	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/auth"
	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/model"
	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/repository"
)


var (
	ErrUserNotFound          = errors.New("user not found or invalid credentials")
	ErrUsernameNotUnique     = errors.New("username is already in use")
	ErrInvalidArgument       = errors.New("invalid argument")
)


type AuthenticationService struct {
	userRepo *repository.UserRepository
	tokenGen *auth.JWTGenerator
}


func NewAuthenticationService(userRepo *repository.UserRepository, tokenGen *auth.JWTGenerator) *AuthenticationService {
	return &AuthenticationService{
		userRepo: userRepo,
		tokenGen: tokenGen,
	}
}


func (s *AuthenticationService) Login(credentials *model.CredentialsDto) (*model.AuthenticationTokensDto, error) {

	user, err := s.userRepo.GetActiveByName(credentials.Username)
	if err != nil {
		return nil, ErrUserNotFound
	}


	if credentials.Password != user.Password {
		return nil, ErrUserNotFound
	}
	

	token, err := s.tokenGen.GenerateAccessToken(user)
	if err != nil {
		return nil, errors.New("failed to generate access token")
	}

	return &model.AuthenticationTokensDto{
		AccessToken: token,
	}, nil
}


func (s *AuthenticationService) RegisterTourist(account *model.AccountRegistrationDto) (*model.AuthenticationTokensDto, error) {

	exists, _ := s.userRepo.Exists(account.Username)
	if exists {
		return nil, ErrUsernameNotUnique
	}


	user := &model.User{
		Username: account.Username,
		Password: account.Password,
		Role: 	  model.UserRoleTourist,
		Blocked:  false,
	}

	createdUser, err := s.userRepo.Create(user)
	if err != nil {
		return nil, ErrInvalidArgument
	}


	token, err := s.tokenGen.GenerateAccessToken(createdUser)
	if err != nil {
		return nil, errors.New("failed to generate access token")
	}

	return &model.AuthenticationTokensDto{
		AccessToken: token,
	}, nil
}
