-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Casos
CREATE TABLE IF NOT EXISTS cases (
    id VARCHAR(36) PRIMARY KEY,
    client VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    sinisterNo VARCHAR(255),
    idNumber VARCHAR(255),
    ciTitular VARCHAR(255),
    ciPatient VARCHAR(255),
    patientName VARCHAR(255) NOT NULL,
    patientPhone VARCHAR(255) NOT NULL,
    assignedAnalystId VARCHAR(36),
    status VARCHAR(255) NOT NULL,
    doctor VARCHAR(255),
    schedule VARCHAR(255),
    consultory VARCHAR(255),
    results TEXT,
    auditNotes TEXT,
    clinicCost DECIMAL(10, 2) DEFAULT 0.00,
    cgmServiceCost DECIMAL(10, 2) DEFAULT 0.00,
    totalInvoiceAmount DECIMAL(10, 2) DEFAULT 0.00,
    invoiceGenerated BOOLEAN DEFAULT FALSE,
    creatorName VARCHAR(255),
    creatorEmail VARCHAR(255),
    creatorPhone VARCHAR(255),
    patientOtherPhone VARCHAR(255),
    patientFixedPhone VARCHAR(255),
    patientBirthDate DATE,
    patientAge INT,
    patientGender VARCHAR(50),
    collective VARCHAR(255),
    diagnosis TEXT,
    provider VARCHAR(255),
    state VARCHAR(255),
    city VARCHAR(255),
    address TEXT,
    holderCI VARCHAR(255),
    services JSON, -- Almacena un array de objetos JSON
    typeOfRequirement VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assignedAnalystId) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabla de Pagos
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(36) PRIMARY KEY,
    invoiceId VARCHAR(36) NOT NULL, -- Enlaza con el ID de un caso
    amount DECIMAL(10, 2) NOT NULL,
    paymentDate DATE NOT NULL,
    status VARCHAR(255) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (invoiceId) REFERENCES cases(id) ON DELETE CASCADE
);

-- Tabla de Baremos
CREATE TABLE IF NOT EXISTS baremos (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    clinicName VARCHAR(255) NOT NULL,
    effectiveDate DATE NOT NULL,
    procedures JSON, -- Almacena un array de objetos JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
