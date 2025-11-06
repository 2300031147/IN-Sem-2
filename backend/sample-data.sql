-- Sample data initialization script for Ticket Booking Application
-- This script creates sample shows and an admin user for testing

USE ticket_booking;

-- Create admin user (password: admin123)
INSERT INTO users (username, email, password, role) VALUES
('admin', 'admin@example.com', '$2a$10$8K1p/a0dL3LKzYQY8v1KdOGnX9TYqv5JqLlZvE5tZ5LFh3cX6FQPW', 'admin');

-- Create sample user (password: user123)
INSERT INTO users (username, email, password, role) VALUES
('john_doe', 'john@example.com', '$2a$10$YN3j5Lr0g2m0LV9cjBqPJOd5GRxbzHqF5vZ8vN3kOsZ5Y3j8LFp1K', 'user');

-- Create sample shows
INSERT INTO shows (title, description, date, time, venue, total_seats, available_seats, price, image_url) VALUES
('Star Wars: A New Hope', 'Join Luke Skywalker on an epic adventure to save the galaxy from the evil Empire.', '2024-12-25', '19:00:00', 'Galaxy Theater', 80, 80, 15.00, 'https://via.placeholder.com/300x200/1a1a1a/ffffff?text=Star+Wars'),
('The Matrix', 'A computer programmer discovers the truth about reality and his role in the war against its controllers.', '2024-12-26', '20:30:00', 'Cyber Cinema', 80, 80, 12.00, 'https://via.placeholder.com/300x200/0a0a0a/00ff00?text=The+Matrix'),
('Inception', 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task.', '2024-12-27', '18:00:00', 'Dream Theater', 80, 80, 14.00, 'https://via.placeholder.com/300x200/2a2a2a/ffffff?text=Inception'),
('Interstellar', 'A team of explorers travel through a wormhole in space to ensure humanity survival.', '2024-12-28', '19:30:00', 'Space Pavilion', 80, 80, 16.00, 'https://via.placeholder.com/300x200/1a1a2a/ffffff?text=Interstellar'),
('The Dark Knight', 'Batman must accept one of the greatest psychological and physical tests to fight injustice.', '2024-12-29', '21:00:00', 'Gotham Cinema', 80, 80, 13.00, 'https://via.placeholder.com/300x200/0a0a0a/ffff00?text=Dark+Knight');

-- Get the show IDs for seat creation
SET @show1_id = (SELECT id FROM shows WHERE title = 'Star Wars: A New Hope');
SET @show2_id = (SELECT id FROM shows WHERE title = 'The Matrix');
SET @show3_id = (SELECT id FROM shows WHERE title = 'Inception');
SET @show4_id = (SELECT id FROM shows WHERE title = 'Interstellar');
SET @show5_id = (SELECT id FROM shows WHERE title = 'The Dark Knight');

-- Note: Seats will be automatically created by the backend when shows are added through the API
-- This script is for manual database initialization only

SELECT 'Sample data inserted successfully!' AS message;
SELECT * FROM users;
SELECT * FROM shows;
