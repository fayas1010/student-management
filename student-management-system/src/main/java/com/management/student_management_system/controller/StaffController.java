package com.management.student_management_system.controller;

import com.management.student_management_system.model.Classroom;
import com.management.student_management_system.model.Staff;
import com.management.student_management_system.service.StaffService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = "*")
public class StaffController {

    @Autowired
    private StaffService staffService;

    @PostMapping
    public ResponseEntity<?> addStaff(@RequestBody Staff staff,
                                      @RequestHeader("role") String role) {
        if (!role.equalsIgnoreCase("MANAGEMENT")) {
            return ResponseEntity.status(403).body("Access denied: only management can add");
        }
        return ResponseEntity.ok(staffService.addStaff(staff));
    }

    @GetMapping
    public List<Staff> getAllStaff() {
        return staffService.getAllStaff();
    }

    @GetMapping("/{id}")
    public Staff getStaff(@PathVariable Long id) {
        return staffService.getStaffById(id);
    }

    // A teacher checking which classroom they're assigned to
    @GetMapping("/{id}/classroom")
    public Classroom getAssignedClassroom(@PathVariable Long id) {
        return staffService.getStaffById(id).getClassroom();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateStaff(@PathVariable Long id,
                                         @RequestBody Staff staff,
                                         @RequestHeader("role") String role) {
        if (!role.equalsIgnoreCase("MANAGEMENT")) {
            return ResponseEntity.status(403).body("Access denied: only management can update");
        }
        staff.setId(id);
        return ResponseEntity.ok(staffService.addStaff(staff));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStaff(@PathVariable Long id,
                                         @RequestHeader("role") String role) {
        if (!role.equalsIgnoreCase("MANAGEMENT")) {
            return ResponseEntity.status(403).body("Access denied: only management can delete");
        }
        staffService.deleteStaff(id);
        return ResponseEntity.ok("Deleted successfully");
    }
}