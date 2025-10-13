package middleware

import (
	"context"
	"log"
	"net/http"
	"strings"

	"github.com/jelena-ra/touristApp/soa-team-4/API_Gateway/config"
	"github.com/jelena-ra/touristApp/soa-team-4/API_Gateway/jwt"
)

type AuthenticationMiddleware struct {
	jwtGenerator *jwt.JWTGenerator
}

func NewAuthenticationMiddleware(jwtConfig *config.JWTConfig) *AuthenticationMiddleware {
	return &AuthenticationMiddleware{
		jwtGenerator: jwt.NewJWTGenerator(jwtConfig),
	}
}

func (m *AuthenticationMiddleware) AuthenticationPolicy() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.Method == "OPTIONS" {
				next.ServeHTTP(w, r)
				return
			}
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				http.Error(w, "Unauthorized: missing token", http.StatusUnauthorized)
				return
			}

			// Provera formata 'Bearer <token>'
			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || parts[0] != "Bearer" {
				http.Error(w, "Unauthorized: invalid token format", http.StatusUnauthorized)
				return
			}
			tokenString := parts[1]

			log.Println("=========================================================")
			log.Printf("[Auth Middleware] RAW TOKEN STRING RECEIVED: %s", tokenString)
			log.Println("=========================================================")

			// Validacija tokena i preuzimanje korisničkih podataka
			claims, err := m.jwtGenerator.ValidateToken(tokenString)
			if err != nil {
				log.Printf("Invalid token: %v", err)
				http.Error(w, "Unauthorized: invalid or expired token", http.StatusUnauthorized)
				return
			}
			log.Printf("[Auth Middleware] Token validated. User ID from claims: %s, Username: %s", claims.ID, claims.Username)

			// Stavljanje korisničkih podataka u kontekst zahteva
			ctx := context.WithValue(r.Context(), "user", claims)
			r = r.WithContext(ctx)

			// Pozivanje sledećeg handlera u lancu
			next.ServeHTTP(w, r)
		})
	}
}
