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
	model.Nature:     tourProto.TourTag_NATURE,
	model.Historical: tourProto.TourTag_HISTORICAL,
	model.Adventure:  tourProto.TourTag_ADVENTURE,
	model.Cultural:   tourProto.TourTag_CULTURAL,
	model.Wildlife:   tourProto.TourTag_WILDLIFE,
	model.Relaxation: tourProto.TourTag_RELAXATION,
	model.Beach:      tourProto.TourTag_BEACH,
	model.Mountain:   tourProto.TourTag_MOUNTAIN,
	model.Urban:      tourProto.TourTag_URBAN,
}

var protoToModelTag = map[tourProto.TourTag]model.TourTag{
	tourProto.TourTag_NATURE:     model.Nature,
	tourProto.TourTag_HISTORICAL: model.Historical,
	tourProto.TourTag_ADVENTURE:  model.Adventure,
	tourProto.TourTag_CULTURAL:   model.Cultural,
	tourProto.TourTag_WILDLIFE:   model.Wildlife,
	tourProto.TourTag_RELAXATION: model.Relaxation,
	tourProto.TourTag_BEACH:      model.Beach,
	tourProto.TourTag_MOUNTAIN:   model.Mountain,
	tourProto.TourTag_URBAN:      model.Urban,
}

var modelToProtoStatus = map[model.TourStatus]tourProto.TourStatus{
	model.Draft: tourProto.TourStatus_DRAFT,
}

var protoToModelStatus = map[tourProto.TourStatus]model.TourStatus{
	tourProto.TourStatus_DRAFT: model.Draft,
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

func TourModelToProto(t *model.Tour) *tourProto.Tour {
	return &tourProto.Tour{
		Id:          t.ID.Hex(),
		AuthorId:    t.AuthorId.Hex(),
		Name:        t.Name,
		Description: t.Description,
		Difficulty:  modelToProtoDifficulty[t.Difficulty],
		Tags:        convertTagsModelToProto(t.Tags),
		Status:      modelToProtoStatus[t.Status],
		Price:       float32(t.Price),
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
	authorId := primitive.NilObjectID
	if t.GetAuthorId() != "" {
		parsed, err := primitive.ObjectIDFromHex(t.GetAuthorId())
		if err == nil {
			authorId = parsed
		}
	}

	return &model.Tour{
		ID:          id,
		AuthorId:    authorId,
		Name:        t.GetName(),
		Description: t.GetDescription(),
		Difficulty:  protoToModelDifficulty[t.GetDifficulty()],
		Tags:        convertTagsProtoToModel(t.GetTags()),
		Status:      protoToModelStatus[t.GetStatus()],
		Price:       float64(t.GetPrice()),
	}
}
