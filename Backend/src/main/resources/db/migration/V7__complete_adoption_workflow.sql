ALTER TABLE adoption_listings ADD COLUMN request_message VARCHAR(2000);
ALTER TABLE adoption_listings ADD COLUMN requested_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE adoption_listings ADD COLUMN reviewed_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX idx_adoption_applicant ON adoption_listings(applicant_id);
