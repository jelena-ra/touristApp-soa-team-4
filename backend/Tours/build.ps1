# Build Tours service from parent directory to include Stakeholders dependency
Set-Location ..
docker build -f Tours/Dockerfile.parent -t tours-service .