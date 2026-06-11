package koreanit.lms.edusys.Repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import koreanit.lms.edusys.Entity.Work;

public interface WorkRepository extends JpaRepository<Work, Integer> {
    List<Work> findBySubjectSubid(Integer subid);
    List<Work> findBySubjectSubidAndDueDateBetween(Integer subid, LocalDate startDate, LocalDate endDate);
}