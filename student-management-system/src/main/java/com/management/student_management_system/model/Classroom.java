package com.management.student_management_system.model;

import jakarta.persistence.*;

@Entity
public class Classroom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String className; // e.g. "A" or "B"

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    // Default Constructor (required by JPA)
    public Classroom() {
    }

    // Parameterized Constructor
    public Classroom(String className, Department department) {
        this.className = className;
        this.department = department;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }
}