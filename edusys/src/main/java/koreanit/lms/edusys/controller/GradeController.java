package koreanit.lms.edusys.Controller;

import koreanit.lms.edusys.Entity.Grade;
import koreanit.lms.edusys.Service.GradeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/grades")
@RequiredArgsConstructor
public class GradeController {

    private final GradeService gradeService;

    @GetMapping
    public List<Grade> getAllGrades() {
        return gradeService.findAll();
    }

    @GetMapping("/{id}")
    public Grade getGradeById(@PathVariable Long id) {
        return gradeService.findById(id)
                .orElseThrow(() -> new RuntimeException("Grade not found with id: " + id));
    }

    @PostMapping
    public Grade saveGrade(@RequestBody Grade grade) {
        return gradeService.save(grade);
    }

    @DeleteMapping("/{id}")
    public void deleteGrade(@PathVariable Long id) {
        gradeService.deleteById(id);
    }
}