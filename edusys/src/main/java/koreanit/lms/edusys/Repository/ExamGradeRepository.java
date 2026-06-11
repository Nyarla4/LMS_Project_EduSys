package koreanit.lms.edusys.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import koreanit.lms.edusys.Entity.ExamGrade;

public interface ExamGradeRepository extends JpaRepository<ExamGrade, Integer> {
    List<ExamGrade> findByExamEid(Integer eid);
    Optional<ExamGrade> findByExamEidAndStudentSid(Integer eid, Integer sid);
    List<ExamGrade> findByStudentSidAndExamExamSetSubjectSubid(Integer sid, Integer subid);
}
