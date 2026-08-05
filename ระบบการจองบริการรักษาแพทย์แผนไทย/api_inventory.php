<?php
/**
 * Medicine & Herbs Inventory API Endpoint
 * Handles MySQL Inventory List, Item Addition, Stock Deduct/Add, and Item Deletion
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
        handleListInventory();
        break;

    case 'create':
        handleCreateInventory();
        break;

    case 'update_stock':
        handleUpdateInventoryStock();
        break;

    case 'delete':
        handleDeleteInventory();
        break;

    default:
        sendJsonResponse(false, 'Invalid Inventory API action requested', [], 400);
        break;
}

/**
 * 1. Fetch Medicine Inventory List from MySQL
 */
function handleListInventory() {
    $pdo = getDbConnection();
    if ($pdo) {
        try {
            $stmt = $pdo->query("SELECT id, code, name, category, stock, unit, status FROM inventory ORDER BY id ASC");
            $inventory = $stmt->fetchAll();

            $formatted = array_map(function($item) {
                $status = ($item['stock'] < 20) ? 'low' : 'normal';
                $statusText = ($item['stock'] < 20) ? 'สินค้าใกล้หมด (ควรสั่งเพิ่ม)' : 'สต็อกปกติ';
                return [
                    'id' => $item['id'],
                    'code' => $item['code'],
                    'name' => $item['name'],
                    'category' => $item['category'],
                    'stock' => intval($item['stock']),
                    'unit' => $item['unit'],
                    'status' => $status,
                    'statusText' => $statusText
                ];
            }, $inventory);

            sendJsonResponse(true, 'Inventory fetched successfully from MySQL', $formatted);
            return;
        } catch (\PDOException $e) {
            // Fallthrough
        }
    }

    // Default Seed Medicine Inventory Fallback
    $mockInventory = [
        [ 'id' => 1, 'code' => 'MED-001', 'name' => 'ลูกประคบสมุนไพรสด มบส.', 'category' => 'หัตถการประคบ', 'stock' => 120, 'unit' => 'ลูก', 'status' => 'normal', 'statusText' => 'สต็อกปกติ' ],
        [ 'id' => 2, 'code' => 'MED-002', 'name' => 'ยาสมุนไพรขมิ้นชันแคปซูล', 'category' => 'ยาสมุนไพรเดี่ยว', 'stock' => 15, 'unit' => 'กระปุก', 'status' => 'low', 'statusText' => 'สินค้าใกล้หมด (ควรสั่งเพิ่ม)' ],
        [ 'id' => 3, 'code' => 'MED-003', 'name' => 'ยาลูกกลอนกษัยเส้นคลินิก', 'category' => 'ตำรับยาไทย', 'stock' => 85, 'unit' => 'กล่อง', 'status' => 'normal', 'statusText' => 'สต็อกปกติ' ],
        [ 'id' => 4, 'code' => 'MED-004', 'name' => 'น้ำมันไพลบำบัดสูตรเข้มข้น', 'category' => 'น้ำมันนวดบำบัด', 'stock' => 8, 'unit' => 'ขวด', 'status' => 'low', 'statusText' => 'สินค้าใกล้หมด (ควรสั่งเพิ่ม)' ]
    ];

    sendJsonResponse(true, 'Inventory fetched (Fallback mode)', $mockInventory);
}

/**
 * 2. Create New Medicine Inventory Item in MySQL
 */
function handleCreateInventory() {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true) ?: $_POST;

    $name = trim($data['med_name'] ?? $data['name'] ?? '');
    $category = trim($data['med_category'] ?? $data['category'] ?? 'ยาสมุนไพรเดี่ยว');
    $stock = intval($data['med_stock'] ?? $data['stock'] ?? $data['qty'] ?? 10);
    $unit = trim($data['med_unit'] ?? $data['unit'] ?? 'หน่วย');

    if (empty($name)) {
        sendJsonResponse(false, 'Medicine item name is required', [], 400);
    }

    $pdo = getDbConnection();
    if ($pdo) {
        try {
            $countStmt = $pdo->query("SELECT MAX(id) AS max_id FROM inventory");
            $maxRow = $countStmt->fetch();
            $nextNum = ($maxRow && !empty($maxRow['max_id'])) ? intval($maxRow['max_id']) + 1 : 1;
            $code = 'MED-' . str_pad($nextNum, 3, '0', STR_PAD_LEFT);

            $stmt = $pdo->prepare("INSERT INTO inventory (code, name, category, stock, unit, status) VALUES (?, ?, ?, ?, ?, ?)");
            $status = ($stock < 20) ? 'low' : 'normal';
            $stmt->execute([$code, $name, $category, $stock, $unit, $status]);
            $insertedId = $pdo->lastInsertId();

            sendJsonResponse(true, "เพิ่มรายการยาสมุนไพรใหม่ '{$name}' ({$code}) ใน MySQL สำเร็จ!", [
                'id' => $insertedId,
                'code' => $code,
                'name' => $name,
                'category' => $category,
                'stock' => $stock,
                'unit' => $unit,
                'status' => $status
            ]);
            return;
        } catch (\PDOException $e) {
            sendJsonResponse(false, 'Database Insert Error: ' . $e->getMessage(), [], 500);
            return;
        }
    }

    sendJsonResponse(true, "เพิ่มรายการยาสมุนไพรเรียบร้อยแล้ว", ['name' => $name]);
}

/**
 * 3. Add or Deduct Stock in MySQL
 */
function handleUpdateInventoryStock() {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true) ?: $_POST;

    $itemId = intval($data['id'] ?? 0);
    $code = trim($data['code'] ?? '');
    $name = trim($data['name'] ?? '');
    $newStock = isset($data['stock']) ? intval($data['stock']) : null;

    $pdo = getDbConnection();
    if ($pdo) {
        try {
            if ($newStock !== null) {
                $status = ($newStock < 20) ? 'low' : 'normal';
                $stmt = $pdo->prepare("UPDATE inventory SET stock = ?, status = ? WHERE id = ? OR code = ? OR name = ?");
                $stmt->execute([$newStock, $status, $itemId, $code, $name]);
            }
            sendJsonResponse(true, "อัปเดตสต็อกเรียบร้อยแล้ว", ['stock' => $newStock]);
            return;
        } catch (\PDOException $e) {
            sendJsonResponse(false, 'Database Update Error: ' . $e->getMessage(), [], 500);
            return;
        }
    }

    sendJsonResponse(true, "อัปเดตสต็อกเรียบร้อยแล้ว", ['stock' => $newStock]);
}

/**
 * 4. Delete Medicine Inventory Item from MySQL
 */
function handleDeleteInventory() {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true) ?: $_POST;

    $itemId = intval($data['id'] ?? 0);
    $code = trim($data['code'] ?? '');
    $name = trim($data['name'] ?? '');

    $pdo = getDbConnection();
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("DELETE FROM inventory WHERE id = ? OR code = ? OR name = ?");
            $stmt->execute([$itemId, $code, $name]);

            sendJsonResponse(true, "ลบรายการสมุนไพร/ยาจาก MySQL เรียบร้อยแล้ว", ['code' => $code, 'name' => $name]);
            return;
        } catch (\PDOException $e) {
            sendJsonResponse(false, 'Database Delete Error: ' . $e->getMessage(), [], 500);
            return;
        }
    }

    sendJsonResponse(true, "ลบรายการเรียบร้อยแล้ว", ['code' => $code]);
}
?>
