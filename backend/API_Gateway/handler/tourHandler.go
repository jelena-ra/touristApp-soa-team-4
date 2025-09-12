package handler

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	tourProto "github.com/jelena-ra/touristApp/soa-team-4/Tours/proto"
	"google.golang.org/protobuf/encoding/protojson"
)

type TourHandler struct {
	client tourProto.TourServiceClient
}

func NewTourHandler(client tourProto.TourServiceClient) *TourHandler {
	return &TourHandler{client: client}
}

func (h *TourHandler) GetAllToursHandle(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	resp, err := h.client.GetAllTours(ctx, &tourProto.Empty{})
	if err != nil {
		log.Printf("Failed to get all tours via gRPC: %v", err)
		http.Error(w, "Failed to get tours", http.StatusInternalServerError)
		return
	}

	marshaler := protojson.MarshalOptions{
		UseEnumNumbers:  false,
		EmitUnpopulated: true,
	}

	jsonData, err := marshaler.Marshal(resp)
	if err != nil {
		log.Printf("Failed to marshal proto to JSON: %v", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(jsonData)
}

func (h *TourHandler) GetByIdHandle(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	vars := mux.Vars(r)
	tourId := vars["tourId"]

	resp, err := h.client.GetTourByID(ctx, &tourProto.TourIDRequest{Id: tourId})
	if err != nil {
		log.Printf("Failed to get tour via gRPC: %v", err)
		http.Error(w, "Failed to get tour", http.StatusInternalServerError)
	}

	marshaler := protojson.MarshalOptions{
		UseEnumNumbers:  false,
		EmitUnpopulated: true,
	}

	jsonData, err := marshaler.Marshal(resp)
	if err != nil {
		log.Printf("Failed to marshal proto to JSON: %v", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(jsonData)
}

func (h *TourHandler) CreateTourHandle(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	var tourReq tourProto.Tour
	if err := json.NewDecoder(r.Body).Decode(&tourReq); err != nil {
		log.Printf("Failed to decode request body: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	resp, err := h.client.CreateTour(ctx, &tourProto.CreateTourRequest{Tour: &tourReq})
	if err != nil {
		log.Printf("Failed to create tour: %v", err)
		http.Error(w, "Failed to create tour", http.StatusInternalServerError)
	}

	marshaler := protojson.MarshalOptions{
		UseEnumNumbers:  false,
		EmitUnpopulated: true,
	}

	jsonData, err := marshaler.Marshal(resp)
	if err != nil {
		log.Printf("Failed to marshal proto to JSON: %v", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	w.Write(jsonData)
}
