package koreanit.lms.edusys.Controller;

import koreanit.lms.edusys.Entity.Grade;
import koreanit.lms.edusys.Service.GradeDTO;
import koreanit.lms.edusys.Service.GradeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/grades")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class GradeController {

    private final GradeService gradeService;

    @GetMapping
    public List<GradeDTO> getAllGrades() {
        return gradeService.findAllGrades();
    }

    @GetMapping("/{id}")
    public GradeDTO getGradeById(@PathVariable Integer id) {
        return gradeService.findGradeById(id);
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