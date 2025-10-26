/*
package saga

import (

	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/jelena-ra/touristApp/soa-team-4/Blog/internal/service"
	"github.com/jelena-ra/touristApp/soa-team-4/Messages"
	"github.com/streadway/amqp"

)

const (

	DeleteBlogsQueue = "q.delete_blogs_command"
	RevertBlogsQueue = "q.revert_blogs_command"

	BlogsRevertedEventsQueue = "q.blogs_reverted_events_for_orchestrator"
	BlogsEventsQueue         = "q.blogs_events_for_orchestrator"

)

	type SagaConsumer struct {
		rabbitConn  *amqp.Connection
		blogService *service.BlogService
	}

	func NewSagaConsumer(conn *amqp.Connection, blogService *service.BlogService) *SagaConsumer {
		return &SagaConsumer{
			rabbitConn:  conn,
			blogService: blogService,
		}
	}

	func (c *SagaConsumer) SetupRabbitMQ() error {
		ch, err := c.rabbitConn.Channel()
		if err != nil {
			return fmt.Errorf("failed to open a channel: %w", err)
		}
		defer ch.Close()

		_, err = ch.QueueDeclare(DeleteBlogsQueue, true, false, false, false, nil)
		if err != nil {
			return fmt.Errorf("failed to declare %s queue: %w", DeleteBlogsQueue, err)
		}

		_, err = ch.QueueDeclare(BlogsEventsQueue, true, false, false, false, nil)
		if err != nil {
			return fmt.Errorf("failed to declare %s queue: %w", BlogsEventsQueue, err)
		}

		log.Println("RabbitMQ queues declared successfully for Blog Saga Consumer.")
		return nil
	}

	func (c *SagaConsumer) StartListening(ctx context.Context) {
		go c.listenForCommands(ctx, DeleteBlogsQueue, c.handleDeleteBlogsCommand)

		log.Println("Blog SagaConsumer started listening for commands.")
	}

	func (c *SagaConsumer) listenForCommands(ctx context.Context, queueName string, handler func([]byte, uint64) error) {
		ch, err := c.rabbitConn.Channel()
		if err != nil {
			log.Printf("Failed to open channel for queue %s: %v", queueName, err)
			return
		}
		defer ch.Close()

		msgs, err := ch.Consume(
			queueName, // queue
			"",        // consumer
			false,     // auto-ack
			false,     // exclusive
			false,     // no-local
			false,     // no-wait
			nil,       // args
		)
		if err != nil {
			log.Printf("Failed to register a consumer for queue %s: %v", queueName, err)
			return
		}

		for {
			select {
			case d := <-msgs:
				log.Printf("Received message from %s: %s", queueName, d.Body)
				if err := handler(d.Body, d.DeliveryTag); err != nil {
					log.Printf("Error handling message from %s, redelivering: %v", queueName, err)
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

	func (c *SagaConsumer) handleDeleteBlogsCommand(body []byte, deliveryTag uint64) error {
		var cmd Messages.DeleteBlogsCommand
		if err := json.Unmarshal(body, &cmd); err != nil {
			log.Printf("Failed to unmarshal DeleteBlogsCommand: %v", err)
			return fmt.Errorf("failed to unmarshal command: %w", err)
		}

		log.Printf("Processing DeleteBlogsCommand for UserID: %d, SagaID: %s", cmd.UserID, cmd.SagaID)

		ctx := context.Background()

		err := c.blogService.DeleteUserData(ctx, cmd.UserID)
		if err != nil {
			log.Printf("Error deleting user data for UserID %d in BlogService: %v", cmd.UserID, err)
			c.publishFailedEvent(ctx, cmd.UserID, cmd.SagaID, fmt.Sprintf("Failed to delete user data: %v", err))
			return fmt.Errorf("failed to delete user data: %w", err)
		}

		c.publishDeletedEvent(ctx, cmd.UserID, cmd.SagaID)
		return nil
	}

	func (c *SagaConsumer) publishDeletedEvent(ctx context.Context, userID string, sagaID string) {
		event := Messages.BlogsDeletedEvent{
			UserID: userID,
			SagaID: sagaID,
		}
		if err := c.publishEvent(ctx, BlogsEventsQueue, event); err != nil {
			log.Printf("Failed to publish BlogsDeletedEvent for SagaID %s: %v", sagaID, err)
		} else {
			log.Printf("Published BlogsDeletedEvent for SagaID %s", sagaID)
		}
	}

	func (c *SagaConsumer) publishFailedEvent(ctx context.Context, userID string, sagaID string, errMsg string) {
		event := Messages.BlogsDeletionFailedEvent{
			UserID: userID,
			SagaID: sagaID,
			Error:  errMsg,
		}
		if err := c.publishEvent(ctx, BlogsEventsQueue, event); err != nil {
			log.Printf("Failed to publish BlogsDeletionFailedEvent for SagaID %s: %v", sagaID, err)
		} else {
			log.Printf("Published BlogsDeletionFailedEvent for SagaID %s with error: %s", sagaID, errMsg)
		}
	}

	func (c *SagaConsumer) publishEvent(ctx context.Context, queueName string, event interface{}) error {
		ch, err := c.rabbitConn.Channel()
		if err != nil {
			return fmt.Errorf("failed to open a channel: %w", err)
		}
		defer ch.Close()

		body, err := json.Marshal(event)
		if err != nil {
			return fmt.Errorf("failed to marshal event: %w", err)
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
*/
package saga

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/jelena-ra/touristApp/soa-team-4/Blog/internal/service"
	"github.com/jelena-ra/touristApp/soa-team-4/Messages"
	"github.com/streadway/amqp"
)

const (
	DeleteBlogsQueue = "q.delete_blogs_command"
	RevertBlogsQueue = "q.revert_blogs_command" // Nova komanda za revert

	BlogsRevertedEventsQueue = "q.blogs_reverted_events_for_orchestrator" // Nova event queue za revert
	BlogsEventsQueue         = "q.blogs_events_for_orchestrator"
)

type SagaConsumer struct {
	rabbitConn  *amqp.Connection
	blogService *service.BlogService
}

func NewSagaConsumer(conn *amqp.Connection, blogService *service.BlogService) *SagaConsumer {
	return &SagaConsumer{
		rabbitConn:  conn,
		blogService: blogService,
	}
}

func (c *SagaConsumer) SetupRabbitMQ() error {
	ch, err := c.rabbitConn.Channel()
	if err != nil {
		return fmt.Errorf("failed to open a channel: %w", err)
	}
	defer ch.Close()

	_, err = ch.QueueDeclare(DeleteBlogsQueue, true, false, false, false, nil)
	if err != nil {
		return fmt.Errorf("failed to declare %s queue: %w", DeleteBlogsQueue, err)
	}

	_, err = ch.QueueDeclare(RevertBlogsQueue, true, false, false, false, nil)
	if err != nil {
		return fmt.Errorf("failed to declare %s queue: %w", RevertBlogsQueue, err)
	}

	_, err = ch.QueueDeclare(BlogsEventsQueue, true, false, false, false, nil)
	if err != nil {
		return fmt.Errorf("failed to declare %s queue: %w", BlogsEventsQueue, err)
	}

	_, err = ch.QueueDeclare(BlogsRevertedEventsQueue, true, false, false, false, nil)
	if err != nil {
		return fmt.Errorf("failed to declare %s queue: %w", BlogsRevertedEventsQueue, err)
	}

	log.Println("RabbitMQ queues declared successfully for Blog Saga Consumer.")
	return nil
}

func (c *SagaConsumer) StartListening(ctx context.Context) {
	go c.listenForCommands(ctx, DeleteBlogsQueue, c.handleDeleteBlogsCommand)
	go c.listenForCommands(ctx, RevertBlogsQueue, c.handleRevertBlogsCommand) // Slušanje za revert komandu

	log.Println("Blog SagaConsumer started listening for commands.")
}

func (c *SagaConsumer) listenForCommands(ctx context.Context, queueName string, handler func([]byte, uint64) error) {
	ch, err := c.rabbitConn.Channel()
	if err != nil {
		log.Printf("Failed to open channel for queue %s: %v", queueName, err)
		return
	}
	defer ch.Close()

	msgs, err := ch.Consume(
		queueName, // queue
		"",        // consumer
		false,     // auto-ack
		false,     // exclusive
		false,     // no-local
		false,     // no-wait
		nil,       // args
	)
	if err != nil {
		log.Printf("Failed to register a consumer for queue %s: %v", queueName, err)
		return
	}

	for {
		select {
		case d := <-msgs:
			log.Printf("Received message from %s: %s", queueName, d.Body)
			if err := handler(d.Body, d.DeliveryTag); err != nil {
				log.Printf("Error handling message from %s, redelivering: %v", queueName, err)
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

func (c *SagaConsumer) handleDeleteBlogsCommand(body []byte, deliveryTag uint64) error {
	var cmd Messages.DeleteBlogsCommand
	if err := json.Unmarshal(body, &cmd); err != nil {
		log.Printf("Failed to unmarshal DeleteBlogsCommand: %v", err)
		return fmt.Errorf("failed to unmarshal command: %w", err)
	}

	log.Printf("Processing DeleteBlogsCommand for UserID: %s, SagaID: %s", cmd.UserID, cmd.SagaID)

	ctx := context.Background()

	err := c.blogService.DeleteUserData(ctx, cmd.UserID)
	if err != nil {
		log.Printf("Error deleting user data for UserID %s in BlogService: %v", cmd.UserID, err)
		c.publishFailedEvent(ctx, cmd.UserID, cmd.SagaID, fmt.Sprintf("Failed to delete user data: %v", err))
		return fmt.Errorf("failed to delete user data: %w", err)
	}

	c.publishDeletedEvent(ctx, cmd.UserID, cmd.SagaID)
	return nil
}

// handleRevertBlogsCommand obrađuje komandu za poništavanje brisanja blogova (revert)
func (c *SagaConsumer) handleRevertBlogsCommand(body []byte, deliveryTag uint64) error {
	var cmd Messages.RevertBlogsDeletionCommand // Predpostavljamo da postoji RevertBlogsCommand u Messages paketu
	if err := json.Unmarshal(body, &cmd); err != nil {
		log.Printf("Failed to unmarshal RevertBlogsCommand: %v", err)
		return fmt.Errorf("failed to unmarshal command: %w", err)
	}

	log.Printf("Processing RevertBlogsCommand for UserID: %s, SagaID: %s", cmd.UserID, cmd.SagaID)

	ctx := context.Background()

	err := c.blogService.RecoverUserData(ctx, cmd.UserID) // Predpostavljamo da BlogService ima RecoverUserData metodu
	if err != nil {
		log.Printf("Error recovering user data for UserID %s in BlogService: %v", cmd.UserID, err)
		c.publishRevertFailedEvent(ctx, cmd.UserID, cmd.SagaID, fmt.Sprintf("Failed to recover user data: %v", err))
		return fmt.Errorf("failed to recover user data: %w", err)
	}

	c.publishRevertedEvent(ctx, cmd.UserID, cmd.SagaID)
	return nil
}

func (c *SagaConsumer) publishDeletedEvent(ctx context.Context, userID string, sagaID string) {
	event := Messages.BlogsDeletedEvent{
		UserID: userID,
		SagaID: sagaID,
	}
	if err := c.publishEvent(ctx, BlogsEventsQueue, event); err != nil {
		log.Printf("Failed to publish BlogsDeletedEvent for SagaID %s: %v", sagaID, err)
	} else {
		log.Printf("Published BlogsDeletedEvent for SagaID %s", sagaID)
	}
}

func (c *SagaConsumer) publishFailedEvent(ctx context.Context, userID string, sagaID string, errMsg string) {
	event := Messages.BlogsDeletionFailedEvent{
		UserID: userID,
		SagaID: sagaID,
		Error:  errMsg,
	}
	if err := c.publishEvent(ctx, BlogsEventsQueue, event); err != nil {
		log.Printf("Failed to publish BlogsDeletionFailedEvent for SagaID %s: %v", sagaID, err)
	} else {
		log.Printf("Published BlogsDeletionFailedEvent for SagaID %s with error: %s", sagaID, errMsg)
	}
}

// publishRevertedEvent objavljuje događaj da su blogovi uspešno vraćeni
func (c *SagaConsumer) publishRevertedEvent(ctx context.Context, userID string, sagaID string) {
	event := Messages.BlogsReversionFailedEvent{ // Predpostavljamo da postoji BlogsRevertedEvent
		UserID: userID,
		SagaID: sagaID,
	}
	if err := c.publishEvent(ctx, BlogsRevertedEventsQueue, event); err != nil {
		log.Printf("Failed to publish BlogsRevertedEvent for SagaID %s: %v", sagaID, err)
	} else {
		log.Printf("Published BlogsRevertedEvent for SagaID %s", sagaID)
	}
}

// publishRevertFailedEvent objavljuje događaj da je operacija vraćanja blogova propala
func (c *SagaConsumer) publishRevertFailedEvent(ctx context.Context, userID string, sagaID string, errMsg string) {
	event := Messages.BlogsReversionFailedEvent{ // Predpostavljamo da postoji BlogsRevertFailedEvent
		UserID: userID,
		SagaID: sagaID,
		Error:  errMsg,
	}
	if err := c.publishEvent(ctx, BlogsRevertedEventsQueue, event); err != nil {
		log.Printf("Failed to publish BlogsRevertFailedEvent for SagaID %s: %v", sagaID, err)
	} else {
		log.Printf("Published BlogsRevertFailedEvent for SagaID %s with error: %s", sagaID, errMsg)
	}
}

func (c *SagaConsumer) publishEvent(ctx context.Context, queueName string, event interface{}) error {
	ch, err := c.rabbitConn.Channel()
	if err != nil {
		return fmt.Errorf("failed to open a channel: %w", err)
	}
	defer ch.Close()

	body, err := json.Marshal(event)
	if err != nil {
		return fmt.Errorf("failed to marshal event: %w", err)
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
