package com.stockpulse.api.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.stockpulse.api.dto.ApiKeyRequest;
import com.stockpulse.api.dto.UpdateUserRequest;
import com.stockpulse.api.dto.UserDto;
import com.stockpulse.api.entity.UserEntity;
import com.stockpulse.api.service.StockService;
import com.stockpulse.api.service.UserService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserService userService;
    private final StockService stockService;

    public AdminController(UserService userService, StockService stockService) {
        this.userService = userService;
        this.stockService = stockService;
    }

    @GetMapping("/users")
    public List<UserDto> listUsers() {
        return userService.getAllUsers().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @PutMapping("/users/{id}")
    public UserDto updateUser(@PathVariable Long id, @RequestBody UpdateUserRequest request) {
        UserEntity updated = userService.updateUser(id, request.getUsername(), request.getPassword(),
                request.getRole());
        return toDto(updated);
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }

    @GetMapping("/config")
    public ApiKeyRequest getConfig() {
        return new ApiKeyRequest(stockService.getApiKey());
    }

    @PutMapping("/config")
    public ApiKeyRequest updateConfig(@RequestBody ApiKeyRequest request) {
        stockService.setApiKey(request.getApiKey());
        return new ApiKeyRequest(stockService.getApiKey());
    }

    private UserDto toDto(UserEntity user) {
        return new UserDto(user.getId(), user.getUsername(), user.getRole());
    }
}
