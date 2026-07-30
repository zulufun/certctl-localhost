#!/bin/sh
export DATABASE_URL="postgres://certctl:certctl@certctl-postgres:5432/certctl?sslmode=disable"
psql -h certctl-postgres -U certctl -d certctl -c "UPDATE jobs SET status = 'Pending', attempts = 0 WHERE id = 'job-1784082572667578913-605';"
cd /app && go run get_work_test.go
