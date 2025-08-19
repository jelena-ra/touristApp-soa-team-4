package service

import (
	"context"
	"errors"
	"time"

	"github.com/jelena-ra/touristApp/soa-team-4/Blog/internal/model"
	"github.com/jelena-ra/touristApp/soa-team-4/Blog/internal/repository"
)

type BlogService struct {
	repo        repository.BlogRepository
	repoComment repository.CommentRepository
}

func NewBlogService(repo repository.BlogRepository, repoComment repository.CommentRepository) *BlogService {
	return &BlogService{repo: repo, repoComment: repoComment}
}

func (s *BlogService) CreateBlog(ctx context.Context, blog *model.Blog) (*model.Blog, error) {
	blog.CreatedAt = time.Now()
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

func (s *BlogService) CreateComment(ctx context.Context, comment *model.Comment) (*model.Comment, error) {
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
