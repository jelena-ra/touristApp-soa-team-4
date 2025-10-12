package handler

import (
	"github.com/jelena-ra/touristApp/soa-team-4/Tours/internal/service"
)

type TourExecutionHandler struct {
	Service *service.TourExecutionService
}

/*func (h *TourExecutionHandler) StartTour(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	tourId, err := primitive.ObjectIDFromHex(vars["tourId"])
	if err != nil {
		http.Error(w, "Invalid tour ID format", http.StatusBadRequest)
		return
	}

	// 2. Dobavljanje 'touristId' iz JWT tokena (simulacija)
	// U pravoj aplikaciji, ovde biste dekodirali JWT i izvukli ID korisnika.
	// Pretpostavljam da je ID u tokenu sačuvan kao string.
	touristIdString := "60d5ec49e0f3e82a8b4104a3" // !! PRIMER - ZAMENITI PRAVOM LOGIKOM !!
	touristId, err := primitive.ObjectIDFromHex(touristIdString)
	if err != nil {
		// Ovo bi se desilo ako je token neispravan
		http.Error(w, "Invalid user ID in token", http.StatusUnauthorized)
		return
	}

	// 3. Parsiranje početne pozicije iz tela (body) zahteva
	var position model.TouristPosition
	err = json.NewDecoder(r.Body).Decode(&position)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// 4. Pozivanje servisne metode
	execution, err := h.Service.StartTour(tourId, touristId, position)
	if err != nil {
		// Servis vraća grešku ako, na primer, korisnik već ima aktivnu turu
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// 5. Slanje uspešnog odgovora
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(execution)
}

func (h *TourExecutionHandler) CheckProximity(w http.ResponseWriter, r *http.Request) {

	vars := mux.Vars(r)
	executionId, err := primitive.ObjectIDFromHex(vars["id"])
	if err != nil {
		http.Error(w, "Invalid tour execution ID format", http.StatusBadRequest)
		return
	}

	// 2. Dobavljanje 'touristId' iz JWT tokena (simulacija)
	touristIdString := "60d5ec49e0f3e82a8b4104a3" // !! PRIMER - ZAMENITI PRAVOM LOGIKOM !!
	touristId, err := primitive.ObjectIDFromHex(touristIdString)
	if err != nil {
		http.Error(w, "Invalid user ID in token", http.StatusUnauthorized)
		return
	}

	var position model.TouristPosition
	err = json.NewDecoder(r.Body).Decode(&position)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	execution, err := h.Service.CheckProximity(executionId, touristId, position)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(execution)
}*/
