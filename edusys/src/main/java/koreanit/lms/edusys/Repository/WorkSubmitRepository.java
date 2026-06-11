package koreanit.lms.edusys.Repository;

import koreanit.lms.edusys.Entity.WorkSubmit;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface WorkSubmitRepository extends JpaRepository<WorkSubmit, Integer> {
    List<WorkSubmit> findByWorkWid(Integer wid);
    Optional<WorkSubmit> findByWorkWidAndStudentSid(Integer wid, Integer sid);
    List<WorkSubmit> findByStudentSidAndWorkSubjectSubid(Integer sid, Integer subid);
}
