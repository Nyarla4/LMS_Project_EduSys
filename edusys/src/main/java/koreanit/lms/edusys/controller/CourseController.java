package koreanit.lms.edusys.Controller;

import koreanit.lms.edusys.Entity.Course;
import koreanit.lms.edusys.Service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    public List<Course> getAllCourses() {
        return courseService.findAll();
    }

    @GetMapping("/{id}")
    public Course getCourseById(@PathVariable Long id) {
        return courseService.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));
    }

    @PostMapping
    public Course saveCourse(@RequestBody Course course) {
        return courseService.save(course);
    }

    @DeleteMapping("/{id}")
    public void deleteCourse(@PathVariable Long id) {
        courseService.deleteById(id);
    }
}