package com.pawcare.backend.auth.dto;

import java.util.Locale;

import com.pawcare.backend.user.User;

public record UserResponse(String id, String name, String email, String role, String status) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId().toString(),
                user.getName(),
                user.getEmail(),
                user.getRole().name().toLowerCase(Locale.ROOT),
                titleCase(user.getStatus().name()));
    }

    private static String titleCase(String value) {
        String lower = value.toLowerCase(Locale.ROOT);
        return Character.toUpperCase(lower.charAt(0)) + lower.substring(1);
    }
}
