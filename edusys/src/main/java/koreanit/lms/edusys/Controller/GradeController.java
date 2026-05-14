package koreanit.lms.edusys.Controller;

import koreanit.lms.edusys.Dto.GradeDTO;
import koreanit.lms.edusys.Entity.Grade;
import koreanit.lms.edusys.Entity.Teacher;
import koreanit.lms.edusys.Service.GradeService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
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
    
    @GetMapping("/student/{sid}")
    public List<GradeDTO> getGradesByStudentId(@PathVariable Integer sid) {
        return gradeService.findAllGradesByStudent(sid);
    }

    @GetMapping("/subject/{subid}")
    public List<GradeDTO> getGradesBySubjectId(@PathVariable Integer subid) {
        return gradeService.findAllGradesBySubject(subid);
    }

    @PostMapping("/{id}")
    public ResponseEntity<GradeDTO> saveGrade(@PathVariable Integer id, @RequestBody String grade) {
        GradeDTO _grade = new GradeDTO(gradeService.saveGrade(id, grade));
        if (_grade == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(_grade);
    }

    @DeleteMapping("/{id}")
    public void deleteGrade(@PathVariable Integer id) {
        gradeService.deleteGrade(id);
    }
}