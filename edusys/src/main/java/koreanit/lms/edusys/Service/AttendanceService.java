package koreanit.lms.edusys.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

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

    public Optional<Attendance> findAttendanceById(Integer aid) {
        if(aid == null) {
            return null;
        }
        return attendanceRepository.findById(aid);
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

    public Attendance save(Attendance attendance) {
        if(attendance == null) {
            return null;
        }
        return attendanceRepository.save(attendance);
    }

    public void deleteById(Integer aid) {
        if(aid == null) {
            return;
        }
        attendanceRepository.deleteById(aid);
    }
}