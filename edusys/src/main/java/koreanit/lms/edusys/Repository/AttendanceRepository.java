package koreanit.lms.edusys.Repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import koreanit.lms.edusys.Entity.Attendance;

public interface AttendanceRepository extends JpaRepository<Attendance, Integer> {
    List<Attendance> findByStudentSid(Integer sid);
    List<Attendance> findBySubjectSubid(Integer subid);
    List<Attendance> findByDate(LocalDate date);
}