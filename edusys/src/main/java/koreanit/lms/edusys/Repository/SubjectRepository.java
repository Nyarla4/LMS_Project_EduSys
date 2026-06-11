package koreanit.lms.edusys.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import koreanit.lms.edusys.Entity.Subject;

public interface SubjectRepository extends JpaRepository<Subject, Integer> {
    List<Subject> findByTeacherTid(Integer tid);
}