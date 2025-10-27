package service

import (
	"bytes"
	"context"
	"os"
	"path/filepath"

	"github.com/google/uuid"
	"github.com/jelena-ra/touristApp/soa-team-4/Blog/internal/repository"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

const (
	imageStorePath = "/app/images"
)

type ImageService struct {
	blogRepo repository.BlogRepository
}

func NewImageService(blogRepo repository.BlogRepository) *ImageService {
	return &ImageService{
		blogRepo: blogRepo,
	}
}

func (s *ImageService) SaveImage(ctx context.Context, blogID primitive.ObjectID, imageType string, imageData *bytes.Buffer) (string, error) {
	fileName := uuid.New().String() + "." + imageType
	filePath := filepath.Join(imageStorePath, fileName)

	if err := os.MkdirAll(imageStorePath, os.ModePerm); err != nil {
		return "", err
	}

	if err := os.WriteFile(filePath, imageData.Bytes(), 0644); err != nil {
		return "", err
	}

	if err := s.blogRepo.AddImageToBlog(ctx, blogID, fileName); err != nil {
		os.Remove(filePath)
		return "", err
	}

	return fileName, nil
}
