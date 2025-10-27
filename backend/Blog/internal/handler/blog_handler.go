package handler

import (
	"bytes"
	"context"
	"io"
	"log"
	"time"

	pb "github.com/jelena-ra/touristApp/soa-team-4/Blog/proto"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/jelena-ra/touristApp/soa-team-4/Blog/internal/model"
	"github.com/jelena-ra/touristApp/soa-team-4/Blog/internal/service"
	blog_proto "github.com/jelena-ra/touristApp/soa-team-4/Blog/proto"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"
)

const maxImageSize = 5 << 20

type BlogHandler struct {
	blog_proto.UnimplementedBlogServiceServer
	service      *service.BlogService
	imageService *service.ImageService
}

func NewBlogHandler(service *service.BlogService, imageService *service.ImageService) *BlogHandler {
	return &BlogHandler{service: service, imageService: imageService}
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
		Deleted:  false,
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
		Deleted:       false,
		Likes:         createdBlog.Likes,
	}

	return &blog_proto.CreateBlogResponse{
		BlogPost: protoBlogRes,
	}, nil
}

func (h *BlogHandler) LikeBlog(ctx context.Context, req *blog_proto.LikeBlogRequest) (*blog_proto.LikeBlogResponse, error) {
	id_blog := req.GetBlogId()
	id_user := req.GetUserId()
	likedBlog, err := h.service.LikeBlog(ctx, id_blog, id_user)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Failed to like blog: %v", err)
	}

	protoComments := make([]*blog_proto.Comment, 0)
	for _, commentModel := range likedBlog.Comments {
		protoComments = append(protoComments, &blog_proto.Comment{
			Id:           commentModel.ID.Hex(),
			BlogId:       commentModel.BlogID,
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
		Deleted:       false,
		Likes:         likedBlog.Likes,
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
			BlogId:       commentModel.BlogID,
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
		Likes:         likedBlog.Likes,
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
			Deleted:       blog.Deleted,
		}
		protoBlogs = append(protoBlogs, protoBlog)
	}

	return &blog_proto.GetAllBlogsResponse{
		Blogs: protoBlogs,
	}, nil
}

func (h *BlogHandler) GetBlogById(ctx context.Context, req *blog_proto.GetBlogRequest) (*blog_proto.GetBlogResponse, error) {
	blogId := req.GetId()
	if blogId == "" {
		return nil, status.Errorf(codes.InvalidArgument, "blog id cannot be empty")
	}

	blog, err := h.service.GetBlogById(ctx, blogId)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Failed to get blog: %v", err)
	}

	// build BlogFull for GetBlogById (BlogFull contains Likes and Comments)
	protoComments := make([]*blog_proto.Comment, 0)
	for _, commentModel := range blog.Comments {
		protoComments = append(protoComments, &blog_proto.Comment{
			Id:           commentModel.ID.Hex(),
			BlogId:       commentModel.BlogID,
			UserId:       commentModel.UserID,
			Content:      commentModel.Content,
			CreatedAt:    timestamppb.New(commentModel.CreatedAt),
			LastModified: timestamppb.New(commentModel.LastModified),
		})
	}

	protoBlogFull := &blog_proto.BlogFull{
		Id:            blog.ID.Hex(),
		Title:         blog.Title,
		Content:       blog.Content,
		AuthorId:      blog.AuthorID,
		Images:        blog.Images,
		NumberOfLikes: int32(len(blog.Likes)),
		Comments:      protoComments,
		Likes:         blog.Likes,
	}

	return &blog_proto.GetBlogResponse{
		BlogPost: protoBlogFull,
	}, nil
}

func (h *BlogHandler) GetFeedForUser(ctx context.Context, req *blog_proto.GetFeedForUserRequest) (*blog_proto.GetAllBlogsResponse, error) {
	userIds := req.GetUserId()

	if len(userIds) == 0 {
		return &pb.GetAllBlogsResponse{Blogs: []*pb.Blog{}}, nil
	}

	blogs, err := h.service.GetFeedForUser(ctx, userIds)
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
		ID:           primitive.ObjectID{},
		BlogID:       commentReq.BlogId,
		UserID:       commentReq.UserId,
		Content:      commentReq.Content,
		CreatedAt:    time.Now(),
		LastModified: time.Now(),
	}

	createdComment, err := h.service.CreateComment(ctx, comment)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to create comment: %v", err)
	}

	protoCommentRes := &blog_proto.Comment{
		Id:           createdComment.ID.Hex(),
		BlogId:       createdComment.BlogID,
		UserId:       createdComment.UserID,
		Content:      createdComment.Content,
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
		Id:           updatedComment.ID.Hex(),
		BlogId:       updatedComment.BlogID,
		UserId:       updatedComment.UserID,
		Content:      updatedComment.Content,
		CreatedAt:    timestamppb.New(updatedComment.CreatedAt),
		LastModified: timestamppb.New(updatedComment.LastModified),
	}

	return &blog_proto.UpdateCommentResponse{
		Comment: protoCommentRes,
	}, nil
}

func (h *BlogHandler) UploadImage(stream pb.BlogService_UploadImageServer) error {
	req, err := stream.Recv()
	if err != nil {
		return status.Errorf(codes.InvalidArgument, "Ne mogu pročitati info: %v", err)
	}

	imageInfo := req.GetInfo()
	if imageInfo == nil {
		return status.Errorf(codes.InvalidArgument, "Prva poruka mora sadržati info")
	}

	blogID, err := primitive.ObjectIDFromHex(imageInfo.GetBlogId())
	if err != nil {
		return status.Errorf(codes.InvalidArgument, "Nevažeći Blog ID")
	}

	imageData := bytes.Buffer{}
	for {
		req, err := stream.Recv()
		if err == io.EOF {
			break
		}
		if err != nil {
			return status.Errorf(codes.Internal, "Greška pri čitanju: %v", err)
		}
		chunk := req.GetChunkData()
		if len(imageData.Bytes())+len(chunk) > maxImageSize {
			return status.Errorf(codes.InvalidArgument, "Slika je prevelika")
		}
		imageData.Write(chunk)
	}

	fileName, err := h.imageService.SaveImage(stream.Context(), blogID, imageInfo.GetImageType(), &imageData)
	if err != nil {
		log.Printf("Greška pri čuvanju slike: %v", err)
		return status.Errorf(codes.Internal, "Greška pri čuvanju slike")
	}

	res := &pb.UploadImageResponse{
		FileName: fileName,
		Size:     uint64(imageData.Len()),
	}
	return stream.SendAndClose(res)
}
