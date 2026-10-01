package com.management.student_management_system.model;

import jakarta.persistence.*;

@Entity
public class Staff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String role;    // "MANAGEMENT" or "TEACHER"
    private String subject; // e.g. "Maths" — only relevant if role = TEACHER

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne
    @JoinColumn(name = "classroom_id")
    private Classroom classroom; // which class this teacher goes to teach (null for management)

    // Default Constructor (required by JPA)
    public Staff() {
    }

    // Parameterized Constructor
    public Staff(String name, String role, String subject, Department department, Classroom classroom) {
        this.name = name;
        this.role = role;
        this.subject = subject;
        this.department = department;
        this.classroom = classroom;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public Classroom getClassroom() {
        return classroom;
    }

    public void setClassroom(Classroom classroom) {
        this.classroom = classroom;
    }
}