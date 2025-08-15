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
