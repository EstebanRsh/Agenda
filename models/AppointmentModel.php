<?php
require_once __DIR__ . '/../config/database.php';

class AppointmentModel {
    private mysqli $conn;

    public function __construct() {
        $this->conn = getConnection();
    }

    public function getByDate(string $date): array {
        $stmt = $this->conn->prepare("SELECT * FROM appointments WHERE date = ? ORDER BY time_start ASC");
        $stmt->bind_param('s', $date);
        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    public function create(array $data): bool {
        $stmt = $this->conn->prepare("
            INSERT INTO appointments (patient_name, phone, social_work, payment, doctor, notes, date, time_start, time_end)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->bind_param(
            'sssdsssss',
            $data['patient_name'],
            $data['phone'],
            $data['social_work'],
            $data['payment'],
            $data['doctor'],
            $data['notes'],
            $data['date'],
            $data['time_start'],
            $data['time_end']
        );
        return $stmt->execute();
    }

    public function delete(int $id): bool {
        $stmt = $this->conn->prepare("DELETE FROM appointments WHERE id = ?");
        $stmt->bind_param('i', $id);
        return $stmt->execute();
    }
}