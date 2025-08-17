package middleware

import (
    //"context"
    "net/http"
    "github.com/jelena-ra/touristApp/soa-team-4/Stakeholders/internal/auth"
)

type AuthorizationMiddleware struct{}

func NewAuthorizationMiddleware() *AuthorizationMiddleware {
    return &AuthorizationMiddleware{}
}

func (m *AuthorizationMiddleware) RequireRole(role string) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            claims, ok := r.Context().Value("user").(*auth.Claims)
            if !ok {
                http.Error(w, "User not authenticated", http.StatusUnauthorized)
                return
            }
            
            if claims.Role != role {
                http.Error(w, "Insufficient permissions", http.StatusForbidden)
                return
            }
            
            next.ServeHTTP(w, r)
        })
    }
}


func (m *AuthorizationMiddleware) TouristPolicy() func(http.Handler) http.Handler {
    return m.RequireRole("tourist")
}

func (m *AuthorizationMiddleware) AuthorPolicy() func(http.Handler) http.Handler {
    return m.RequireRole("author")
}

func (m *AuthorizationMiddleware) AdministratorPolicy() func(http.Handler) http.Handler {
    return m.RequireRole("administrator")
}