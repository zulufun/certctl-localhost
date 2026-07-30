package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/zulufun/certctl-localhost/internal/config"
	"github.com/zulufun/certctl-localhost/internal/repository/postgres"
	"github.com/zulufun/certctl-localhost/internal/service"
)

func main() {
	os.Setenv("DATABASE_URL", "postgres://certctl:certctl@localhost:5432/certctl?sslmode=disable")
	db, err := postgres.New(os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatal(err)
	}
	agentRepo := postgres.NewAgentRepository(db)
	jobRepo := postgres.NewJobRepository(db)
	targetRepo := postgres.NewTargetRepository(db)
	certRepo := postgres.NewCertificateRepository(db)

	svc := service.NewAgentService(agentRepo, jobRepo, targetRepo, certRepo, nil)

	jobs, err := svc.GetWorkWithTargets(context.Background(), "WIN-TMHQMPDLGM8")
	if err != nil {
		log.Fatal(err)
	}

	bytes, _ := json.MarshalIndent(jobs, "", "  ")
	fmt.Println(string(bytes))
}
