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
    secretKey := os.Getenv("JWT_KEY")
    if secretKey == "" {
        secretKey = "explorer_secret_key"
    }
    
    issuer := os.Getenv("JWT_ISSUER")
    if issuer == "" {
        issuer = "explorer"
    }
    
    audience := os.Getenv("JWT_AUDIENCE")
    if audience == "" {
        audience = "explorer-front.com"
    }
    
    return &JWTConfig{
        SecretKey: secretKey,
        Issuer:    issuer,
        Audience:  audience,
        Duration:  24 * time.Hour,
    }
}