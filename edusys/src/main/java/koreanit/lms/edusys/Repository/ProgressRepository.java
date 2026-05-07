package koreanit.lms.edusys.Repository;

import koreanit.lms.edusys.Entity.Progress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProgressRepository extends JpaRepository<Progress, Long> {
    Optional<Progress> findByStudentIdAndVideoId(Long studentId, Long videoId);
    List<Progress> findByStudentId(Long studentId);
}