package koreanit.lms.edusys.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import koreanit.lms.edusys.Entity.Progress;

public interface ProgressRepository extends JpaRepository<Progress, Integer> {
    List<Progress> findByStudent_Sid(Integer sid);
    List<Progress> findBySubject_Subid(Integer subid);
    List<Progress> findByLesson_Lid(Integer lid);
    Optional<Progress> findByStudent_SidAndLesson_Lid(Integer sid, Integer lid);
}