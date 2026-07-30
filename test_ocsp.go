package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"io"
)

func main() {
	resp, err := http.Get("http://localhost:8080/.well-known/pki/ocsp/iss-local/0cd1f8a3d206eb191542095c47a89938cfaaa501")
	if err != nil {
		log.Fatal(err)
	}
	defer resp.Body.Close()
	b, _ := io.ReadAll(resp.Body)
	fmt.Printf("Status: %d\nBody: %s\n", resp.StatusCode, string(b))
}
