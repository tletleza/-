<?php
// api/schedules.php - Fetch Available Doctors & Slots by Symptom
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit();
}

$symptom_id = isset($_GET['symptom_id']) ? (int)$_GET['symptom_id'] : 0;
$work_date  = isset($_GET['work_date']) ? trim($_GET['work_date']) : date('Y-m-d');

if ($symptom_id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'symptom_id is required']);
    exit();
}

try {
    // 1. Find Specialty associated with the given symptom
    $stmtSymptom = $pdo->prepare("
        SELECT s.symptom_id, s.symptom_name, s.specialty_id, spec.specialty_name
        FROM symptoms s
        LEFT JOIN specialties spec ON s.specialty_id = spec.specialty_id
        WHERE s.symptom_id = ?
    ");
    $stmtSymptom->execute([$symptom_id]);
    $symptomInfo = $stmtSymptom->fetch();

    if (!$symptomInfo) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Symptom not found']);
        exit();
    }

    $specialty_id = $symptomInfo['specialty_id'];

    // 2. Fetch staff members matching the specialty along with their available schedules
    $sql = "
        SELECT 
            st.staff_id,
            st.first_name,
            st.last_name,
            st.phone,
            st.role,
            st.profile_image,
            sp.specialty_name,
            sch.schedule_id,
            sch.work_date,
            sch.start_time,
            sch.end_time,
            sch.status AS schedule_status
        FROM staff st
        JOIN schedules sch ON st.staff_id = sch.staff_id
        LEFT JOIN specialties sp ON st.specialty_id = sp.specialty_id
        WHERE (st.specialty_id = :specialty_id OR :specialty_id IS NULL)
          AND sch.work_date = :work_date
          AND sch.status = 'available'
        ORDER BY sch.start_time ASC
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        'specialty_id' => $specialty_id,
        'work_date'    => $work_date
    ]);
    $results = $stmt->fetchAll();

    // 3. For each available staff schedule, exclude already booked time slots
    $schedules = [];
    foreach ($results as $row) {
        $staff_id = $row['staff_id'];
        
        // Fetch existing bookings for this staff on this date
        $stmtBookings = $pdo->prepare("
            SELECT booking_time 
            FROM bookings 
            WHERE staff_id = ? AND booking_date = ? AND status IN ('pending', 'confirmed')
        ");
        $stmtBookings->execute([$staff_id, $work_date]);
        $bookedTimes = $stmtBookings->fetchAll(PDO::FETCH_COLUMN);

        $row['existing_booked_times'] = $bookedTimes;
        $schedules[] = $row;
    }

    echo json_encode([
        'success' => true,
        'symptom' => $symptomInfo,
        'query'   => ['symptom_id' => $symptom_id, 'work_date' => $work_date],
        'data'    => $schedules
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
