package com.stockpulse.api.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.stockpulse.api.entity.UserEntity;
import com.stockpulse.api.exception.UserAlreadyExistsException;
import com.stockpulse.api.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${DEFAULT_ADMIN_PASSWORD:}")
    private String defaultAdminPassword;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    public void initializeUsers() {
        ensureAdminExists();
        normalizeAllUserRoles();
        ensureAdminRole();
    }

    private void normalizeAllUserRoles() {
        userRepository.findAll().stream()
                .map(user -> {
                    String normalizedRole = normalizeRole(user.getRole());
                    if (!normalizedRole.equals(user.getRole())) {
                        user.setRole(normalizedRole);
                        return user;
                    }
                    return null;
                })
                .filter(user -> user != null)
                .forEach(userRepository::save);
    }

    private void ensureAdminExists() {
        if (!userRepository.existsByUsername("admin") && defaultAdminPassword != null
                && !defaultAdminPassword.isBlank()) {
            UserEntity admin = new UserEntity(null, "admin", passwordEncoder.encode(defaultAdminPassword),
                    "ROLE_ADMIN");
            userRepository.save(admin);
        }
    }

    private void ensureAdminRole() {
        userRepository.findByUsername("admin").ifPresent(admin -> {
            String normalizedRole = normalizeRole(admin.getRole());
            if (!"ROLE_ADMIN".equals(normalizedRole)) {
                admin.setRole("ROLE_ADMIN");
                userRepository.save(admin);
            }
        });
    }

    public UserEntity register(String username, String password) {
        if (userRepository.existsByUsername(username)) {
            throw new UserAlreadyExistsException("Username already exists");
        }

        UserEntity user = new UserEntity(null, username, passwordEncoder.encode(password), normalizeRole("ROLE_USER"));
        return userRepository.save(user);
    }

    public UserEntity getByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public java.util.List<UserEntity> getAllUsers() {
        return userRepository.findAll();
    }

    public UserEntity updateUser(Long id, String username, String password, String role) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (username != null && !username.isBlank()) {
            user.setUsername(username);
        }
        if (password != null && !password.isBlank()) {
            user.setPassword(passwordEncoder.encode(password));
        }
        if (role != null && !role.isBlank()) {
            user.setRole(normalizeRole(role));
        }
        return userRepository.save(user);
    }

    private String normalizeRole(String role) {
        if (role == null || role.isBlank()) {
            return "ROLE_USER";
        }
        String normalized = role.trim().toUpperCase();
        return normalized.startsWith("ROLE_") ? normalized : "ROLE_" + normalized;
    }

    public void deleteUser(Long id) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if ("admin".equals(user.getUsername())) {
            throw new IllegalArgumentException("The admin user cannot be deleted");
        }
        userRepository.delete(user);
    }
}
