package handler

import (
    "context"
    "github.com/jelena-ra/touristApp/soa-team-4/Blog/internal/service"

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
    // 1. Pretvara gRPC poruku u interni Go model
    // blogPostModel := &model.BlogPost{
    //     Title: req.GetTitle(),
    //     Content: req.GetContent(),
    // }

    // 2. Poziva servisni sloj s Go modelom
    // err := h.service.CreateBlog(ctx, blogPostModel)

    // 3. Pretvara Go model nazad u gRPC poruku za odgovor
    // return &blog_proto.CreateBlogResponse{ ... }, nil
    return nil, nil // placeholder
}