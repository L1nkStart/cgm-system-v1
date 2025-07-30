-- Agregar el campo insuranceCompanyId a la tabla clients
ALTER TABLE clients 
ADD COLUMN insuranceCompanyId VARCHAR(255) AFTER insuranceCompany,
ADD FOREIGN KEY (insuranceCompanyId) REFERENCES insurance_companies(id) ON DELETE SET NULL;

-- Crear índice para mejor rendimiento
CREATE INDEX idx_clients_insurance_company ON clients(insuranceCompanyId);
