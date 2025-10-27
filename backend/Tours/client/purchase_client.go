package client

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
)

type TourPurchaseToken struct {
	id     int    `json:"id"`
	UserID string `json:"user_id"`
	TourID string `json:"tour_id"`
	Token  string `json:"token"`
}

func PurchasedToursForUser(httpClient *http.Client, apiGatewayAddress, userID, authToken string) ([]TourPurchaseToken, error) {

	url := fmt.Sprintf("http://api-gateway:8000/api/cart/tokens?user_id=%s", userID)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	log.Printf("[DEBUG] Šaljem zahtev ka API Gateway-u sa tokenom: %s", authToken)

	if authToken != "" {
		bearerToken := "Bearer " + authToken
		req.Header.Set("Authorization", bearerToken)
	}

	resp, err := httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request to API Gateway: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		log.Printf("API Gateway vratio grešku: %s", string(body))
		return nil, fmt.Errorf("API Gateway returned an error status: %d", resp.StatusCode)
	}

	var userTokens []TourPurchaseToken
	if err := json.NewDecoder(resp.Body).Decode(&userTokens); err != nil {
		return nil, fmt.Errorf("failed to decode API Gateway response: %w", err)
	}

	return userTokens, nil
}
