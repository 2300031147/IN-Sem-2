# Quick Start Guide

This guide will help you get the Online Ticket Booking Application running quickly.

## Prerequisites

- Docker and Docker Compose installed
- Or Node.js 18+ and MySQL 8.0+

## Option 1: Using Docker Compose (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd IN-Sem-2
```

2. Start the application:
```bash
docker-compose up --build
```

3. Access the application:
   - Frontend: http://localhost
   - Backend API: http://localhost:5000

4. Create an admin user:
   - Register a new user through the UI at http://localhost/register
   - Connect to MySQL and update the user role:
   ```bash
   docker exec -it ticket-booking-mysql mysql -u root -ppassword ticket_booking
   ```
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
   exit
   ```

5. Login with your admin account to access the admin panel

## Option 2: Local Development

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Edit `.env` with your MySQL credentials

5. Create database:
```bash
mysql -u root -p
CREATE DATABASE ticket_booking;
exit
```

6. Start the backend:
```bash
npm start
```

Backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Start the frontend:
```bash
npm run dev
```

Frontend will run on http://localhost:5173

## Option 3: Kubernetes Deployment

### Prerequisites
- Kubernetes cluster (minikube, kind, or cloud provider)
- kubectl configured
- Ingress controller installed

### Steps

1. Build Docker images:
```bash
cd backend
docker build -t ticket-booking-backend:latest .
cd ../frontend
docker build -t ticket-booking-frontend:latest .
```

2. Deploy to Kubernetes:
```bash
cd ../k8s
./deploy.sh
```

3. Get ingress IP:
```bash
kubectl get ingress -n ticket-booking
```

4. Add to `/etc/hosts`:
```
<INGRESS_IP> ticket-booking.local
```

5. Access: http://ticket-booking.local

## Default Test Data

After starting the application, you can create test data through the admin panel:

### Sample Show Data
- **Title**: Star Wars: A New Hope
- **Description**: Join Luke Skywalker on an epic adventure
- **Date**: 2024-12-25
- **Time**: 19:00
- **Venue**: Galaxy Theater
- **Total Seats**: 80
- **Price**: 15.00

## API Testing

You can test the API using curl or Postman:

### Register a user:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get all shows:
```bash
curl http://localhost:5000/api/shows
```

## Troubleshooting

### Port already in use
If port 80, 5000, or 3306 is already in use:
- Stop the conflicting service
- Or modify the ports in `docker-compose.yml`

### Database connection error
- Ensure MySQL is running
- Check credentials in `.env` file
- Verify database exists

### Frontend not connecting to backend
- Check `VITE_API_URL` in frontend `.env`
- Ensure backend is running
- Check browser console for CORS errors

### Docker build failures
- Clear Docker cache: `docker system prune -a`
- Rebuild: `docker-compose build --no-cache`

## Next Steps

1. Register a user account
2. Create an admin account (by updating the database)
3. Login as admin and create shows
4. Login as user and book tickets
5. View booking history

## Support

For issues and questions, please refer to the main README.md file.
