package koreanit.lms.edusys.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import koreanit.lms.edusys.Dto.CourseDTO;
import koreanit.lms.edusys.Entity.Course;
import koreanit.lms.edusys.Entity.ExamGrade;
import koreanit.lms.edusys.Entity.Lesson;
import koreanit.lms.edusys.Entity.Progress;
import koreanit.lms.edusys.Entity.Student;
import koreanit.lms.edusys.Entity.Subject;
import koreanit.lms.edusys.Repository.AttendanceRepository;
import koreanit.lms.edusys.Repository.CourseRepository;
import koreanit.lms.edusys.Repository.ExamGradeRepository;
import koreanit.lms.edusys.Repository.GradeRepository;
import koreanit.lms.edusys.Repository.LessonRepository;
import koreanit.lms.edusys.Repository.ProgressRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CourseService {
    private final CourseRepository courseRepository;
    private final StudentService studentService;
    private final SubjectService subjectService;
    private final LessonRepository lessonRepository;
    private final AttendanceRepository attendanceRepository;
    private final GradeRepository gradeRepository;
    private final ProgressRepository progressRepository;
    private final ExamGradeRepository examGradeRepository;
    private final WorkSubmitService workSubmitService;
    private final GradeService gradeService;

    public List<Course> findAllCourses() {
        return courseRepository.findAll();
    }

    public Optional<Course> findCourseById(Integer cid) {
        if(cid == null) {
            return null;
        }
        return courseRepository.findById(cid);
    }

    public List<Course> findAllCoursesByStudent(Integer sid) {
        return courseRepository.findByStudentSid(sid);
    }

    public List<Course> findAllCoursesBySubject(Integer subid) {
        return courseRepository.findBySubjectSubid(subid);
    }

    @Transactional
    public Course createCourse(Integer sid, Integer subid) {
        Course course = new Course();
        Student student = studentService.findById(sid);
        Subject subject = subjectService.findSubjectById(subid);
        if(student == null || subject == null) {
            return null;
        }
        course.setStudent(student);
        course.setSubject(subject);
        Course savedCourse = courseRepository.save(course);
        createGradeIfAbsent(sid, subid);
        return savedCourse;
    }

    @Transactional
    public Course createCourse(Course course) {
        if(course == null || course.getStudent() == null || course.getSubject() == null) {
            return null;
        }

        Integer sid = course.getStudent().getSid();
        Integer subid = course.getSubject().getSubid();

        Student student = studentService.findById(sid);
        Subject subject = subjectService.findSubjectById(subid);
        if (student == null || subject == null) {
            return null;
        }

        course.setStudent(student);
        course.setSubject(subject);

        Course savedCourse = courseRepository.save(course);
        createGradeIfAbsent(sid, subid);
        return savedCourse;
    }

    @Transactional
    public void deleteCourse(Integer cid) {
        if(cid == null) {
            return;
        }
        Course existingCourse = courseRepository.findById(cid).orElse(null);
        if (existingCourse != null) {
            Integer sid = existingCourse.getStudent().getSid();
            Integer subid = existingCourse.getSubject().getSubid();

            attendanceRepository.deleteByStudentSidAndSubjectSubid(sid, subid);
            gradeRepository.deleteByStudentSidAndSubjectSubid(sid, subid);

            List<Progress> progresses = progressRepository.findByStudentSidAndLessonSubjectSubid(sid, subid);
            progressRepository.deleteAll(progresses);

            List<ExamGrade> examGrades = examGradeRepository.findByStudentSidAndExamExamSetSubjectSubid(sid, subid);
            examGradeRepository.deleteAll(examGrades);

            workSubmitService.deleteSubmissionsByStudentAndSubject(sid, subid);

            courseRepository.delete(existingCourse);
        }
    }
    // 수강신청 현황 조회
    public List<CourseDTO> findCourseDTOsByStudent(Integer sid) {
    return courseRepository.findByStudentSid(sid).stream()
            .map(this::toCourseDTO)
            .collect(Collectors.toList());
    }
    // Course 엔티티에서 필요한 정보를 추출하여 CourseDTO로 변환하는 메서드
    private CourseDTO toCourseDTO(Course course) {
        CourseDTO dto = new CourseDTO(course);

        if (course.getSubject() != null) {
            if (course.getSubject().getTeacher() != null
                    && course.getSubject().getTeacher().getUser() != null) {
                dto.setTeacherName(course.getSubject().getTeacher().getUser().getUsername());
            }

            List<Lesson> lessons = lessonRepository.findBySubjectSubid(course.getSubject().getSubid());
            if (lessons != null && !lessons.isEmpty()) {
                dto.setLessonName(lessons.get(0).getName());
            }
        }
        return dto;
    }

    private void createGradeIfAbsent(Integer sid, Integer subid) {
        if (!gradeRepository.existsByStudentSidAndSubjectSubid(sid, subid)) {
            gradeService.createGrade(sid, subid);
        }
    }
}
