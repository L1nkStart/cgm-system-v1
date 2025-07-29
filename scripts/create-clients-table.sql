CREATE TABLE IF NOT EXISTS clients (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  rif VARCHAR(20) UNIQUE NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(100),
  contactPerson VARCHAR(255),
  contactPhone VARCHAR(20),
  contactEmail VARCHAR(100),
  baremoId VARCHAR(36),
  isActive BOOLEAN DEFAULT TRUE,
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (baremoId) REFERENCES baremos(id) ON DELETE SET NULL,
  INDEX idx_clients_name (name),
  INDEX idx_clients_rif (rif),
  INDEX idx_clients_baremo (baremoId)
);
-- Update cases table to reference patients
ALTER TABLE cases ADD COLUMN clientId VARCHAR(255);
ALTER TABLE cases ADD FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE SET NULL;