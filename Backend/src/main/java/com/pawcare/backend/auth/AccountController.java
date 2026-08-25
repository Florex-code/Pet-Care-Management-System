package com.pawcare.backend.auth;

import java.util.Locale;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.pawcare.backend.auth.dto.UserResponse;
import com.pawcare.backend.user.User;
import com.pawcare.backend.user.UserRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@RestController
@RequestMapping("/api/v1/account")
public class AccountController {
    private final UserRepository users;
    private final PasswordEncoder passwords;

    public AccountController(UserRepository users, PasswordEncoder passwords) {
        this.users = users;
        this.passwords = passwords;
    }

    @GetMapping
    UserResponse get(@AuthenticationPrincipal Jwt jwt) { return UserResponse.from(user(jwt)); }

    @PutMapping
    UserResponse update(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ProfileRequest request) {
        User user = user(jwt);
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        users.findByEmailIgnoreCase(email).filter(other -> !other.getId().equals(user.getId())).ifPresent(other -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "That email is already in use");
        });
        user.setName(request.name().trim());
        user.setEmail(email);
        return UserResponse.from(users.save(user));
    }

    @PutMapping("/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void password(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody PasswordRequest request) {
        User user = user(jwt);
        if (!passwords.matches(request.currentPassword(), user.getPasswordHash()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
        if (request.currentPassword().equals(request.newPassword()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a different new password");
        user.setPasswordHash(passwords.encode(request.newPassword()));
        users.save(user);
    }

    private User user(Jwt jwt) {
        return users.findById(UUID.fromString(jwt.getSubject()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    public record ProfileRequest(@NotBlank @Size(max=120) String name, @NotBlank @Email @Size(max=254) String email) {}
    public record PasswordRequest(@NotBlank String currentPassword, @NotBlank @Size(min=8, max=72) String newPassword) {}
}
