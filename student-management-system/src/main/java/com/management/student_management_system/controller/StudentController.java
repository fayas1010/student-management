package com.management.student_management_system.controller;

import com.management.student_management_system.model.Student;
import com.management.student_management_system.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @PostMapping
    public ResponseEntity<?> addStudent(@RequestBody Student student,
                                        @RequestHeader("role") String role) {
        if (!role.equalsIgnoreCase("MANAGEMENT")) {
            return ResponseEntity.status(403).body("Access denied: only management can add");
        }
        return ResponseEntity.ok(studentService.addStudent(student));
    }

    @GetMapping
    public List<Student> getAllStudents() {
        return studentService.getAllStudents();
    }

    @GetMapping("/{id}")
    public Student getStudent(@PathVariable Long id) {
        return studentService.getStudentById(id);
    }

    // A student checking their own CGPA by roll number
    @GetMapping("/rollnumber/{rollNumber}")
    public Student getStudentByRollNumber(@PathVariable String rollNumber) {
        return studentService.getStudentByRollNumber(rollNumber);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateStudent(@PathVariable Long id,
                                           @RequestBody Student student,
                                           @RequestHeader("role") String role) {
        if (!role.equalsIgnoreCase("MANAGEMENT")) {
            return ResponseEntity.status(403).body("Access denied: only management can update");
        }
        student.setId(id);
        return ResponseEntity.ok(studentService.addStudent(student));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable Long id,
                                           @RequestHeader("role") String role) {
        if (!role.equalsIgnoreCase("MANAGEMENT")) {
            return ResponseEntity.status(403).body("Access denied: only management can delete");
        }
        studentService.deleteStudent(id);
        return ResponseEntity.ok("Deleted successfully");
    }
}