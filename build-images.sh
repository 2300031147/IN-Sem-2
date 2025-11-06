#!/bin/bash

# Script to build Docker images for the ticket booking application

echo "Building Docker images for Ticket Booking Application..."

# Build backend image
echo ""
echo "Building backend image..."
cd backend
docker build -t ticket-booking-backend:latest .
if [ $? -eq 0 ]; then
    echo "✓ Backend image built successfully"
else
    echo "✗ Failed to build backend image"
    exit 1
fi
cd ..

# Build frontend image
echo ""
echo "Building frontend image..."
cd frontend
docker build -t ticket-booking-frontend:latest .
if [ $? -eq 0 ]; then
    echo "✓ Frontend image built successfully"
else
    echo "✗ Failed to build frontend image"
    exit 1
fi
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
