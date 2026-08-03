-- -------------------------------------------------------------
-- Relational Database Schema: Thai Traditional Medicine Booking System
-- Database Name: ttm_clinic
-- Target DBMS: MySQL / MariaDB (XAMPP Compatible)
-- -------------------------------------------------------------

CREATE DATABASE IF NOT EXISTS ttm_clinic DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ttm_clinic;

-- 1. สร้างตารางความเชี่ยวชาญ (Specialties)
CREATE TABLE IF NOT EXISTS specialties (
    specialty_id INT AUTO_INCREMENT PRIMARY KEY,
    specialty_name VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. สร้างตารางอาการเบื้องต้น (Symptoms)
CREATE TABLE IF NOT EXISTS symptoms (
    symptom_id INT AUTO_INCREMENT PRIMARY KEY,
    symptom_name VARCHAR(100) NOT NULL,
    specialty_id INT,
    FOREIGN KEY (specialty_id) REFERENCES specialties(specialty_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. สร้างตารางบุคลากร (Staff)
CREATE TABLE IF NOT EXISTS staff (
    staff_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role ENUM('admin', 'doctor', 'intern') NOT NULL,
    specialty_id INT,
    profile_image VARCHAR(255),
    FOREIGN KEY (specialty_id) REFERENCES specialties(specialty_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. สร้างตารางผู้ใช้งาน (Users)
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. สร้างตารางบริการ (Services)
CREATE TABLE IF NOT EXISTS services (
    service_id INT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(150) NOT NULL,
    description TEXT,
    duration_minutes INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    service_type ENUM('massage', 'package') DEFAULT 'massage'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. สร้างตารางเวรทำงาน (Schedules)
CREATE TABLE IF NOT EXISTS schedules (
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT NOT NULL,
    work_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status ENUM('available', 'full', 'unavailable') DEFAULT 'available',
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. สร้างตารางการจอง (Bookings)
CREATE TABLE IF NOT EXISTS bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    staff_id INT NOT NULL,
    service_id INT NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. สร้างตารางบันทึกการรักษา (Treatments)
CREATE TABLE IF NOT EXISTS treatments (
    treatment_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    treatment_details TEXT,
    next_appointment_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. สร้างตารางคลังยา (Medicines)
CREATE TABLE IF NOT EXISTS medicines (
    medicine_id INT AUTO_INCREMENT PRIMARY KEY,
    medicine_name VARCHAR(150) NOT NULL,
    properties TEXT,
    stock_qty INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. สร้างตารางการจ่ายยา (Treatment Medicines)
CREATE TABLE IF NOT EXISTS treatment_medicines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    treatment_id INT NOT NULL,
    medicine_id INT NOT NULL,
    qty_dispensed INT NOT NULL,
    FOREIGN KEY (treatment_id) REFERENCES treatments(treatment_id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. สร้างตารางบันทึกชั่วโมงนักศึกษาฝึกงาน (Intern Hours Log)
CREATE TABLE IF NOT EXISTS intern_hours_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT NOT NULL,
    booking_id INT NOT NULL,
    hours_earned DECIMAL(5,2) NOT NULL,
    date_logged DATE NOT NULL,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
