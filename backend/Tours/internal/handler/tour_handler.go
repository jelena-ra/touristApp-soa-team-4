package handler

import (
	"context"
	"log"

	stakeholdersProto "github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/proto"
	"github.com/jelena-ra/touristApp/soa-team-4/Tours/internal/mapper"
	"github.com/jelena-ra/touristApp/soa-team-4/Tours/internal/service"
	tourProto "github.com/jelena-ra/touristApp/soa-team-4/Tours/proto"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type TourHandler struct {
	tourProto.UnimplementedTourServiceServer
	server             *service.TourService
	stakeholdersClient stakeholdersProto.StakeholderServiceClient
}

func NewTourHandler(service *service.TourService, stakeholdersClient stakeholdersProto.StakeholderServiceClient) *TourHandler {
	return &TourHandler{
		server:             service,
		stakeholdersClient: stakeholdersClient,
	}
}

func (h *TourHandler) GetAllTours(ctx context.Context, req *tourProto.Empty) (*tourProto.TourListResponse, error) {
	allTours, err := h.server.GetAll(ctx)
	if err != nil {
		return nil, status.Error(codes.Internal, err.Error())
	}

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

	tour, err := h.server.GetByID(ctx, id)
	if err != nil {
		return nil, status.Error(codes.Internal, err.Error())
	}
	protoTour := mapper.TourModelToProto(tour)

	keyPoints, err := h.server.GetKeyPoints(ctx, id)
	if err != nil {
		return nil, status.Error(codes.Internal, err.Error())
	}
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
	newTour, err := h.server.Create(ctx, modelCreateTour)
	if err != nil {
		return nil, status.Error(codes.Internal, err.Error())
	}
	protoTour := mapper.TourModelToProto(newTour)

	return &tourProto.TourResponse{Tour: protoTour}, nil
}

func (h *TourHandler) CreateKeyPoint(ctx context.Context, req *tourProto.CreateKeyPointRequest) (*tourProto.CreateKeyPointResponse, error) {
	createInfo := req.GetKeyPoint()
	if createInfo == nil {
		return nil, status.Error(codes.InvalidArgument, "KeyPoint information is required")
	}

	modelCreateInfo, err := mapper.KeyPointProtoToModel(createInfo)
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, err.Error())
	}
	newKeyPoint, err := h.server.CreateKeyPoint(ctx, modelCreateInfo)
	if err != nil {
		return nil, status.Error(codes.Internal, err.Error())
	}
	protoKeyPoint := mapper.KeyPointModelToProto(newKeyPoint)

	return &tourProto.CreateKeyPointResponse{KeyPoint: protoKeyPoint}, nil
}

func (h *TourHandler) CreateRecension(ctx context.Context, req *tourProto.CreateRecensionRequest) (*tourProto.RecensionResponse, error) {
	createInfo := req.GetRecension()
	if createInfo == nil {
		return nil, status.Error(codes.InvalidArgument, "Recension information is required")
	}

	// Validate rating range (1-5)
	if createInfo.Rating < 1 || createInfo.Rating > 5 {
		return nil, status.Error(codes.InvalidArgument, "Rating must be between 1 and 5")
	}

	// TODO: Validate that the author exists and is authenticated

	modelRecension, err := mapper.RecensionProtoToModel(createInfo)
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, err.Error())
	}
	newRecension, err := h.server.CreateRecension(ctx, modelRecension)
	if err != nil {
		return nil, status.Error(codes.Internal, err.Error())
	}
	protoRecension := mapper.RecensionModelToProto(newRecension)

	return &tourProto.RecensionResponse{Recension: protoRecension}, nil
}

func (h *TourHandler) GetRecensionsByTourID(ctx context.Context, req *tourProto.TourIDRequest) (*tourProto.RecensionListResponse, error) {
	tourID := req.GetId()
	if tourID == "" {
		return nil, status.Error(codes.InvalidArgument, "Tour ID is required")
	}

	recensions, err := h.server.GetRecensionsByTourID(ctx, tourID)
	if err != nil {
		return nil, status.Error(codes.Internal, err.Error())
	}
	protoRecensions := make([]*tourProto.Recension, len(recensions))

	for i, recension := range recensions {
		protoRecensions[i] = mapper.RecensionModelToProto(recension)
	}

	return &tourProto.RecensionListResponse{Recensions: protoRecensions}, nil
}
