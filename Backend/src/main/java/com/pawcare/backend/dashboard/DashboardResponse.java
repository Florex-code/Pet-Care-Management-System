package com.pawcare.backend.dashboard;

import java.util.List;

public record DashboardResponse(
        List<UserItem> users,
        List<PetItem> pets,
        List<AppointmentItem> appointments,
        List<MedicalRecordItem> records,
        List<AdoptionItem> adoptions,
        List<NotificationItem> notices) {

    public record UserItem(String id, String name, String email, String role, String status) {}
    public record PetItem(String id, String ownerId, String name, String species, String breed, String gender,
            String dob, String weight, String photo, String healthStatus, String allergies) {}
    public record AppointmentItem(String id, String petId, String ownerId, String vetId, String date, String time,
            String reason, String status) {}
    public record MedicalRecordItem(String id, String petId, String vetId, String date, String diagnosis,
            String treatment, String medication, String vaccination, String notes) {}
    public record AdoptionItem(String id, String name, String species, String breed, String age, String photo,
            String status, String applicantId, String applicantName, String requestMessage) {}
    public record NotificationItem(String id, String userId, String text, boolean read) {}
}
