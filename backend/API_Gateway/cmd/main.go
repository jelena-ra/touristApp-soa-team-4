package main

import (
	"log"
	"net/http"
	"net/http/httputil" 
	"net/url"           

	"github.com/gorilla/mux"
)


var (
	stakeholdersServiceURL, _ = url.Parse("http://localhost:8081")

	blogServiceURL, _ = url.Parse("http://localhost:8082")
)

// NewReverseProxy kreira reversni proxy za datu URL adresu
func NewReverseProxy(targetURL *url.URL) *httputil.ReverseProxy {
	return httputil.NewSingleHostReverseProxy(targetURL)
}

func main() {

	router := mux.NewRouter()


	stakeholdersProxy := NewReverseProxy(stakeholdersServiceURL)
    blogProxy := NewReverseProxy(blogServiceURL)
    

	// 3. Definisanje ruta za Gateway
	router.PathPrefix("/api/stakeholders").Handler(http.StripPrefix("/api", stakeholdersProxy))
    router.PathPrefix("/api/profile/{userId}").Handler(http.StripPrefix("/api", stakeholdersProxy))
    router.PathPrefix("/api/profile").Methods("POST").Handler(http.StripPrefix("/api", stakeholdersProxy))
    router.PathPrefix("/api/blog").Handler(http.StripPrefix("/api", blogProxy))

	log.Println("API Gateway is running on port :8000...")

	log.Fatal(http.ListenAndServe(":8000", router))
}