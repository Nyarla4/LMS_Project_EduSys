package koreanit.lms.edusys.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import koreanit.lms.edusys.Entity.Teacher;
import koreanit.lms.edusys.Entity.User;

public interface TeacherRepository extends JpaRepository<Teacher, Integer> {
    Optional<Teacher> findByUser(User user);
}