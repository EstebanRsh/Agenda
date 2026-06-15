CREATE DATABASE IF NOT EXISTS consultorio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE consultorio;

CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    social_work VARCHAR(100),
    payment DECIMAL(10,2),
    doctor VARCHAR(100),
    notes TEXT,
    status ENUM('Pendiente', 'Confirmado', 'En atención', 'Finalizado', 'Cancelado', 'Ausente') NOT NULL DEFAULT 'Pendiente',
    date DATE NOT NULL,
    time_start TIME NOT NULL,
    time_end TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);