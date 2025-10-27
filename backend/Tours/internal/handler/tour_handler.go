package handler

import (
	"context"
	"encoding/base64"
	"fmt"
	"log"
	"os"
	"path"

	stakeholdersProto "github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/proto"
	"github.com/jelena-ra/touristApp/soa-team-4/Tours/internal/mapper"
	"github.com/jelena-ra/touristApp/soa-team-4/Tours/internal/service"
	tourProto "github.com/jelena-ra/touristApp/soa-team-4/Tours/proto"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type TourHandler struct {
	tourProto.UnimplementedTourServiceServer
	server             *service.TourService
	stakeholdersClient stakeholdersProto.StakeholderServiceClient
	executionService   *service.TourExecutionService
}

func NewTourHandler(service *service.TourService, stakeholdersClient stakeholdersProto.StakeholderServiceClient, executionService *service.TourExecutionService) *TourHandler {
	return &TourHandler{
		server:             service,
		stakeholdersClient: stakeholdersClient,
		executionService:   executionService,
	}
}

func (h *TourHandler) GetAllTours(ctx context.Context, req *tourProto.Empty) (*tourProto.TourListResponse, error) {
	allTours := must(h.server.GetAll(ctx))

	protoTours := make([]*tourProto.Tour, len(allTours))
	for i, mt := range allTours {
		protoTours[i] = mapper.TourModelToProto(mt)
	}

	return &tourProto.TourListResponse{Tours: protoTours}, nil
}

func (h *TourHandler) GetTourByID(ctx context.Context, req *tourProto.TourIDRequest) (*tourProto.DetailedTourResponse, error) {
	id := req.GetId()

	if id == "" {
		return nil, status.Error(codes.InvalidArgument, "ID is required")
	}

	tour := must(h.server.GetByID(ctx, id))
	protoTour := mapper.TourModelToProto(tour)

	keyPoints := must(h.server.GetKeyPoints(ctx, id))
	protoKeyPoints := make([]*tourProto.KeyPoint, len(keyPoints))
	for i, point := range keyPoints {
		protoKeyPoints[i] = mapper.KeyPointModelToProto(point)
	}

	return &tourProto.DetailedTourResponse{
		Tour:      protoTour,
		KeyPoints: protoKeyPoints,
	}, nil
}

func (h *TourHandler) CreateTour(ctx context.Context, req *tourProto.CreateTourRequest) (*tourProto.TourResponse, error) {
	crateInfo := req.GetTour()
	log.Printf("crateInfo: %v", crateInfo)
	if crateInfo == nil {
		return nil, status.Error(codes.InvalidArgument, "Tour information is required")
	}

	//TODO check user exists and is author

	modelCreateTour := mapper.TourProtoToModel(crateInfo)
	newTour := must(h.server.Create(ctx, modelCreateTour))
	protoTour := mapper.TourModelToProto(newTour)

	return &tourProto.TourResponse{Tour: protoTour}, nil
}

func (h *TourHandler) UpdateTour(ctx context.Context, req *tourProto.UpdateTourRequest) (*tourProto.UpdateTourResponse, error) {
	log.Println("AAAAAAA Update tour via gRPC")
	updateInfo := req.GetTour()
	if updateInfo == nil {
		return nil, status.Error(codes.InvalidArgument, "Tour information is required")
	}

	log.Println("Update tour via gRPC")

	modelUpdateTour := mapper.TourProtoToModel(updateInfo)
	updatedTour := must(h.server.Update(ctx, modelUpdateTour))
	protoTour := mapper.TourModelToProto(updatedTour)

	log.Println("VRACA ODGOVOR")
	return &tourProto.UpdateTourResponse{Tour: protoTour}, nil
}

func (h *TourHandler) CreateKeyPoint(ctx context.Context, req *tourProto.CreateKeyPointRequest) (*tourProto.CreateKeyPointResponse, error) {
	createInfo := req.GetKeyPoint()
	if createInfo == nil {
		return nil, status.Error(codes.InvalidArgument, "KeyPoint information is required")
	}

	modelCreateInfo := must(mapper.KeyPointProtoToModel(createInfo))

	log.Printf("Received CreateKeyPoint request: %+v\n", req.KeyPoint)
	if req.ImageBase64 != "" {
		log.Println("Image base64 length:", len(req.ImageBase64))
	} else {
		log.Println("No image received")
	}

	if req.GetImageBase64() != "" {
		data, err := base64.StdEncoding.DecodeString(req.GetImageBase64())
		if err != nil {
			return nil, status.Error(codes.InvalidArgument, "Invalid base64 image")
		}

		newID := primitive.NewObjectID()
		filename := fmt.Sprintf("%s.jpg", newID.Hex())
		dir := fmt.Sprintf("/app/uploads/keypoints/%s", newID.Hex())
		err = os.MkdirAll(dir, os.ModePerm)
		if err != nil {
			return nil, err
		}

		filePath := path.Join(dir, filename)
		err = os.WriteFile(filePath, data, 0644)
		if err != nil {
			return nil, status.Error(codes.Internal, "Failed to save image")
		}

		modelCreateInfo.ImageURL = fmt.Sprintf("http://localhost:8000/uploads/keypoints/%s/%s", newID.Hex(), filename)
	}

	newKeyPoint := must(h.server.CreateKeyPoint(ctx, modelCreateInfo))
	protoKeyPoint := mapper.KeyPointModelToProto(newKeyPoint)

	return &tourProto.CreateKeyPointResponse{KeyPoint: protoKeyPoint}, nil
}

func must[T any](val T, err error) T {
	if err != nil {
		panic(status.Error(codes.Internal, err.Error()))
	}
	return val
}
func (h *TourHandler) StartTour(ctx context.Context, req *tourProto.StartTourRequest) (*tourProto.TourExecutionResponse, error) {

	tourId, err := primitive.ObjectIDFromHex(req.GetTourId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "Invalid tour ID format ;)")
	}

	/*touristId, err := primitive.ObjectIDFromHex(req.GetTouristId())
	log.Printf("[Tours Service] Received gRPC StartTour request. Tourist ID from request: %s", req.GetTouristId())
	if err != nil {

		return nil, status.Error(codes.InvalidArgument, "Invalid tourist ID format :)")
	}*/
	touristId := req.GetTouristId()

	position := mapper.PositionProtoToModel(req.GetPosition())

	execution, err := h.executionService.StartTour(tourId, touristId, *position)
	if err != nil {
		return nil, status.Error(codes.Internal, err.Error())
	}

	return mapper.TourExecutionModelToProto(execution), nil
}

func (h *TourHandler) CheckProximity(ctx context.Context, req *tourProto.CheckProximityRequest) (*tourProto.TourExecutionResponse, error) {

	if req.GetId() == "" {
		return nil, status.Error(codes.InvalidArgument, "Execution ID is required")
	}
	if req.GetPosition() == nil {
		return nil, status.Error(codes.InvalidArgument, "Position is required")
	}
	if req.GetTouristId() == "" {
		return nil, status.Error(codes.InvalidArgument, "Tourist ID is required")
	}

	executionId, err := primitive.ObjectIDFromHex(req.GetId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "Invalid execution ID format")
	}

	/*touristId, err := primitive.ObjectIDFromHex(req.GetTouristId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "Invalid tourist ID format")
	}*/
	touristId := req.GetTouristId()

	position := mapper.PositionProtoToModel(req.GetPosition())

	execution, err := h.executionService.CheckProximity(executionId, touristId, *position)
	if err != nil {
		return nil, status.Error(codes.Internal, err.Error())
	}

	return mapper.TourExecutionModelToProto(execution), nil
}

func (h *TourHandler) AbandonTour(ctx context.Context, req *tourProto.TourExecutionRequest) (*tourProto.TourExecutionResponse, error) {

	if req.GetId() == "" {
		return nil, status.Error(codes.InvalidArgument, "Execution ID is required")
	}
	if req.GetTouristId() == "" {
		return nil, status.Error(codes.InvalidArgument, "Tourist ID is required")
	}

	executionId, err := primitive.ObjectIDFromHex(req.GetId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "Invalid execution ID format")
	}

	/*touristId, err := primitive.ObjectIDFromHex(req.GetTouristId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "Invalid tourist ID format")
	}*/
	touristId := req.GetTouristId()

	execution, err := h.executionService.AbandonTour(executionId, touristId)
	if err != nil {
		return nil, status.Error(codes.Internal, err.Error())
	}

	return mapper.TourExecutionModelToProto(execution), nil
}
func (h *TourHandler) GetActiveTour(ctx context.Context, req *tourProto.GetActiveTourRequest) (*tourProto.TourExecutionResponse, error) {

	touristId := req.GetTouristId()
	log.Printf("[Get active tour tur servis] Received request to start tour. Tourist ID from token: %s", touristId)
	execution, err := h.executionService.GetActiveTour(touristId)
	if err != nil {
		return nil, status.Error(codes.NotFound, "No active tour found")
	}

	return mapper.TourExecutionModelToProto(execution), nil
}

func (h *TourHandler) CreateRecension(ctx context.Context, req *tourProto.CreateRecensionRequest) (*tourProto.RecensionResponse, error) {
	createInfo := req.GetRecension()
	if createInfo == nil {
		return nil, status.Error(codes.InvalidArgument, "Recension information is required")
	}

	if createInfo.Rating < 1 || createInfo.Rating > 5 {
		return nil, status.Error(codes.InvalidArgument, "Rating must be between 1 and 5")
	}

	// TODO: Validacija za autora i turu - da li postoje

	modelRecension := must(mapper.RecensionProtoToModel(createInfo))
	newRecension := must(h.server.CreateRecension(ctx, modelRecension))
	protoRecension := mapper.RecensionModelToProto(newRecension)

	return &tourProto.RecensionResponse{Recension: protoRecension}, nil
}

func (h *TourHandler) GetRecensionsByTourID(ctx context.Context, req *tourProto.TourIDRequest) (*tourProto.RecensionListResponse, error) {
	tourID := req.GetId()
	if tourID == "" {
		return nil, status.Error(codes.InvalidArgument, "Tour ID is required")
	}

	recensions := must(h.server.GetRecensionsByTourID(ctx, tourID))
	protoRecensions := make([]*tourProto.Recension, len(recensions))

	for i, recension := range recensions {
		protoRecensions[i] = mapper.RecensionModelToProto(recension)
	}

	return &tourProto.RecensionListResponse{Recensions: protoRecensions}, nil
}

func (h *TourHandler) PublishTour(ctx context.Context, req *tourProto.PublishTourRequest) (*tourProto.PublishTourResponse, error) {
	tourID := req.GetTourId()
	if tourID == "" {
		return nil, status.Error(codes.InvalidArgument, "Tour ID is required")
	}

	message := must(h.server.PublishTour(ctx, tourID))
	return &tourProto.PublishTourResponse{Message: message}, nil
}

func (h *TourHandler) ArchiveTour(ctx context.Context, req *tourProto.ArchiveTourRequest) (*tourProto.ArchiveTourResponse, error) {
	tourID := req.GetTourId()
	if tourID == "" {
		return nil, status.Error(codes.InvalidArgument, "Tour ID is required")
	}

	message := must(h.server.ArchiveTour(ctx, tourID))
	return &tourProto.ArchiveTourResponse{Message: message}, nil
}

func (h *TourHandler) UpdateKeyPoint(ctx context.Context, req *tourProto.UpdateKeyPointRequest) (*tourProto.UpdateKeyPointResponse, error) {

	if req.GetKeyPoint() == nil {
		return nil, status.Error(codes.InvalidArgument, "KeyPoint information is required")
	}

	modelUpdateInfo, err := mapper.KeyPointProtoToModel(req.GetKeyPoint())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, err.Error())
	}

	if req.ImageBase64 != "" {
		log.Println("Image base64 length:", len(req.ImageBase64))
	} else {
		log.Println("No image received")
	}

	if req.GetImageBase64() != "" {
		data, err := base64.StdEncoding.DecodeString(req.GetImageBase64())
		if err != nil {
			return nil, status.Error(codes.InvalidArgument, "Invalid base64 image")
		}

		newID := primitive.NewObjectID()
		filename := fmt.Sprintf("%s.jpg", newID.Hex())
		dir := fmt.Sprintf("/app/uploads/keypoints/%s", newID.Hex())
		err = os.MkdirAll(dir, os.ModePerm)
		if err != nil {
			return nil, err
		}

		filePath := path.Join(dir, filename)
		err = os.WriteFile(filePath, data, 0644)
		if err != nil {
			return nil, status.Error(codes.Internal, "Failed to save image")
		}

		modelUpdateInfo.ImageURL = fmt.Sprintf("http://localhost:8000/uploads/keypoints/%s/%s", newID.Hex(), filename)
	}

	updatedKeyPoint, err := h.server.UpdateKeyPoint(ctx, modelUpdateInfo)
	if err != nil {
		return nil, status.Error(codes.Internal, err.Error())
	}

	protoKeyPoint := mapper.KeyPointModelToProto(updatedKeyPoint)

	return &tourProto.UpdateKeyPointResponse{KeyPoint: protoKeyPoint}, nil
}

func (h *TourHandler) DeleteKeyPoint(ctx context.Context, req *tourProto.DeleteKeyPointRequest) (*tourProto.DeleteKeyPointResponse, error) {

	keyPointId := req.GetKeyPointId()
	if keyPointId == "" {
		return nil, status.Error(codes.InvalidArgument, "KeyPoint ID is required")
	}

	err := h.server.DeleteKeyPoint(ctx, keyPointId)
	if err != nil {
		return nil, status.Error(codes.Internal, err.Error())
	}

	return &tourProto.DeleteKeyPointResponse{Message: "Key point successfully deleted"}, nil
}
