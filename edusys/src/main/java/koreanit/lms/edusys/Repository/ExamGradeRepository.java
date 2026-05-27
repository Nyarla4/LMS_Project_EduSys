package koreanit.lms.edusys.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import koreanit.lms.edusys.Entity.ExamGrade;

public interface ExamGradeRepository extends JpaRepository<ExamGrade, Integer> {
    List<ExamGrade> findByExamEid(Integer eid);
}