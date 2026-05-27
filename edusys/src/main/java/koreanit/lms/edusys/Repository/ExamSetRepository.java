package koreanit.lms.edusys.Repository;

import koreanit.lms.edusys.Entity.ExamSet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExamSetRepository extends JpaRepository<ExamSet, Integer> {
    List<ExamSet> findBySubjectSubid(Integer subid);
    Optional<ExamSet> findByEsid(Integer esid);
}