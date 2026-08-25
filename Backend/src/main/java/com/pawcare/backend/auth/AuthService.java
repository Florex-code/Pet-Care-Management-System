package com.pawcare.backend.auth;

import java.time.Instant;
import java.util.Locale;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.pawcare.backend.auth.dto.AuthResponse;
import com.pawcare.backend.auth.dto.LoginRequest;
import com.pawcare.backend.auth.dto.RegisterRequest;
import com.pawcare.backend.auth.dto.UserResponse;
import com.pawcare.backend.auth.AuthController.PasswordResetStartResponse;
import com.pawcare.backend.config.JwtProperties;
import com.pawcare.backend.user.Role;
import com.pawcare.backend.user.User;
import com.pawcare.backend.user.UserRepository;
import com.pawcare.backend.user.UserStatus;

@Service
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;
    private final JwtProperties jwtProperties;
    private final JdbcTemplate jdbc;

    public AuthService(UserRepository users, PasswordEncoder passwordEncoder, JwtEncoder jwtEncoder, JwtProperties jwtProperties,
            JdbcTemplate jdbc) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
        this.jwtProperties = jwtProperties;
        this.jdbc = jdbc;
    }

    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (users.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists");
        }

        User user = new User(UUID.randomUUID(), request.name().trim(), email,
                passwordEncoder.encode(request.password()), Role.OWNER, UserStatus.ACTIVE, Instant.now());
        return response(users.save(user));
    }

    public AuthResponse login(LoginRequest request) {
        User user = users.findByEmailIgnoreCase(normalizeEmail(request.email()))
                .orElseThrow(AuthService::invalidCredentials);
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw invalidCredentials();
        }
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This account is suspended");
        }
        return response(user);
    }

    @Transactional
    public PasswordResetStartResponse startPasswordReset(String requestedEmail) {
        String message = "If that email belongs to an account, password reset instructions are ready.";
        User user = users.findByEmailIgnoreCase(normalizeEmail(requestedEmail)).orElse(null);
        if (user == null || user.getStatus() != UserStatus.ACTIVE) return new PasswordResetStartResponse(message, null);
        UUID token = UUID.randomUUID();
        jdbc.update("DELETE FROM password_reset_tokens WHERE user_id=? OR expires_at<?", user.getId(), java.sql.Timestamp.from(Instant.now()));
        jdbc.update("INSERT INTO password_reset_tokens (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)",
                token, user.getId(), java.sql.Timestamp.from(Instant.now().plusSeconds(15 * 60)), java.sql.Timestamp.from(Instant.now()));
        return new PasswordResetStartResponse(message, token.toString());
    }

    @Transactional
    public void resetPassword(String tokenValue, String password) {
        UUID token;
        try { token = UUID.fromString(tokenValue); }
        catch (IllegalArgumentException exception) { throw invalidResetToken(); }
        String userId = jdbc.query("""
                SELECT user_id FROM password_reset_tokens WHERE token=? AND used_at IS NULL AND expires_at>?
                """, rs -> rs.next() ? rs.getString(1) : null, token, java.sql.Timestamp.from(Instant.now()));
        if (userId == null) throw invalidResetToken();
        User user = users.findById(UUID.fromString(userId)).orElseThrow(AuthService::invalidResetToken);
        user.setPasswordHash(passwordEncoder.encode(password));
        users.save(user);
        jdbc.update("UPDATE password_reset_tokens SET used_at=? WHERE token=?", java.sql.Timestamp.from(Instant.now()), token);
    }

    private AuthResponse response(User user) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("pawcare-backend")
                .issuedAt(now)
                .expiresAt(now.plus(jwtProperties.ttl()))
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim("name", user.getName())
                .claim("role", user.getRole().name())
                .build();
        String token = jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
        return new AuthResponse(token, UserResponse.from(user));
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private static ResponseStatusException invalidCredentials() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
    }

    private static ResponseStatusException invalidResetToken() {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, "This reset link is invalid or has expired");
    }
}
