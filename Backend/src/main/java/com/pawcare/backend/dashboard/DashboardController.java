package com.pawcare.backend.dashboard;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.pawcare.backend.dashboard.DashboardResponse.AdoptionItem;
import com.pawcare.backend.dashboard.DashboardResponse.AppointmentItem;
import com.pawcare.backend.dashboard.DashboardResponse.MedicalRecordItem;
import com.pawcare.backend.dashboard.DashboardResponse.PetItem;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@RestController
@RequestMapping("/api/v1")
public class DashboardController {
    private final DashboardService dashboard;

    public DashboardController(DashboardService dashboard) {
        this.dashboard = dashboard;
    }

    @GetMapping("/dashboard")
    DashboardResponse get(@AuthenticationPrincipal Jwt jwt) {
        return dashboard.get(userId(jwt));
    }

    @GetMapping("/adoptions")
    java.util.List<AdoptionItem> publicAdoptions() {
        return dashboard.publicAdoptions();
    }

    @PostMapping("/pets")
    @ResponseStatus(HttpStatus.CREATED)
    PetItem createPet(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody PetRequest request) {
        return dashboard.createPet(userId(jwt), request);
    }

    @PutMapping("/pets/{id}")
    PetItem updatePet(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id,
            @Valid @RequestBody PetRequest request) {
        return dashboard.updatePet(userId(jwt), id, request);
    }

    @PostMapping("/appointments")
    @ResponseStatus(HttpStatus.CREATED)
    AppointmentItem createAppointment(@AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody AppointmentRequest request) {
        return dashboard.createAppointment(userId(jwt), request);
    }

    @PutMapping("/appointments/{id}")
    AppointmentItem rescheduleAppointment(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id,
            @Valid @RequestBody AppointmentRequest request) {
        return dashboard.rescheduleAppointment(userId(jwt), id, request);
    }

    @PatchMapping("/appointments/{id}/cancel")
    AppointmentItem cancelAppointment(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        return dashboard.cancelAppointment(userId(jwt), id);
    }

    @PatchMapping("/appointments/{id}/status")
    AppointmentItem updateAppointmentStatus(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id,
            @Valid @RequestBody AppointmentStatusRequest request) {
        return dashboard.updateAppointmentStatus(userId(jwt), id, request.status());
    }

    @PostMapping("/medical-records")
    @ResponseStatus(HttpStatus.CREATED)
    MedicalRecordItem createMedicalRecord(@AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody MedicalRecordRequest request) {
        return dashboard.createMedicalRecord(userId(jwt), request);
    }

    @PostMapping("/adoptions/{id}/request")
    AdoptionItem requestAdoption(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id,
            @Valid @RequestBody AdoptionRequest request) {
        return dashboard.requestAdoption(userId(jwt), id, request.message());
    }


    @PostMapping("/adoptions")
    @ResponseStatus(HttpStatus.CREATED)
    AdoptionItem createAdoption(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody AdoptionListingRequest request) {
        return dashboard.createAdoption(userId(jwt), request);
    }

    @PutMapping("/adoptions/{id}")
    AdoptionItem updateAdoption(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id,
            @Valid @RequestBody AdoptionListingRequest request) {
        return dashboard.updateAdoption(userId(jwt), id, request);
    }

    @PatchMapping("/adoptions/{id}/status")
    AdoptionItem reviewAdoption(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id,
            @Valid @RequestBody AdoptionStatusRequest request) {
        return dashboard.reviewAdoption(userId(jwt), id, request.status());
    }

    @PatchMapping("/notifications/{id}/read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void markNotificationRead(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        dashboard.markNotificationRead(userId(jwt), id);
    }

    private UUID userId(Jwt jwt) { return UUID.fromString(jwt.getSubject()); }

    public record PetRequest(@NotBlank @Size(max=120) String name, @NotBlank @Size(max=60) String species,
            @NotBlank @Size(max=120) String breed, @NotBlank @Size(max=30) String gender,
            @NotBlank String dob, @NotBlank @Size(max=40) String weight, String photo,
            @NotBlank @Size(max=120) String healthStatus, @NotBlank @Size(max=500) String allergies) {}

    public record AppointmentRequest(@NotNull UUID petId, String vetId, @NotBlank String date,
            @NotBlank String time, @NotBlank @Size(max=500) String reason) {}

    public record AppointmentStatusRequest(@NotBlank String status) {}
    public record AdoptionStatusRequest(@NotBlank String status) {}
    public record AdoptionRequest(@NotBlank @Size(min=20, max=2000) String message) {}
    public record AdoptionListingRequest(@NotBlank @Size(max=120) String name,
            @NotBlank @Size(max=60) String species, @NotBlank @Size(max=120) String breed,
            @NotBlank @Size(max=60) String age, String photo) {}

    public record MedicalRecordRequest(@NotNull UUID petId, @NotBlank String date,
            @NotBlank @Size(max=500) String diagnosis, @NotBlank @Size(max=1000) String treatment,
            @NotBlank @Size(max=500) String medication, @Size(max=500) String vaccination,
            @NotBlank @Size(max=2000) String notes) {}
}
