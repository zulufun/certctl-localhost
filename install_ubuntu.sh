#!/bin/bash
set -e

echo "Ensuring Docker is installed..."
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
fi

echo "Starting certctl system..."
sudo docker compose -f deploy/docker-compose.yml up -d

echo "Waiting for Postgres to become healthy..."
while ! sudo docker ps | grep certctl-postgres | grep -q "healthy"; do
    sleep 2
done

if [ -f "certctl_backup.sql" ]; then
    echo "Importing database backup..."
    sudo docker cp certctl_backup.sql certctl-postgres:/tmp/backup.sql
    sudo docker exec certctl-postgres psql -U certctl -d certctl -f /tmp/backup.sql
    echo "Database import complete!"
else
    echo "No backup file found (certctl_backup.sql). Starting fresh."
fi

echo "Installation complete! Access the system at https://<server-ip>:8443"
