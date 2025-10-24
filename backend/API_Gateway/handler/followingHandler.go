package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	following_proto "github.com/jelena-ra/touristApp/soa-team-4/Following/proto"
)

type FollowingHandler struct {
	followingClient following_proto.FollowingServiceClient
}

func NewFollowingHandler(followingClient following_proto.FollowingServiceClient) *FollowingHandler {
	return &FollowingHandler{followingClient}
}

func (h *FollowingHandler) FollowUserHandler(w http.ResponseWriter, r *http.Request) {
	var req following_proto.FollowRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	resp, err := h.followingClient.FollowUser(context.Background(), &req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(resp)
}

func (h *FollowingHandler) GetRecommendationsHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userId := vars["userId"]

	req := &following_proto.GetRecommendationsRequest{UserId: userId}
	resp, err := h.followingClient.GetRecommendations(context.Background(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(resp)
}

func (h *FollowingHandler) GetFollowingsForUserHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userId := vars["userId"]

	req := &following_proto.GetFollowingsForUserRequest{Id: userId}
	resp, err := h.followingClient.GetFollowingsForUser(context.Background(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(resp)
}

func (h *FollowingHandler) FollowExistsHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	followerId := vars["followerId"]
	followedId := vars["followedId"]

	req := &following_proto.FollowExistsRequest{FollowerId: followerId, FollowedId: followedId}
	resp, err := h.followingClient.FollowExists(context.Background(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(resp)
}
