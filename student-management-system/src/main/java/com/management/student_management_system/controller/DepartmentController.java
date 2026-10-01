package com.management.student_management_system.controller;

import com.management.student_management_system.model.Department;
import com.management.student_management_system.service.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@CrossOrigin(origins = "*")
public class DepartmentController {

    @Autowired
    private DepartmentService departmentService;

    // Only MANAGEMENT can add
    @PostMapping
    public ResponseEntity<?> addDepartment(@RequestBody Department department,
                                           @RequestHeader("role") String role) {
        if (!role.equalsIgnoreCase("MANAGEMENT")) {
            return ResponseEntity.status(403).body("Access denied: only management can add");
        }
        return ResponseEntity.ok(departmentService.addDepartment(department));
    }

    // Anyone can view (management, teacher, student)
    @GetMapping
    public List<Department> getAllDepartments() {
        return departmentService.getAllDepartments();
    }

    @GetMapping("/{id}")
    public Department getDepartment(@PathVariable Long id) {
        return departmentService.getDepartmentById(id);
    }

    // Only MANAGEMENT can update
    @PutMapping("/{id}")
    public ResponseEntity<?> updateDepartment(@PathVariable Long id,
                                              @RequestBody Department department,
                                              @RequestHeader("role") String role) {
        if (!role.equalsIgnoreCase("MANAGEMENT")) {
            return ResponseEntity.status(403).body("Access denied: only management can update");
        }
        department.setId(id);
        return ResponseEntity.ok(departmentService.addDepartment(department));
    }

    // Only MANAGEMENT can delete
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDepartment(@PathVariable Long id,
                                              @RequestHeader("role") String role) {
        if (!role.equalsIgnoreCase("MANAGEMENT")) {
            return ResponseEntity.status(403).body("Access denied: only management can delete");
        }
        departmentService.deleteDepartment(id);
        return ResponseEntity.ok("Deleted successfully");
    }
}