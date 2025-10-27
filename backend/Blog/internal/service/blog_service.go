package service

import (
	"context"
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/jelena-ra/touristApp/soa-team-4/Blog/internal/model"
	"github.com/jelena-ra/touristApp/soa-team-4/Blog/internal/repository"
	following_proto "github.com/jelena-ra/touristApp/soa-team-4/Following/proto"
)

type BlogService struct {
	repo            repository.BlogRepository
	repoComment     repository.CommentRepository
	followingClient following_proto.FollowingServiceClient
}

func NewBlogService(repo repository.BlogRepository, repoComment repository.CommentRepository, followingClient following_proto.FollowingServiceClient) *BlogService {
	return &BlogService{
		repo:            repo,
		repoComment:     repoComment,
		followingClient: followingClient,
	}
}

func (s *BlogService) CreateBlog(ctx context.Context, blog *model.Blog) (*model.Blog, error) {
	blog.CreatedAt = time.Now()
	if blog.Images == nil {
		blog.Images = make([]string, 0)
	}
	createdBlog, err := s.repo.CreateBlog(ctx, blog)
	if err != nil {
		return nil, err
	}
	return createdBlog, nil
}

func (s *BlogService) LikeBlog(ctx context.Context, blogId string, userId string) (*model.Blog, error) {
	blogFound, err := s.repo.GetById(ctx, blogId)
	if err != nil {
		return nil, err
	}

	for _, existingUserId := range blogFound.Likes {
		if existingUserId == userId {
			return blogFound, nil
		}
	}

	blogFound.Likes = append(blogFound.Likes, userId)

	blogUpdated, err := s.repo.Update(ctx, blogFound)
	if err != nil {
		return nil, err
	}

	return blogUpdated, nil
}
func (s *BlogService) UnlikeBlog(ctx context.Context, blogId string, userId string) (*model.Blog, error) {
	blogFound, err := s.repo.GetById(ctx, blogId)
	if err != nil {
		return nil, err
	}

	indexToRemove := -1
	for i, existingLikeId := range blogFound.Likes {
		if existingLikeId == userId {
			indexToRemove = i
			break
		}
	}

	if indexToRemove != -1 {
		blogFound.Likes = append(blogFound.Likes[:indexToRemove], blogFound.Likes[indexToRemove+1:]...)
		return s.repo.Update(ctx, blogFound)
	}

	return blogFound, nil
}

func (s *BlogService) GetAllBlogs(ctx context.Context) ([]model.Blog, error) {
	blogs, err := s.repo.GetAll(ctx)
	if err != nil {
		return nil, err
	}
	return blogs, nil
}

func (s *BlogService) GetBlogById(ctx context.Context, blogId string) (*model.Blog, error) {
	blog, err := s.repo.GetById(ctx, blogId)
	if err != nil {
		return nil, err
	}

	comments, err := s.repoComment.GetByBlogId(ctx, blogId)
	if err != nil {
		return nil, err
	}

	blog.Comments = make([]model.Comment, 0, len(comments))
	for _, comment := range comments {
		if comment != nil {
			blog.Comments = append(blog.Comments, *comment)
		}
	}

	return blog, nil
}

func (s *BlogService) GetFeedForUser(ctx context.Context, userId string) ([]model.Blog, error) {
	followedResponse, err := s.followingClient.GetFollowingsForUser(ctx, &following_proto.GetFollowingsForUserRequest{Id: userId})
	if err != nil {
		return nil, err
	}

	followedUserIds := followedResponse.GetIds()

	if len(followedUserIds) == 0 {
		return []model.Blog{}, nil
	}

	blogs, err := s.repo.GetAllBlogsForUsers(ctx, followedUserIds)
	if err != nil {
		return nil, err
	}

	return blogs, nil
}

func (s *BlogService) CreateComment(ctx context.Context, comment *model.Comment) (*model.Comment, error) {
	blog, err := s.repo.GetById(ctx, comment.BlogID)
	if err != nil {
		return nil, err
	}
	if blog == nil {
		return nil, errors.New("blog not found")
	}

	followExistsResponse, err := s.followingClient.FollowExists(ctx, &following_proto.FollowExistsRequest{
		FollowerId: comment.UserID,
		FollowedId: blog.AuthorID,
	})
	if err != nil {
		return nil, errors.New("failed to check following status")
	}

	if !followExistsResponse.Exists {
		return nil, errors.New("you must follow the blog author to leave a comment")
	}

	comment.CreatedAt = time.Now()
	comment.LastModified = time.Now()

	createdComment, err := s.repoComment.CreateComment(ctx, comment)
	if err != nil {
		return nil, err
	}
	return createdComment, nil
}

func (s *BlogService) UpdateComment(ctx context.Context, commentId string, userId string, content string) (*model.Comment, error) {
	comment, err := s.repoComment.GetById(ctx, commentId)
	if err != nil {
		return nil, err
	}

	if comment.UserID != userId {
		return nil, errors.New("user is not the author of the comment")
	}

	comment.Content = content
	comment.LastModified = time.Now()
	comment, err = s.repoComment.Update(ctx, comment)
	if err != nil {
		return nil, err
	}
	return comment, nil
}

func (s *BlogService) DeleteUserData(ctx context.Context, userID string) error {
	log.Printf("Attempting to delete all user data for UserID: %s", userID)

	err := s.repo.DeleteAllBlogsByUserID(ctx, userID)
	if err != nil {
		log.Printf("Error deleting blogs for user %s: %v", userID, err)
		return fmt.Errorf("failed to delete blogs: %w", err)
	}
	log.Printf("Successfully deleted blogs for user %s", userID)

	/*	err = s.repoComment.DeleteAllCommentsByUserID(ctx, userID)
		if err != nil {
			log.Printf("Error deleting comments for user %s: %v", userID, err)
			return fmt.Errorf("failed to delete comments: %w", err)
		}
		log.Printf("Successfully deleted comments for user %s", userID)

		err = s.repo.RemoveUserLikesFromAllBlogs(ctx, userID)
		if err != nil {
			log.Printf("Error removing user %s likes from all blogs: %v", userID, err)
			return fmt.Errorf("failed to remove user likes: %w", err)
		}
		log.Printf("Successfully removed likes from all blogs for user %s", userID)*/

	return nil
}

func (s *BlogService) RecoverUserData(ctx context.Context, userID string) error {
	log.Printf("Attempting to recover all user data for UserID: %s", userID)

	err := s.repo.RecoverAllBlogsByUserID(ctx, userID)
	if err != nil {
		log.Printf("Error recovering blogs for user %s: %v", userID, err)
		return fmt.Errorf("failed to recover blogs: %w", err)
	}
	log.Printf("Successfully recovered blogs for user %s", userID)

	/*	err = s.repoComment.DeleteAllCommentsByUserID(ctx, userID)
		if err != nil {
			log.Printf("Error deleting comments for user %s: %v", userID, err)
			return fmt.Errorf("failed to delete comments: %w", err)
		}
		log.Printf("Successfully deleted comments for user %s", userID)

		err = s.repo.RemoveUserLikesFromAllBlogs(ctx, userID)
		if err != nil {
			log.Printf("Error removing user %s likes from all blogs: %v", userID, err)
			return fmt.Errorf("failed to remove user likes: %w", err)
		}
		log.Printf("Successfully removed likes from all blogs for user %s", userID)*/

	return nil
}
func (s *BlogService) GetBlogById(ctx context.Context, id string) (*model.Blog, error) {
	return s.repo.GetById(ctx, id)
}

func (s *BlogService) DeleteBlog(ctx context.Context, id string) error {
	return s.repo.DeleteBlog(ctx, id)
}
