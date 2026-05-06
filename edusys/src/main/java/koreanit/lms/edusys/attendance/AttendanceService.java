package koreanit.lms.edusys.attendance;

import koreanit.lms.edusys.attendance.Attendance;
import koreanit.lms.edusys.attendance.AttendanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AttendanceService {
    private final AttendanceRepository attendanceRepository;

    public List<Attendance> findAll() {
        return attendanceRepository.findAll();
    }

    public Optional<Attendance> findById(Long id) {
        return attendanceRepository.findById(id);
    }

    public Attendance save(Attendance attendance) {
        return attendanceRepository.save(attendance);
    }

    public void deleteById(Long id) {
        attendanceRepository.deleteById(id);
    }
}