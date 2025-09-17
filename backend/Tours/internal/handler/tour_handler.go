package handler

import (
	"context"
	"log"

	"github.com/jelena-ra/touristApp/soa-team-4/Tours/internal/mapper"
	"github.com/jelena-ra/touristApp/soa-team-4/Tours/internal/service"
	tourProto "github.com/jelena-ra/touristApp/soa-team-4/Tours/proto"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type TourHandler struct {
	tourProto.UnimplementedTourServiceServer
	server *service.TourService
}

func NewTourHandler(service *service.TourService) *TourHandler {
	return &TourHandler{server: service}
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

	modelCreateTour := mapper.TourProtoToModel(crateInfo)
	newTour := must(h.server.Create(ctx, modelCreateTour))
	protoTour := mapper.TourModelToProto(newTour)

	return &tourProto.TourResponse{Tour: protoTour}, nil
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
