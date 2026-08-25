CREATE TABLE pets (
    id UUID PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    species VARCHAR(60) NOT NULL,
    breed VARCHAR(120) NOT NULL,
    gender VARCHAR(30) NOT NULL,
    date_of_birth DATE NOT NULL,
    weight VARCHAR(40) NOT NULL,
    photo TEXT,
    health_status VARCHAR(120) NOT NULL,
    allergies VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE appointments (
    id UUID PRIMARY KEY,
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    vet_id UUID REFERENCES app_users(id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    reason VARCHAR(500) NOT NULL,
    status VARCHAR(30) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT ck_appointments_status CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED'))
);

CREATE TABLE medical_records (
    id UUID PRIMARY KEY,
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    vet_id UUID REFERENCES app_users(id) ON DELETE SET NULL,
    record_date DATE NOT NULL,
    diagnosis VARCHAR(500) NOT NULL,
    treatment VARCHAR(1000) NOT NULL,
    medication VARCHAR(500) NOT NULL,
    vaccination VARCHAR(500) NOT NULL,
    notes VARCHAR(2000) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE adoption_listings (
    id UUID PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    species VARCHAR(60) NOT NULL,
    breed VARCHAR(120) NOT NULL,
    age VARCHAR(60) NOT NULL,
    photo TEXT,
    status VARCHAR(30) NOT NULL,
    applicant_id UUID REFERENCES app_users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT ck_adoption_status CHECK (status IN ('AVAILABLE', 'PENDING', 'ADOPTED'))
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    message VARCHAR(1000) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_pets_owner ON pets(owner_id);
CREATE INDEX idx_appointments_owner ON appointments(owner_id);
CREATE INDEX idx_medical_records_pet ON medical_records(pet_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);

INSERT INTO adoption_listings (id, name, species, breed, age, photo, status, applicant_id, created_at) VALUES
('10000000-0000-0000-0000-000000000001', 'Milo', 'Dog', 'Golden Retriever', '2 years', '/images/adoption/milo.jpg', 'AVAILABLE', NULL, CURRENT_TIMESTAMP),
('10000000-0000-0000-0000-000000000002', 'Nala', 'Cat', 'Domestic shorthair', '1 year', '/images/adoption/nala.jpg', 'AVAILABLE', NULL, CURRENT_TIMESTAMP),
('10000000-0000-0000-0000-000000000003', 'Bailey', 'Dog', 'Labrador Retriever', '3 years', '/images/adoption/bailey.jpg', 'AVAILABLE', NULL, CURRENT_TIMESTAMP),
('10000000-0000-0000-0000-000000000004', 'Simba', 'Cat', 'Brown tabby', '2 years', '/images/adoption/simba.jpg', 'AVAILABLE', NULL, CURRENT_TIMESTAMP),
('10000000-0000-0000-0000-000000000005', 'Daisy', 'Dog', 'Pembroke Welsh Corgi', '18 months', '/images/adoption/daisy.jpg', 'AVAILABLE', NULL, CURRENT_TIMESTAMP),
('10000000-0000-0000-0000-000000000006', 'Oliver', 'Cat', 'Long-haired tabby', '4 years', '/images/adoption/oliver.jpg', 'AVAILABLE', NULL, CURRENT_TIMESTAMP),
('10000000-0000-0000-0000-000000000007', 'Rocky', 'Dog', 'German Shepherd', '2 years', '/images/adoption/rocky.jpg', 'AVAILABLE', NULL, CURRENT_TIMESTAMP),
('10000000-0000-0000-0000-000000000008', 'Willow', 'Cat', 'Scottish Fold mix', '10 months', '/images/adoption/willow.jpg', 'AVAILABLE', NULL, CURRENT_TIMESTAMP);
