package com.ims.auth.controller;

import com.ims.auth.dto.*;
import com.ims.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "User Management", description = "Admin endpoints for user management")
public class UserController {

    private final AuthService authService;

    @GetMapping
    @Operation(summary = "Get all users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(authService.getAllUsers());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(authService.getUserById(id));
    }

    @PostMapping
    @Operation(summary = "Create new user")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.ok(authService.createUser(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update user")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id, 
                                                   @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(authService.updateUser(id, request));
    }

    @PostMapping("/{id}/reset-password")
    @Operation(summary = "Reset user password")
    public ResponseEntity<Void> resetPassword(@PathVariable Long id, 
                                              @Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(id, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/assign-role")
    @Operation(summary = "Assign role to user")
    public ResponseEntity<UserResponse> assignRole(@PathVariable Long id, 
                                                   @RequestParam String roleName) {
        return ResponseEntity.ok(authService.assignRole(id, roleName));
    }
}
