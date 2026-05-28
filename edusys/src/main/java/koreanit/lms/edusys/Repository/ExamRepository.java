package koreanit.lms.edusys.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import koreanit.lms.edusys.Entity.Exam;

public interface ExamRepository extends JpaRepository<Exam, Integer> {
    List<Exam> findByExamSetEsid(Integer esid);
    List<Exam> findByExamSetSubjectSubid(Integer subid);
}