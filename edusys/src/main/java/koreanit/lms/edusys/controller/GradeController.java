package koreanit.lms.edusys.Controller;

import koreanit.lms.edusys.Entity.Grade;
import koreanit.lms.edusys.Service.GradeDTO;
import koreanit.lms.edusys.Service.GradeService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

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

    @GetMapping("/{gid}")
    public ResponseEntity<GradeDTO> getGradeById(@PathVariable Integer gid) {
        GradeDTO grade = gradeService.findGradeById(gid);
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

    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<GradeDTO>> getGradesBySubjectId(@PathVariable Integer subjectId) {
        List<GradeDTO> grades = gradeService.findAllGradesBySubject(subjectId);
        if (grades == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(grades);
    }

    @PostMapping("/{gid}")
    public ResponseEntity<GradeDTO> saveGrade(@PathVariable Integer gid, @RequestBody String score) {
        Grade savedGrade = gradeService.saveGrade(gid, score);

        if (savedGrade == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(new GradeDTO(savedGrade));
    }

    @DeleteMapping("/{gid}")
    public void deleteGrade(@PathVariable Integer gid) {
        gradeService.deleteGrade(gid);
    }
}