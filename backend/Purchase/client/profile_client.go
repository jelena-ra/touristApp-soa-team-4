package client

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
)

type Profile struct {
	UserId    string  `json:"userId"`
	Name      string  `json:"name"`
	Surname   string  `json:"surname"`
	Biography string  `json:"biography"`
	Moto      string  `json:"moto"`
	PhotoId   string  `json:"photoId"`
	Money     float64 `json:"money"`
}

func GetProfile(ctx context.Context, userID string, token string) (*Profile, error) {
	urlGet := fmt.Sprintf("http://api-gateway:8000/api/profile/%s", userID)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, urlGet, nil)
	if err != nil {
		return nil, fmt.Errorf("Error with GET req: %w", err)
	}
	req.Header.Set("Authorization", token)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("Error with GET response: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("Couldn't retrieve profile: %d", resp.StatusCode)
	}

	var profile Profile
	if err := json.NewDecoder(resp.Body).Decode(&profile); err != nil {
		return nil, fmt.Errorf("Error rith encoding json: %w", err)
	}

	return &profile, nil
}
func ChangeProfileMoney(ctx context.Context, userID string, delta float64, token string) (bool, error) {
	profile, err := GetProfile(ctx, userID, token)
	if err != nil {
		return false, err
	}

	profile.Money -= delta
	if profile.Money < 0 {
		profile.Money = 0
	}

	urlUpdate := "http://api-gateway:8000/api/profile-update"
	jsonBody, err := json.Marshal(profile)
	if err != nil {
		return false, fmt.Errorf("Erro with  JSON serialization: %w", err)
	}

	reqUpdate, err := http.NewRequestWithContext(ctx, http.MethodPost, urlUpdate, bytes.NewBuffer(jsonBody))
	if err != nil {
		return false, fmt.Errorf("Error with POST req: %w", err)
	}
	reqUpdate.Header.Set("Content-Type", "application/json")
	reqUpdate.Header.Set("Authorization", token)

	resp2, err := http.DefaultClient.Do(reqUpdate)
	if err != nil {
		return false, fmt.Errorf("Error with POST response: %w", err)
	}
	defer resp2.Body.Close()

	if resp2.StatusCode != http.StatusOK && resp2.StatusCode != http.StatusCreated {
		return false, fmt.Errorf("Couldn't update profile: %d", resp2.StatusCode)
	}

	return true, nil
}
