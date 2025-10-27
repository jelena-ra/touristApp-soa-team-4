package mapper

import (
	"github.com/jelena-ra/touristApp/soa-team-4/Tours/internal/model"
	tourProto "github.com/jelena-ra/touristApp/soa-team-4/Tours/proto"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

var modelToProtoDifficulty = map[model.TourDifficulty]tourProto.TourDifficulty{
	model.Easy:   tourProto.TourDifficulty_EASY,
	model.Medium: tourProto.TourDifficulty_MEDIUM,
	model.Hard:   tourProto.TourDifficulty_HARD,
}

var protoToModelDifficulty = map[tourProto.TourDifficulty]model.TourDifficulty{
	tourProto.TourDifficulty_EASY:   model.Easy,
	tourProto.TourDifficulty_MEDIUM: model.Medium,
	tourProto.TourDifficulty_HARD:   model.Hard,
}

var modelToProtoTag = map[model.TourTag]tourProto.TourTag{
	model.Nature:     tourProto.TourTag_Nature,
	model.Historical: tourProto.TourTag_Historical,
	model.Adventure:  tourProto.TourTag_Adventure,
	model.Cultural:   tourProto.TourTag_Cultural,
	model.Wildlife:   tourProto.TourTag_Wildlife,
	model.Relaxation: tourProto.TourTag_Relaxation,
	model.Beach:      tourProto.TourTag_Beach,
	model.Mountain:   tourProto.TourTag_Mountain,
	model.Urban:      tourProto.TourTag_Urban,
}

var protoToModelTag = map[tourProto.TourTag]model.TourTag{
	tourProto.TourTag_Nature:     model.Nature,
	tourProto.TourTag_Historical: model.Historical,
	tourProto.TourTag_Adventure:  model.Adventure,
	tourProto.TourTag_Cultural:   model.Cultural,
	tourProto.TourTag_Wildlife:   model.Wildlife,
	tourProto.TourTag_Relaxation: model.Relaxation,
	tourProto.TourTag_Beach:      model.Beach,
	tourProto.TourTag_Mountain:   model.Mountain,
	tourProto.TourTag_Urban:      model.Urban,
}

var modelToProtoStatus = map[model.TourStatus]tourProto.TourStatus{
	model.Draft:     tourProto.TourStatus_DRAFT,
	model.Published: tourProto.TourStatus_PUBLISHED,
	model.Archived:  tourProto.TourStatus_ARCHIVED,
}

var protoToModelStatus = map[tourProto.TourStatus]model.TourStatus{
	tourProto.TourStatus_DRAFT:     model.Draft,
	tourProto.TourStatus_PUBLISHED: model.Published,
	tourProto.TourStatus_ARCHIVED:  model.Archived,
}

func convertTagsModelToProto(tags []model.TourTag) []tourProto.TourTag {
	out := make([]tourProto.TourTag, len(tags))
	for i, tag := range tags {
		out[i] = modelToProtoTag[tag]
	}
	return out
}

func convertTagsProtoToModel(tags []tourProto.TourTag) []model.TourTag {
	out := make([]model.TourTag, len(tags))
	for i, tag := range tags {
		out[i] = protoToModelTag[tag]
	}
	return out
}

func convertTravelTimesModelToProto(times map[model.Transport]string) map[string]string {
	out := make(map[string]string, len(times))
	for k, v := range times {
		out[string(k)] = v
	}
	return out
}

func convertTravelTimesProtoToModel(times map[string]string) map[model.Transport]string {
	out := make(map[model.Transport]string, len(times))
	for k, v := range times {
		out[model.Transport(k)] = v
	}
	return out
}

func TourModelToProto(t *model.Tour) *tourProto.Tour {
	return &tourProto.Tour{
		Id:          t.ID.Hex(),
		AuthorId:    t.AuthorId,
		Name:        t.Name,
		Description: t.Description,
		Difficulty:  modelToProtoDifficulty[t.Difficulty],
		Tags:        convertTagsModelToProto(t.Tags),
		Status:      modelToProtoStatus[t.Status],
		Price:       float32(t.Price),
		TravelTimes: convertTravelTimesModelToProto(t.TravelTimes),
		Length:      float32(t.Length),
	}
}

func TourProtoToModel(t *tourProto.Tour) *model.Tour {
	id := primitive.NilObjectID
	if t.GetId() != "" {
		parsed, err := primitive.ObjectIDFromHex(t.GetId())
		if err == nil {
			id = parsed
		}
	}

	return &model.Tour{
		ID:          id,
		AuthorId:    t.GetAuthorId(),
		Name:        t.GetName(),
		Description: t.GetDescription(),
		Difficulty:  protoToModelDifficulty[t.GetDifficulty()],
		Tags:        convertTagsProtoToModel(t.GetTags()),
		Status:      protoToModelStatus[t.GetStatus()],
		Price:       float64(t.GetPrice()),
		TravelTimes: convertTravelTimesProtoToModel(t.GetTravelTimes()),
		Length:      float64(t.GetLength()),
	}
}
