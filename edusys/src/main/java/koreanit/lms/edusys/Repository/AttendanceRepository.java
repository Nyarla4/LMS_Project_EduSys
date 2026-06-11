package koreanit.lms.edusys.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import koreanit.lms.edusys.Entity.Attendance;

public interface AttendanceRepository extends JpaRepository<Attendance, Integer> {
    List<Attendance> findByStudentSid(Integer sid);
    List<Attendance> findBySubjectSubid(Integer subid);
    List<Attendance> findByDate(LocalDate date);
    void deleteByStudentSidAndSubjectSubid(Integer sid, Integer subid);

    @EntityGraph(attributePaths = {"student", "student.user"})
    List<Attendance> findBySubjectSubidAndDate(Integer subid, LocalDate date);
    Optional<Attendance> findByStudentSidAndSubjectSubidAndDate(Integer sid, Integer subid, LocalDate date);
}
