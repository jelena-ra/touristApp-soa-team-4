package handler

import (
	"context"
	"log"

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
	updateInfo := req.GetTour()
	if updateInfo == nil {
		return nil, status.Error(codes.InvalidArgument, "Tour information is required")
	}

	//TODO check user exists and is author

	modelUpdateTour := mapper.TourProtoToModel(updateInfo)
	updatedTour := must(h.server.Update(ctx, modelUpdateTour))
	protoTour := mapper.TourModelToProto(updatedTour)

	return &tourProto.UpdateTourResponse{Tour: protoTour}, nil
}

func (h *TourHandler) CreateKeyPoint(ctx context.Context, req *tourProto.CreateKeyPointRequest) (*tourProto.CreateKeyPointResponse, error) {
	createInfo := req.GetKeyPoint()
	if createInfo == nil {
		return nil, status.Error(codes.InvalidArgument, "KeyPoint information is required")
	}

	modelCreateInfo := must(mapper.KeyPointProtoToModel(createInfo))
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
	// 1. Parsiraj ID ture iz gRPC zahteva
	tourId, err := primitive.ObjectIDFromHex(req.GetTourId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "Invalid tour ID format")
	}

	// 2. Izvuci ID turiste (simulacija)
	touristIdStr := "60d5ec49e0f3e82a8b4104a3"
	touristId, err := primitive.ObjectIDFromHex(touristIdStr)
	if err != nil {
		return nil, status.Error(codes.Unauthenticated, "Invalid user ID")
	}

	// 3. Mapiraj poziciju iz proto u model
	position := mapper.PositionProtoToModel(req.GetPosition())

	// 4. Pozovi servis (koji si već dodala u TourHandler)
	execution, err := h.executionService.StartTour(tourId, touristId, *position)
	if err != nil {
		return nil, status.Error(codes.Internal, err.Error())
	}

	// 5. Mapiraj rezultat nazad u proto odgovor
	return mapper.TourExecutionModelToProto(execution), nil
}
func (h *TourHandler) CheckProximity(ctx context.Context, req *tourProto.CheckProximityRequest) (*tourProto.TourExecutionResponse, error) {
	// 1. Validacija
	if req.GetId() == "" {
		return nil, status.Error(codes.InvalidArgument, "Execution ID is required")
	}
	if req.GetPosition() == nil {
		return nil, status.Error(codes.InvalidArgument, "Position is required")
	}

	// 2. Parsiranje ID-ja sesije
	executionId, err := primitive.ObjectIDFromHex(req.GetId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "Invalid execution ID format")
	}

	// 3. Dobijanje ID-ja turiste (simulacija)
	touristIdStr := "60d5ec49e0f3e82a8b4104a3" // !! PRIMER !!
	touristId, err := primitive.ObjectIDFromHex(touristIdStr)
	if err != nil {
		return nil, status.Error(codes.Unauthenticated, "Invalid user ID")
	}

	// 4. Mapiranje pozicije iz proto u model
	position := mapper.PositionProtoToModel(req.GetPosition())

	// 5. Poziv executionService-a
	execution, err := h.executionService.CheckProximity(executionId, touristId, *position)
	if err != nil {
		return nil, status.Error(codes.Internal, err.Error())
	}

	// 6. Mapiranje rezultata nazad u proto odgovor
	return mapper.TourExecutionModelToProto(execution), nil
}
