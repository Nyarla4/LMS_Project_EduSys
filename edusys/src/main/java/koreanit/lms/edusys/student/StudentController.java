package koreanit.lms.edusys.student;

import koreanit.lms.edusys.student.Student;
import koreanit.lms.edusys.student.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @GetMapping
    public List<Student> getAllStudents() {
        return studentService.findAll();
    }

    @GetMapping("/{id}")
    public Student getStudentById(@PathVariable Long id) {
        return studentService.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));
    }

    @PostMapping
    public Student saveStudent(@RequestBody Student student) {
        return studentService.save(student);
    }

    @DeleteMapping("/{id}")
    public void deleteStudent(@PathVariable Long id) {
        studentService.deleteById(id);
    }
}