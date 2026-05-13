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
        return gradeService.findAllGrades();
    }

    @GetMapping("/{id}")
    public Grade getGradeById(@PathVariable Integer id) {
        return gradeService.findGradeById(id)
                .orElseThrow(() -> new RuntimeException("Grade not found with id: " + id));
    }

    @PostMapping
    public Grade saveGrade(@RequestBody Grade grade) {
        return gradeService.createGrade(grade);
    }

    @DeleteMapping("/{id}")
    public void deleteGrade(@PathVariable Integer id) {
        gradeService.deleteGrade(id);
    }
}