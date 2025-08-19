package handler

import (
	"context"

	"github.com/jelena-ra/touristApp/soa-team-4/Blog/internal/model"
	"github.com/jelena-ra/touristApp/soa-team-4/Blog/internal/service"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"

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

	blogReq := req.GetBlogInput()
	if blogReq == nil {
		return nil, status.Errorf(codes.InvalidArgument, "blog input cannot be empty")
	}

	blog := &model.Blog{
		Title:    blogReq.Title,
		Content:  blogReq.Content,
		AuthorID: blogReq.GetAuthorId(),
		Images:   blogReq.GetImages(),
	}
	createdBlog, err := h.service.CreateBlog(ctx, blog)

	if err != nil {
		return nil, status.Errorf(codes.Internal, "Failed to create blog: %v", err)
	}

	protoBlogRes := &blog_proto.BlogFull{ // nazad u Proto oblik
		Id:            createdBlog.ID.Hex(),
		Title:         createdBlog.Title,
		Content:       createdBlog.Content,
		AuthorId:      createdBlog.AuthorID,
		Images:        createdBlog.Images,
		NumberOfLikes: 0,
		Comments:      make([]*blog_proto.Comment, 0),
	}

	return &blog_proto.CreateBlogResponse{
		BlogPost: protoBlogRes,
	}, nil
}

func (h *BlogHandler) LikeBlog(ctx context.Context, req *blog_proto.LikeBlogRequest) (*blog_proto.LikeBlogResponse, error) {
	id_blog := req.GetBlogId() // Sigurnije je koristiti Gettere
	id_user := req.GetUserId()
	likedBlog, err := h.service.LikeBlog(ctx, id_blog, id_user)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Failed to like blog: %v", err)
	}

	protoComments := make([]*blog_proto.Comment, 0)
	for _, commentModel := range likedBlog.Comments {
		protoComments = append(protoComments, &blog_proto.Comment{
			Id:           commentModel.ID.Hex(),
			UserId:       commentModel.UserID,
			Content:      commentModel.Content,
			CreatedAt:    timestamppb.New(commentModel.CreatedAt),
			LastModified: timestamppb.New(commentModel.LastModified),
		})
	}

	LikedBlogProto := blog_proto.BlogFull{
		Id:            likedBlog.ID.Hex(),
		Title:         likedBlog.Title,
		Content:       likedBlog.Content,
		AuthorId:      likedBlog.AuthorID,
		Images:        likedBlog.Images,
		NumberOfLikes: int32(len(likedBlog.Likes)),
		Comments:      protoComments,
	}

	LikedBlogResponse := &blog_proto.LikeBlogResponse{
		BlogPost: &LikedBlogProto,
	}
	return LikedBlogResponse, nil
}

func (h *BlogHandler) UnlikeBlog(ctx context.Context, req *blog_proto.LikeBlogRequest) (*blog_proto.LikeBlogResponse, error) {
	id_blog := req.GetBlogId()
	id_user := req.GetUserId()
	likedBlog, err := h.service.UnlikeBlog(ctx, id_blog, id_user)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Failed to like blog: %v", err)
	}

	protoComments := make([]*blog_proto.Comment, 0)
	for _, commentModel := range likedBlog.Comments {
		protoComments = append(protoComments, &blog_proto.Comment{
			Id:           commentModel.ID.Hex(),
			UserId:       commentModel.UserID,
			Content:      commentModel.Content,
			CreatedAt:    timestamppb.New(commentModel.CreatedAt),
			LastModified: timestamppb.New(commentModel.LastModified),
		})
	}

	LikedBlogProto := blog_proto.BlogFull{
		Id:            likedBlog.ID.Hex(),
		Title:         likedBlog.Title,
		Content:       likedBlog.Content,
		AuthorId:      likedBlog.AuthorID,
		Images:        likedBlog.Images,
		NumberOfLikes: int32(len(likedBlog.Likes)),
		Comments:      protoComments,
	}

	LikedBlogResponse := &blog_proto.LikeBlogResponse{
		BlogPost: &LikedBlogProto,
	}
	return LikedBlogResponse, nil
}

func (h *BlogHandler) GetAllBlogs(ctx context.Context, req *blog_proto.GetAllBlogsRequest) (*blog_proto.GetAllBlogsResponse, error) {
	blogs, err := h.service.GetAllBlogs(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Failed to get blogs: %v", err)
	}

	protoBlogs := make([]*blog_proto.Blog, 0)

	for _, blog := range blogs {
		protoBlog := &blog_proto.Blog{
			Id:            blog.ID.Hex(),
			Title:         blog.Title,
			Content:       blog.Content,
			AuthorId:      blog.AuthorID,
			Images:        blog.Images,
			NumberOfLikes: int32(len(blog.Likes)),
		}
		protoBlogs = append(protoBlogs, protoBlog)
	}

	return &blog_proto.GetAllBlogsResponse{
		Blogs: protoBlogs,
	}, nil
}

func (h *BlogHandler) CreateComment(ctx context.Context, req *blog_proto.CreateCommentRequest) (*blog_proto.CreateCommentResponse, error) {
	commentReq := req.GetCommentInput()
	if commentReq == nil {
		return nil, status.Errorf(codes.InvalidArgument, "comment input cannot be empty")
	}

	comment := &model.Comment{
		UserID:  commentReq.GetUserId(),
		Content: commentReq.Content,
	}

	createdComment, err := h.service.CreateComment(ctx, comment)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to create comment: %v", err)
	}

	protoCommentRes := &blog_proto.Comment{
		Id:      createdComment.ID.Hex(),
		UserId:  createdComment.UserID,
		Content: createdComment.Content,

		// OVO JE PROMENA: Korišćenje timestamppb.New() funkcije
		CreatedAt:    timestamppb.New(createdComment.CreatedAt),
		LastModified: timestamppb.New(createdComment.LastModified),
	}

	return &blog_proto.CreateCommentResponse{
		Comment: protoCommentRes,
	}, nil
}

func (h *BlogHandler) UpdateComment(ctx context.Context, req *blog_proto.UpdateCommentRequest) (*blog_proto.UpdateCommentResponse, error) {
	updateReq := req.GetCommentInput()
	if updateReq == nil {
		return nil, status.Errorf(codes.InvalidArgument, "comment update input cannot be empty")
	}

	updatedComment, err := h.service.UpdateComment(ctx, updateReq.CommentId, updateReq.UserId, updateReq.Content)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to update comment: %v", err)
	}

	protoCommentRes := &blog_proto.Comment{
		Id:      updatedComment.ID.Hex(),
		UserId:  updatedComment.UserID,
		Content: updatedComment.Content,

		// OVO JE PROMENA: Korišćenje timestamppb.New() funkcije
		CreatedAt:    timestamppb.New(updatedComment.CreatedAt),
		LastModified: timestamppb.New(updatedComment.LastModified),
	}

	return &blog_proto.UpdateCommentResponse{
		Comment: protoCommentRes,
	}, nil
}
