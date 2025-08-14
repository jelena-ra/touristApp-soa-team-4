package auth

import (
    "github.com/golang-jwt/jwt/v5"
)

type Claims struct {
    UserID   string  `json:"id"`
    Username string `json:"username"`
    PersonID int64  `json:"personId"`
    Role     string `json:"role"`
    jwt.RegisteredClaims
}