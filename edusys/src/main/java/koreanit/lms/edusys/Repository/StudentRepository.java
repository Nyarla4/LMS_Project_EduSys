package koreanit.lms.edusys.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import koreanit.lms.edusys.Entity.Student;
import koreanit.lms.edusys.Entity.UserEntity;

public interface StudentRepository extends JpaRepository<Student, Integer> {
    Optional<Student> findByUser(UserEntity user);
}