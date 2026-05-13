package koreanit.lms.edusys.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import koreanit.lms.edusys.Entity.Course;
import koreanit.lms.edusys.Entity.Student;
import koreanit.lms.edusys.Entity.Subject;
import koreanit.lms.edusys.Repository.CourseRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CourseService {
    private final CourseRepository courseRepository;
    private final StudentService studentService;
    private final SubjectService subjectService;

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

    public Course createCourse(Integer sid, Integer subid) {
        Course course = new Course();
        Student student = studentService.findById(sid);
        Subject subject = subjectService.findSubjectById(subid);
        if(student == null || subject == null) {
            return null;
        }
        course.setStudent(student);
        course.setSubject(subject);
        return courseRepository.save(course);
    }
    public Course createCourse(Course course) {
        if(course == null) {
            return null;
        }
        return courseRepository.save(course);
    }

    public void deleteCourse(Integer cid) {
        if(cid == null) {
            return;
        }
        Course existingCourse = courseRepository.findById(cid).orElse(null);
        if (existingCourse != null) {
            courseRepository.delete(existingCourse);
        }
    }
}
