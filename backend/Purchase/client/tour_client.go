package client

import (
	"encoding/json"
	"fmt"
	"net/http"
)

func TourExists(tourID string) (bool, error) {
	url := fmt.Sprintf("http://api-gateway:8000/api/tours/%s", tourID)
	resp, err := http.Get(url)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		return false, nil
	} else if resp.StatusCode != http.StatusOK {
		return false, fmt.Errorf("error with finding existing tours : %d", resp.StatusCode)
	}

	var tour interface{}
	if err := json.NewDecoder(resp.Body).Decode(&tour); err != nil {
		return false, err
	}

	return true, nil
}
