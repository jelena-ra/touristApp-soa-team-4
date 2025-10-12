package handler

import (
	"context"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/jelena-ra/touristApp/soa-team-4/API_Gateway/jwt"
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

	bodyBytes, err := io.ReadAll(r.Body)
	if err != nil {
		log.Printf("Failed to read request body: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	var tourReq tourProto.CreateTourRequest
	unmarshaler := protojson.UnmarshalOptions{
		AllowPartial:   true,
		DiscardUnknown: true,
	}

	if err := unmarshaler.Unmarshal(bodyBytes, &tourReq); err != nil {
		log.Printf("Failed to decode request body: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	log.Printf("Create tour via gRPC: %+v", &tourReq)

	resp, err := h.client.CreateTour(ctx, &tourReq)
	if err != nil {
		log.Printf("Failed to create tour: %v", err)
		http.Error(w, "Failed to create tour", http.StatusInternalServerError)
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
	w.WriteHeader(http.StatusCreated)
	w.Write(jsonData)
}

func (h *TourHandler) UpdateTourHandle(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	var updateTourRequest tourProto.UpdateTourRequest
	if err := json.NewDecoder(r.Body).Decode(&updateTourRequest); err != nil {
		log.Printf("Failed to decode request body: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	resp, err := h.client.UpdateTour(ctx, &updateTourRequest)
	if err != nil {
		log.Printf("Failed to update tour: %v", err)
		http.Error(w, "Failed to update tour", http.StatusInternalServerError)
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

func (h *TourHandler) CreateKeyPointHandle(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	var keyPointReq tourProto.CreateKeyPointRequest
	if err := json.NewDecoder(r.Body).Decode(&keyPointReq); err != nil {
		log.Printf("Failed to decode request body: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	resp, err := h.client.CreateKeyPoint(ctx, &keyPointReq)
	if err != nil {
		log.Printf("Failed to create key point: %v", err)
		http.Error(w, "Failed to create key point", http.StatusInternalServerError)
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
func (h *TourHandler) StartTourHandle(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	vars := mux.Vars(r)
	tourId := vars["tourId"]

	claims, ok := r.Context().Value("user").(*jwt.Claims)
	if !ok {
		http.Error(w, "User claims not found in context", http.StatusUnauthorized)
		return
	}
	touristId := claims.ID
	log.Printf("[API Gateway] Received request to start tour. Tourist ID from token: %s", touristId)

	bodyBytes, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	var positionReq tourProto.TouristPosition
	unmarshaler := protojson.UnmarshalOptions{}
	if err := unmarshaler.Unmarshal(bodyBytes, &positionReq); err != nil {
		log.Printf("Failed to decode position JSON: %v", err)
		http.Error(w, "Invalid position data", http.StatusBadRequest)
		return
	}

	gprcRequest := &tourProto.StartTourRequest{
		TourId:    tourId,
		Position:  &positionReq,
		TouristId: touristId,
	}

	resp, err := h.client.StartTour(ctx, gprcRequest)
	if err != nil {
		log.Printf("Failed to start tour via gRPC: %v", err)
		http.Error(w, "Failed to start tour", http.StatusInternalServerError)
		return
	}

	marshaler := protojson.MarshalOptions{EmitUnpopulated: true}
	jsonData, _ := marshaler.Marshal(resp)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	w.Write(jsonData)
}

func (h *TourHandler) CheckProximityHandle(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	vars := mux.Vars(r)
	executionId := vars["id"]

	claims, ok := r.Context().Value("user").(*jwt.Claims)
	if !ok {
		http.Error(w, "User claims not found in context", http.StatusUnauthorized)
		return
	}
	touristId := claims.ID

	bodyBytes, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	var positionReq tourProto.TouristPosition
	if err := protojson.Unmarshal(bodyBytes, &positionReq); err != nil {
		http.Error(w, "Invalid position data", http.StatusBadRequest)
		return
	}

	gprcRequest := &tourProto.CheckProximityRequest{
		Id:        executionId,
		Position:  &positionReq,
		TouristId: touristId,
	}

	resp, err := h.client.CheckProximity(ctx, gprcRequest)
	if err != nil {
		log.Printf("Failed to check proximity via gRPC: %v", err)
		http.Error(w, "Failed to check proximity", http.StatusInternalServerError)
		return
	}

	marshaler := protojson.MarshalOptions{EmitUnpopulated: true}
	jsonData, _ := marshaler.Marshal(resp)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(jsonData)
}
func (h *TourHandler) AbandonTourHandle(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	vars := mux.Vars(r)
	executionId := vars["id"]

	claims, ok := r.Context().Value("user").(*jwt.Claims)
	if !ok {
		http.Error(w, "User claims not found in context", http.StatusUnauthorized)
		return
	}
	touristId := claims.ID

	gprcRequest := &tourProto.TourExecutionRequest{
		Id:        executionId,
		TouristId: touristId,
	}

	resp, err := h.client.AbandonTour(ctx, gprcRequest)
	if err != nil {
		log.Printf("Failed to abandon tour via gRPC: %v", err)
		http.Error(w, "Failed to abandon tour", http.StatusInternalServerError)
		return
	}

	marshaler := protojson.MarshalOptions{EmitUnpopulated: true}
	jsonData, _ := marshaler.Marshal(resp)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(jsonData)
}
