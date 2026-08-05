<?php
/**
 * User Management API Endpoint
 * Handles User Fetching, Creation, Updates, and Deletion from MySQL database
 */

require_once __DIR__ . '/db_config.php';

// Handle CORS Preflight OPTIONS Request
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    http_response_code(200);
    exit;
}

$action = $_REQUEST['action'] ?? 'list';

switch ($action) {
    case 'list':
        handleListUsers();
        break;

    case 'create':
        handleCreateUser();
        break;

    case 'update':
        handleUpdateUser();
        break;

    case 'delete':
        handleDeleteUser();
        break;

    default:
        sendJsonResponse(false, 'Invalid User API action requested', [], 400);
        break;
}

/**
 * 1. Fetch List of Users from MySQL
 */
function handleListUsers() {
    $pdo = getDbConnection();
    if ($pdo) {
        try {
            $stmt = $pdo->query("
                SELECT u.id, CONCAT(u.first_name, ' ', u.last_name) AS name, u.first_name, u.last_name,
                       u.email, u.phone, u.student_staff_id,
                       r.role_key AS role, r.name_th AS roleName
                FROM users u
                JOIN roles r ON u.role_id = r.id
                ORDER BY u.id ASC
            ");
            $users = $stmt->fetchAll();

            $formattedUsers = array_map(function($u) {
                return [
                    'id' => 'USR-' . str_pad($u['id'], 3, '0', STR_PAD_LEFT),
                    'db_id' => $u['id'],
                    'name' => $u['name'],
                    'email' => $u['email'],
                    'phone' => $u['phone'],
                    'role' => $u['role'],
                    'roleName' => $u['roleName']
                ];
            }, $users);

            sendJsonResponse(true, 'Users fetched from MySQL', $formattedUsers);
            return;
        } catch (\PDOException $e) {
            sendJsonResponse(false, 'Database Error: ' . $e->getMessage(), [], 500);
            return;
        }
    }

    // Fallback Seed Users
    $seedUsers = [
        [ 'id' => 'USR-001', 'db_id' => 1, 'name' => 'สมชาย แอดมิน', 'email' => 'admin@bsru.ac.th', 'phone' => '02-473-7000', 'role' => 'admin', 'roleName' => 'ผู้ดูแลระบบ (Admin)' ],
        [ 'id' => 'USR-002', 'db_id' => 2, 'name' => 'พท.ป. สมหญิง รักษาดี', 'email' => 'doctor@bsru.ac.th', 'phone' => '081-234-5678', 'role' => 'doctor', 'roleName' => 'แพทย์แผนไทย (Doctor)' ],
        [ 'id' => 'USR-003', 'db_id' => 3, 'name' => 'นศ. ใจดี ตั้งใจเรียน', 'email' => 'intern@bsru.ac.th', 'phone' => '089-876-5432', 'role' => 'intern', 'roleName' => 'นักศึกษาฝึกงาน (Intern)' ],
        [ 'id' => 'USR-004', 'db_id' => 4, 'name' => 'มานะ เรียนดี', 'email' => 'student@bsru.ac.th', 'phone' => '086-555-4321', 'role' => 'user', 'roleName' => 'ผู้ใช้งานทั่วไป/นักศึกษา (Student)' ]
    ];

    sendJsonResponse(true, 'Users fetched (Fallback mode)', $seedUsers);
}

/**
 * 2. Create User in MySQL
 */
function handleCreateUser() {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true) ?: $_POST;

    $name = trim($data['name'] ?? '');
    $email = trim($data['email'] ?? '');
    $phone = trim($data['phone'] ?? '');
    $role = trim($data['role'] ?? 'user');

    if (empty($name) || empty($email)) {
        sendJsonResponse(false, 'Name and Email are required', [], 400);
    }

    $roleMap = [ 'admin' => 1, 'doctor' => 2, 'intern' => 3, 'user' => 4 ];
    $roleId = $roleMap[$role] ?? 4;

    $nameParts = explode(' ', $name, 2);
    $firstName = $nameParts[0];
    $lastName = $nameParts[1] ?? '';

    $pdo = getDbConnection();
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("INSERT INTO users (first_name, last_name, email, phone, role_id) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$firstName, $lastName, $email, $phone, $roleId]);
            $newId = $pdo->lastInsertId();

            sendJsonResponse(true, "เพิ่มผู้ใช้งานใหม่ '{$name}' ใน MySQL สำเร็จ", [
                'id' => 'USR-' . str_pad($newId, 3, '0', STR_PAD_LEFT),
                'db_id' => $newId,
                'name' => $name,
                'email' => $email,
                'phone' => $phone,
                'role' => $role
            ]);
        } catch (\PDOException $e) {
            sendJsonResponse(false, 'Database Error: ' . $e->getMessage(), [], 500);
        }
    }

    sendJsonResponse(true, "เพิ่มผู้ใช้งานใหม่ '{$name}' สำเร็จ (Fallback)", [
        'id' => 'USR-' . str_pad(rand(5, 99), 3, '0', STR_PAD_LEFT),
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'role' => $role
    ]);
}

/**
 * 3. Update User in MySQL
 */
function handleUpdateUser() {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true) ?: $_POST;

    $userId = intval($data['db_id'] ?? $data['id'] ?? 0);
    $name = trim($data['name'] ?? '');
    $email = trim($data['email'] ?? '');
    $phone = trim($data['phone'] ?? '');
    $role = trim($data['role'] ?? 'user');

    $roleMap = [ 'admin' => 1, 'doctor' => 2, 'intern' => 3, 'user' => 4 ];
    $roleId = $roleMap[$role] ?? 4;

    $nameParts = explode(' ', $name, 2);
    $firstName = $nameParts[0];
    $lastName = $nameParts[1] ?? '';

    $pdo = getDbConnection();
    if ($pdo && $userId > 0) {
        try {
            $stmt = $pdo->prepare("UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ?, role_id = ? WHERE id = ?");
            $stmt->execute([$firstName, $lastName, $email, $phone, $roleId, $userId]);

            sendJsonResponse(true, "อัปเดตข้อมูลผู้ใช้งาน ID: {$userId} ใน MySQL สำเร็จ", [
                'db_id' => $userId,
                'name' => $name,
                'email' => $email,
                'phone' => $phone,
                'role' => $role
            ]);
        } catch (\PDOException $e) {
            sendJsonResponse(false, 'Database Error: ' . $e->getMessage(), [], 500);
        }
    }

    sendJsonResponse(true, "อัปเดตข้อมูลผู้ใช้งานเรียบร้อยแล้ว", [ 'name' => $name ]);
}

/**
 * 4. Delete User from MySQL
 */
function handleDeleteUser() {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true) ?: $_POST;

    $userId = intval($data['db_id'] ?? 0);
    $email = trim($data['email'] ?? '');

    $pdo = getDbConnection();
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("DELETE FROM users WHERE id = ? OR email = ?");
            $stmt->execute([$userId, $email]);

            sendJsonResponse(true, "ลบบัญชีผู้ใช้งานจาก MySQL เรียบร้อยแล้ว", [ 'db_id' => $userId, 'email' => $email ]);
        } catch (\PDOException $e) {
            sendJsonResponse(false, 'Database Delete Error: ' . $e->getMessage(), [], 500);
        }
    }

    sendJsonResponse(true, "ลบบัญชีผู้ใช้งานเรียบร้อยแล้ว", [ 'email' => $email ]);
}
?>
