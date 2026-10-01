package com.management.student_management_system.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Value("${management.password}")
    private String managementPassword;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        if (managementPassword.equals(request.getPassword())) {
            return ResponseEntity.ok("SUCCESS");
        } else {
            return ResponseEntity.status(401).body("Invalid password");
        }
    }
}