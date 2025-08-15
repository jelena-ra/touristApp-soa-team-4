package middleware

import (
    "context"
    "net/http"
    "strings"
    "github.com/golang-jwt/jwt/v5"
    "github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/auth"
    "github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/config"
)

type JWTMiddleware struct {
    config *config.JWTConfig
}

func NewJWTMiddleware(config *config.JWTConfig) *JWTMiddleware {
    return &JWTMiddleware{config: config}
}

func (m *JWTMiddleware) Authenticate(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        authHeader := r.Header.Get("Authorization")
        if authHeader == "" {
            http.Error(w, "Authorization header required", http.StatusUnauthorized)
            return
        }
        
        tokenString := strings.TrimPrefix(authHeader, "Bearer ")
        if tokenString == authHeader {
            http.Error(w, "Bearer token required", http.StatusUnauthorized)
            return
        }
        
        claims := &auth.Claims{}
        token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
           
            if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
                return nil, jwt.ErrSignatureInvalid
            }
            return []byte(m.config.SecretKey), nil
        })
        
        if err != nil {
            switch err {
            case jwt.ErrTokenExpired:
                w.Header().Set("AuthenticationTokens-Expired", "true")
                http.Error(w, "Token expired", http.StatusUnauthorized)
                return
            case jwt.ErrTokenNotValidYet:
                http.Error(w, "Token not valid yet", http.StatusUnauthorized)
                return
            default:
                http.Error(w, "Invalid token", http.StatusUnauthorized)
                return
            }
        }
        
        if !token.Valid {
            http.Error(w, "Invalid token", http.StatusUnauthorized)
            return
        }
        
     
        ctx := context.WithValue(r.Context(), "user", claims)
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}