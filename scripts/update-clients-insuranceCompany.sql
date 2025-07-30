ALTER TABLE clients 
ADD COLUMN insuranceCompany VARCHAR(255) AFTER name;

-- Actualizar el índice para incluir el nuevo campo si es necesario
CREATE INDEX idx_clients_insurance_company ON clients(insuranceCompany);