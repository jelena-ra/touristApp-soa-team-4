package service

import (
	"context"


	"github.com/jelena-ra/touristApp/soa-team-4/Blog/internal/model" 
	"github.com/jelena-ra/touristApp/soa-team-4/Blog/internal/repository"
)
type BlogService struct {
	repo *repository.BlogRepository
}

func NewBlogService(repo *repository.BlogRepository) *BlogService {
	return &BlogService{repo: repo}
}
func (s *BlogService) CreateBlog(ctx context.Context, blog *model.Blog) error {


    return s.repo.CreateBlog(ctx, blog)
}