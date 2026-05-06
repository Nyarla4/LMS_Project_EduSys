package koreanit.lms.edusys.teacher;

import koreanit.lms.edusys.teacher.Teacher;
import koreanit.lms.edusys.teacher.TeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/teachers")
@RequiredArgsConstructor
public class TeacherController {

    private final TeacherService teacherService;

    @GetMapping
    public List<Teacher> getAllTeachers() {
        return teacherService.findAll();
    }

    @GetMapping("/{id}")
    public Teacher getTeacherById(@PathVariable Long id) {
        return teacherService.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher not found with id: " + id));
    }

    @PostMapping
    public Teacher saveTeacher(@RequestBody Teacher teacher) {
        return teacherService.save(teacher);
    }

    @DeleteMapping("/{id}")
    public void deleteTeacher(@PathVariable Long id) {
        teacherService.deleteById(id);
    }
}