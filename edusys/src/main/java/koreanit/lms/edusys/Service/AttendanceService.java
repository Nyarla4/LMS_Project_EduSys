package koreanit.lms.edusys.Service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import koreanit.lms.edusys.Entity.Attendance;
import koreanit.lms.edusys.Repository.AttendanceRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AttendanceService {
    private final AttendanceRepository attendanceRepository;

    public List<Attendance> findAllAttendances() {
        return attendanceRepository.findAll();
    }

    public List<Attendance> findAllAttendancesByStudent(Integer sid) {
        return attendanceRepository.findByStudentSid(sid);
    }

    public List<Attendance> findAllAttendancesBySubject(Integer subid) {
        return attendanceRepository.findBySubjectSubid(subid);
    }

    public List<Attendance> findAllAttendancesByDate(LocalDate date) {
        return attendanceRepository.findByDate(date);
    }
}