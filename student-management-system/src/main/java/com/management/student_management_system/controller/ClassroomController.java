package com.management.student_management_system.controller;

import com.management.student_management_system.model.Classroom;
import com.management.student_management_system.model.Department;
import com.management.student_management_system.service.ClassroomService;
import com.management.student_management_system.service.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classrooms")
@CrossOrigin(origins = "*")
public class ClassroomController {

    @Autowired
    private ClassroomService classroomService;

    @PostMapping
    public ResponseEntity<?> addClassroom(@RequestBody Classroom classroom,
                                          @RequestHeader("role") String role) {
        if (!role.equalsIgnoreCase("MANAGEMENT")) {
            return ResponseEntity.status(403).body("Access denied: only management can add");
        }
        return ResponseEntity.ok(classroomService.addClassroom(classroom));
    }

    @GetMapping
    public List<Classroom> getAllClassrooms() {
        return classroomService.getAllClassrooms();
    }

    @GetMapping("/{id}")
    public Classroom getClassroom(@PathVariable Long id) {
        return classroomService.getClassroomById(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateClassroom(@PathVariable Long id,
                                             @RequestBody Classroom classroom,
                                             @RequestHeader("role") String role) {
        if (!role.equalsIgnoreCase("MANAGEMENT")) {
            return ResponseEntity.status(403).body("Access denied: only management can update");
        }
        classroom.setId(id);
        return ResponseEntity.ok(classroomService.addClassroom(classroom));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteClassroom(@PathVariable Long id,
                                             @RequestHeader("role") String role) {
        if (!role.equalsIgnoreCase("MANAGEMENT")) {
            return ResponseEntity.status(403).body("Access denied: only management can delete");
        }
        classroomService.deleteClassroom(id);
        return ResponseEntity.ok("Deleted successfully");
    }
}