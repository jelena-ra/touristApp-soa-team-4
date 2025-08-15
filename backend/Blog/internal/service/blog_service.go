package service

import (
	"context"
	"time"

	"github.com/jelena-ra/touristApp/soa-team-4/Blog/internal/model"
	"github.com/jelena-ra/touristApp/soa-team-4/Blog/internal/repository"
)

type BlogService struct {
	repo repository.BlogRepository
}

func NewBlogService(repo repository.BlogRepository) *BlogService {
	return &BlogService{repo: repo}
}

func (s *BlogService) CreateBlog(ctx context.Context, blog *model.Blog) (*model.Blog, error) {
	blog.CreatedAt = time.Now()
	createdBlog, err := s.repo.CreateBlog(ctx, blog)
	if err != nil {
		return nil, err
	}
	return createdBlog, nil
}

func (s *BlogService) LikeBlog(ctx context.Context, id_blog string, id_user int) (*model.Blog, error) {
	blogFound, err := s.repo.GetById(ctx, id_blog)
	if err != nil {
		return nil, err
	}
	blogFound.Likes = append(blogFound.Likes, id_user)
	blogUpdated, err := s.repo.Update(ctx, blogFound)
	if err != nil {
		return nil, err
	}
	return blogUpdated, nil
}

func (s *BlogService) UnlikeBlog(ctx context.Context, blogId string, userId int) (*model.Blog, error) {
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
