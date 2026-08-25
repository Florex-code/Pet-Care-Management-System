package com.pawcare.backend.dashboard;

import java.sql.Date;
import java.sql.Time;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.DayOfWeek;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.pawcare.backend.dashboard.DashboardController.AppointmentRequest;
import com.pawcare.backend.dashboard.DashboardController.AdoptionListingRequest;
import com.pawcare.backend.dashboard.DashboardController.MedicalRecordRequest;
import com.pawcare.backend.dashboard.DashboardController.PetRequest;
import com.pawcare.backend.dashboard.DashboardResponse.AdoptionItem;
import com.pawcare.backend.dashboard.DashboardResponse.AppointmentItem;
import com.pawcare.backend.dashboard.DashboardResponse.MedicalRecordItem;
import com.pawcare.backend.dashboard.DashboardResponse.NotificationItem;
import com.pawcare.backend.dashboard.DashboardResponse.PetItem;
import com.pawcare.backend.dashboard.DashboardResponse.UserItem;

@Service
public class DashboardService {
    private final JdbcTemplate jdbc;

    public DashboardService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public DashboardResponse get(UUID userId) {
        boolean vet = "VET".equals(jdbc.queryForObject("SELECT role FROM app_users WHERE id=?", String.class, userId));
        boolean admin = "ADMIN".equals(jdbc.queryForObject("SELECT role FROM app_users WHERE id=?", String.class, userId));
        List<UserItem> users = jdbc.query("""
                SELECT id, name, email, role, status FROM app_users
                WHERE ? OR id = ? OR ((role = 'VET' OR (? AND role = 'OWNER')) AND status = 'ACTIVE') ORDER BY name
                """, (rs, row) -> new UserItem(rs.getString("id"), rs.getString("name"), rs.getString("email"),
                        lower(rs.getString("role")), title(rs.getString("status"))), admin, userId, vet);
        List<PetItem> pets = jdbc.query("""
                SELECT DISTINCT p.* FROM pets p LEFT JOIN appointments a ON a.pet_id=p.id
                WHERE ? OR p.owner_id = ? OR (? AND a.vet_id = ?) ORDER BY p.created_at DESC
                """, (rs, row) -> new PetItem(rs.getString("id"), rs.getString("owner_id"), rs.getString("name"),
                        rs.getString("species"), rs.getString("breed"), rs.getString("gender"),
                        rs.getDate("date_of_birth").toLocalDate().toString(), rs.getString("weight"),
                        rs.getString("photo"), rs.getString("health_status"), rs.getString("allergies")), admin, userId, vet, userId);
        List<AppointmentItem> appointments = jdbc.query("""
                SELECT * FROM appointments WHERE ? OR owner_id = ? OR (? AND vet_id = ?)
                ORDER BY appointment_date, appointment_time
                """, (rs, row) -> new AppointmentItem(rs.getString("id"), rs.getString("pet_id"),
                        rs.getString("owner_id"), rs.getString("vet_id"), rs.getDate("appointment_date").toString(),
                        rs.getTime("appointment_time").toLocalTime().toString(), rs.getString("reason"),
                        title(rs.getString("status"))), admin, userId, vet, userId);
        List<MedicalRecordItem> records = jdbc.query("""
                SELECT mr.* FROM medical_records mr JOIN pets p ON p.id = mr.pet_id
                WHERE ? OR p.owner_id = ? OR (? AND (mr.vet_id = ? OR EXISTS
                    (SELECT 1 FROM appointments a WHERE a.pet_id=p.id AND a.vet_id=?)))
                ORDER BY mr.record_date DESC, mr.created_at DESC
                """, (rs, row) -> new MedicalRecordItem(rs.getString("id"), rs.getString("pet_id"),
                        rs.getString("vet_id"), rs.getDate("record_date").toString(), rs.getString("diagnosis"),
                        rs.getString("treatment"), rs.getString("medication"), rs.getString("vaccination"),
                        rs.getString("notes")), admin, userId, vet, userId, userId);
        List<AdoptionItem> adoptions = adoptionQuery("""
                WHERE ? OR al.status = 'AVAILABLE' OR al.applicant_id = ? ORDER BY al.created_at
                """, admin, userId);
        List<NotificationItem> notices = jdbc.query("""
                SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC
                """, (rs, row) -> new NotificationItem(rs.getString("id"), rs.getString("user_id"),
                        rs.getString("message"), rs.getBoolean("is_read")), userId);
        return new DashboardResponse(users, pets, appointments, records, adoptions, notices);
    }

    public List<AdoptionItem> publicAdoptions() {
        return adoptionQuery("WHERE al.status = 'AVAILABLE' ORDER BY al.created_at");
    }

    @Transactional
    public PetItem createPet(UUID ownerId, PetRequest request) {
        UUID id = UUID.randomUUID();
        jdbc.update("""
                INSERT INTO pets (id, owner_id, name, species, breed, gender, date_of_birth, weight, photo,
                    health_status, allergies, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, id, ownerId, request.name().trim(), request.species().trim(), request.breed().trim(),
                request.gender().trim(), Date.valueOf(request.dob()), request.weight().trim(), request.photo(),
                request.healthStatus().trim(), request.allergies().trim(), now());
        return petById(id, ownerId);
    }

    @Transactional
    public PetItem updatePet(UUID ownerId, UUID petId, PetRequest request) {
        int updated = jdbc.update("""
                UPDATE pets SET name=?, species=?, breed=?, gender=?, date_of_birth=?, weight=?, photo=?,
                    health_status=?, allergies=? WHERE id=? AND owner_id=?
                """, request.name().trim(), request.species().trim(), request.breed().trim(), request.gender().trim(),
                Date.valueOf(request.dob()), request.weight().trim(), request.photo(), request.healthStatus().trim(),
                request.allergies().trim(), petId, ownerId);
        if (updated == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pet not found");
        return petById(petId, ownerId);
    }

    @Transactional
    public AppointmentItem createAppointment(UUID ownerId, AppointmentRequest request) {
        requireRole(ownerId, "OWNER");
        if (jdbc.queryForObject("SELECT COUNT(*) FROM pets WHERE id=? AND owner_id=?", Integer.class,
                request.petId(), ownerId) == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pet not found");
        }
        UUID id = UUID.randomUUID();
        UUID vetId = request.vetId() == null || request.vetId().isBlank() ? null : UUID.fromString(request.vetId());
        validateAppointmentSchedule(vetId, request.date(), request.time(), null);
        jdbc.update("""
                INSERT INTO appointments (id, pet_id, owner_id, vet_id, appointment_date, appointment_time,
                    reason, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)
                """, id, request.petId(), ownerId, vetId, Date.valueOf(request.date()), Time.valueOf(LocalTime.parse(request.time())),
                request.reason().trim(), now());
        jdbc.update("INSERT INTO notifications (id, user_id, message, is_read, created_at) VALUES (?, ?, ?, FALSE, ?)",
                UUID.randomUUID(), ownerId, "Appointment request received for " + petName(request.petId()) + ".", now());
        if (vetId != null) {
            jdbc.update("INSERT INTO notifications (id, user_id, message, is_read, created_at) VALUES (?, ?, ?, FALSE, ?)",
                    UUID.randomUUID(), vetId, "New appointment request for " + petName(request.petId()) + ".", now());
        }
        return appointmentById(id, ownerId);
    }

    @Transactional
    public AppointmentItem rescheduleAppointment(UUID ownerId, UUID appointmentId, AppointmentRequest request) {
        requireRole(ownerId, "OWNER");
        if (jdbc.queryForObject("SELECT COUNT(*) FROM pets WHERE id=? AND owner_id=?", Integer.class,
                request.petId(), ownerId) == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pet not found");
        }
        UUID vetId = request.vetId() == null || request.vetId().isBlank() ? null : UUID.fromString(request.vetId());
        validateAppointmentSchedule(vetId, request.date(), request.time(), appointmentId);
        int updated = jdbc.update("""
                UPDATE appointments SET pet_id=?, vet_id=?, appointment_date=?, appointment_time=?, reason=?, status='PENDING'
                WHERE id=? AND owner_id=? AND status IN ('PENDING','ACCEPTED')
                """, request.petId(), vetId, Date.valueOf(request.date()), Time.valueOf(LocalTime.parse(request.time())),
                request.reason().trim(), appointmentId, ownerId);
        if (updated == 0) throw new ResponseStatusException(HttpStatus.CONFLICT, "Appointment cannot be rescheduled");
        jdbc.update("INSERT INTO notifications (id, user_id, message, is_read, created_at) VALUES (?, ?, ?, FALSE, ?)",
                UUID.randomUUID(), ownerId, "Your appointment for " + petName(request.petId()) + " was rescheduled and is pending review.", now());
        if (vetId != null) {
            jdbc.update("INSERT INTO notifications (id, user_id, message, is_read, created_at) VALUES (?, ?, ?, FALSE, ?)",
                    UUID.randomUUID(), vetId, "An appointment for " + petName(request.petId()) + " was rescheduled.", now());
        }
        return appointmentById(appointmentId, ownerId);
    }

    @Transactional
    public AdoptionItem requestAdoption(UUID ownerId, UUID listingId, String message) {
        requireRole(ownerId, "OWNER");
        int updated = jdbc.update("""
                UPDATE adoption_listings SET status='PENDING', applicant_id=?, request_message=?, requested_at=?
                WHERE id=? AND status='AVAILABLE'
                """, ownerId, message.trim(), now(), listingId);
        if (updated == 0) throw new ResponseStatusException(HttpStatus.CONFLICT, "This pet is no longer available");
        String pet = adoptionById(listingId).name();
        jdbc.update("INSERT INTO notifications (id, user_id, message, is_read, created_at) VALUES (?, ?, ?, FALSE, ?)",
                UUID.randomUUID(), ownerId, "Your adoption request for " + pet + " has been submitted.", now());
        jdbc.update("""
                INSERT INTO notifications (id, user_id, message, is_read, created_at)
                SELECT ?, id, ?, FALSE, ? FROM app_users WHERE role='ADMIN' AND status='ACTIVE'
                """, UUID.randomUUID(), "New adoption request for " + pet + ".", now());
        return adoptionById(listingId);
    }

    @Transactional
    public AdoptionItem createAdoption(UUID adminId, AdoptionListingRequest request) {
        requireRole(adminId, "ADMIN");
        UUID id = UUID.randomUUID();
        jdbc.update("""
                INSERT INTO adoption_listings (id, name, species, breed, age, photo, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, 'AVAILABLE', ?)
                """, id, request.name().trim(), request.species().trim(), request.breed().trim(),
                request.age().trim(), request.photo(), now());
        return adoptionById(id);
    }

    @Transactional
    public AdoptionItem updateAdoption(UUID adminId, UUID listingId, AdoptionListingRequest request) {
        requireRole(adminId, "ADMIN");
        int updated = jdbc.update("""
                UPDATE adoption_listings SET name=?, species=?, breed=?, age=?, photo=? WHERE id=?
                """, request.name().trim(), request.species().trim(), request.breed().trim(),
                request.age().trim(), request.photo(), listingId);
        if (updated == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Adoption listing not found");
        return adoptionById(listingId);
    }

    @Transactional
    public AdoptionItem reviewAdoption(UUID adminId, UUID listingId, String requestedStatus) {
        requireRole(adminId, "ADMIN");
        String status = requestedStatus.toUpperCase(Locale.ROOT);
        if (!List.of("ADOPTED", "AVAILABLE").contains(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported adoption status");
        }
        String applicant = jdbc.query("SELECT applicant_id FROM adoption_listings WHERE id=? AND status='PENDING'",
                rs -> rs.next() ? rs.getString(1) : null, listingId);
        if (applicant == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Adoption request is not pending");
        }
        jdbc.update("""
                UPDATE adoption_listings SET status=?, reviewed_at=?,
                    applicant_id=CASE WHEN ?='AVAILABLE' THEN NULL ELSE applicant_id END,
                    request_message=CASE WHEN ?='AVAILABLE' THEN NULL ELSE request_message END
                WHERE id=?
                """,
                status, now(), status, status, listingId);
        String pet = adoptionById(listingId).name();
        String message = "ADOPTED".equals(status)
                ? "Your adoption request for " + pet + " has been approved."
                : "Your adoption request for " + pet + " was not approved; the pet is available again.";
        jdbc.update("INSERT INTO notifications (id, user_id, message, is_read, created_at) VALUES (?, ?, ?, FALSE, ?)",
                UUID.randomUUID(), UUID.fromString(applicant), message, now());
        return adoptionById(listingId);
    }

    @Transactional
    public AppointmentItem cancelAppointment(UUID ownerId, UUID appointmentId) {
        requireRole(ownerId, "OWNER");
        String vetId = jdbc.query("SELECT vet_id FROM appointments WHERE id=? AND owner_id=?",
                rs -> rs.next() ? rs.getString(1) : null, appointmentId, ownerId);
        int updated = jdbc.update("""
                UPDATE appointments SET status='CANCELLED'
                WHERE id=? AND owner_id=? AND status IN ('PENDING', 'ACCEPTED')
                """, appointmentId, ownerId);
        if (updated == 0) throw new ResponseStatusException(HttpStatus.CONFLICT, "Appointment cannot be cancelled");
        if (vetId != null) {
            jdbc.update("INSERT INTO notifications (id, user_id, message, is_read, created_at) VALUES (?, ?, ?, FALSE, ?)",
                    UUID.randomUUID(), UUID.fromString(vetId), "An appointment was cancelled by the pet owner.", now());
        }
        return appointmentById(appointmentId, ownerId);
    }

    @Transactional
    public AppointmentItem updateAppointmentStatus(UUID vetId, UUID appointmentId, String requestedStatus) {
        String status = requestedStatus.toUpperCase(Locale.ROOT);
        if (!List.of("ACCEPTED", "REJECTED", "COMPLETED").contains(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported appointment status");
        }
        String requiredCurrent = "COMPLETED".equals(status) ? "ACCEPTED" : "PENDING";
        int updated = jdbc.update("""
                UPDATE appointments SET status=? WHERE id=? AND vet_id=? AND status=?
                """, status, appointmentId, vetId, requiredCurrent);
        if (updated == 0) throw new ResponseStatusException(HttpStatus.CONFLICT, "Appointment status cannot be changed");
        AppointmentItem appointment = appointmentForVet(appointmentId, vetId);
        jdbc.update("INSERT INTO notifications (id, user_id, message, is_read, created_at) VALUES (?, ?, ?, FALSE, ?)",
                UUID.randomUUID(), UUID.fromString(appointment.ownerId()),
                "Your appointment for " + petName(UUID.fromString(appointment.petId())) + " is now " + title(status) + ".", now());
        return appointment;
    }

    @Transactional
    public MedicalRecordItem createMedicalRecord(UUID vetId, MedicalRecordRequest request) {
        Integer assigned = jdbc.queryForObject("""
                SELECT COUNT(*) FROM appointments WHERE pet_id=? AND vet_id=? AND status IN ('ACCEPTED','COMPLETED')
                """, Integer.class, request.petId(), vetId);
        if (assigned == null || assigned == 0) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This patient is not assigned to you");
        }
        UUID id = UUID.randomUUID();
        jdbc.update("""
                INSERT INTO medical_records (id, pet_id, vet_id, record_date, diagnosis, treatment, medication,
                    vaccination, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, id, request.petId(), vetId, Date.valueOf(request.date()), request.diagnosis().trim(),
                request.treatment().trim(), request.medication().trim(), request.vaccination().trim(),
                request.notes().trim(), now());
        return jdbc.queryForObject("SELECT * FROM medical_records WHERE id=?", (rs, row) -> new MedicalRecordItem(
                rs.getString("id"), rs.getString("pet_id"), rs.getString("vet_id"), rs.getDate("record_date").toString(),
                rs.getString("diagnosis"), rs.getString("treatment"), rs.getString("medication"),
                rs.getString("vaccination"), rs.getString("notes")), id);
    }

    public void markNotificationRead(UUID ownerId, UUID notificationId) {
        int updated = jdbc.update("UPDATE notifications SET is_read=TRUE WHERE id=? AND user_id=?", notificationId, ownerId);
        if (updated == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found");
    }

    private PetItem petById(UUID id, UUID ownerId) {
        return jdbc.queryForObject("SELECT * FROM pets WHERE id=? AND owner_id=?", (rs, row) -> new PetItem(
                rs.getString("id"), rs.getString("owner_id"), rs.getString("name"), rs.getString("species"),
                rs.getString("breed"), rs.getString("gender"), rs.getDate("date_of_birth").toString(),
                rs.getString("weight"), rs.getString("photo"), rs.getString("health_status"),
                rs.getString("allergies")), id, ownerId);
    }

    private AppointmentItem appointmentById(UUID id, UUID ownerId) {
        return jdbc.queryForObject("SELECT * FROM appointments WHERE id=? AND owner_id=?", (rs, row) ->
                new AppointmentItem(rs.getString("id"), rs.getString("pet_id"), rs.getString("owner_id"),
                        rs.getString("vet_id"), rs.getDate("appointment_date").toString(),
                        rs.getTime("appointment_time").toLocalTime().toString(), rs.getString("reason"),
                        title(rs.getString("status"))), id, ownerId);
    }

    private AppointmentItem appointmentForVet(UUID id, UUID vetId) {
        return jdbc.queryForObject("SELECT * FROM appointments WHERE id=? AND vet_id=?", (rs, row) ->
                new AppointmentItem(rs.getString("id"), rs.getString("pet_id"), rs.getString("owner_id"),
                        rs.getString("vet_id"), rs.getDate("appointment_date").toString(),
                        rs.getTime("appointment_time").toLocalTime().toString(), rs.getString("reason"),
                        title(rs.getString("status"))), id, vetId);
    }

    private AdoptionItem adoptionById(UUID id) {
        return adoptionQuery("WHERE al.id=?", id).stream().findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Adoption listing not found"));
    }

    private List<AdoptionItem> adoptionQuery(String clause, Object... args) {
        return jdbc.query("""
                SELECT al.*, u.name AS applicant_name FROM adoption_listings al
                LEFT JOIN app_users u ON u.id=al.applicant_id
                """ + clause, (rs, row) -> new AdoptionItem(rs.getString("id"), rs.getString("name"),
                rs.getString("species"), rs.getString("breed"), rs.getString("age"), rs.getString("photo"),
                title(rs.getString("status")), rs.getString("applicant_id"), rs.getString("applicant_name"),
                rs.getString("request_message")), args);
    }

    private String petName(UUID id) {
        return jdbc.queryForObject("SELECT name FROM pets WHERE id=?", String.class, id);
    }

    private void validateAppointmentSchedule(UUID vetId, String dateValue, String timeValue, UUID excludingId) {
        LocalDate date;
        LocalTime time;
        try {
            date = LocalDate.parse(dateValue);
            time = LocalTime.parse(timeValue);
        } catch (RuntimeException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid appointment date or time");
        }
        if (!date.atTime(time).isAfter(java.time.LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Appointment must be scheduled in the future");
        }
        if (date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY
                || time.isBefore(LocalTime.of(8, 0)) || time.isAfter(LocalTime.of(17, 0))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Appointments are available Monday to Friday, 8:00 AM to 5:00 PM");
        }
        if (vetId != null) {
            Integer conflicts = excludingId == null
                    ? jdbc.queryForObject("""
                            SELECT COUNT(*) FROM appointments WHERE vet_id=? AND appointment_date=? AND appointment_time=?
                            AND status IN ('PENDING','ACCEPTED')
                            """, Integer.class, vetId, Date.valueOf(date), Time.valueOf(time))
                    : jdbc.queryForObject("""
                            SELECT COUNT(*) FROM appointments WHERE vet_id=? AND appointment_date=? AND appointment_time=?
                            AND status IN ('PENDING','ACCEPTED') AND id<>?
                            """, Integer.class, vetId, Date.valueOf(date), Time.valueOf(time), excludingId);
            if (conflicts != null && conflicts > 0) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "This veterinarian is already booked at that time");
            }
        }
    }

    private void requireRole(UUID userId, String role) {
        String actual = jdbc.queryForObject("SELECT role FROM app_users WHERE id=?", String.class, userId);
        if (!role.equals(actual)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Insufficient permissions");
    }

    private static String lower(String value) { return value.toLowerCase(Locale.ROOT); }
    private static Timestamp now() { return Timestamp.from(Instant.now()); }
    private static String title(String value) {
        String lower = lower(value);
        return Character.toUpperCase(lower.charAt(0)) + lower.substring(1);
    }
}
