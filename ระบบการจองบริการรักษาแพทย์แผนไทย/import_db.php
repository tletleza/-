<?php
/**
 * Database Importer Script for XAMPP (UTF-8 Enforced)
 */
require_once __DIR__ . '/db_config.php';

try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";charset=utf8mb4", DB_USER, DB_PASS, [
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4",
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    $sqlContent = file_get_contents(__DIR__ . '/database.sql');
    
    // Split SQL statements by semicolon
    $statements = array_filter(
        array_map('trim', explode(';', $sqlContent)),
        'strlen'
    );

    foreach ($statements as $stmt) {
        if (!empty($stmt)) {
            $pdo->exec($stmt);
        }
    }

    echo "Database imported successfully with UTF-8 encoding!\n";
} catch (\PDOException $e) {
    echo "Import Error: " . $e->getMessage() . "\n";
}
?>
