#!/bin/bash

# Script to undeploy the ticket booking application from Kubernetes
set -e  # Exit on any error

echo "Undeploying Ticket Booking Application from Kubernetes..."

# Delete Ingress
echo "Deleting Ingress..."
kubectl delete -f k8s/ingress.yaml --ignore-not-found=true

# Delete Frontend
echo "Deleting Frontend..."
kubectl delete -f k8s/frontend/ --ignore-not-found=true

# Delete Backend
echo "Deleting Backend..."
kubectl delete -f k8s/backend/ --ignore-not-found=true

# Delete MySQL
echo "Deleting MySQL..."
kubectl delete -f k8s/mysql/ --ignore-not-found=true

# Optionally delete namespace (uncomment if you want to delete the namespace)
# echo "Deleting namespace..."
# kubectl delete -f k8s/namespace.yaml --ignore-not-found=true

echo ""
echo "Undeployment complete!"
echo ""
echo "To delete the namespace and all resources, run:"
echo "  kubectl delete namespace ticket-booking"
