package com.management.student_management_system.repository;

import com.management.student_management_system.model.Classroom;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClassroomRepository extends JpaRepository<Classroom, Long> {
    Classroom findNameBy(String name);
}
