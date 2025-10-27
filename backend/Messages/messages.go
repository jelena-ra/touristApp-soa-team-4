package Messages

type DeleteBlogsCommand struct {
	UserID string `json:"user_id"`
	SagaID string `json:"saga_id"` // Za praćenje Sage
}

type DeleteLikesCommand struct {
	UserID string `json:"user_id"`
	SagaID string `json:"saga_id"`
}

type DeleteCommentsCommand struct {
	UserID string `json:"user_id"`
	SagaID string `json:"saga_id"`
}

// Event definitions
type BlogsDeletedEvent struct {
	UserID string `json:"user_id"`
	SagaID string `json:"saga_id"`
}

type BlogsDeletionFailedEvent struct {
	UserID string `json:"user_id"`
	SagaID string `json:"saga_id"`
	Error  string `json:"error"`
}

type LikesDeletedEvent struct {
	UserID string `json:"user_id"`
	SagaID string `json:"saga_id"`
}

type LikesDeletionFailedEvent struct {
	UserID string `json:"user_id"`
	SagaID string `json:"saga_id"`
	Error  string `json:"error"`
}

type CommentsDeletedEvent struct {
	UserID string `json:"user_id"`
	SagaID string `json:"saga_id"`
}

type CommentsDeletionFailedEvent struct {
	UserID string `json:"user_id"`
	SagaID string `json:"saga_id"`
	Error  string `json:"error"`
}

// Nova komanda koju prima Stakeholders servis od Orchestratora da započne akcije blokiranja
type BlockUserInStakeholdersCommand struct {
	UserID string `json:"user_id"`
	SagaID string `json:"saga_id"`
}

// Kompenzacione komande
type UnblockUserInStakeholdersCommand struct { // Kompenzacija za BlockUserInStakeholdersCommand
	UserID string `json:"user_id"`
	SagaID string `json:"saga_id"`
}
type RevertBlogsDeletionCommand struct {
	UserID string `json:"user_id"`
	SagaID string `json:"saga_id"`
}
type RevertLikesDeletionCommand struct {
	UserID string `json:"user_id"`
	SagaID string `json:"saga_id"`
}
type RevertCommentsDeletionCommand struct {
	UserID string `json:"user_id"`
	SagaID string `json:"saga_id"`
}

// Novi događaji koje Stakeholders servis šalje Orchestratoru
type UserBlockedInStakeholdersEvent struct {
	UserID string `json:"user_id"`
	SagaID string `json:"saga_id"`
}
type UserBlockingInStakeholdersFailedEvent struct {
	UserID string `json:"user_id"`
	SagaID string `json:"saga_id"`
	Error  string `json:"error"`
}

// Kompenzacioni događaji
type UserUnblockedInStakeholdersEvent struct { // Događaj nakon uspešne kompenzacije za Stakeholders
	UserID string `json:"user_id"`
	SagaID string `json:"saga_id"`
}
type UserUnblockingInStakeholdersFailedEvent struct {
	UserID string `json:"user_id"`
	SagaID string `json:"saga_id"`
	Error  string `json:"error"`
}
type BlogsDeletionRevertedEvent struct {
	UserID string `json:"user_id"`
	SagaID string `json:"saga_id"`
}
type BlogsReversionFailedEvent struct {
	UserID string `json:"user_id"`
	SagaID string `json:"saga_id"`
	Error  string `json:"error"`
}

// ... slično za Likes i Comments Reverted/ReversionFailed Events
type LikesDeletionRevertedEvent struct {
	UserID string `json:"user_id"`
	SagaID string `json:"saga_id"`
}
type LikesReversionFailedEvent struct {
	UserID string `json:"user_id"`
	SagaID string `json:"saga_id"`
	Error  string `json:"error"`
}
type CommentsDeletionRevertedEvent struct {
	UserID string `json:"user_id"`
	SagaID string `json:"saga_id"`
}
type CommentsReversionFailedEvent struct {
	UserID string `json:"user_id"`
	SagaID string `json:"saga_id"`
	Error  string `json:"error"`
}
