-- Create the clients table
CREATE TABLE IF NOT EXISTS clients (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    rif VARCHAR(50) UNIQUE NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    contactPerson VARCHAR(255),
    contactPhone VARCHAR(50),
    contactEmail VARCHAR(255),
    baremoId VARCHAR(255),
    isActive BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (baremoId) REFERENCES baremos(id) ON DELETE SET NULL
);
