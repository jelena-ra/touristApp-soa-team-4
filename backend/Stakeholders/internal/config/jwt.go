package config

import (
    "os"
    "time"
)

type JWTConfig struct {
    SecretKey string
    Issuer    string
    Audience  string
    Duration  time.Duration
}

func NewJWTConfig() *JWTConfig {
    secretKey := os.Getenv("JWT_SECRET_KEY")
    if secretKey == "" {
        secretKey = "neka_tajna_koja_se_ne_ponavlja"
    }
    
    issuer := os.Getenv("JWT_ISSUER")
    if issuer == "" {
        issuer = "extouristApp"
    }
    
    audience := os.Getenv("JWT_AUDIENCE")
    if audience == "" {
        audience = "touristApp-users"
    }
    
    return &JWTConfig{
        SecretKey: secretKey,
        Issuer:    issuer,
        Audience:  audience,
        Duration:  24 * time.Hour,
    }
}