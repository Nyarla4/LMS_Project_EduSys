package koreanit.lms.edusys.Controller;

import koreanit.lms.edusys.Entity.Course;
import koreanit.lms.edusys.Service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class CourseController {

    private final CourseService courseService;

    // 상세 조회보다 구체적인 경로를 위로 올립니다.
    @GetMapping("/student/{sid}")
    public List<Course> getCoursesByStudentId(@PathVariable("sid") Integer sid) {
        return courseService.findAllCoursesByStudent(sid);
    }

    @GetMapping
    public List<Course> getAllCourses() {
        return courseService.findAllCourses();
    }

    @GetMapping("/{id}")
    public Course getCourseById(@PathVariable("id") Integer id) {
        return courseService.findCourseById(id)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));
    }

    @PostMapping
    public Course saveCourse(@RequestBody Course course) {
        return courseService.createCourse(course);
    }

    @DeleteMapping("/{id}")
    public void deleteCourse(@PathVariable Integer id) {
        courseService.deleteCourse(id);
    }
}