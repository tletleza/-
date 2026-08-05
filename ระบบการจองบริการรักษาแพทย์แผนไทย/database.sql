-- ============================================================================
-- ฐานข้อมูลระบบการจองและบริหารจัดการคลินิกการแพทย์แผนไทย
-- มหาวิทยาลัยราชภัฏบ้านสมเด็จเจ้าพระยา (BSRU Traditional Thai Medicine Clinic)
-- Database Script: MySQL 8.0+ / MariaDB (XAMPP Compatible)
-- Character Set: utf8mb4_unicode_ci
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `bsru_thaimed_db` 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `bsru_thaimed_db`;

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ----------------------------------------------------------------------------
-- 1. ตารางบทบาทผู้ใช้งาน (Roles Table)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `treatment_records`;
DROP TABLE IF EXISTS `bookings`;
DROP TABLE IF EXISTS `doctor_schedules`;
DROP TABLE IF EXISTS `patients`;
DROP TABLE IF EXISTS `doctors`;
DROP TABLE IF EXISTS `role_permissions`;
DROP TABLE IF EXISTS `permissions`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `roles`;
DROP TABLE IF EXISTS `services`;

CREATE TABLE `roles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `role_key` VARCHAR(50) NOT NULL UNIQUE,
    `name_th` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. ตารางสิทธิ์การใช้งาน (Permissions Table)
-- ----------------------------------------------------------------------------
CREATE TABLE `permissions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `permission_key` VARCHAR(100) NOT NULL UNIQUE,
    `module` VARCHAR(50) NOT NULL,
    `description` TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. ตารางจับคู่บทบาทและสิทธิ์ (Role Permissions Join Table)
-- ----------------------------------------------------------------------------
CREATE TABLE `role_permissions` (
    `role_id` INT NOT NULL,
    `permission_id` INT NOT NULL,
    PRIMARY KEY (`role_id`, `permission_id`),
    FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. ตารางหลักข้อมูลผู้ใช้งาน (Users Master Table)
-- ----------------------------------------------------------------------------
CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `phone` VARCHAR(20) NOT NULL,
    `password_hash` VARCHAR(255) NULL, -- Nullable สำหรับผู้ใช้ SSO
    `profile_image_url` VARCHAR(255) NULL, -- รูปภาพโปรไฟล์ประจำตัว
    `student_staff_id` VARCHAR(50) NULL, -- รหัสนักศึกษา / บุคลากร มบส.
    `role_id` INT NOT NULL DEFAULT 4, -- ค่าเริ่มต้น: Tier 4 (user)
    `auth_provider` ENUM('local', 'bsru_sso', 'google', 'line') DEFAULT 'local',
    `provider_user_id` VARCHAR(255) NULL,
    `is_active` TINYINT(1) DEFAULT 1,
    `last_login_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`),
    INDEX `idx_user_email` (`email`),
    INDEX `idx_auth_provider` (`auth_provider`, `provider_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 5. ตารางข้อมูลอาจารย์แพทย์แผนไทย (Doctors Profile Table)
-- ----------------------------------------------------------------------------
CREATE TABLE `doctors` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE,
    `license_no` VARCHAR(100) NOT NULL UNIQUE, -- เลขใบประกอบโรคศิลปะ
    `academic_title` VARCHAR(100) DEFAULT 'อาจารย์แพทย์แผนไทย',
    `specialization` VARCHAR(255) DEFAULT 'หัตถการบำบัด & การปรับสมดุลธาตุ',
    `bio` TEXT NULL,
    `is_on_duty` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 6. ตารางประวัติผู้รับบริการ/คนไข้ (Patients Medical Profile Table)
-- ----------------------------------------------------------------------------
CREATE TABLE `patients` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE,
    `blood_type` VARCHAR(5) NULL,
    `primary_element` ENUM('ดิน', 'น้ำ', 'ลม', 'ไฟ') NULL, -- ธาตุเจ้าเรือนประจำตัว
    `underlying_conditions` TEXT NULL, -- โรคประจำตัว / ประวัติการแพ้ยา
    `emergency_contact_name` VARCHAR(150) NULL,
    `emergency_contact_phone` VARCHAR(20) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 7. ตารางบริการและหัตถการ (Services & Packages Table)
-- ----------------------------------------------------------------------------
CREATE TABLE `services` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `service_code` VARCHAR(50) NOT NULL UNIQUE,
    `title` VARCHAR(150) NOT NULL,
    `category` ENUM('massage', 'herbal', 'package', 'consultation') NOT NULL DEFAULT 'massage',
    `description` TEXT NOT NULL,
    `duration_minutes` INT NOT NULL DEFAULT 60,
    `price` DECIMAL(10, 2) NOT NULL,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 8. ตารางข้อมูลการจองเวลาเข้ารับบริการ (Bookings Master Table)
-- ----------------------------------------------------------------------------
CREATE TABLE `bookings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `booking_code` VARCHAR(30) NOT NULL UNIQUE,
    `patient_name` VARCHAR(150) NOT NULL,
    `patient_phone` VARCHAR(30) NOT NULL,
    `service_name` VARCHAR(150) NOT NULL,
    `doctor_name` VARCHAR(150) NULL,
    `room_name` VARCHAR(100) DEFAULT 'รอจัดสรรห้อง',
    `status` VARCHAR(50) DEFAULT 'waiting',
    `status_text` VARCHAR(100) DEFAULT 'รอเรียกคิว',
    `booking_date` DATE NULL,
    `booking_time` VARCHAR(50) DEFAULT '09:00 น.',
    `notes` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 9. ตารางบันทึกการรักษาทางคลินิก (Clinical Treatment Records / EMR Logs)
-- ----------------------------------------------------------------------------
CREATE TABLE `treatment_records` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `booking_id` INT NOT NULL UNIQUE,
    `patient_id` INT NOT NULL,
    `doctor_id` INT NOT NULL,
    `pulse_rate` VARCHAR(50) NULL, -- การจับชีพจรธาตุ (ตับ ไต หัวใจ ปอด)
    `elemental_diagnosis` TEXT NOT NULL, -- วินิจฉัยธาตุเจ้าเรือนที่เสียสมดุล
    `symptoms_observed` TEXT NOT NULL, -- อาการที่ตรวจพบ
    `treatment_details` TEXT NOT NULL, -- รายละเอียดการนวด/ประคบ/เผายาสมุนไพร
    `herbs_prescribed` TEXT NULL, -- ตำรับยาสมุนไพรที่จ่าย
    `doctor_notes` TEXT NULL,
    `is_approved_by_doctor` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`),
    FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`),
    FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 10. ตารางตารางเวลาออกตรวจของแพทย์ (Doctor Schedules Table)
-- ----------------------------------------------------------------------------
CREATE TABLE `doctor_schedules` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `doctor_id` INT NOT NULL,
    `day_of_week` ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    `start_time` TIME NOT NULL,
    `end_time` TIME NOT NULL,
    `max_patients` INT DEFAULT 8,
    `is_available` TINYINT(1) DEFAULT 1,
    FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SEED DATA: ข้อมูลเริ่มต้นสำหรับทดสอบระบบ (Initial Seed Data)
-- ============================================================================

-- 1. เพิ่มบทบาทผู้ใช้งาน 4 สิทธิ์ (Tier 1 - 4)
INSERT INTO `roles` (`id`, `role_key`, `name_th`, `description`) VALUES
(1, 'admin', 'ผู้ดูแลระบบ', 'ผู้ดูแลระบบสูงสุด บริหารจัดการโครงสร้างและบัญชีผู้ใช้ทั้งหมด'),
(2, 'doctor', 'แพทย์แผนไทย', 'อาจารย์แพทย์แผนไทยวิชาชีพ ตรวจ วินิจฉัย และลงบันทึกการรักษา'),
(3, 'intern', 'นักศึกษาฝึกงาน', 'นักศึกษาผู้ช่วยแพทย์แผนไทย บันทึกสัญญาณชีพและคัดกรองเบื้องต้น'),
(4, 'user', 'ผู้ใช้งานทั่วไป / นักศึกษา', 'ผู้รับบริการทั่วไป และนักศึกษา/บุคลากร มบส.');

-- 2. เพิ่มสิทธิ์การใช้งานระบบ (Permissions)
INSERT INTO `permissions` (`permission_key`, `module`, `description`) VALUES
('system:config', 'system', 'กำหนดค่าระบบและเวลาเปิด-ปิดทำการ'),
('user:manage', 'user', 'จัดการบัญชีผู้ใช้งาน แพทย์ และนักศึกษา'),
('booking:read', 'booking', 'ดูรายการจองคิวเข้ารับบริการ'),
('booking:write', 'booking', 'สร้างและแก้ไขรายการจอง'),
('booking:cancel', 'booking', 'ยกเลิกรายการจอง'),
('emr:read', 'emr', 'เข้าถึงเวชระเบียนประวัติการรักษา'),
('emr:write', 'emr', 'บันทึกการตรวจวินิจฉัยและสั่งยาสมุนไพร');

-- 3. กำหนดสิทธิ์ให้แต่ละบทบาท (Role Permissions)
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), -- Admin ได้ทุกสิทธิ์
(2, 3), (2, 4), (2, 5), (2, 6), (2, 7),                 -- Doctor จัดการจองและ EMR ได้
(3, 3), (3, 6),                                         -- Intern ดูรายการจองและ EMR ได้
(4, 3), (4, 4), (4, 5);                                 -- User ดู จอง และยกเลิกการจองของตนเองได้

-- 4. ข้อมูลผู้ใช้งานเริ่มต้น (Seed Users for All 4 Roles)
-- 4. ข้อมูลผู้ใช้งานเริ่มต้น (Seed Users for All 4 Roles & All Doctors)
INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `phone`, `password_hash`, `student_staff_id`, `role_id`, `auth_provider`) VALUES
(1, 'ผู้ดูแล', 'ระบบมบส.', 'admin@bsru.ac.th', '02-473-7000', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'EMP-0001', 1, 'local'),
(2, 'พท.ป. สมหญิง', 'รักษาดี', 'doctor@bsru.ac.th', '081-234-5678', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'EMP-8812', 2, 'bsru_sso'),
(3, 'นศ. ใจดี', 'ตั้งใจเรียน', 'intern@bsru.ac.th', '089-876-5432', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'STD-6610012', 3, 'bsru_sso'),
(4, 'มานะ', 'เรียนดี', 'student@bsru.ac.th', '086-555-4321', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'STD-6610099', 4, 'local'),
(5, 'พท.ป. ณัฐวุฒิ', 'สุวรรณเวช', 'doctor.nattawut@bsru.ac.th', '081-999-1111', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'EMP-8813', 2, 'bsru_sso'),
(6, 'พท.ป. ศิรินทร์ทิพย์', 'เมธาเวช', 'doctor.sirinthip@bsru.ac.th', '081-999-2222', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'EMP-8814', 2, 'bsru_sso'),
(7, 'พท.ป. ธนพล', 'กาญจนพิบูลย์', 'doctor.thanapol@bsru.ac.th', '081-999-3333', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'EMP-8815', 2, 'bsru_sso');

-- 5. ข้อมูลแพทย์ (Seed Doctor Profiles)
INSERT INTO `doctors` (`id`, `user_id`, `license_no`, `academic_title`, `specialization`, `bio`) VALUES
(1, 2, 'พท.ป. 18452', 'อาจารย์แพทย์แผนไทยประจำคลินิก', 'หัตถการบำบัดรักษา, การประคบสมุนไพรสด และเผายาสมุนไพรปรับสมดุลธาตุ', 'อาจารย์ประจำสาขาวิชาการแพทย์แผนไทย มหาวิทยาลัยราชภัฏบ้านสมเด็จเจ้าพระยา ประสบการณ์กว่า 15 ปี'),
(2, 5, 'พท.ป. 18453', 'อาจารย์แพทย์ผู้เชี่ยวชาญ', 'ออฟฟิศซินโดรม / คอ บ่า ไหล่ และหัตถการรักษาโรคกระดูกและข้อ', 'แพทย์ผู้เชี่ยวชาญหัตถการบำบัดโรคกล้ามเนื้อ มหาวิทยาลัยราชภัฏบ้านสมเด็จเจ้าพระยา'),
(3, 6, 'พท.ป. 18454', 'อาจารย์แพทย์ผู้เชี่ยวชาญ', 'นวดประคบสมุนไพรสด, การผ่อนคลายกล้ามเนื้อ และฟื้นฟูสุขภาพ', 'แพทย์ผู้เชี่ยวชาญการประคบสมุนไพรบำบัด มหาวิทยาลัยราชภัฏบ้านสมเด็จเจ้าพระยา'),
(4, 7, 'พท.ป. 18455', 'อาจารย์แพทย์ผู้เชี่ยวชาญ', 'นวดน้ำมันหอมระเหย, การปรับสมดุลธาตุเจ้าเรือน และสุคนธบำบัด', 'แพทย์ผู้เชี่ยวชาญสุคนธบำบัด มหาวิทยาลัยราชภัฏบ้านสมเด็จเจ้าพระยา');

-- 6. ข้อมูลคนไข้ (Seed Patient Profile)
INSERT INTO `patients` (`id`, `user_id`, `blood_type`, `primary_element`, `underlying_conditions`, `emergency_contact_name`, `emergency_contact_phone`) VALUES
(1, 4, 'O', 'ลม', 'ปวดกล้ามเนื้อคอบ่าไหล่จากการทำงานหน้าคอมพิวเตอร์ (Office Syndrome)', 'คุณสมศรี รักสุขภาพ', '086-555-9999');

-- 7. ข้อมูลบริการและหัตถการ (Seed Services)
INSERT INTO `services` (`id`, `service_code`, `title`, `category`, `description`, `duration_minutes`, `price`) VALUES
(1, 'SVC-THAI-MASSAGE', 'นวดไทยเพื่อการรักษา (Therapeutic Thai Massage)', 'massage', 'การกด ดึง ดัด และคลึงตามเส้นประธานสิบ โดยแพทย์แผนไทยประยุกต์ เพื่อรักษาอาการปวดกล้ามเนื้อเรื้อรัง', 60, 450.00),
(2, 'SVC-HERBAL-COMPRESS', 'นวดประคบสมุนไพรสด (Fresh Herbal Compress Massage)', 'herbal', 'ประคบด้วยตัวยาสมุนไพรสดสูตรคลินิก มบส. (ไพล ขมิ้นชัน ตะไคร้หอม) ผ่านความร้อนบรรเทาอาการอักเสบ', 90, 650.00),
(3, 'SVC-AROMA-MASSAGE', 'นวดน้ำมันหอมระเหยสมุนไพร (Herbal Aromatherapy)', 'massage', 'ลูบคลึงด้วยน้ำมันสกัดธรรมชาติ ผสมผสานน้ำมันหอมระเหยช่วยฟื้นฟูผิวและผ่อนคลายลึก', 60, 750.00),
(4, 'SVC-HERBAL-BURNING', 'หัตถการเผายาสมุนไพร (Traditional Herbal Burning Therapy)', 'herbal', 'การเผายาสมุนไพรบนหน้าท้อง/หลัง เพื่อขับลม ไล่ความเย็น และปรับสมดุลธาตุไฟในร่างกาย', 45, 550.00),
(5, 'PKG-OFFICE-SYNDROME', 'แพ็กเกจฟื้นฟูออฟฟิศซินโดรมครบวงจร', 'package', 'รวมนวดไทยบำบัด 60 นาที + ประคบสมุนไพรสด 30 นาที + เผายาขับลมบ่าไหล่', 120, 1200.00);

-- 8. ข้อมูลรายการจองคิวตัวอย่าง (Seed Live Bookings)
INSERT INTO `bookings` (`id`, `booking_code`, `patient_name`, `patient_phone`, `service_name`, `doctor_name`, `room_name`, `status`, `status_text`, `booking_date`, `booking_time`, `notes`) VALUES
(1, 'Q-001', 'คุณประเสริฐ สุขสวัสดิ์', '081-234-5678', 'นวดไทยเพื่อการรักษา (590฿)', 'พท.ป. ณัฐวุฒิ สุวรรณเวช', 'ห้องหัตถการ 1', 'ongoing', 'กำลังรับบริการ', CURDATE(), '09:00', 'ปวดกล้ามเนื้อหลังเรื้อรัง'),
(2, 'Q-002', 'คุณวิภาดา รัตนกุล', '089-876-5432', 'นวดประคบสมุนไพรสด (890฿)', 'พท.ป. ศิรินทร์ทิพย์ เมธาเวช', 'ห้องหัตถการ 3', 'ongoing', 'กำลังรับบริการ', CURDATE(), '10:30', 'ปวดบ่าไหล่จากการทำงาน office syndrome'),
(3, 'Q-003', 'คุณสมชาย ใจดี', '086-555-4321', 'นวดน้ำมันหอมระเหย (1,290฿)', 'พท.ป. ธนพล กาญจนพิบูลย์', 'ห้องหัตถการ 2', 'waiting', 'รอเรียกคิว', CURDATE(), '13:00', 'ต้องการผ่อนคลายความเครียด'),
(4, 'Q-004', 'คุณอนันต์ ชัยชนะ', '090-123-4567', 'หัตถการเผายาสมุนไพร (750฿)', 'พท.ป. ณัฐวุฒิ สุวรรณเวช', 'ห้องหัตถการ 1', 'completed', 'เสร็จสิ้น', CURDATE(), '08:30', 'ท้องอืด ลมในท้องมาก');

-- 9. ข้อมูลบันทึกการรักษาตัวอย่าง (Seed Clinical EMR Log)
INSERT INTO `treatment_records` (`id`, `booking_id`, `patient_id`, `doctor_id`, `pulse_rate`, `elemental_diagnosis`, `symptoms_observed`, `treatment_details`, `herbs_prescribed`, `doctor_notes`) VALUES
(1, 1, 1, 1, '76 bpm (ตับปกติ, ลมกำเริบ)', 'ธาตุลมกำเริบ (วาตะพิการ) บริเวณเส้นประธานอิทาและปิงคลา', 'กล้ามเนื้อ Trapezium และ Levator Scapulae เกร็งแข็งเป็นก้อน', 'เน้นกดจุดสัญญาณ 1-5 คอบ่าไหล่ คลายเส้นประธาน และประคบอุ่น 15 นาที', 'ยาชงสมุนไพรเถาวัลย์เปรียง บรรเทาอาการปวดกล้ามเนื้อ รับประทานหลังอาหาร เช้า-เย็น', 'แนะนำปรับท่าทางการนั่งทำงาน และประคบอุ่นที่บ้านวันละ 15 นาที');

-- 10. ตารางเวลาออกตรวจของแพทย์ (Seed Doctor Schedules)
INSERT INTO `doctor_schedules` (`doctor_id`, `day_of_week`, `start_time`, `end_time`, `max_patients`) VALUES
(1, 'Monday', '09:00:00', '16:30:00', 8),
(1, 'Tuesday', '09:00:00', '16:30:00', 8),
(1, 'Wednesday', '09:00:00', '16:30:00', 8),
(1, 'Thursday', '09:00:00', '16:30:00', 8),
(1, 'Friday', '09:00:00', '16:30:00', 8);

-- ----------------------------------------------------------------------------
-- 11. ตารางคลังยาสมุนไพรและตำรับยาคลินิก (Medicine Inventory Directory Table)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `inventory`;
CREATE TABLE `inventory` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `code` VARCHAR(30) NOT NULL UNIQUE,
    `name` VARCHAR(150) NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `stock` INT NOT NULL DEFAULT 0,
    `unit` VARCHAR(30) NOT NULL DEFAULT 'หน่วย',
    `status` VARCHAR(30) DEFAULT 'normal',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `inventory` (`id`, `code`, `name`, `category`, `stock`, `unit`, `status`) VALUES
(1, 'MED-001', 'ลูกประคบสมุนไพรสด มบส.', 'หัตถการประคบ', 120, 'ลูก', 'normal'),
(2, 'MED-002', 'ยาสมุนไพรขมิ้นชันแคปซูล', 'ยาสมุนไพรเดี่ยว', 15, 'กระปุก', 'low'),
(3, 'MED-003', 'ยาลูกกลอนกษัยเส้นคลินิก', 'ตำรับยาไทย', 85, 'กล่อง', 'normal'),
(4, 'MED-004', 'น้ำมันไพลบำบัดสูตรเข้มข้น', 'น้ำมันนวดบำบัด', 8, 'ขวด', 'low');

-- ============================================================================
-- FINISH DATABASE SETUP SCRIPT
-- ============================================================================
