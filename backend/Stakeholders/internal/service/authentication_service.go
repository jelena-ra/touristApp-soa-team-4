package service

import (
	"context"
	"errors"
	//"net/http"
	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/auth"
	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/model"
	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/repository"
)

var (
	ErrUserNotFound      = errors.New("user not found or invalid credentials")
	ErrUsernameNotUnique = errors.New("username is already in use")
	ErrInvalidArgument   = errors.New("invalid argument")
)

type AuthenticationService struct {
	userRepo    *repository.UserRepository
	profileRepo *repository.ProfileRepository
	tokenGen    *auth.JWTGenerator
}

func NewAuthenticationService(userRepo *repository.UserRepository, tokenGen *auth.JWTGenerator, profileRepo *repository.ProfileRepository) *AuthenticationService {
	return &AuthenticationService{
		userRepo:    userRepo,
		tokenGen:    tokenGen,
		profileRepo: profileRepo,
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

	if account == nil {
		return nil, ErrInvalidArgument
	}
	if account.Username == "" || account.Password == "" || account.Email == "" {
		return nil, ErrInvalidArgument
	}
	exists, err := s.userRepo.Exists(account.Username)
	if err != nil {
		return nil, errors.New("database error")
	}
	if exists {
		return nil, ErrUsernameNotUnique
	}

	var role string

	if account.Role == "turista" {
		role = model.UserRoleTourist
	} else {
		role = model.UserRoleAuthor
	}

	user := &model.User{
		Username: account.Username,
		Password: account.Password,
		Email:    account.Email,
		Role:     role,
		Blocked:  false,
	}

	createdUser, err := s.userRepo.Create(user)
	if err != nil {
		return nil, ErrInvalidArgument
	}

	defaultProfile := model.Profile{
		UserId:    createdUser.ID,
		Name:      createdUser.Username,
		Surname:   "",
		Biography: "Default biography",
		Moto:      "Default moto",
		PhotoId:   "",
		Money:     20000.0,
	}
	_, err = s.profileRepo.CreateProfile(defaultProfile, context.Background())
	if err != nil {
		return nil, errors.New("failed to create default profile")
	}

	//token, err := s.tokenGen.GenerateAccessToken(createdUser)
	/*if err != nil {
		return nil, errors.New("failed to generate access token")
	}*/

	return &model.AuthenticationTokensDto{
		createdUser.Username,
	}, nil
}

func (s *AuthenticationService) ValidateToken(tokenString string) (*auth.Claims, error) {
	claims, err := s.tokenGen.ValidateToken(tokenString)
	if err != nil {
		return nil, err
	}
	return claims, nil
}

func (s *AuthenticationService) ValidateTokenAndRole(token, requiredRole string) (*auth.Claims, error) {

	claims, err := s.tokenGen.ValidateToken(token)
	if err != nil {
		return nil, err
	}

	if claims.Role != requiredRole {
		return nil, errors.New("rola iz tokena se ne podudara sa trazenom rolom")
	}

	return claims, nil
}
