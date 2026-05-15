package koreanit.lms.edusys.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import koreanit.lms.edusys.Entity.Student;
import koreanit.lms.edusys.Entity.Subject;
import koreanit.lms.edusys.Entity.Attendance;
import koreanit.lms.edusys.Entity.Course;
import koreanit.lms.edusys.Entity.Lesson;
import koreanit.lms.edusys.Repository.AttendanceRepository;
import koreanit.lms.edusys.Repository.CourseRepository;
import koreanit.lms.edusys.Repository.StudentRepository;
import koreanit.lms.edusys.Repository.SubjectRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AttendanceService {
    private final AttendanceRepository attendanceRepository;
    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;

    @Transactional(readOnly = true)
    public List<Attendance> findAllAttendances() {
        return attendanceRepository.findAll();
    }

    public Optional<Attendance> findAttendanceById(Integer aid) {
        if(aid == null) {
            return Optional.empty();
        }
        return attendanceRepository.findById(aid);
    }

    @Transactional(readOnly = true)
    public List<Attendance> findAllAttendancesByStudent(Integer sid) {
        return attendanceRepository.findByStudentSid(sid);
    }

    @Transactional(readOnly = true)
    public List<Attendance> findAllAttendancesBySubject(Integer subid) {
        return attendanceRepository.findBySubjectSubid(subid);
    }

    @Transactional(readOnly = true)
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

    @Transactional
    public void createInitialAttendance(Lesson lesson) {
        if (lesson.getSubject() == null || lesson.getDate() == null) return;
        
        // 해당 과목을 수강하는 모든 학생 조회
        List<Course> enrollments = courseRepository.findBySubjectSubid(lesson.getSubject().getSubid());
        for (Course course : enrollments) {
            Optional<Attendance> existing = attendanceRepository.findByStudentSidAndSubjectSubidAndDate(
                course.getStudent().getSid(), lesson.getSubject().getSubid(), lesson.getDate()
            );
            
            if (existing.isEmpty()) {
                Attendance attendance = new Attendance();
                attendance.setStudent(course.getStudent());
                attendance.setSubject(lesson.getSubject());
                attendance.setDate(lesson.getDate());
                attendance.setWhether(false); // 초기값은 결석
                attendanceRepository.save(attendance);
            }
        }
    }

    @Transactional
    public void markAsPresent(Integer sid, Integer subid, LocalDate date) {
        Optional<Attendance> existing = attendanceRepository.findByStudentSidAndSubjectSubidAndDate(sid, subid, date);
        
        if (existing.isPresent()) {
            Attendance attendance = existing.get();
            attendance.setWhether(true);
            attendanceRepository.save(attendance);
        } else {
            // 레코드가 없다면(직접 더미데이터를 넣었을 경우 등) 새로 생성하며 출석 처리
            Attendance attendance = new Attendance();
            studentRepository.findById(sid).ifPresent(attendance::setStudent);
            subjectRepository.findById(subid).ifPresent(attendance::setSubject);
            attendance.setDate(date);
            attendance.setWhether(true);
            attendanceRepository.save(attendance);
        }
    }
}