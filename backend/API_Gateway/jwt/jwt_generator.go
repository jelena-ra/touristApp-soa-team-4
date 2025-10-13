package jwt

import (
	"log"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jelena-ra/touristApp/soa-team-4/API_Gateway/config"
)

type JWTGenerator struct {
	config *config.JWTConfig
}

type Claims struct {
	ID       string   `json:"id"`
	Username string   `json:"username"`
	PersonID int      `json:"personId"`
	Role     string   `json:"role"`
	Audience []string `json:"aud"`
	jwt.RegisteredClaims
}

func NewJWTGenerator(config *config.JWTConfig) *JWTGenerator {
	return &JWTGenerator{config: config}
}
func (g *JWTGenerator) ValidateToken(tokenString string) (*Claims, error) {
	claims := &Claims{}

	log.Printf("JWT Secret Key (Validating): %s", g.config.SecretKey)

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(g.config.SecretKey), nil
	})

	if err != nil || !token.Valid {
		return nil, err
	}

	return claims, nil
}
