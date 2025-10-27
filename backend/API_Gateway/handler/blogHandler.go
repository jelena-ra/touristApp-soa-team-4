package handler

import (
	"context"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"path/filepath"
	"time"

	"github.com/gorilla/mux"
	blog_proto "github.com/jelena-ra/touristApp/soa-team-4/Blog/proto"
)

type BlogHandler struct {
	client blog_proto.BlogServiceClient
}

func NewBlogHandler(client blog_proto.BlogServiceClient) *BlogHandler {
	return &BlogHandler{client: client}
}

func (h *BlogHandler) GetBlogByIdHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	blogID, ok := vars["blogId"]
	if !ok {
		http.Error(w, "Blog ID is missing in URL", http.StatusBadRequest)
		return
	}

	grpcRequest := &blog_proto.GetBlogRequest{
		Id: blogID,
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	resp, err := h.client.GetBlogById(ctx, grpcRequest)
	if err != nil {
		log.Printf("Failed to get blog by id via gRPC: %v", err)
		http.Error(w, "Failed to get blog", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(resp.GetBlogPost()); err != nil {
		log.Printf("Failed to encode response: %v", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}

func (h *BlogHandler) GetAllBlogsHandler(w http.ResponseWriter, r *http.Request) {

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	resp, err := h.client.GetAllBlogs(ctx, &blog_proto.GetAllBlogsRequest{})
	if err != nil {
		log.Printf("Failed to get all blogs via gRPC: %v", err)
		http.Error(w, "Failed to get blogs", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(resp.GetBlogs()); err != nil {
		log.Printf("Failed to encode response: %v", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}

func (h *BlogHandler) CreateBlogHandler(w http.ResponseWriter, r *http.Request) {
	// Definise se privremena struktura za dekodiranje JSON-a
	var reqBody struct {
		BlogInput map[string]interface{} `json:"blogInput"`
	}

	// Dekodiranje JSON tela zahteva u privremenu mapu
	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		log.Printf("Failed to decode request body: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Provera da li postoji ugnježdeni 'blogInput' objekat
	if reqBody.BlogInput == nil {
		log.Println("blogInput is missing from the request body")
		http.Error(w, "Required fields are missing", http.StatusBadRequest)
		return
	}

	// Kreira se gRPC zahtev sa ugnježdenim blogInput-om
	blogInput := &blog_proto.CreateBlogInput{
		Title:    reqBody.BlogInput["title"].(string),
		Content:  reqBody.BlogInput["content"].(string),
		AuthorId: reqBody.BlogInput["authorId"].(string),
	}

	// Provera da li su obavezna polja popunjena
	if blogInput.Title == "" || blogInput.Content == "" || blogInput.AuthorId == "" {
		http.Error(w, "Required fields are missing", http.StatusBadRequest)
		return
	}

	// Dohvaćanje i konverzija niza slika
	if images, ok := reqBody.BlogInput["images"].([]interface{}); ok {
		for _, img := range images {
			if strImg, ok := img.(string); ok {
				blogInput.Images = append(blogInput.Images, strImg)
			}
		}
	}

	// Poziv gRPC metode CreateBlog
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	resp, err := h.client.CreateBlog(ctx, &blog_proto.CreateBlogRequest{
		BlogInput: blogInput,
	})
	if err != nil {
		log.Printf("Failed to create blog via gRPC: %v", err)
		http.Error(w, "Failed to create blog", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(resp.GetBlogPost()); err != nil {
		log.Printf("Failed to encode response: %v", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}

func (h *BlogHandler) LikeBlogHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	blogID := vars["blogId"]
	userID := vars["userId"]

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	resp, err := h.client.LikeBlog(ctx, &blog_proto.LikeBlogRequest{BlogId: blogID, UserId: userID})
	if err != nil {
		log.Printf("Failed to like blog via gRPC: %v", err)
		http.Error(w, "Failed to like blog", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(resp.GetBlogPost()); err != nil {
		log.Printf("Failed to encode response: %v", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}

func (h *BlogHandler) UnlikeBlogHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	blogID := vars["blogId"]
	userID := vars["userId"]

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	resp, err := h.client.UnlikeBlog(ctx, &blog_proto.LikeBlogRequest{BlogId: blogID, UserId: userID})
	if err != nil {
		log.Printf("Failed to unlike blog via gRPC: %v", err)
		http.Error(w, "Failed to unlike blog", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(resp.GetBlogPost()); err != nil {
		log.Printf("Failed to encode response: %v", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}

func (h *BlogHandler) CreateCommentHandler(w http.ResponseWriter, r *http.Request) {
	var reqBody struct {
		CommentInput map[string]interface{} `json:"commentInput"`
	}

	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		log.Printf("Failed to decode request body: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if reqBody.CommentInput == nil {
		log.Println("commentInput is missing from the request body")
		http.Error(w, "Required fields are missing", http.StatusBadRequest)
		return
	}

	blogId, ok1 := reqBody.CommentInput["blogId"].(string)
	userId, ok2 := reqBody.CommentInput["userId"].(string)
	content, ok3 := reqBody.CommentInput["content"].(string)

	if !ok1 || !ok2 || !ok3 {
		log.Println("One or more required fields are missing or have an incorrect type in commentInput")
		http.Error(w, "Required fields are missing or invalid", http.StatusBadRequest)
		return
	}

	commentInput := &blog_proto.CreateCommentInput{
		BlogId:  blogId,
		UserId:  userId,
		Content: content,
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	resp, err := h.client.CreateComment(ctx, &blog_proto.CreateCommentRequest{
		CommentInput: commentInput,
	})
	if err != nil {
		log.Printf("Failed to create comment via gRPC: %v", err)
		http.Error(w, "Failed to create comment", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(resp.GetComment()); err != nil {
		log.Printf("Failed to encode response: %v", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}

func (h *BlogHandler) UpdateCommentHandler(w http.ResponseWriter, r *http.Request) {
	var reqBody struct {
		CommentInput map[string]interface{} `json:"commentInput"`
	}

	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		log.Printf("Failed to decode request body: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if reqBody.CommentInput == nil {
		log.Println("commentInput is missing from the request body")
		http.Error(w, "Required fields are missing", http.StatusBadRequest)
		return
	}

	commentInput := &blog_proto.UpdateCommentInput{
		CommentId: reqBody.CommentInput["commentId"].(string),
		UserId:    reqBody.CommentInput["userId"].(string),
		Content:   reqBody.CommentInput["content"].(string),
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	resp, err := h.client.UpdateComment(ctx, &blog_proto.UpdateCommentRequest{
		CommentInput: commentInput,
	})
	if err != nil {
		log.Printf("Failed to create comment via gRPC: %v", err)
		http.Error(w, "Failed to create comment", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(resp.GetComment()); err != nil {
		log.Printf("Failed to encode response: %v", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}

func (h *BlogHandler) GetFeedForUserHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID, ok := vars["userId"]
	if !ok {
		http.Error(w, "User ID is missing in URL", http.StatusBadRequest)
		return
	}

	grpcRequest := &blog_proto.GetFeedForUserRequest{
		UserId: userID,
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	resp, err := h.client.GetFeedForUser(ctx, grpcRequest)
	if err != nil {
		log.Printf("Failed to get feed for user via gRPC: %v", err)
		http.Error(w, "Failed to get feed", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(resp.GetBlogs()); err != nil {
		log.Printf("Failed to encode response: %v", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}

func (h *BlogHandler) UploadImageHandler(w http.ResponseWriter, r *http.Request) {
	// 1. Dobavi blogId iz URL-a
	vars := mux.Vars(r)
	blogID, ok := vars["blogId"]
	if !ok {
		http.Error(w, "Blog ID is missing in URL", http.StatusBadRequest)
		return
	}

	// 2. Parsiraj multipart formu. 10 << 20 limitira upload na 10 MB.
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		http.Error(w, "Image is too large", http.StatusBadRequest)
		return
	}

	// 3. Dobavi fajl iz forme. "image" je ključ (name) u form-data.
	file, handler, err := r.FormFile("image")
	if err != nil {
		http.Error(w, "Failed to retrieve image from request", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// 4. Pokreni gRPC stream ka blog-servisu
	ctx, cancel := context.WithTimeout(r.Context(), 30*time.Second) // Duži timeout za upload
	defer cancel()

	stream, err := h.client.UploadImage(ctx)
	if err != nil {
		log.Printf("Failed to start gRPC stream: %v", err)
		http.Error(w, "Failed to connect to image service", http.StatusInternalServerError)
		return
	}

	// 5. Pošalji prvu poruku sa metapodacima (info)
	imageType := filepath.Ext(handler.Filename) // Dobavlja ekstenziju, npr. ".jpg"
	req := &blog_proto.UploadImageRequest{
		Data: &blog_proto.UploadImageRequest_Info{
			Info: &blog_proto.ImageInfo{
				BlogId:    blogID,
				ImageType: imageType[1:], // Uklanjamo tačku sa početka
			},
		},
	}
	if err := stream.Send(req); err != nil {
		log.Printf("Failed to send image info: %v", err)
		http.Error(w, "Failed to send image metadata", http.StatusInternalServerError)
		return
	}

	// 6. Čitaj fajl u delovima (chunks) i šalji preko streama
	buffer := make([]byte, 1024) // 1 KB buffer
	for {
		n, err := file.Read(buffer)
		if err == io.EOF {
			break // Stigli smo do kraja fajla
		}
		if err != nil {
			log.Printf("Failed to read chunk from file: %v", err)
			http.Error(w, "Failed to process image", http.StatusInternalServerError)
			return
		}

		req = &blog_proto.UploadImageRequest{
			Data: &blog_proto.UploadImageRequest_ChunkData{
				ChunkData: buffer[:n],
			},
		}
		if err := stream.Send(req); err != nil {
			log.Printf("Failed to send chunk: %v", err)
			http.Error(w, "Failed to upload image chunk", http.StatusInternalServerError)
			return
		}
	}

	// 7. Zatvori stream i primi odgovor od servera
	resp, err := stream.CloseAndRecv()
	if err != nil {
		log.Printf("Failed to close stream and receive response: %v", err)
		http.Error(w, "Failed to finalize image upload", http.StatusInternalServerError)
		return
	}

	// 8. Pošalji uspešan odgovor klijentu
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
