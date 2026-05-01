package com.stationery.auth_service.controller;

import com.stationery.auth_service.dto.AuthResponse;
import com.stationery.auth_service.dto.LoginRequest;
import com.stationery.auth_service.dto.RegisterRequest;
import com.stationery.auth_service.dto.TokenValidationResponse;
import com.stationery.auth_service.entity.User;
import com.stationery.auth_service.repository.UserRepository;
import com.stationery.auth_service.service.AuthService;
import com.stationery.auth_service.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    // ─── Public Endpoints ──────────────────────────────────────────────────────
    @GetMapping("/status")
    public ResponseEntity<String> status() {
        return ResponseEntity.ok("Auth Service is up and running");
    }

    /** Register a new user (or admin if role=ROLE_ADMIN is passed) */
    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    /** Login and receive JWT + role */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * Validate JWT token from other microservices
     * This is the central validation point for all services
     * Internal use only - called by other microservices
     */
    @PostMapping("/api/auth/validate-token")
    public ResponseEntity<TokenValidationResponse> validateToken(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.ok(TokenValidationResponse.builder()
                        .valid(false)
                        .message("Missing or invalid Authorization header")
                        .build());
            }

            String token = authHeader.substring(7);
            jwtService.validateToken(token);

            String userEmail = jwtService.extractEmail(token);
            String role = jwtService.extractRole(token);

            return ResponseEntity.ok(TokenValidationResponse.builder()
                    .valid(true)
                    .userEmail(userEmail)
                    .role(role)
                    .message("Token is valid")
                    .build());

        } catch (Exception e) {
            return ResponseEntity.ok(TokenValidationResponse.builder()
                    .valid(false)
                    .message("Token validation failed: " + e.getMessage())
                    .build());
        }
    }

    // ─── User Endpoints (any authenticated user) ────────────────────────────

    /** Returns the currently authenticated user's email (from JWT subject) */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> me(java.security.Principal principal) {
        return ResponseEntity.ok("Logged in as: " + principal.getName());
    }

    /** Returns the currently authenticated user's full profile */
    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<User> getProfile(java.security.Principal principal) {
        return ResponseEntity.ok(authService.getUserInfo(principal.getName()));
    }

    // ─── Admin-Only Endpoints ───────────────────────────────────────────────

    /** List all registered users – ADMIN only */
    @GetMapping("/api/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }
}
