package koreanit.lms.edusys.Controller;

import koreanit.lms.edusys.Entity.Exam;
import koreanit.lms.edusys.Service.ExamService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/exams")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ExamController {

    private final ExamService examService;

    @GetMapping
    public List<Exam> getAllExams() {
        return examService.findAllExams();
    }

    @GetMapping("/{id}")
    public Exam getExamById(@PathVariable Integer id) {
        return examService.findExamById(id)
                .orElseThrow(() -> new RuntimeException("Exam not found with id: " + id));
    }

    @PostMapping
    public Exam saveExam(@RequestBody Exam exam) {
        return examService.createExam(exam);
    }

    @DeleteMapping("/{id}")
    public void deleteExam(@PathVariable Integer id) {
        examService.deleteExam(id);
    }
}