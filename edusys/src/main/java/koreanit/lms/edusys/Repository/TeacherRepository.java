package koreanit.lms.edusys.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import koreanit.lms.edusys.Entity.Teacher;
import koreanit.lms.edusys.Entity.UserEntity;

public interface TeacherRepository extends JpaRepository<Teacher, Integer> {
    Optional<Teacher> findByUser(UserEntity user);
    List<Teacher> findByApprovedFalse(); // 승인되지 않은 교사 목록 조회
    List<Teacher> findByApprovedTrue(); // 승인된 교사 목록 조회
}