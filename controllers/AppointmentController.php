<?php
require_once __DIR__ . '/../models/AppointmentModel.php';

class AppointmentController {
    private AppointmentModel $model;

    public function __construct() {
        $this->model = new AppointmentModel();
    }

    public function handleRequest(): void {
        $action = $_GET['action'] ?? '';

        if ($action === 'list') {
            $date = $_GET['date'] ?? date('Y-m-d');
            header('Content-Type: application/json');
            echo json_encode($this->model->getByDate($date));
            exit;
        }

        if ($action === 'create' && $_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = [
                'patient_name' => trim($_POST['patient_name'] ?? ''),
                'phone'        => trim($_POST['phone'] ?? ''),
                'social_work'  => trim($_POST['social_work'] ?? ''),
                'payment'      => floatval($_POST['payment'] ?? 0),
                'doctor'       => trim($_POST['doctor'] ?? ''),
                'notes'        => trim($_POST['notes'] ?? ''),
                'date'         => $_POST['date'] ?? '',
                'time_start'   => $_POST['time_start'] ?? '',
                'time_end'     => $_POST['time_end'] ?? '',
            ];
            header('Content-Type: application/json');
            echo json_encode(['success' => $this->model->create($data)]);
            exit;
        }

        if ($action === 'delete' && $_SERVER['REQUEST_METHOD'] === 'POST') {
            $id = intval($_POST['id'] ?? 0);
            header('Content-Type: application/json');
            echo json_encode(['success' => $this->model->delete($id)]);
            exit;
        }
    }
}