CREATE TABLE IF NOT EXISTS insurance_companies (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  rif VARCHAR(50) UNIQUE,
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  contactPerson VARCHAR(255),
  contactPhone VARCHAR(50),
  contactEmail VARCHAR(255),
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_insurance_companies_name ON insurance_companies(name);
CREATE INDEX idx_insurance_companies_rif ON insurance_companies(rif);
CREATE INDEX idx_insurance_companies_active ON insurance_companies(isActive);
