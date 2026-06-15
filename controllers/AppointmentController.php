<?php
require_once __DIR__ . '/../models/AppointmentModel.php';

class AppointmentController
{
    private AppointmentModel $model;

    public function __construct()
    {
        $this->model = new AppointmentModel();
    }

    public function handleRequest(): void
    {
        // Captura cualquier output accidental (notices, warnings de AppointmentModel, etc.)
        // antes de emitir JSON. Sin esto, un solo notice rompe el JSON.parse del cliente.
        ob_start();

        $action = $_GET['action'] ?? '';

        if ($action === 'list') {
            $date = $_GET['date'] ?? date('Y-m-d');
            $this->json($this->model->getByDate($date));
        }

        if ($action === 'create' && $_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = [
                'patient_name' => trim($_POST['patient_name'] ?? ''),
                'phone'        => trim($_POST['phone']        ?? ''),
                'social_work'  => trim($_POST['social_work']  ?? ''),
                'payment'      => floatval($_POST['payment']  ?? 0),
                'doctor'       => trim($_POST['doctor']       ?? ''),
                'notes'        => trim($_POST['notes']        ?? ''),
                'status'       => trim($_POST['status']       ?? 'Pendiente'),
                'date'         => $_POST['date']              ?? '',
                'time_start'   => $_POST['time_start']        ?? '',
                'time_end'     => $_POST['time_end']          ?? '',
            ];
            $this->json(['success' => $this->model->create($data)]);
        }

        if ($action === 'delete' && $_SERVER['REQUEST_METHOD'] === 'POST') {
            $id = intval($_POST['id'] ?? 0);
            $this->json(['success' => $this->model->delete($id)]);
        }
    }

    // Descarta cualquier output acumulado y emite JSON limpio
    private function json(mixed $data, int $status = 200): void
    {
        ob_end_clean();
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }
}
