package model

import (
	"time"
)

type SagaStatus string

const (
	SagaStatusPending          SagaStatus = "Pending"
	SagaStatusUserBlocking     SagaStatus = "UserBlocking" // Novi
	SagaStatusUserBlocked      SagaStatus = "UserBlocked"  // Novi
	SagaStatusBlogsDeleting    SagaStatus = "BlogsDeleting"
	SagaStatusBlogsDeleted     SagaStatus = "BlogsDeleted"
	SagaStatusLikesDeleting    SagaStatus = "LikesDeleting"
	SagaStatusLikesDeleted     SagaStatus = "LikesDeleted"
	SagaStatusCommentsDeleting SagaStatus = "CommentsDeleting"
	SagaStatusCommentsDeleted  SagaStatus = "CommentsDeleted"
	SagaStatusCompleted        SagaStatus = "Completed"
	SagaStatusFailed           SagaStatus = "Failed"

	SagaStatusCompensating          SagaStatus = "Compensating"
	SagaStatusUserReverting         SagaStatus = "UserReverting" // Novi
	SagaStatusUserReverted          SagaStatus = "UserReverted"  // Novi
	SagaStatusBlogsReverting        SagaStatus = "BlogsReverting"
	SagaStatusBlogsReverted         SagaStatus = "BlogsReverted"
	SagaStatusLikesReverting        SagaStatus = "LikesReverting"
	SagaStatusLikesReverted         SagaStatus = "LikesReverted"
	SagaStatusCommentsReverting     SagaStatus = "CommentsReverting"
	SagaStatusCommentsReverted      SagaStatus = "CommentsReverted"
	SagaStatusCompensationCompleted SagaStatus = "CompensationCompleted"
	SagaStatusCompensationFailed    SagaStatus = "CompensationFailed"
)

type SagaState struct {
	SagaID       string     `json:"saga_id" db:"saga_id"`
	UserID       string     `json:"user_id" db:"user_id"`
	Status       SagaStatus `json:"status" db:"status"`
	ErrorMessage *string    `json:"error_message,omitempty" db:"error_message"` // Pointer za nullable
	LastUpdate   time.Time  `json:"last_update" db:"last_update"`
}
