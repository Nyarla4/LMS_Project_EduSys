package koreanit.lms.edusys.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import koreanit.lms.edusys.Entity.Grade;

public interface GradeRepository extends JpaRepository<Grade, Integer> {
    List<Grade> findByStudentSid(Integer sid);
    List<Grade> findBySubjectSubid(Integer subid);
    boolean existsByStudentSidAndSubjectSubid(Integer sid, Integer subid);
    void deleteByStudentSidAndSubjectSubid(Integer sid, Integer subid);
}
