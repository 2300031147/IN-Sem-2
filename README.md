# Online Ticket Booking Application

A fullstack online ticket booking application built with Vite React frontend, Node.js Express backend, MySQL database, JWT authentication, and deployable to Kubernetes with Docker.

## Features

- **User Authentication**: JWT-based authentication with login and registration
- **Show Management**: Browse available shows with details
- **Seat Booking**: Interactive seat selection interface
- **Booking History**: View and manage user bookings
- **Admin Panel**: Manage shows and view all bookings
- **Responsive Design**: Mobile-friendly interface
- **Containerized**: Docker and Docker Compose support
- **Kubernetes Ready**: Complete K8s manifests for production deployment

## Technology Stack

### Frontend
- React 18 with Vite
- React Router for navigation
- Axios for API calls
- Context API for state management
- CSS3 for styling

### Backend
- Node.js with Express
- MySQL 8.0 database
- JWT for authentication
- bcryptjs for password hashing
- CORS enabled

### DevOps
- Docker & Docker Compose
- Kubernetes (Deployments, Services, Ingress, ConfigMaps, Secrets, PVCs)
- Nginx for frontend serving

## Project Structure

```
.
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   └── showController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── bookings.js
│   │   └── shows.js
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── pages/
│   │   │   ├── AdminPanel.jsx
│   │   │   ├── Booking.jsx
│   │   │   ├── BookingHistory.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── index.js
│   │   ├── utils/
│   │   │   └── AuthContext.jsx
│   │   ├── App.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── k8s/
│   ├── backend/
│   │   ├── configmap.yaml
│   │   ├── deployment.yaml
│   │   ├── secret.yaml
│   │   └── service.yaml
│   ├── frontend/
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   ├── mysql/
│   │   ├── configmap.yaml
│   │   ├── deployment.yaml
│   │   ├── pvc.yaml
│   │   ├── secret.yaml
│   │   └── service.yaml
│   ├── ingress.yaml
│   └── namespace.yaml
├── docker-compose.yml
└── README.md
```

## Local Development Setup

### Prerequisites
- Node.js 20+
- MySQL 8.0+
- Docker & Docker Compose (optional)

### Option 1: Without Docker

#### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm start
```

#### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env if needed
npm run dev
```

#### Database Setup
```bash
mysql -u root -p
CREATE DATABASE ticket_booking;
```

The application will automatically create the required tables on first run.

### Option 2: With Docker Compose

```bash
docker-compose up --build
```

Access the application:
- Frontend: http://localhost
- Backend API: http://localhost:5000
- MySQL: localhost:3306

## Kubernetes Deployment

### Prerequisites
- Kubernetes cluster (minikube, kind, or cloud provider)
- kubectl configured
- Docker images built and pushed to registry

### Build Docker Images

```bash
# Build backend image
cd backend
DOCKER_BUILDKIT=0 docker build -t ticket-booking-backend:latest .

# Build frontend image
cd frontend
DOCKER_BUILDKIT=0 docker build -t ticket-booking-frontend:latest .
```

**Note:** The `DOCKER_BUILDKIT=0` flag is required when building the frontend image due to a BuildKit issue with optional dependencies in the rolldown package (see [npm/cli#4828](https://github.com/npm/cli/issues/4828)). Alternatively, use the provided `build-images.sh` script which handles this automatically.

### Deploy to Kubernetes

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Deploy MySQL
kubectl apply -f k8s/mysql/

# Deploy Backend
kubectl apply -f k8s/backend/

# Deploy Frontend
kubectl apply -f k8s/frontend/

# Create Ingress
kubectl apply -f k8s/ingress.yaml
```

### Access the Application

Add to your `/etc/hosts`:
```
<INGRESS_IP> ticket-booking.local
```

Then access: http://ticket-booking.local

### Verify Deployment

```bash
# Check all pods
kubectl get pods -n ticket-booking

# Check services
kubectl get svc -n ticket-booking

# Check ingress
kubectl get ingress -n ticket-booking

# View logs
kubectl logs -f deployment/backend -n ticket-booking
kubectl logs -f deployment/frontend -n ticket-booking
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

### Shows
- `GET /api/shows` - Get all shows
- `GET /api/shows/:id` - Get show by ID
- `GET /api/shows/:id/seats` - Get show seats
- `POST /api/shows` - Create show (admin only)
- `PUT /api/shows/:id` - Update show (admin only)
- `DELETE /api/shows/:id` - Delete show (admin only)

### Bookings
- `POST /api/bookings` - Create booking (protected)
- `GET /api/bookings/user` - Get user bookings (protected)
- `GET /api/bookings/all` - Get all bookings (admin only)
- `PUT /api/bookings/:id/cancel` - Cancel booking (protected)

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Shows Table
```sql
CREATE TABLE shows (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  venue VARCHAR(255) NOT NULL,
  total_seats INT NOT NULL,
  available_seats INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Seats Table
```sql
CREATE TABLE seats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  show_id INT NOT NULL,
  seat_number VARCHAR(10) NOT NULL,
  row_label VARCHAR(5) NOT NULL,
  is_booked BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (show_id) REFERENCES shows(id) ON DELETE CASCADE,
  UNIQUE KEY unique_seat (show_id, seat_number)
);
```

### Bookings Table
```sql
CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  show_id INT NOT NULL,
  seat_ids JSON NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  booking_status ENUM('confirmed', 'cancelled') DEFAULT 'confirmed',
  booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (show_id) REFERENCES shows(id) ON DELETE CASCADE
);
```

## Environment Variables

### Backend (.env)
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=ticket_booking
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Default Admin Account

To create an admin account, register a user and manually update the role in the database:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

## Features in Detail

### User Features
- Register and login with email/password
- Browse available shows
- Interactive seat selection
- Book multiple seats in one transaction
- View booking history
- Cancel bookings

### Admin Features
- Create, update, and delete shows
- View all bookings
- Monitor seat availability
- Manage show details and pricing

### Technical Features
- JWT token-based authentication
- Transaction support for bookings
- Real-time seat availability
- Responsive design
- RESTful API
- Docker containerization
- Kubernetes orchestration

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Protected routes
- SQL injection prevention with parameterized queries
- CORS configuration
- Environment variable management
- Kubernetes secrets for sensitive data

## Troubleshooting

### Database Connection Issues
- Ensure MySQL is running
- Check database credentials in .env
- Verify database exists

### Docker Issues
- Clean up containers: `docker-compose down -v`
- Rebuild images: `docker-compose build --no-cache`

### Kubernetes Issues
- Check pod status: `kubectl get pods -n ticket-booking`
- View logs: `kubectl logs <pod-name> -n ticket-booking`
- Check secrets: `kubectl get secrets -n ticket-booking`

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

