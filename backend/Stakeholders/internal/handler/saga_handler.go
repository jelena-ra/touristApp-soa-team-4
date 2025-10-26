package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/model"
	"github.com/streadway/amqp"

	"github.com/jelena-ra/touristApp/soa-team-4/Messages"
	"github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/repository"
)

const (
	BlockUserInStakeholdersQueue        = "q.block_user_stakeholders_command"
	UnblockUserInStakeholdersQueue      = "q.unblock_user_stakeholders_command"
	UserStakeholdersEventsQueue         = "q.user_stakeholders_events_for_orchestrator"
	UserStakeholdersRevertedEventsQueue = "q.user_stakeholders_reverted_events"
)

type StakeholdersSagaHandler struct {
	rabbitConn  *amqp.Connection
	userRepo    *repository.UserRepository
	profileRepo *repository.ProfileRepository
}

func NewStakeholdersSagaHandler(conn *amqp.Connection, userRepo *repository.UserRepository, profileRepo *repository.ProfileRepository) *StakeholdersSagaHandler {
	return &StakeholdersSagaHandler{
		rabbitConn:  conn,
		userRepo:    userRepo,
		profileRepo: profileRepo,
	}
}

func (h *StakeholdersSagaHandler) SetupRabbitMQ() error {
	ch, err := h.rabbitConn.Channel()
	if err != nil {
		return fmt.Errorf("failed to open a channel: %w", err)
	}
	defer ch.Close()

	_, err = ch.QueueDeclare(BlockUserInStakeholdersQueue, true, false, false, false, nil)
	if err != nil {
		return fmt.Errorf("failed to declare %s queue: %w", BlockUserInStakeholdersQueue, err)
	}
	_, err = ch.QueueDeclare(UnblockUserInStakeholdersQueue, true, false, false, false, nil)
	if err != nil {
		return fmt.Errorf("failed to declare %s queue: %w", UnblockUserInStakeholdersQueue, err)
	}
	_, err = ch.QueueDeclare(UserStakeholdersEventsQueue, true, false, false, false, nil)
	if err != nil {
		return fmt.Errorf("failed to declare %s queue: %w", UserStakeholdersEventsQueue, err)
	}
	_, err = ch.QueueDeclare(UserStakeholdersRevertedEventsQueue, true, false, false, false, nil)
	if err != nil {
		return fmt.Errorf("failed to declare %s queue: %w", UserStakeholdersRevertedEventsQueue, err)
	}
	log.Println("Stakeholders Saga RabbitMQ queues declared successfully.")
	return nil
}

func (h *StakeholdersSagaHandler) StartListening(ctx context.Context) {
	go h.listenForCommands(ctx, BlockUserInStakeholdersQueue, h.handleBlockUserCommand)
	go h.listenForCommands(ctx, UnblockUserInStakeholdersQueue, h.handleUnblockUserCommand) // Listen for unblock command for compensation
	log.Println("StakeholdersSagaHandler started listening for commands.")
}

func (h *StakeholdersSagaHandler) listenForCommands(ctx context.Context, queueName string, handler func([]byte, *amqp.Delivery) error) {
	ch, err := h.rabbitConn.Channel()
	if err != nil {
		log.Printf("Failed to open channel for queue %s: %v", queueName, err)
		return
	}
	defer ch.Close()

	msgs, err := ch.Consume(queueName, "", false, false, false, false, nil)
	if err != nil {
		log.Printf("Failed to register a consumer for queue %s: %v", queueName, err)
		return
	}

	for {
		select {
		case d := <-msgs:
			log.Printf("Received command from %s: %s", queueName, d.Body)
			if err := handler(d.Body, &d); err != nil {
				log.Printf("Error handling command from %s: %v", queueName, err)
				d.Nack(false, true) // Nack, requeue the message
			} else {
				d.Ack(false) // Ack, remove the message from the queue
			}
		case <-ctx.Done():
			log.Printf("Stopping listener for queue %s due to context cancellation.", queueName)
			return
		}
	}
}

func (h *StakeholdersSagaHandler) handleBlockUserCommand(body []byte, d *amqp.Delivery) error {
	var command Messages.BlockUserInStakeholdersCommand
	if err := json.Unmarshal(body, &command); err != nil {
		log.Printf("Failed to unmarshal BlockUserInStakeholdersCommand: %v", err)
		h.publishBlockingFailedEvent(command.SagaID, command.UserID, fmt.Sprintf("Failed to unmarshal command: %v", err))
		return err
	}

	log.Printf("Processing BlockUserInStakeholdersCommand for user ID: %d, SagaID: %s", command.UserID, command.SagaID)

	userIDStr := command.UserID

	user, err := h.userRepo.GetByid(userIDStr)
	if err != nil {
		log.Printf("User not found in Stakeholders for ID %s: %v", userIDStr, err)
		h.publishBlockingFailedEvent(command.SagaID, command.UserID, fmt.Sprintf("User not found: %v", err))
		return err
	}

	user.Blocked = true
	updatedUser, err := h.userRepo.Update(user)
	if err != nil {
		log.Printf("Failed to block user %s in Stakeholders: %v", userIDStr, err)
		h.publishBlockingFailedEvent(command.SagaID, command.UserID, fmt.Sprintf("Failed to block user: %v", err))
		return err
	}
	log.Printf("User %s blocked successfully (Blocked: %t)", updatedUser.ID, updatedUser.Blocked)

	_, err = h.profileRepo.GetByUserID(userIDStr, context.Background())
	if err != nil {
		log.Printf("Profile not found for user ID %s during block operation. Error: %v", userIDStr, err)

	} else {
		err = h.profileRepo.DeleteProfile(userIDStr, context.Background())
		if err != nil {
			log.Printf("Failed to delete profile for user %s: %v", userIDStr, err)
		} else {
			log.Printf("Profile for user %s deleted successfully.", userIDStr)
		}
	}

	log.Printf("Successfully processed BlockUserInStakeholdersCommand for user %d. Publishing success event.", command.UserID)
	h.publishBlockedEvent(command.SagaID, command.UserID)
	return nil
}

func (h *StakeholdersSagaHandler) handleUnblockUserCommand(body []byte, d *amqp.Delivery) error {
	var command Messages.UnblockUserInStakeholdersCommand
	if err := json.Unmarshal(body, &command); err != nil {
		log.Printf("Failed to unmarshal UnblockUserInStakeholdersCommand: %v", err)
		h.publishUnblockingFailedEvent(command.SagaID, command.UserID, fmt.Sprintf("Failed to unmarshal command: %v", err))
		return err
	}

	log.Printf("Processing UnblockUserInStakeholdersCommand for user ID: %s, SagaID: %s", command.UserID, command.SagaID)

	userIDStr := command.UserID

	user, err := h.userRepo.GetByid(userIDStr)
	if err != nil {
		log.Printf("User not found in Stakeholders for ID %s: %v", userIDStr, err)
		h.publishUnblockingFailedEvent(command.SagaID, command.UserID, fmt.Sprintf("User not found: %v", err))
		return err
	}

	user.Blocked = false
	updatedUser, err := h.userRepo.Update(user)
	if err != nil {
		log.Printf("Failed to unblock user %s in Stakeholders: %v", userIDStr, err)
		h.publishUnblockingFailedEvent(command.SagaID, command.UserID, fmt.Sprintf("Failed to unblock user: %v", err))
		return err
	}
	log.Printf("User %s unblocked successfully (Blocked: %t)", updatedUser.ID, updatedUser.Blocked)

	defaultProfile := model.Profile{
		UserId:    userIDStr,
		Name:      user.Username,
		Surname:   "",
		Biography: "Default biography",
		Moto:      "Default moto",
		PhotoId:   "",
		Money:     20000.0,
	}
	_, err = h.profileRepo.CreateProfile(defaultProfile, context.Background())
	if err != nil {
		log.Printf("WARNING: Failed to re-create default profile for user %s during unblock: %v", userIDStr, err)

	} else {
		log.Printf("Default profile re-created for user %s during unblock.", userIDStr)
	}

	_, err = h.profileRepo.GetByUserID(userIDStr, context.Background())
	if err != nil {
		log.Printf("Profile not found for user ID %s during unblock. Assuming it was deleted/not critical. Error: %v", userIDStr, err)
	} else {

		log.Printf("Profile for user %s found and was not re-created/unblocked as per current logic.", userIDStr)
	}

	log.Printf("Successfully processed UnblockUserInStakeholdersCommand for user %d. Publishing success event.", command.UserID)
	h.publishUnblockedEvent(command.SagaID, command.UserID)
	return nil
}

func (h *StakeholdersSagaHandler) publishBlockedEvent(sagaID string, userID string) {
	ch, err := h.rabbitConn.Channel()
	if err != nil {
		log.Printf("Failed to open channel for publishing UserBlockedInStakeholdersEvent: %v", err)
		return
	}
	defer ch.Close()

	event := Messages.UserBlockedInStakeholdersEvent{
		UserID: userID,
		SagaID: sagaID,
	}

	body, err := json.Marshal(event)
	if err != nil {
		log.Printf("Failed to marshal UserBlockedInStakeholdersEvent: %v", err)
		return
	}

	err = ch.Publish(
		"",
		UserStakeholdersEventsQueue,
		false,
		false,
		amqp.Publishing{
			ContentType: "application/json",
			Body:        body,
		})
	if err != nil {
		log.Printf("Failed to publish UserBlockedInStakeholdersEvent to queue %s: %v", UserStakeholdersEventsQueue, err)
		return
	}
	log.Printf("Published UserBlockedInStakeholdersEvent for SagaID: %s, UserID: %d to queue %s", sagaID, userID, UserStakeholdersEventsQueue)
}

func (h *StakeholdersSagaHandler) publishBlockingFailedEvent(sagaID string, userID string, errorMessage string) {
	ch, err := h.rabbitConn.Channel()
	if err != nil {
		log.Printf("Failed to open channel for publishing UserBlockingInStakeholdersFailedEvent: %v", err)
		return
	}
	defer ch.Close()

	event := Messages.UserBlockingInStakeholdersFailedEvent{
		UserID: userID,
		SagaID: sagaID,
		Error:  errorMessage,
	}

	body, err := json.Marshal(event)
	if err != nil {
		log.Printf("Failed to marshal UserBlockingInStakeholdersFailedEvent: %v", err)
		return
	}

	err = ch.Publish(
		"",
		UserStakeholdersRevertedEventsQueue,
		false,
		false,
		amqp.Publishing{
			ContentType: "application/json",
			Body:        body,
		})
	if err != nil {
		log.Printf("Failed to publish UserBlockingInStakeholdersFailedEvent to queue %s: %v", UserStakeholdersRevertedEventsQueue, err)
		return
	}
	log.Printf("Published UserBlockingInStakeholdersFailedEvent for SagaID: %s, UserID: %d to queue %s (Error: %s)", sagaID, userID, UserStakeholdersRevertedEventsQueue, errorMessage)
}

func (h *StakeholdersSagaHandler) publishUnblockedEvent(sagaID string, userID string) {
	ch, err := h.rabbitConn.Channel()
	if err != nil {
		log.Printf("Failed to open channel for publishing UserUnblockedInStakeholdersEvent: %v", err)
		return
	}
	defer ch.Close()

	event := Messages.UserUnblockedInStakeholdersEvent{
		UserID: userID,
		SagaID: sagaID,
	}

	body, err := json.Marshal(event)
	if err != nil {
		log.Printf("Failed to marshal UserUnblockedInStakeholdersEvent: %v", err)
		return
	}

	err = ch.Publish(
		"",
		UserStakeholdersRevertedEventsQueue,
		false,
		false,
		amqp.Publishing{
			ContentType: "application/json",
			Body:        body,
		})
	if err != nil {
		log.Printf("Failed to publish UserUnblockedInStakeholdersEvent to queue %s: %v", UserStakeholdersRevertedEventsQueue, err)
		return
	}
	log.Printf("Published UserUnblockedInStakeholdersEvent for SagaID: %s, UserID: %d to queue %s", sagaID, userID, UserStakeholdersRevertedEventsQueue)
}

func (h *StakeholdersSagaHandler) publishUnblockingFailedEvent(sagaID string, userID string, errorMessage string) {
	ch, err := h.rabbitConn.Channel()
	if err != nil {
		log.Printf("Failed to open channel for publishing UserUnblockingInStakeholdersFailedEvent: %v", err)
		return
	}
	defer ch.Close()

	event := Messages.UserUnblockingInStakeholdersFailedEvent{
		UserID: userID,
		SagaID: sagaID,
		Error:  errorMessage,
	}

	body, err := json.Marshal(event)
	if err != nil {
		log.Printf("Failed to marshal UserUnblockingInStakeholdersFailedEvent: %v", err)
		return
	}

	err = ch.Publish(
		"",
		UserStakeholdersRevertedEventsQueue,
		false,
		false,
		amqp.Publishing{
			ContentType: "application/json",
			Body:        body,
		})
	if err != nil {
		log.Printf("Failed to publish UserUnblockingInStakeholdersFailedEvent to queue %s: %v", UserStakeholdersRevertedEventsQueue, err)
		return
	}
	log.Printf("Published UserUnblockingInStakeholdersFailedEvent for SagaID: %s, UserID: %d to queue %s (Error: %s)", sagaID, userID, UserStakeholdersRevertedEventsQueue, errorMessage)
}
