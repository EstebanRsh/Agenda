<?php
require_once __DIR__ . '/controllers/CalendarController.php';
require_once __DIR__ . '/controllers/AppointmentController.php';

$action = $_GET['action'] ?? '';

if (in_array($action, ['list', 'create', 'delete'])) {
    $controller = new AppointmentController();
    $controller->handleRequest();
} else {
    $controller = new CalendarController();
    $controller->index();
}