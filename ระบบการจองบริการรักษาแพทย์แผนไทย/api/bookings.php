<?php
// api/bookings.php - Create Bookings (POST) & Update Status (PUT)
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

// Parse JSON Body
$inputData = json_decode(file_get_contents('php://input'), true);

// =========================================================================
// ENDPOINT 2: POST /api/bookings - Create New Booking
// =========================================================================
if ($method === 'POST') {
    $user_id      = isset($inputData['user_id']) ? (int)$inputData['user_id'] : 0;
    $staff_id     = isset($inputData['staff_id']) ? (int)$inputData['staff_id'] : 0;
    $service_id   = isset($inputData['service_id']) ? (int)$inputData['service_id'] : 0;
    $booking_date = isset($inputData['booking_date']) ? trim($inputData['booking_date']) : '';
    $booking_time = isset($inputData['booking_time']) ? trim($inputData['booking_time']) : '';
    $total_price  = isset($inputData['total_price']) ? (float)$inputData['total_price'] : 0.00;

    // Input Validation
    if ($user_id <= 0 || $staff_id <= 0 || $service_id <= 0 || empty($booking_date) || empty($booking_time)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required fields: user_id, staff_id, service_id, booking_date, booking_time']);
        exit();
    }

    try {
        $pdo->beginTransaction();

        // 1. Check double booking collision for staff
        $stmtCheck = $pdo->prepare("
            SELECT booking_id FROM bookings 
            WHERE staff_id = ? AND booking_date = ? AND booking_time = ? AND status IN ('pending', 'confirmed')
            FOR UPDATE
        ");
        $stmtCheck->execute([$staff_id, $booking_date, $booking_time]);
        if ($stmtCheck->fetch()) {
            $pdo->rollBack();
            http_response_code(409); // Conflict
            echo json_encode(['success' => false, 'message' => 'Selected doctor/time slot is already booked.']);
            exit();
        }

        // 2. Fetch service price if not provided
        if ($total_price <= 0) {
            $stmtService = $pdo->prepare("SELECT price FROM services WHERE service_id = ?");
            $stmtService->execute([$service_id]);
            $service = $stmtService->fetch();
            if ($service) {
                $total_price = (float)$service['price'];
            }
        }

        // 3. Insert into bookings table
        $stmtInsert = $pdo->prepare("
            INSERT INTO bookings (user_id, staff_id, service_id, booking_date, booking_time, status, total_price)
            VALUES (?, ?, ?, ?, ?, 'pending', ?)
        ");
        $stmtInsert->execute([$user_id, $staff_id, $service_id, $booking_date, $booking_time, $total_price]);
        $booking_id = $pdo->lastInsertId();

        $pdo->commit();

        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Booking created successfully',
            'data' => [
                'booking_id'   => (int)$booking_id,
                'user_id'      => $user_id,
                'staff_id'     => $staff_id,
                'service_id'   => $service_id,
                'booking_date' => $booking_date,
                'booking_time' => $booking_time,
                'status'       => 'pending',
                'total_price'  => $total_price
            ]
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit();

    } catch (\PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        exit();
    }
}

// =========================================================================
// ENDPOINT 3: PUT /api/bookings/:id/status - Update Booking Status & Log Intern Hours
// =========================================================================
if ($method === 'PUT') {
    // Get booking_id from query string e.g. api/bookings.php?id=5
    $booking_id = isset($_GET['id']) ? (int)$_GET['id'] : (isset($inputData['booking_id']) ? (int)$inputData['booking_id'] : 0);
    $new_status = isset($inputData['status']) ? trim($inputData['status']) : '';

    $validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];

    if ($booking_id <= 0 || !in_array($new_status, $validStatuses)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid booking ID or status. Status must be: pending, confirmed, completed, or cancelled.']);
        exit();
    }

    try {
        $pdo->beginTransaction();

        // 1. Fetch booking details along with assigned staff role and service duration
        $stmtFetch = $pdo->prepare("
            SELECT 
                b.booking_id, b.staff_id, b.service_id, b.booking_date, b.status AS current_status,
                st.role AS staff_role, st.first_name, st.last_name,
                srv.duration_minutes
            FROM bookings b
            JOIN staff st ON b.staff_id = st.staff_id
            JOIN services srv ON b.service_id = srv.service_id
            WHERE b.booking_id = ?
            FOR UPDATE
        ");
        $stmtFetch->execute([$booking_id]);
        $booking = $stmtFetch->fetch();

        if (!$booking) {
            $pdo->rollBack();
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Booking not found']);
            exit();
        }

        // 2. Update booking status
        $stmtUpdate = $pdo->prepare("UPDATE bookings SET status = ? WHERE booking_id = ?");
        $stmtUpdate->execute([$new_status, $booking_id]);

        $intern_hours_logged = false;
        $logged_hours = 0.00;

        // 3. Automated Trigger Logic for Intern Hours Logging
        if ($new_status === 'completed' && strtolower($booking['staff_role']) === 'intern') {
            // Check if hours were already logged to prevent duplicates
            $stmtLogCheck = $pdo->prepare("SELECT log_id FROM intern_hours_log WHERE booking_id = ?");
            $stmtLogCheck->execute([$booking_id]);
            
            if (!$stmtLogCheck->fetch()) {
                // Calculate hours earned (duration in minutes / 60)
                $duration_minutes = (int)($booking['duration_minutes'] ?? 60);
                $hours_earned = round($duration_minutes / 60.0, 2);

                $stmtInsertLog = $pdo->prepare("
                    INSERT INTO intern_hours_log (staff_id, booking_id, hours_earned, date_logged)
                    VALUES (?, ?, ?, CURDATE())
                ");
                $stmtInsertLog->execute([
                    $booking['staff_id'],
                    $booking_id,
                    $hours_earned
                ]);

                $intern_hours_logged = true;
                $logged_hours = $hours_earned;
            }
        }

        $pdo->commit();

        echo json_encode([
            'success' => true,
            'message' => "Booking status updated to '{$new_status}' successfully",
            'data' => [
                'booking_id'          => $booking_id,
                'previous_status'     => $booking['current_status'],
                'new_status'          => $new_status,
                'staff_id'            => $booking['staff_id'],
                'staff_role'          => $booking['staff_role'],
                'intern_hours_logged' => $intern_hours_logged,
                'hours_earned'        => $logged_hours
            ]
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit();

    } catch (\PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        exit();
    }
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
