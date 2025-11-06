#!/bin/bash

# Script to build Docker images for the ticket booking application
set -e  # Exit on any error

echo "Building Docker images for Ticket Booking Application..."

# Disable BuildKit to avoid issues with optional dependencies
export DOCKER_BUILDKIT=0

# Build backend image
echo ""
echo "Building backend image..."
cd backend
docker build -t ticket-booking-backend:latest .
echo "✓ Backend image built successfully"
cd ..

# Build frontend image
echo ""
echo "Building frontend image..."
cd frontend
docker build -t ticket-booking-frontend:latest .
echo "✓ Frontend image built successfully"
cd ..

echo ""
echo "All images built successfully!"
echo ""
echo "Images:"
docker images | grep ticket-booking

echo ""
echo "To push images to a registry:"
echo "  docker tag ticket-booking-backend:latest <registry>/ticket-booking-backend:latest"
echo "  docker tag ticket-booking-frontend:latest <registry>/ticket-booking-frontend:latest"
echo "  docker push <registry>/ticket-booking-backend:latest"
echo "  docker push <registry>/ticket-booking-frontend:latest"
