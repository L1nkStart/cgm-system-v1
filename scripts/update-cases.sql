ALTER TABLE cases DROP COLUMN patientName, DROP COLUMN patientPhone, DROP COLUMN ciPatient, DROP COLUMN ciTitular, DROP COLUMN patientOtherPhone, DROP COLUMN patientFixedPhone, DROP COLUMN patientBirthDate, DROP COLUMN patientAge, DROP COLUMN patientGender, DROP COLUMN holderCI
ALTER TABLE cases ADD COLUMN holderId VARCHAR(250), ADD CONSTRAINT fk_cases_holder_insurance FOREIGN KEY (holderId) REFERENCES insurance_holders(id) ON DELETE CASCADE
ALTER TABLE cases DROP COLUMN client
