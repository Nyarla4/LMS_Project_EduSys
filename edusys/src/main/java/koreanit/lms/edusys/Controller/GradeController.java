package koreanit.lms.edusys.Controller;

import koreanit.lms.edusys.Entity.Grade;
import koreanit.lms.edusys.Service.GradeDTO;
import koreanit.lms.edusys.Service.GradeService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/grades")
@RequiredArgsConstructor
public class GradeController {

    private final GradeService gradeService;

    public ResponseEntity<List<GradeDTO>> getAllGrades() {
        List<GradeDTO> grades = gradeService.findAllGrades();
        if (grades == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(grades);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GradeDTO> getGradeById(@PathVariable Integer id) {
        GradeDTO grade = gradeService.findGradeById(id);
        if (grade == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(grade);
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<GradeDTO>> getGradesByStudentId(@PathVariable Integer studentId) {
        List<GradeDTO> grades = gradeService.findAllGradesByStudent(studentId);
        if (grades == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(grades);
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