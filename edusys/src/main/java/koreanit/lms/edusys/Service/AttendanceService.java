package koreanit.lms.edusys.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import koreanit.lms.edusys.Entity.Student;
import koreanit.lms.edusys.Entity.Subject;
import koreanit.lms.edusys.Entity.Attendance;
import koreanit.lms.edusys.Entity.Course;
import koreanit.lms.edusys.Entity.Lesson;
import koreanit.lms.edusys.Dto.AttendanceDTO;
import koreanit.lms.edusys.Repository.AttendanceRepository;
import koreanit.lms.edusys.Repository.LessonRepository;
import koreanit.lms.edusys.Repository.CourseRepository;
import koreanit.lms.edusys.Repository.StudentRepository;
import koreanit.lms.edusys.Repository.SubjectRepository;
import koreanit.lms.edusys.Repository.ProgressRepository; // 진도 확인을 위해 필요
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AttendanceService {
    private final AttendanceRepository attendanceRepository;
    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final LessonRepository lessonRepository;
    private final ProgressRepository progressRepository;

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

    @Transactional(readOnly = true)
    public List<AttendanceDTO> getAttendanceByLesson(Integer lid) {
        Lesson lesson = lessonRepository.findById(lid)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        
        if (lesson.getSubject() == null || lesson.getDate() == null) {
            return List.of();
        }

        // 1. 비디오 총 길이를 루프 밖에서 미리 한 번만 계산 (매우 중요: N번의 VideoUtils 호출 방지)
        Integer duration = lesson.getDuration();

        List<Attendance> attendances = attendanceRepository.findBySubjectSubidAndDate(
                lesson.getSubject().getSubid(), 
                lesson.getDate()
        );

        // 2. 해당 강의에 대한 모든 학생의 진도 정보를 한 번에 조회하여 Map으로 캐싱 (N+1 문제 해결)
        Map<Integer, Integer> progressMap = progressRepository.findByLessonLid(lid).stream()
                .filter(p -> p.getStudent() != null)
                .collect(Collectors.toMap(
                    p -> p.getStudent().getSid(),
                    p -> p.getProgressed() != null ? p.getProgressed() : 0,
                    (v1, v2) -> v1 // 중복 발생 시 첫 번째 값 유지
                ));

        return attendances.stream().map(att -> {
            AttendanceDTO dto = new AttendanceDTO(att);

            // 3. 캐싱된 Map에서 진도 정보를 바로 찾아 처리 (추가 쿼리 없음)
            Integer progressed = progressMap.get(att.getStudent().getSid());
            if (progressed != null && duration != null && duration > 0) {
                boolean isPresentByVideo = progressed >= (duration * 0.9);
                dto.setIsPresentByVideo(isPresentByVideo);
            }
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public void updateBatchAttendance(Integer lid, List<Map<String, Object>> records) {
        Lesson lesson = lessonRepository.findById(lid)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        
        for (Map<String, Object> record : records) {
            Integer sid = (Integer) record.get("sid");
            Boolean whether = (Boolean) record.get("whether");
            markAsPresent(sid, lesson.getSubject().getSubid(), lesson.getDate());
            // markAsPresent는 true로만 만드므로 직접 setWhether 처리
            attendanceRepository.findByStudentSidAndSubjectSubidAndDate(sid, lesson.getSubject().getSubid(), lesson.getDate())
                .ifPresent(a -> { a.setWhether(whether); attendanceRepository.save(a); });
        }
    }
}