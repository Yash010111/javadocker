package com.stockpulse.api.service;

import java.util.List;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.stockpulse.api.dto.AuthRequest;
import com.stockpulse.api.dto.AuthResponse;
import com.stockpulse.api.security.JwtTokenProvider;
import com.stockpulse.api.entity.UserEntity;

@Service
public class AuthService {

    private final UserService userService;
    private final JwtTokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserService userService, JwtTokenProvider tokenProvider, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.tokenProvider = tokenProvider;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse register(AuthRequest request) {
        UserEntity user = userService.register(request.getUsername(), request.getPassword());
        String token = tokenProvider.createToken(user.getUsername());
        return new AuthResponse(token, user.getUsername(), List.of(normalizeRole(user.getRole())));
    }

    public AuthResponse login(AuthRequest request) {
        UserEntity user;
        try {
            user = userService.getByUsername(request.getUsername());
        } catch (IllegalArgumentException ex) {
            throw new BadCredentialsException("Invalid username or password");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid username or password");
        }
        String token = tokenProvider.createToken(user.getUsername());
        return new AuthResponse(token, user.getUsername(), List.of(normalizeRole(user.getRole())));
    }

    private String normalizeRole(String role) {
        if (role == null || role.isBlank()) {
            return "ROLE_USER";
        }
        String normalized = role.trim().toUpperCase();
        return normalized.startsWith("ROLE_") ? normalized : "ROLE_" + normalized;
    }
}
