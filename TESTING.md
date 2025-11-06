# Testing Guide

This document provides instructions for testing the Online Ticket Booking Application.

## Prerequisites

- Application running (see QUICKSTART.md)
- Admin user created
- Regular user account created

## Manual Testing Checklist

### 1. User Authentication

#### Registration
- [ ] Navigate to `/register`
- [ ] Enter valid user details
- [ ] Submit form
- [ ] Verify redirect to login page
- [ ] Verify user created in database

#### Login
- [ ] Navigate to `/login`
- [ ] Enter valid credentials
- [ ] Submit form
- [ ] Verify redirect to home page
- [ ] Verify user info in navbar
- [ ] Verify token stored in localStorage

#### Logout
- [ ] Click logout button
- [ ] Verify redirect to login page
- [ ] Verify token removed from localStorage

### 2. Browse Shows

#### View All Shows
- [ ] Navigate to home page
- [ ] Verify shows displayed in grid
- [ ] Verify show details visible (title, date, time, venue, price, seats)
- [ ] Verify "Book Now" button enabled for available shows
- [ ] Verify "Sold Out" displayed for full shows

### 3. Seat Booking

#### Select Seats
- [ ] Click "Book Now" on a show
- [ ] Verify redirect to booking page
- [ ] Verify show details displayed
- [ ] Verify seat layout displayed
- [ ] Click on available seats
- [ ] Verify selected seats highlighted in green
- [ ] Click again to deselect
- [ ] Verify booked seats shown in red and disabled

#### Complete Booking
- [ ] Select multiple seats
- [ ] Verify total amount calculated correctly
- [ ] Click "Confirm Booking"
- [ ] Verify success message
- [ ] Verify redirect to booking history
- [ ] Verify booking appears in list

#### Booking Validation
- [ ] Try to book without selecting seats
- [ ] Verify error message displayed
- [ ] Try to book already booked seats (should be disabled)
- [ ] Verify seats remain booked after refresh

### 4. Booking History

#### View Bookings
- [ ] Navigate to "My Bookings"
- [ ] Verify all user bookings displayed
- [ ] Verify booking details correct (show, seats, amount, date, status)
- [ ] Verify cancelled bookings shown with "CANCELLED" status

#### Cancel Booking
- [ ] Click "Cancel Booking" on a confirmed booking
- [ ] Confirm cancellation in dialog
- [ ] Verify success message
- [ ] Verify booking status updated to "CANCELLED"
- [ ] Verify seats become available again
- [ ] Verify "Cancel Booking" button removed

### 5. Admin Panel

#### Access Admin Panel
- [ ] Login as admin user
- [ ] Verify "Admin Panel" link in navbar
- [ ] Navigate to admin panel
- [ ] Verify access granted

#### Manage Shows Tab
- [ ] Click "Manage Shows" tab
- [ ] Verify all shows listed in table
- [ ] Verify show details displayed correctly

#### Create Show
- [ ] Click "Add New Show"
- [ ] Fill in all required fields
  - Title
  - Description
  - Date
  - Time
  - Venue
  - Total Seats
  - Price
  - Image URL (optional)
- [ ] Submit form
- [ ] Verify success message
- [ ] Verify show appears in list
- [ ] Verify seats automatically created

#### Edit Show
- [ ] Click "Edit" on a show
- [ ] Modify show details (except total seats)
- [ ] Submit form
- [ ] Verify success message
- [ ] Verify changes reflected in list

#### Delete Show
- [ ] Click "Delete" on a show
- [ ] Confirm deletion
- [ ] Verify success message
- [ ] Verify show removed from list
- [ ] Verify associated seats deleted

#### View Bookings Tab
- [ ] Click "View Bookings" tab
- [ ] Verify all bookings listed in table
- [ ] Verify booking details displayed:
  - Booking ID
  - User (username and email)
  - Show title
  - Date and time
  - Seats
  - Amount
  - Status
  - Booking date

### 6. Error Handling

#### Authentication Errors
- [ ] Try login with invalid credentials
- [ ] Verify error message displayed
- [ ] Try registration with existing email
- [ ] Verify error message displayed
- [ ] Try accessing protected routes without login
- [ ] Verify redirect to login page

#### Booking Errors
- [ ] Try to book with invalid show ID
- [ ] Verify error handled gracefully
- [ ] Try to book more seats than available
- [ ] Verify validation message

#### Admin Errors
- [ ] Try to access admin panel as regular user
- [ ] Verify access denied
- [ ] Try to create show with missing fields
- [ ] Verify validation messages

### 7. Responsive Design

#### Mobile View
- [ ] Test on mobile device or resize browser
- [ ] Verify navbar collapses appropriately
- [ ] Verify show grid adjusts to single column
- [ ] Verify seat selection usable on mobile
- [ ] Verify forms usable on mobile
- [ ] Verify tables scroll horizontally if needed

#### Desktop View
- [ ] Test on desktop browser
- [ ] Verify layout uses full width
- [ ] Verify show grid displays multiple columns
- [ ] Verify seat layout clearly visible
- [ ] Verify tables display all columns

### 8. Performance

#### Page Load Times
- [ ] Verify home page loads quickly
- [ ] Verify booking page loads in reasonable time
- [ ] Verify admin panel loads smoothly
- [ ] Check browser console for errors

#### Concurrent Bookings
- [ ] Open booking page in two different browsers
- [ ] Try to book same seat simultaneously
- [ ] Verify only one booking succeeds
- [ ] Verify second booking gets error message

## API Testing

### Using curl

#### Health Check
```bash
curl http://localhost:5000/health
```

#### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```
Save the returned token for authenticated requests.

#### Get Shows
```bash
curl http://localhost:5000/api/shows
```

#### Get Show Details
```bash
curl http://localhost:5000/api/shows/1
```

#### Get Show Seats
```bash
curl http://localhost:5000/api/shows/1/seats
```

#### Create Booking (requires token)
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "show_id": 1,
    "seat_ids": [1, 2, 3]
  }'
```

#### Get User Bookings (requires token)
```bash
curl http://localhost:5000/api/bookings/user \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Cancel Booking (requires token)
```bash
curl -X PUT http://localhost:5000/api/bookings/1/cancel \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Create Show (requires admin token)
```bash
curl -X POST http://localhost:5000/api/shows \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "title": "Test Show",
    "description": "Test Description",
    "date": "2024-12-31",
    "time": "20:00",
    "venue": "Test Venue",
    "total_seats": 80,
    "price": 15.00
  }'
```

## Database Testing

### Verify Data Integrity

```sql
-- Check users
SELECT * FROM users;

-- Check shows
SELECT * FROM shows;

-- Check seats for a show
SELECT * FROM seats WHERE show_id = 1;

-- Check bookings
SELECT b.*, s.title, u.username 
FROM bookings b
JOIN shows s ON b.show_id = s.id
JOIN users u ON b.user_id = u.id;

-- Verify seat booking integrity
SELECT 
  s.title,
  sh.total_seats,
  sh.available_seats,
  COUNT(CASE WHEN st.is_booked = TRUE THEN 1 END) as booked_seats
FROM shows s
JOIN seats st ON s.id = st.show_id
JOIN shows sh ON s.id = sh.id
GROUP BY s.id, s.title, sh.total_seats, sh.available_seats;
```

### Test Transaction Rollback

```sql
-- Start a transaction
START TRANSACTION;

-- Manually book seats
UPDATE seats SET is_booked = TRUE WHERE id IN (1, 2, 3);
UPDATE shows SET available_seats = available_seats - 3 WHERE id = 1;

-- Rollback
ROLLBACK;

-- Verify seats are not booked
SELECT * FROM seats WHERE id IN (1, 2, 3);
```

## Docker Testing

### Test Docker Compose

```bash
# Start services
docker-compose up -d

# Check service health
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql

# Test connectivity
docker-compose exec backend sh -c "nc -zv mysql 3306"

# Stop services
docker-compose down
```

## Kubernetes Testing

### Test K8s Deployment

```bash
# Deploy
cd k8s
./deploy.sh

# Check pod status
kubectl get pods -n ticket-booking

# Check services
kubectl get svc -n ticket-booking

# Check ingress
kubectl get ingress -n ticket-booking

# Test backend pod
kubectl exec -it deployment/backend -n ticket-booking -- curl http://localhost:5000/health

# View logs
kubectl logs -f deployment/backend -n ticket-booking
kubectl logs -f deployment/frontend -n ticket-booking

# Test MySQL connection
kubectl exec -it deployment/mysql -n ticket-booking -- mysql -u root -ppassword -e "SHOW DATABASES;"

# Undeploy
./undeploy.sh
```

## Load Testing

### Using Apache Bench (ab)

```bash
# Test home page
ab -n 1000 -c 10 http://localhost/

# Test API endpoint
ab -n 100 -c 5 http://localhost:5000/api/shows
```

### Using wrk

```bash
# Test home page
wrk -t4 -c100 -d30s http://localhost/

# Test API endpoint
wrk -t4 -c100 -d30s http://localhost:5000/api/shows
```

## Security Testing

### Check for SQL Injection

- Try entering SQL commands in form inputs
- Verify parameterized queries prevent injection
- Examples:
  - Email: `admin@example.com' OR '1'='1`
  - Username: `'; DROP TABLE users; --`

### Check for XSS

- Try entering JavaScript in form inputs
- Verify content is properly escaped
- Examples:
  - Username: `<script>alert('XSS')</script>`
  - Show title: `<img src=x onerror=alert('XSS')>`

### Check Authentication

- Try accessing protected routes without token
- Try using expired token
- Try using tampered token
- Verify proper error responses

## Test Coverage Summary

After completing all tests, verify:

- [x] All user flows work correctly
- [x] Admin functionality complete
- [x] Error handling appropriate
- [x] Responsive design works
- [x] API endpoints secure
- [x] Database integrity maintained
- [x] Docker deployment successful
- [x] Kubernetes deployment successful

## Reporting Issues

When reporting issues, include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Screenshots if applicable
5. Browser/environment details
6. Error messages or logs
