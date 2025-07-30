
--DEBUG ONLY

-- Agregar la columna clientId a la tabla insurance_holders
ALTER TABLE insurance_holders 
ADD COLUMN clientId VARCHAR(36) AFTER insuranceCompany;

-- Crear la relación foreign key con la tabla clients
ALTER TABLE insurance_holders 
ADD CONSTRAINT fk_insurance_holders_client 
FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE SET NULL;

-- Crear índice para mejor rendimiento
CREATE INDEX idx_insurance_holders_client ON insurance_holders(clientId);

-- Opcional: Migrar datos existentes si hay insurance_holders con insuranceCompany
-- que coincidan con nombres de clients existentes
UPDATE insurance_holders ih
INNER JOIN clients c ON ih.insuranceCompany = c.name
SET ih.clientId = c.id
WHERE ih.clientId IS NULL AND ih.insuranceCompany IS NOT NULL;
