package repository

import (
    "gorm.io/gorm"
    "mime/multipart"
    "io"
    "fmt"
)

type Image struct {
    gorm.Model
    Filename string
    Data        []byte
    ContentType string
}


type ImageRepository struct {
    db *gorm.DB
}


func NewImageRepository(db *gorm.DB) *ImageRepository {
    return &ImageRepository{db: db}
}


func (r *ImageRepository) SaveImage(file multipart.File, fileHeader *multipart.FileHeader) (uint, error) {
    imageData, err := io.ReadAll(file)
    if err != nil {
        return 0, err
    }

    image := Image{
        Filename: fileHeader.Filename,
        Data:        imageData,
        ContentType: fileHeader.Header.Get("Content-Type"),
    }

    if err := r.db.Create(&image).Error; err != nil {
        return 0, err
    }
    image.Filename = fmt.Sprintf("%s", fileHeader.Filename)
    r.db.Save(&image)
    
    return image.ID, nil
}


func (r *ImageRepository) GetImageByID(id uint) (*Image, error) {
    var image Image
    if err := r.db.First(&image, id).Error; err != nil {
        return nil, err
    }
    return &image, nil
}

func (r *ImageRepository) GetImageByFilename(filename string) (*Image, error) {
    var image Image
    if err := r.db.Where("filename = ?", filename).First(&image).Error; err != nil {
        return nil, err
    }
    return &image, nil
}
