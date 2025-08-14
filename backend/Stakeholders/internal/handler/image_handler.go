package handler

import (
    "net/http"
    "github.com/gorilla/mux"
    "github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/service"
)


type ImageHandler struct {
    imageService *service.ImageService
}


func NewImageHandler(service *service.ImageService) *ImageHandler {
    return &ImageHandler{imageService: service}
}

func (h *ImageHandler) UploadImageHandler(w http.ResponseWriter, r *http.Request) {
    file, fileHeader, err := r.FormFile("file")
    if err != nil {
        http.Error(w, "Failed to get file from form data", http.StatusBadRequest)
        return
    }
    defer file.Close()

    imageID, err := h.imageService.UploadImage(file, fileHeader)
    if err != nil {
        http.Error(w, "Failed to save image", http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusOK)
    w.Write([]byte(imageID))
}


func (h *ImageHandler) GetImageHandler(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    imageID := vars["id"]

    imageData, contentType, err := h.imageService.GetImage(imageID)
    if err != nil {
        http.Error(w, "Image not found", http.StatusNotFound)
        return
    }

    w.Header().Set("Content-Type", contentType)
    w.Write(imageData)
}