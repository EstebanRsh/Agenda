<?php
require_once __DIR__ . '/../config/database.php';

class CalendarModel {
    private mysqli $conn;

    public function __construct() {
        $this->conn = getConnection();
    }

    public function getEventsByMonth(int $year, int $month): array {
        $start = "$year-" . str_pad($month, 2, '0', STR_PAD_LEFT) . "-01";
        $end   = date('Y-m-t', strtotime($start));
        $stmt  = $this->conn->prepare("SELECT * FROM events WHERE event_date BETWEEN ? AND ?");
        $stmt->bind_param('ss', $start, $end);
        $stmt->execute();
        $result = $stmt->get_result();
        $events = [];
        while ($row = $result->fetch_assoc()) {
            $events[$row['event_date']][] = $row;
        }
        return $events;
    }
}