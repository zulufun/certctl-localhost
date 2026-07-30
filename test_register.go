package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

func main() {
	body := []byte(`{"name": "test-agent", "hostname": "test", "os": "windows", "architecture": "amd64"}`)
	req, _ := http.NewRequest("POST", "https://10.1.0.12:8443/api/v1/agents", bytes.NewBuffer(body))
	req.Header.Set("Authorization", "Bearer demo-secret-123")
	req.Header.Set("Content-Type", "application/json")
	
	client := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: &http.tls.Config{InsecureSkipVerify: true},
		},
	}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	defer resp.Body.Close()
	
	buf := new(bytes.Buffer)
	buf.ReadFrom(resp.Body)
	fmt.Println("Status:", resp.StatusCode)
	fmt.Println("Response:", buf.String())
}
