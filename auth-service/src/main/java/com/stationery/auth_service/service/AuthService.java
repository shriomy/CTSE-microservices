package com.stationery.auth_service.service;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import com.stationery.auth_service.repository.UserRepository;
import com.stationery.auth_service.entity.Role;
import com.stationery.auth_service.entity.User;
import com.stationery.auth_service.dto.RegisterRequest;
import com.stationery.auth_service.dto.LoginRequest;
import com.stationery.auth_service.dto.AuthResponse;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    public User register(RegisterRequest request) {
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setPassword(request.getPassword());
        // Default to ROLE_USER if no role specified in request
        user.setRole(request.getRole() != null ? request.getRole() : Role.ROLE_USER);
        return userRepository.save(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = jwtService.generateToken(user.getEmail(), user.getRole());
        return new AuthResponse(token, user.getRole().name());
    }

    public User getUserInfo(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
