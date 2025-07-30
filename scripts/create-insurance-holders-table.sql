-- Create the insurance holders table
CREATE TABLE IF NOT EXISTS insurance_holders (
    id VARCHAR(255) PRIMARY KEY,
    ci VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    otherPhone VARCHAR(255),
    fixedPhone VARCHAR(255),
    email VARCHAR(255),
    birthDate DATE,
    age INT,
    gender VARCHAR(50),
    address TEXT,
    city VARCHAR(255),
    state VARCHAR(255),
    
    -- Insurance specific information
    policyNumber VARCHAR(255),
    insuranceCompany VARCHAR(255),
    policyType VARCHAR(255), -- Individual, Familiar, Corporativo
    policyStatus VARCHAR(255) DEFAULT 'Activo', -- Activo, Suspendido, Vencido, Cancelado
    policyStartDate DATE,
    policyEndDate DATE,
    
    -- Coverage information
    coverageType VARCHAR(255), -- Básico, Intermedio, Premium
    maxCoverageAmount DECIMAL(12, 2),
    usedCoverageAmount DECIMAL(12, 2) DEFAULT 0.00,
    
    -- Emergency contact
    emergencyContact VARCHAR(255),
    emergencyPhone VARCHAR(255),
    
    -- Medical information
    bloodType VARCHAR(10),
    allergies TEXT,
    medicalHistory TEXT,
    
    -- System fields
    isActive BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create junction table for holder-patient relationships
CREATE TABLE IF NOT EXISTS holder_patient_relationships (
    id VARCHAR(255) PRIMARY KEY,
    holderId VARCHAR(255) NOT NULL,
    patientId VARCHAR(255) NOT NULL,
    relationshipType VARCHAR(255) NOT NULL, -- 'Titular', 'Cónyuge', 'Hijo/a', 'Padre/Madre', 'Hermano/a', 'Otro'
    isPrimary BOOLEAN DEFAULT FALSE, -- Indicates if this is the primary holder for this patient
    isActive BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (holderId) REFERENCES insurance_holders(id) ON DELETE CASCADE,
    FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE,
    
    -- Ensure unique active relationships per holder-patient pair
    UNIQUE KEY unique_active_relationship (holderId, patientId, isActive)
);

-- Add indexes for better performance
CREATE INDEX idx_insurance_holders_ci ON insurance_holders(ci);
CREATE INDEX idx_insurance_holders_policy ON insurance_holders(policyNumber);
CREATE INDEX idx_insurance_holders_company ON insurance_holders(insuranceCompany);
CREATE INDEX idx_insurance_holders_status ON insurance_holders(policyStatus);
CREATE INDEX idx_holder_patient_holder ON holder_patient_relationships(holderId);
CREATE INDEX idx_holder_patient_patient ON holder_patient_relationships(patientId);
CREATE INDEX idx_holder_patient_primary ON holder_patient_relationships(isPrimary);


ALTER TABLE insurance_holders 
ADD COLUMN clientId VARCHAR(255),
ADD FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX idx_insurance_holders_client ON insurance_holders(clientId);