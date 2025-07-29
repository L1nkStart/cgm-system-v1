-- Create the patients table
CREATE TABLE IF NOT EXISTS patients (
    id VARCHAR(255) PRIMARY KEY,
    ci VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    otherPhone VARCHAR(255),
    fixedPhone VARCHAR(255),
    birthDate DATE,
    age INT,
    gender VARCHAR(50),
    address TEXT,
    city VARCHAR(255),
    state VARCHAR(255),
    email VARCHAR(255),
    emergencyContact VARCHAR(255),
    emergencyPhone VARCHAR(255),
    bloodType VARCHAR(10),
    allergies TEXT,
    medicalHistory TEXT,
    isActive BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add index for faster CI lookups
CREATE INDEX idx_patients_ci ON patients(ci);

-- Update cases table to reference patients
ALTER TABLE cases ADD COLUMN patientId VARCHAR(255);
ALTER TABLE cases ADD FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE SET NULL;
