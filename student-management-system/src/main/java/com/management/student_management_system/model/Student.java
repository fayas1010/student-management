package com.management.student_management_system.model;

import jakarta.persistence.*;

@Entity
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String rollNumber;
    private Double cgpa; // student views this

    @ManyToOne
    @JoinColumn(name = "classroom_id")
    private Classroom classroom;

    // Default Constructor (required by JPA)
    public Student() {
    }

    // Parameterized Constructor
    public Student(String name, String rollNumber, Double cgpa, Classroom classroom) {
        this.name = name;
        this.rollNumber = rollNumber;
        this.cgpa = cgpa;
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

    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
    }

    public Double getCgpa() {
        return cgpa;
    }

    public void setCgpa(Double cgpa) {
        this.cgpa = cgpa;
    }

    public Classroom getClassroom() {
        return classroom;
    }

    public void setClassroom(Classroom classroom) {
        this.classroom = classroom;
    }
}