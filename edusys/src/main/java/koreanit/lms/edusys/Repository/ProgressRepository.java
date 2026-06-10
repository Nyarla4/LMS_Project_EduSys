package koreanit.lms.edusys.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import koreanit.lms.edusys.Entity.Progress;

public interface ProgressRepository extends JpaRepository<Progress, Integer> {
    List<Progress> findByStudentSid(Integer sid);
    List<Progress> findByLessonSubjectSubid(Integer subid);
    List<Progress> findByStudentSidAndLessonSubjectSubid(Integer sid, Integer subid);

    @EntityGraph(attributePaths = {"student"})
    List<Progress> findByLessonLid(Integer lid);
    Optional<Progress> findByStudentSidAndLessonLid(Integer sid, Integer lid);
}
