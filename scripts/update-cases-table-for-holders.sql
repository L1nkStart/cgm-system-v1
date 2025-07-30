-- Add insurance holder reference to cases table
ALTER TABLE cases 
ADD COLUMN insuranceHolderId VARCHAR(255),
ADD COLUMN relationshipToHolder VARCHAR(255) DEFAULT 'Titular',
ADD FOREIGN KEY (insuranceHolderId) REFERENCES insurance_holders(id) ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX idx_cases_insurance_holder ON cases(insuranceHolderId);

-- Update existing cases to have a default insurance holder (optional migration)
-- This would need to be run after creating some insurance holders
-- UPDATE cases SET insuranceHolderId = 'default-holder-id' WHERE insuranceHolderId IS NULL;
