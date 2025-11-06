#!/bin/bash

# Script to deploy the ticket booking application to Kubernetes

echo "Deploying Ticket Booking Application to Kubernetes..."

# Create namespace
echo "Creating namespace..."
kubectl apply -f k8s/namespace.yaml

# Deploy MySQL
echo "Deploying MySQL..."
kubectl apply -f k8s/mysql/configmap.yaml
kubectl apply -f k8s/mysql/secret.yaml
kubectl apply -f k8s/mysql/pvc.yaml
kubectl apply -f k8s/mysql/deployment.yaml
kubectl apply -f k8s/mysql/service.yaml

# Wait for MySQL to be ready
echo "Waiting for MySQL to be ready..."
kubectl wait --for=condition=ready pod -l app=mysql -n ticket-booking --timeout=300s

# Deploy Backend
echo "Deploying Backend..."
kubectl apply -f k8s/backend/configmap.yaml
kubectl apply -f k8s/backend/secret.yaml
kubectl apply -f k8s/backend/deployment.yaml
kubectl apply -f k8s/backend/service.yaml

# Wait for Backend to be ready
echo "Waiting for Backend to be ready..."
kubectl wait --for=condition=ready pod -l app=backend -n ticket-booking --timeout=300s

# Deploy Frontend
echo "Deploying Frontend..."
kubectl apply -f k8s/frontend/deployment.yaml
kubectl apply -f k8s/frontend/service.yaml

# Wait for Frontend to be ready
echo "Waiting for Frontend to be ready..."
kubectl wait --for=condition=ready pod -l app=frontend -n ticket-booking --timeout=300s

# Create Ingress
echo "Creating Ingress..."
kubectl apply -f k8s/ingress.yaml

echo ""
echo "Deployment complete!"
echo ""
echo "Check the status with:"
echo "  kubectl get all -n ticket-booking"
echo ""
echo "To access the application, add this to your /etc/hosts:"
echo "  <INGRESS_IP> ticket-booking.local"
echo ""
echo "Then visit: http://ticket-booking.local"
