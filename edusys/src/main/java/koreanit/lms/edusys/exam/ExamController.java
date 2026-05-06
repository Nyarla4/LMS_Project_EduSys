package koreanit.lms.edusys.exam;

import koreanit.lms.edusys.exam.Exam;
import koreanit.lms.edusys.exam.ExamService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/exams")
@RequiredArgsConstructor
public class ExamController {

    private final ExamService examService;

    @GetMapping
    public List<Exam> getAllExams() {
        return examService.findAll();
    }

    @GetMapping("/{id}")
    public Exam getExamById(@PathVariable Long id) {
        return examService.findById(id)
                .orElseThrow(() -> new RuntimeException("Exam not found with id: " + id));
    }

    @PostMapping
    public Exam saveExam(@RequestBody Exam exam) {
        return examService.save(exam);
    }

    @DeleteMapping("/{id}")
    public void deleteExam(@PathVariable Long id) {
        examService.deleteById(id);
    }
}