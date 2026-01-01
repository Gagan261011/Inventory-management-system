package com.ims.auth.controller;

import com.ims.auth.dto.*;
import com.ims.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Authentication", description = "Authentication endpoints")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "General login for any user")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("Login request received for: {}", request.getEmail());
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/login/user")
    @Operation(summary = "Login for warehouse/store staff users")
    public ResponseEntity<LoginResponse> loginAsUser(@Valid @RequestBody LoginRequest request) {
        log.info("User login request received for: {}", request.getEmail());
        return ResponseEntity.ok(authService.loginAsUser(request));
    }

    @PostMapping("/login/admin")
    @Operation(summary = "Login for admin/inventory managers")
    public ResponseEntity<LoginResponse> loginAsAdmin(@Valid @RequestBody LoginRequest request) {
        log.info("Admin login request received for: {}", request.getEmail());
        return ResponseEntity.ok(authService.loginAsAdmin(request));
    }

    @PostMapping("/validate")
    @Operation(summary = "Validate JWT token")
    public ResponseEntity<UserResponse> validateToken(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return ResponseEntity.ok(authService.validateToken(token));
    }
}
