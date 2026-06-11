package koreanit.lms.edusys.Controller;

import koreanit.lms.edusys.Dto.CourseDTO;
import koreanit.lms.edusys.Entity.Course;
import koreanit.lms.edusys.Service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class CourseController {

    private final CourseService courseService;

    // 수강신청 현황 조회
    @GetMapping("/student/{sid}")
    public List<CourseDTO> getCoursesByStudentId(@PathVariable("sid") Integer sid) {
        return courseService.findCourseDTOsByStudent(sid);
    }

    @GetMapping
    public List<CourseDTO> getAllCourses() {
        return courseService.findAllCourses().stream()
                .map(CourseDTO::new)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public CourseDTO getCourseById(@PathVariable("id") Integer id) {
        Course course = courseService.findCourseById(id)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));
        return new CourseDTO(course);
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