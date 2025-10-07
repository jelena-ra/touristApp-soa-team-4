#!/bin/bash

# Build Tours service from parent directory to include Stakeholders dependency
cd ..
docker build -f Tours/Dockerfile.parent -t tours-service Tours/