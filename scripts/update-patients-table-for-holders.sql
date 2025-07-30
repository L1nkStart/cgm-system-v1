-- Add primary insurance holder reference to patients table for quick access
ALTER TABLE patients 
ADD COLUMN primaryInsuranceHolderId VARCHAR(255),
ADD FOREIGN KEY (primaryInsuranceHolderId) REFERENCES insurance_holders(id) ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX idx_patients_primary_holder ON patients(primaryInsuranceHolderId);
