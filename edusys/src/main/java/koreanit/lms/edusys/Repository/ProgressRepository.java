package koreanit.lms.edusys.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import koreanit.lms.edusys.Entity.Progress;

public interface ProgressRepository extends JpaRepository<Progress, Integer> {
    List<Progress> findByStudentSid(Integer sid);
    List<Progress> findBySubjectSubid(Integer subid);
    List<Progress> findByLessonLid(Integer lid);
}