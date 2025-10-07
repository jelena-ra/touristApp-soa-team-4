package client

import (
	following_proto "github.com/jelena-ra/touristApp/soa-team-4/Following/proto"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func NewFollowingClient(address string) (following_proto.FollowingServiceClient, error) {
	conn, err := grpc.Dial(address, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, err
	}
	return following_proto.NewFollowingServiceClient(conn), nil
}
