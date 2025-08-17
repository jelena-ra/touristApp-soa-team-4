package service

import (
    "mime/multipart"
    "strconv"
    "github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/repository"
)


type ImageService struct {
    imageRepo *repository.ImageRepository
}


func NewImageService(repo *repository.ImageRepository) *ImageService {
    return &ImageService{imageRepo: repo}
}


func (s *ImageService) UploadImage(file multipart.File, fileHeader *multipart.FileHeader) (string, error) {
    imageID, err := s.imageRepo.SaveImage(file, fileHeader)
    if err != nil {
        return "", err
    }
    return strconv.FormatUint(uint64(imageID), 10), nil

}


func (s *ImageService) GetImage(id string) ([]byte, string, error) {
    imageID, err := strconv.ParseUint(id, 10, 64)
    if err != nil {
        return nil, "", err
    }
    image, err := s.imageRepo.GetImageByID(uint(imageID))
    if err != nil {
        return nil, "", err
    }
    return image.Data, image.ContentType, nil
}

func (s *ImageService) GetImageFilename(id string) ([]byte, string, error) {

    image, err := s.imageRepo.GetImageByFilename(id)
    if err != nil {
        return nil, "", err
    }
    return image.Data, image.ContentType, nil
}