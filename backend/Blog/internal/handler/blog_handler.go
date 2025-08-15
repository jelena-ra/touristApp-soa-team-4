package handler

import (
	"context"

	"github.com/jelena-ra/touristApp/soa-team-4/Blog/internal/model"
	"github.com/jelena-ra/touristApp/soa-team-4/Blog/internal/service"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	blog_proto "github.com/jelena-ra/touristApp/soa-team-4/Blog/proto"
)

type BlogHandler struct {
	blog_proto.UnimplementedBlogServiceServer
	service *service.BlogService
}

func NewBlogHandler(service *service.BlogService) *BlogHandler {
	return &BlogHandler{service: service}
}

func (h *BlogHandler) CreateBlog(ctx context.Context, req *blog_proto.CreateBlogRequest) (*blog_proto.CreateBlogResponse, error) {

	blogReq := req.GetBlogPost()
	if blogReq == nil {
		return nil, status.Errorf(codes.InvalidArgument, "CreateBlogRequest.BlogPost cannot be empty")
	}

	blog := &model.Blog{
		Title:    blogReq.Title,
		Content:  blogReq.Content,
		AuthorID: int(blogReq.GetAuthorId()),
	}
	createdBlog, err := h.service.CreateBlog(ctx, blog)

	if err != nil {
		return nil, status.Errorf(codes.Internal, "Failed to create blog: %v", err)
	}

	protoBlogRes := &blog_proto.Blog{ // nazad u Proto oblik
		Id:       createdBlog.ID.Hex(),
		Title:    createdBlog.Title,
		Content:  createdBlog.Content,
		AuthorId: int32(createdBlog.AuthorID),
	}

	return &blog_proto.CreateBlogResponse{
		BlogPost: protoBlogRes,
	}, nil
}
