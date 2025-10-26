package saga

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/streadway/amqp"

	"github.com/jelena-ra/touristApp/soa-team-4/Messages"
	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/model"
	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/repository"
)

const (
	BlockUserInStakeholdersQueue = "q.block_user_stakeholders_command"
	DeleteBlogsQueue             = "q.delete_blogs_command"
	//DeleteLikesQueue             = "q.delete_likes_command"
	//DeleteCommentsQueue          = "q.delete_comments_command"

	UserStakeholdersEventsQueue = "q.user_stakeholders_events_for_orchestrator"
	BlogsEventsQueue            = "q.blogs_events_for_orchestrator"
	//LikesEventsQueue            = "q.likes_events_for_orchestrator"
	//CommentsEventsQueue         = "q.comments_events_for_orchestrator"

	UnblockUserInStakeholdersQueue = "q.unblock_user_stakeholders_command"
	RevertBlogsQueue               = "q.revert_blogs_command"
	//RevertLikesQueue               = "q.revert_likes_command"
	//RevertCommentsQueue            = "q.revert_comments_command"

	UserStakeholdersRevertedEventsQueue = "q.user_stakeholders_reverted_events"
	BlogsRevertedEventsQueue            = "q.blogs_reverted_events_for_orchestrator"
	//LikesRevertedEventsQueue            = "q.likes_reverted_events_for_orchestrator"
	//CommentsRevertedEventsQueue         = "q.comments_reverted_events_for_orchestrator"
)

type SagaOrchestrator struct {
	rabbitConn *amqp.Connection
	sagaRepo   repository.SagaRepository
}

func NewSagaOrchestrator(conn *amqp.Connection, repo repository.SagaRepository) *SagaOrchestrator {
	return &SagaOrchestrator{
		rabbitConn: conn,
		sagaRepo:   repo,
	}
}

func (o *SagaOrchestrator) SetupRabbitMQ() error {
	ch, err := o.rabbitConn.Channel()
	if err != nil {
		return fmt.Errorf("failed to open a channel: %w", err)
	}
	defer ch.Close()

	_, err = ch.QueueDeclare(DeleteBlogsQueue, true, false, false, false, nil)
	if err != nil {
		return fmt.Errorf("failed to declare %s queue: %w", DeleteBlogsQueue, err)
	}
	/*	_, err = ch.QueueDeclare(DeleteLikesQueue, true, false, false, false, nil)
		if err != nil {
			return fmt.Errorf("failed to declare %s queue: %w", DeleteLikesQueue, err)
		}
		_, err = ch.QueueDeclare(DeleteCommentsQueue, true, false, false, false, nil)
		if err != nil {
			return fmt.Errorf("failed to declare %s queue: %w", DeleteCommentsQueue, err)
		}*/
	_, err = ch.QueueDeclare(BlockUserInStakeholdersQueue, true, false, false, false, nil)
	if err != nil {
		return fmt.Errorf("failed to declare %s queue: %w", BlockUserInStakeholdersQueue, err)
	}
	_, err = ch.QueueDeclare(UnblockUserInStakeholdersQueue, true, false, false, false, nil)
	if err != nil {
		return fmt.Errorf("failed to declare %s queue: %w", UnblockUserInStakeholdersQueue, err)
	}
	_, err = ch.QueueDeclare(RevertBlogsQueue, true, false, false, false, nil)
	if err != nil {
		return fmt.Errorf("failed to declare %s queue: %w", RevertBlogsQueue, err)
	}
	/*	_, err = ch.QueueDeclare(RevertLikesQueue, true, false, false, false, nil)
		if err != nil {
			return fmt.Errorf("failed to declare %s queue: %w", RevertLikesQueue, err)
		}
		_, err = ch.QueueDeclare(RevertCommentsQueue, true, false, false, false, nil)
		if err != nil {
			return fmt.Errorf("failed to declare %s queue: %w", RevertCommentsQueue, err)
		}*/

	_, err = ch.QueueDeclare(BlogsEventsQueue, true, false, false, false, nil)
	if err != nil {
		return fmt.Errorf("failed to declare %s queue: %w", BlogsEventsQueue, err)
	}
	/*_, err = ch.QueueDeclare(LikesEventsQueue, true, false, false, false, nil)
	if err != nil {
		return fmt.Errorf("failed to declare %s queue: %w", LikesEventsQueue, err)
	}
	_, err = ch.QueueDeclare(CommentsEventsQueue, true, false, false, false, nil)
	if err != nil {
		return fmt.Errorf("failed to declare %s queue: %w", CommentsEventsQueue, err)
	}*/
	_, err = ch.QueueDeclare(UserStakeholdersEventsQueue, true, false, false, false, nil)
	if err != nil {
		return fmt.Errorf("failed to declare %s queue: %w", UserStakeholdersEventsQueue, err)
	}
	_, err = ch.QueueDeclare(UserStakeholdersRevertedEventsQueue, true, false, false, false, nil)
	if err != nil {
		return fmt.Errorf("failed to declare %s queue: %w", UserStakeholdersRevertedEventsQueue, err)
	}
	_, err = ch.QueueDeclare(BlogsRevertedEventsQueue, true, false, false, false, nil)
	if err != nil {
		return fmt.Errorf("failed to declare %s queue: %w", BlogsRevertedEventsQueue, err)
	}
	/*	_, err = ch.QueueDeclare(LikesRevertedEventsQueue, true, false, false, false, nil)
		if err != nil {
			return fmt.Errorf("failed to declare %s queue: %w", LikesRevertedEventsQueue, err)
		}
		_, err = ch.QueueDeclare(CommentsRevertedEventsQueue, true, false, false, false, nil)
		if err != nil {
			return fmt.Errorf("failed to declare %s queue: %w", CommentsRevertedEventsQueue, err)
		}*/

	log.Println("RabbitMQ queues declared successfully")
	return nil
}

func (o *SagaOrchestrator) StartListening(ctx context.Context) {
	go o.listenForEvents(ctx, UserStakeholdersEventsQueue, o.handleUserStakeholdersEvent)

	go o.listenForEvents(ctx, BlogsEventsQueue, o.handleBlogsEvent)
	/*go o.listenForEvents(ctx, LikesEventsQueue, o.handleLikesEvent)
	go o.listenForEvents(ctx, CommentsEventsQueue, o.handleCommentsEvent)*/

	go o.listenForEvents(ctx, UserStakeholdersRevertedEventsQueue, o.handleUserStakeholdersRevertedEvent)
	go o.listenForEvents(ctx, BlogsRevertedEventsQueue, o.handleBlogsRevertedEvent)
	/*	go o.listenForEvents(ctx, LikesRevertedEventsQueue, o.handleLikesRevertedEvent)
		go o.listenForEvents(ctx, CommentsRevertedEventsQueue, o.handleCommentsRevertedEvent)*/

	log.Println("SagaOrchestrator started listening for events.")
}

func (o *SagaOrchestrator) listenForEvents(ctx context.Context, queueName string, handler func([]byte) error) {
	ch, err := o.rabbitConn.Channel()
	if err != nil {
		log.Printf("Failed to open channel for queue %s: %v", queueName, err)
		return
	}
	defer ch.Close()

	msgs, err := ch.Consume(
		queueName,
		"",
		false,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Printf("Failed to register a consumer for queue %s: %v", queueName, err)
		return
	}

	for {
		select {
		case d := <-msgs:
			log.Printf("Received message from %s: %s", queueName, d.Body)
			if err := handler(d.Body); err != nil {
				log.Printf("Error handling message from %s: %v", queueName, err)
				d.Nack(false, true)
			} else {
				d.Ack(false)
			}
		case <-ctx.Done():
			log.Printf("Stopping listener for queue %s.", queueName)
			return
		}
	}
}

func (o *SagaOrchestrator) InitiateUserBlockingSaga(ctx context.Context, userID string) (string, error) {
	sagaID := uuid.New().String()

	sagaState := model.SagaState{
		SagaID:     sagaID,
		UserID:     userID,
		Status:     model.SagaStatusPending,
		LastUpdate: time.Now(),
	}
	if err := o.sagaRepo.CreateSagaState(&sagaState); err != nil {
		return "", fmt.Errorf("failed to create saga state: %w", err)
	}

	cmd := Messages.BlockUserInStakeholdersCommand{UserID: userID, SagaID: sagaID}
	if err := o.publishCommand(ctx, BlockUserInStakeholdersQueue, cmd); err != nil {
		o.updateSagaStatus(sagaID, model.SagaStatusFailed, fmt.Sprintf("Failed to publish BlockUserInStakeholdersCommand: %v", err))
		return "", fmt.Errorf("failed to publish initial command to Stakeholders: %w", err)
	}

	o.updateSagaStatus(sagaID, model.SagaStatusUserBlocking, "")
	log.Printf("Saga %s initiated for user %d. BlockUserInStakeholdersCommand sent.", sagaID, userID)
	return sagaID, nil
}

func (o *SagaOrchestrator) publishCommand(ctx context.Context, queueName string, cmd interface{}) error {
	ch, err := o.rabbitConn.Channel()
	if err != nil {
		return fmt.Errorf("failed to open a channel: %w", err)
	}
	defer ch.Close()

	body, err := json.Marshal(cmd)
	if err != nil {
		return fmt.Errorf("failed to marshal command: %w", err)
	}

	err = ch.Publish(
		"",
		queueName,
		false,
		false,
		amqp.Publishing{
			ContentType: "application/json",
			Body:        body,
		})
	if err != nil {
		return fmt.Errorf("failed to publish message to queue %s: %w", queueName, err)
	}
	return nil
}

func (o *SagaOrchestrator) updateSagaStatus(sagaID string, status model.SagaStatus, errorMessage string) {
	sagaState, err := o.sagaRepo.GetSagaState(sagaID)
	if err != nil {
		log.Printf("Error getting saga state %s for update: %v", sagaID, err)
		return
	}
	sagaState.Status = status
	sagaState.LastUpdate = time.Now()
	if errorMessage != "" {
		sagaState.ErrorMessage = &errorMessage // samo ako postoji greska
	}
	if err := o.sagaRepo.UpdateSagaState(sagaState); err != nil {
		log.Printf("Error updating saga state %s to %s: %v", sagaID, status, err)
	}
}
func (o *SagaOrchestrator) handleUserStakeholdersEvent(body []byte) error {
	var userBlocked Messages.UserBlockedInStakeholdersEvent
	var userBlockingFailed Messages.UserBlockingInStakeholdersFailedEvent

	if err := json.Unmarshal(body, &userBlocked); err == nil && userBlocked.SagaID != "" {
		log.Printf("UserBlockedInStakeholdersEvent received for Saga %s, User %d", userBlocked.SagaID, userBlocked.UserID)
		o.updateSagaStatus(userBlocked.SagaID, model.SagaStatusUserBlocked, "")

		cmd := Messages.DeleteBlogsCommand{UserID: userBlocked.UserID, SagaID: userBlocked.SagaID}
		if err := o.publishCommand(context.Background(), DeleteBlogsQueue, cmd); err != nil {
			return o.handleSagaFailure(userBlocked.SagaID, userBlocked.UserID, "Failed to publish DeleteBlogsCommand after user blocked in Stakeholders", err)
		}
		o.updateSagaStatus(userBlocked.SagaID, model.SagaStatusBlogsDeleting, "")
		return nil
	}

	if err := json.Unmarshal(body, &userBlockingFailed); err == nil && userBlockingFailed.SagaID != "" {
		log.Printf("UserBlockingInStakeholdersFailedEvent received for Saga %s, User %d: %s", userBlockingFailed.SagaID, userBlockingFailed.UserID, userBlockingFailed.Error)
		//saga propala
		return o.handleSagaFailure(userBlockingFailed.SagaID, userBlockingFailed.UserID, userBlockingFailed.Error, nil)
	}

	return fmt.Errorf("unrecognized user stakeholders event: %s", string(body))
}

func (o *SagaOrchestrator) handleBlogsEvent(body []byte) error {
	var blogsDeleted Messages.BlogsDeletedEvent
	var blogsFailed Messages.BlogsDeletionFailedEvent

	if err := json.Unmarshal(body, &blogsDeleted); err == nil && blogsDeleted.SagaID != "" {
		log.Printf("BlogsDeletedEvent received for Saga %s, User %d", blogsDeleted.SagaID, blogsDeleted.UserID)
		o.updateSagaStatus(blogsDeleted.SagaID, model.SagaStatusBlogsDeleted, "")

		/*cmd := Messages.DeleteLikesCommand{UserID: blogsDeleted.UserID, SagaID: blogsDeleted.SagaID}
		if err := o.publishCommand(context.Background(), DeleteLikesQueue, cmd); err != nil {
			return o.handleSagaFailure(blogsDeleted.SagaID, blogsDeleted.UserID, "Failed to publish DeleteLikesCommand", err)
		}
		o.updateSagaStatus(blogsDeleted.SagaID, model.SagaStatusLikesDeleting, "")*/
		o.updateSagaStatus(blogsDeleted.SagaID, model.SagaStatusCompleted, "User blocking saga completed successfully.")
		log.Printf("Saga %s for user %d COMPLETED successfully.", blogsDeleted.SagaID, blogsDeleted.UserID)
		return nil
	}

	if err := json.Unmarshal(body, &blogsFailed); err == nil && blogsFailed.SagaID != "" {
		log.Printf("BlogsDeletionFailedEvent received for Saga %s, User %d: %s", blogsFailed.SagaID, blogsFailed.UserID, blogsFailed.Error)
		return o.handleSagaFailure(blogsFailed.SagaID, blogsFailed.UserID, blogsFailed.Error, nil)
	}

	return fmt.Errorf("unrecognized blogs event: %s", string(body))
}

/*
	func (o *SagaOrchestrator) handleLikesEvent(body []byte) error {
		var likesDeleted Messages.LikesDeletedEvent
		var likesFailed Messages.LikesDeletionFailedEvent

		if err := json.Unmarshal(body, &likesDeleted); err == nil && likesDeleted.SagaID != "" {
			log.Printf("LikesDeletedEvent received for Saga %s, User %d", likesDeleted.SagaID, likesDeleted.UserID)
			o.updateSagaStatus(likesDeleted.SagaID, model.SagaStatusLikesDeleted, "")

			cmd := Messages.DeleteCommentsCommand{UserID: likesDeleted.UserID, SagaID: likesDeleted.SagaID}
			if err := o.publishCommand(context.Background(), DeleteCommentsQueue, cmd); err != nil {
				return o.handleSagaFailure(likesDeleted.SagaID, likesDeleted.UserID, "Failed to publish DeleteCommentsCommand", err)
			}
			o.updateSagaStatus(likesDeleted.SagaID, model.SagaStatusCommentsDeleting, "")
			return nil
		}

		if err := json.Unmarshal(body, &likesFailed); err == nil && likesFailed.SagaID != "" {
			log.Printf("LikesDeletionFailedEvent received for Saga %s, User %d: %s", likesFailed.SagaID, likesFailed.UserID, likesFailed.Error)
			return o.handleSagaFailure(likesFailed.SagaID, likesFailed.UserID, likesFailed.Error, nil)
		}

		return fmt.Errorf("unrecognized likes event: %s", string(body))
	}

	func (o *SagaOrchestrator) handleCommentsEvent(body []byte) error {
		var commentsDeleted Messages.CommentsDeletedEvent
		var commentsFailed Messages.CommentsDeletionFailedEvent

		if err := json.Unmarshal(body, &commentsDeleted); err == nil && commentsDeleted.SagaID != "" {
			log.Printf("CommentsDeletedEvent received for Saga %s, User %d", commentsDeleted.SagaID, commentsDeleted.UserID)
			o.updateSagaStatus(commentsDeleted.SagaID, model.SagaStatusCommentsDeleted, "")

			// Saga je completed
			o.updateSagaStatus(commentsDeleted.SagaID, model.SagaStatusCompleted, "User blocking saga completed successfully.")
			log.Printf("Saga %s for user %d COMPLETED successfully.", commentsDeleted.SagaID, commentsDeleted.UserID)
			return nil
		}

		if err := json.Unmarshal(body, &commentsFailed); err == nil && commentsFailed.SagaID != "" {
			log.Printf("CommentsDeletionFailedEvent received for Saga %s, User %d: %s", commentsFailed.SagaID, commentsFailed.UserID, commentsFailed.Error)
			return o.handleSagaFailure(commentsFailed.SagaID, commentsFailed.UserID, commentsFailed.Error, nil)
		}

		return fmt.Errorf("unrecognized comments event: %s", string(body))
	}
*/
func (o *SagaOrchestrator) initiateCompensation(sagaID string, userID string) error {
	sagaState, err := o.sagaRepo.GetSagaState(sagaID)
	if err != nil {
		return fmt.Errorf("failed to get saga state %s for compensation: %w", sagaID, err)
	}

	o.updateSagaStatus(sagaID, model.SagaStatusCompensating, "Starting compensation process.")
	log.Printf("Saga %s for user %d is entering compensation phase.", sagaID, userID)

	switch sagaState.Status {
	/*case model.SagaStatusFailed, model.SagaStatusPending, model.SagaStatusUserBlocking:
		log.Printf("Saga %s failed early (before user blocked), no compensation steps needed for data deletion.", sagaID)
		o.updateSagaStatus(sagaID, model.SagaStatusCompensationCompleted, "No compensation required for data deletion.")
		return nil

	case model.SagaStatusCommentsDeleting, model.SagaStatusCommentsDeleted:
		log.Printf("Saga %s: Comments were deleted or deleting. Initiating RevertCommentsDeletionCommand.", sagaID)
		cmd := Messages.RevertCommentsDeletionCommand{UserID: userID, SagaID: sagaID}
		if err := o.publishCommand(context.Background(), RevertCommentsQueue, cmd); err != nil {
			o.updateSagaStatus(sagaID, model.SagaStatusCompensationFailed, fmt.Sprintf("Failed to publish RevertCommentsDeletionCommand: %v", err))
			return fmt.Errorf("failed to publish RevertCommentsDeletionCommand: %w", err)
		}
		o.updateSagaStatus(sagaID, model.SagaStatusCommentsReverting, "")
		return nil

	case model.SagaStatusLikesDeleting, model.SagaStatusLikesDeleted:
		log.Printf("Saga %s: Likes were deleted or deleting. Initiating RevertLikesDeletionCommand.", sagaID)
		cmd := Messages.RevertLikesDeletionCommand{UserID: userID, SagaID: sagaID}
		if err := o.publishCommand(context.Background(), RevertLikesQueue, cmd); err != nil {
			o.updateSagaStatus(sagaID, model.SagaStatusCompensationFailed, fmt.Sprintf("Failed to publish RevertLikesDeletionCommand: %v", err))
			return fmt.Errorf("failed to publish RevertLikesDeletionCommand: %w", err)
		}
		o.updateSagaStatus(sagaID, model.SagaStatusLikesReverting, "")
		return nil

	case model.SagaStatusBlogsDeleting, model.SagaStatusBlogsDeleted:
		log.Printf("Saga %s: Blogs were deleted or deleting. Initiating RevertBlogsDeletionCommand.", sagaID)
		cmd := Messages.RevertBlogsDeletionCommand{UserID: userID, SagaID: sagaID}
		if err := o.publishCommand(context.Background(), RevertBlogsQueue, cmd); err != nil {
			o.updateSagaStatus(sagaID, model.SagaStatusCompensationFailed, fmt.Sprintf("Failed to publish RevertBlogsDeletionCommand: %v", err))
			return fmt.Errorf("failed to publish RevertBlogsDeletionCommand: %w", err)
		}
		o.updateSagaStatus(sagaID, model.SagaStatusBlogsReverting, "")
		return nil*/
	case model.SagaStatusFailed, model.SagaStatusPending, model.SagaStatusUserBlocking:
		log.Printf("Saga %s failed early (before user blocked), no compensation steps needed for data deletion.", sagaID)
		o.updateSagaStatus(sagaID, model.SagaStatusCompensationCompleted, "No compensation required for data deletion.")
		return nil

	case model.SagaStatusBlogsDeleting, model.SagaStatusBlogsDeleted,
		model.SagaStatusLikesDeleting, model.SagaStatusLikesDeleted,
		model.SagaStatusCommentsDeleting, model.SagaStatusCommentsDeleted:
		log.Printf("Saga %s: Blogs (and all related data) were deleted/deleting. Initiating RevertBlogsDeletionCommand.", sagaID)
		cmd := Messages.RevertBlogsDeletionCommand{UserID: userID, SagaID: sagaID}
		if err := o.publishCommand(context.Background(), RevertBlogsQueue, cmd); err != nil {
			o.updateSagaStatus(sagaID, model.SagaStatusCompensationFailed, fmt.Sprintf("Failed to publish RevertBlogsDeletionCommand: %v", err))
			return fmt.Errorf("failed to publish RevertBlogsDeletionCommand: %w", err)
		}
		o.updateSagaStatus(sagaID, model.SagaStatusBlogsReverting, "") // Novi status
		return nil

	case model.SagaStatusUserBlocked:
		log.Printf("Saga %s: User was blocked in Stakeholders. Initiating UnblockUserInStakeholdersCommand.", sagaID)
		cmd := Messages.UnblockUserInStakeholdersCommand{UserID: userID, SagaID: sagaID}
		if err := o.publishCommand(context.Background(), UnblockUserInStakeholdersQueue, cmd); err != nil {
			o.updateSagaStatus(sagaID, model.SagaStatusCompensationFailed, fmt.Sprintf("Failed to publish UnblockUserInStakeholdersCommand: %v", err))
			return fmt.Errorf("failed to publish UnblockUserInStakeholdersCommand: %w", err)
		}
		o.updateSagaStatus(sagaID, model.SagaStatusUserReverting, "")
		return nil

	default:
		log.Printf("Saga %s is in an unexpected state (%s) for compensation. No compensation initiated.", sagaID, sagaState.Status)
		o.updateSagaStatus(sagaID, model.SagaStatusCompensationCompleted, "Unexpected state, no specific compensation initiated.")
		return nil
	}
}

/*
	func (o *SagaOrchestrator) handleCommentsRevertedEvent(body []byte) error {
		var commentsReverted Messages.CommentsDeletionRevertedEvent
		var commentsReversionFailed Messages.CommentsReversionFailedEvent

		if err := json.Unmarshal(body, &commentsReverted); err == nil && commentsReverted.SagaID != "" {
			log.Printf("CommentsDeletionRevertedEvent received for Saga %s, User %d", commentsReverted.SagaID, commentsReverted.UserID)
			o.updateSagaStatus(commentsReverted.SagaID, model.SagaStatusCommentsReverted, "")

			cmd := Messages.RevertLikesDeletionCommand{UserID: commentsReverted.UserID, SagaID: commentsReverted.SagaID}
			if err := o.publishCommand(context.Background(), RevertLikesQueue, cmd); err != nil {
				o.updateSagaStatus(commentsReverted.SagaID, model.SagaStatusCompensationFailed, fmt.Sprintf("Failed to publish RevertLikesDeletionCommand during compensation: %v", err))
				return fmt.Errorf("compensation for Saga %s failed: failed to publish RevertLikesDeletionCommand: %w", commentsReverted.SagaID, err)
			}
			o.updateSagaStatus(commentsReverted.SagaID, model.SagaStatusLikesReverting, "")
			return nil
		}

		if err := json.Unmarshal(body, &commentsReversionFailed); err == nil && commentsReversionFailed.SagaID != "" {
			log.Printf("CommentsReversionFailedEvent received for Saga %s, User %d: %s", commentsReversionFailed.SagaID, commentsReversionFailed.UserID, commentsReversionFailed.Error)
			o.updateSagaStatus(commentsReversionFailed.SagaID, model.SagaStatusCompensationFailed, fmt.Sprintf("Comments reversion failed: %s", commentsReversionFailed.Error))
			return fmt.Errorf("compensation for Saga %s failed at comments reversion: %s", commentsReversionFailed.SagaID, commentsReversionFailed.Error)
		}

		return fmt.Errorf("unrecognized comments reversion event: %s", string(body))
	}

	func (o *SagaOrchestrator) handleLikesRevertedEvent(body []byte) error {
		var likesReverted Messages.LikesDeletionRevertedEvent
		var likesReversionFailed Messages.LikesReversionFailedEvent

		if err := json.Unmarshal(body, &likesReverted); err == nil && likesReverted.SagaID != "" {
			log.Printf("LikesDeletionRevertedEvent received for Saga %s, User %d", likesReverted.SagaID, likesReverted.UserID)
			o.updateSagaStatus(likesReverted.SagaID, model.SagaStatusLikesReverted, "")

			cmd := Messages.RevertBlogsDeletionCommand{UserID: likesReverted.UserID, SagaID: likesReverted.SagaID}
			if err := o.publishCommand(context.Background(), RevertBlogsQueue, cmd); err != nil {
				o.updateSagaStatus(likesReverted.SagaID, model.SagaStatusCompensationFailed, fmt.Sprintf("Failed to publish RevertBlogsDeletionCommand during compensation: %v", err))
				return fmt.Errorf("compensation for Saga %s failed: failed to publish RevertBlogsDeletionCommand: %w", likesReverted.SagaID, err)
			}
			o.updateSagaStatus(likesReverted.SagaID, model.SagaStatusBlogsReverting, "")
			return nil
		}

		if err := json.Unmarshal(body, &likesReversionFailed); err == nil && likesReversionFailed.SagaID != "" {
			log.Printf("LikesReversionFailedEvent received for Saga %s, User %d: %s", likesReversionFailed.SagaID, likesReversionFailed.UserID, likesReversionFailed.Error)
			o.updateSagaStatus(likesReversionFailed.SagaID, model.SagaStatusCompensationFailed, fmt.Sprintf("Likes reversion failed: %s", likesReversionFailed.Error))
			return fmt.Errorf("compensation for Saga %s failed at likes reversion: %s", likesReversionFailed.SagaID, likesReversionFailed.Error)
		}

		return fmt.Errorf("unrecognized likes reversion event: %s", string(body))
	}
*/
func (o *SagaOrchestrator) handleBlogsRevertedEvent(body []byte) error {
	var blogsReverted Messages.BlogsDeletionRevertedEvent
	var blogsReversionFailed Messages.BlogsReversionFailedEvent

	if err := json.Unmarshal(body, &blogsReverted); err == nil && blogsReverted.SagaID != "" {
		log.Printf("BlogsDeletionRevertedEvent received for Saga %s, User %d", blogsReverted.SagaID, blogsReverted.UserID)
		o.updateSagaStatus(blogsReverted.SagaID, model.SagaStatusBlogsReverted, "")

		cmd := Messages.UnblockUserInStakeholdersCommand{UserID: blogsReverted.UserID, SagaID: blogsReverted.SagaID}
		if err := o.publishCommand(context.Background(), UnblockUserInStakeholdersQueue, cmd); err != nil {
			o.updateSagaStatus(blogsReverted.SagaID, model.SagaStatusCompensationFailed, fmt.Sprintf("Failed to publish UnblockUserInStakeholdersCommand during compensation: %v", err))
			return fmt.Errorf("compensation for Saga %s failed: failed to publish UnblockUserInStakeholdersCommand: %w", blogsReverted.SagaID, err)
		}
		o.updateSagaStatus(blogsReverted.SagaID, model.SagaStatusUserReverting, "")
		return nil
	}

	if err := json.Unmarshal(body, &blogsReversionFailed); err == nil && blogsReversionFailed.SagaID != "" {
		log.Printf("BlogsReversionFailedEvent received for Saga %s, User %d: %s", blogsReversionFailed.SagaID, blogsReversionFailed.UserID, blogsReversionFailed.Error)
		o.updateSagaStatus(blogsReversionFailed.SagaID, model.SagaStatusCompensationFailed, fmt.Sprintf("Blogs reversion failed: %s", blogsReversionFailed.Error))
		return fmt.Errorf("CRITICAL: compensation for Saga %s failed at blogs reversion: %s", blogsReversionFailed.SagaID, blogsReversionFailed.Error)
	}
	return fmt.Errorf("unrecognized blogs reversion event: %s", string(body))
}

func (o *SagaOrchestrator) handleUserStakeholdersRevertedEvent(body []byte) error {
	var userUnblocked Messages.UserUnblockedInStakeholdersEvent
	var userUnblockingFailed Messages.UserUnblockingInStakeholdersFailedEvent

	if err := json.Unmarshal(body, &userUnblocked); err == nil && userUnblocked.SagaID != "" {
		log.Printf("UserUnblockedInStakeholdersEvent received for Saga %s, User %d", userUnblocked.SagaID, userUnblocked.UserID)
		o.updateSagaStatus(userUnblocked.SagaID, model.SagaStatusUserReverted, "")
		//saga zavrsena
		o.updateSagaStatus(userUnblocked.SagaID, model.SagaStatusCompensationCompleted, "All compensation steps successfully completed.")
		log.Printf("Saga %s for user %d: COMPENSATION COMPLETED successfully.", userUnblocked.SagaID, userUnblocked.UserID)
		return nil
	}

	if err := json.Unmarshal(body, &userUnblockingFailed); err == nil && userUnblockingFailed.SagaID != "" {
		log.Printf("UserUnblockingInStakeholdersFailedEvent received for Saga %s, User %d: %s", userUnblockingFailed.SagaID, userUnblockingFailed.UserID, userUnblockingFailed.Error)
		o.updateSagaStatus(userUnblockingFailed.SagaID, model.SagaStatusCompensationFailed, fmt.Sprintf("User unblocking failed in Stakeholders: %s", userUnblockingFailed.Error))
		log.Printf("CRITICAL ERROR: Compensation for Saga %s FAILED at user unblocking in Stakeholders. Manual intervention required!", userUnblockingFailed.SagaID)
		return fmt.Errorf("CRITICAL: compensation for Saga %s failed at user unblocking in Stakeholders: %s", userUnblockingFailed.SagaID, userUnblockingFailed.Error)
	}

	return fmt.Errorf("unrecognized user stakeholders reversion event: %s", string(body))
}

func (o *SagaOrchestrator) handleSagaFailure(sagaID string, userID string, reason string, err error) error {
	fullErrorMsg := reason
	if err != nil {
		fullErrorMsg += fmt.Sprintf(": %v", err)
	}
	o.updateSagaStatus(sagaID, model.SagaStatusFailed, fullErrorMsg)
	log.Printf("Saga %s for user %d FAILED: %s", sagaID, userID, fullErrorMsg)

	log.Printf("Initiating compensation for Saga %s...", sagaID)
	if compErr := o.initiateCompensation(sagaID, userID); compErr != nil {
		log.Printf("Error initiating compensation for Saga %s: %v", sagaID, compErr)
		return fmt.Errorf("saga %s failed and compensation initiation failed: %s; %v", sagaID, fullErrorMsg, compErr)
	}
	return fmt.Errorf("saga %s failed: %s. Compensation initiated.", sagaID, fullErrorMsg)
}
