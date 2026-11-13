
-- HostelEase Database
-- Hostel Booking Management System

CREATE DATABASE IF NOT EXISTS hostelease_db;

USE hostelease_db;

-- Students table
CREATE TABLE students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL
);

-- Hostels table
CREATE TABLE hostels (
    hostel_id INT AUTO_INCREMENT PRIMARY KEY,
    hostel_name VARCHAR(100) NOT NULL,
    location VARCHAR(150),
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    availability VARCHAR(30) DEFAULT 'Available'
);

-- Bookings table
CREATE TABLE bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    hostel_id INT NOT NULL,
    booking_date DATE NOT NULL,
    status VARCHAR(30) DEFAULT 'Pending',
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (hostel_id) REFERENCES hostels(hostel_id)
);
USE hostelease_db;

INSERT INTO hostels
(hostel_name, location, price, description, availability)
VALUES
(
    'Royal Hostel',
    'Kumasi',
    2500.00,
    'Comfortable student accommodation with essential facilities.',
    'Available'
),
(
    'Victory Hostel',
    'Kumasi',
    3000.00,
    'Modern student accommodation with a convenient location.',
    'Available'
),
(
    'Peace Hostel',
    'Kumasi',
    2000.00,
    'Affordable accommodation suitable for students.',
    'Available'
);
USE hostelease_db;

CREATE TABLE IF NOT EXISTS administrators (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
