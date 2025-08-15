package auth

import (
    "time"
    "github.com/golang-jwt/jwt/v5"
    "github.com/google/uuid"
    "github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/config"
    "github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/model"
    "log"
)

type JWTGenerator struct {
    config *config.JWTConfig
}

func NewJWTGenerator(config *config.JWTConfig) *JWTGenerator {
    return &JWTGenerator{config: config}
}

func (g *JWTGenerator) GenerateAccessToken(user *model.User) (string, error) {
    claims := Claims{
        UserID:   user.ID,
        Username: user.Username,
        Role:     user.GetPrimaryRoleName(),
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(time.Now().Add(g.config.Duration)),
            IssuedAt:  jwt.NewNumericDate(time.Now()),
            NotBefore: jwt.NewNumericDate(time.Now()),
            Issuer:    g.config.Issuer,
            Audience:  []string{g.config.Audience},
            ID:        uuid.New().String(),
        },
    }
    
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

    	// DEBUG: Ispis tajnog ključa za potpisivanje
	log.Printf("JWT Secret Key (Signing): %s", g.config.SecretKey)
    return token.SignedString([]byte(g.config.SecretKey))
}

func (g *JWTGenerator) ValidateToken(tokenString string) (*Claims, error) {
    claims := &Claims{}

    // DEBUG: Ispis tajnog ključa za validaciju
	log.Printf("JWT Secret Key (Validating): %s", g.config.SecretKey)
    
    token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
        return []byte(g.config.SecretKey), nil
    })
    
    if err != nil || !token.Valid {
        return nil, err
    }
    
    return claims, nil
}