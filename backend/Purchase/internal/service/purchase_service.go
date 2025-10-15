package service

import (
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jelena-ra/touristApp/soa-team-4/Purchase/client"
	"github.com/jelena-ra/touristApp/soa-team-4/Purchase/internal/model"
	"github.com/jelena-ra/touristApp/soa-team-4/Purchase/internal/repository"
)

type PurchaseService struct {
	cartRepo  *repository.ShoppingCartRepository
	itemRepo  *repository.OrderItemRepository
	tokenRepo *repository.TourPurchaseTokenRepository
}

func NewPurchaseService(
	cartRepo *repository.ShoppingCartRepository,
	itemRepo *repository.OrderItemRepository,
	tokenRepo *repository.TourPurchaseTokenRepository,
) *PurchaseService {
	return &PurchaseService{cartRepo, itemRepo, tokenRepo}
}

func (s *PurchaseService) AddItem(userID string, item model.OrderItem) error {

	exists, err := client.TourExists(item.TourID)
	if err != nil {
		return fmt.Errorf("error sa  tour: %v", err)
	}
	if !exists {
		return fmt.Errorf("tura sa ID %s ne postoji", item.TourID)
	}

	cart, err := s.cartRepo.GetCartByUserID(userID)
	if err != nil {
		return err
	}
	if cart == nil {
		if err := s.cartRepo.CreateCart(userID); err != nil {
			return err
		}
		cart, err = s.cartRepo.GetCartByUserID(userID)
		if err != nil {
			return err
		}
	}

	itemss, err := s.itemRepo.GetItems(cart.CartID)
	for _, itemm := range itemss {
		if itemm.TourID == item.TourID {
			err := errors.New("Tour is already in cart")
			return err
		}
	}
	item.CartID = cart.CartID
	if err := s.itemRepo.AddItem(item); err != nil {
		return err
	}

	total, err := s.itemRepo.CalculateTotal(cart.CartID)
	if err != nil {
		return err
	}
	return s.cartRepo.UpdateTotal(cart.CartID, total)
}

func (s *PurchaseService) RemoveItem(userID string, tourID string) error {
	cart, err := s.cartRepo.GetCartByUserID(userID)
	if err != nil || cart == nil {
		return err
	}

	if err := s.itemRepo.RemoveItem(cart.CartID, tourID); err != nil {
		return err
	}

	total, err := s.itemRepo.CalculateTotal(cart.CartID)
	if err != nil {
		return err
	}
	return s.cartRepo.UpdateTotal(cart.CartID, total)
}

func (s *PurchaseService) Checkout(userID string) ([]model.TourPurchaseToken, error) {
	cart, err := s.cartRepo.GetCartByUserID(userID)
	if err != nil || cart == nil {
		return nil, err
	}

	items, err := s.itemRepo.GetItems(cart.CartID)
	if err != nil {
		return nil, err
	}

	tokens := []model.TourPurchaseToken{}
	for _, item := range items {

		token := model.TourPurchaseToken{
			UserID: userID,
			TourID: item.TourID,
			Token:  uuid.New().String(),
		}
		if err := s.tokenRepo.SaveToken(token); err != nil {
			return nil, err
		}
		tokens = append(tokens, token)
	}

	if err := s.itemRepo.ClearItems(cart.CartID); err != nil {
		return nil, err
	}
	if err := s.cartRepo.UpdateTotal(cart.CartID, 0); err != nil {
		return nil, err
	}

	return tokens, nil
}

func (s *PurchaseService) GetCart(userID string) (*model.ShoppingCart, error) {
	return s.cartRepo.GetCartByUserID(userID)
}

func (s *PurchaseService) GetCartWithItems(userID string) (*model.ShoppingCart, []model.OrderItem, error) {

	cart, err := s.cartRepo.GetCartByUserID(userID)
	if err != nil {
		return nil, nil, err
	}

	if cart == nil {

		cart = &model.ShoppingCart{
			UserID: userID,
			Total:  0,
			CartID: "",
		}
		return cart, []model.OrderItem{}, nil
	}

	items, err := s.itemRepo.GetItems(cart.CartID)
	if err != nil {
		return nil, nil, err
	}

	return cart, items, nil
}
func (s *PurchaseService) GetTokensByUser(userID string) ([]model.TourPurchaseToken, error) {
	tokens, err := s.tokenRepo.GetTokensByUser(userID)
	if err != nil {
		return nil, err
	}

	return tokens, nil
}
