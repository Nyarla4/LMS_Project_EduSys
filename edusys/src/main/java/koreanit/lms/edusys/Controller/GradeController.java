package koreanit.lms.edusys.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;

import koreanit.lms.edusys.Entity.Grade;
import koreanit.lms.edusys.Service.GradeService;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/grades")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class GradeController {
    private final GradeService gradeService;

    @GetMapping("/all")
    public ResponseEntity<List<Grade>> getAllGrades() {
        List<Grade> grades = gradeService.findAllGrades(); // 서비스에서 리스트를 가져옴

        if (grades.isEmpty()) {
            return ResponseEntity.noContent().build(); // 데이터가 없으면 204 No Content
        }

        return ResponseEntity.ok(grades); // 데이터와 함께 200 OK 전송
    }

    @GetMapping("/student/{sid}")
    public ResponseEntity<List<Grade>> getGradesByStudent(@PathVariable Integer sid) {
        List<Grade> grades = gradeService.findAllGradesByStudent(sid); // 서비스에서 리스트를 가져옴

        if (grades.isEmpty()) {
            return ResponseEntity.noContent().build(); // 데이터가 없으면 204 No Content
        }

        return ResponseEntity.ok(grades); // 데이터와 함께 200 OK 전송
    }

    @GetMapping("/subject/{subid}")
    public ResponseEntity<List<Grade>> getGradesBySubject(@PathVariable Integer subid) {
        List<Grade> grades = gradeService.findAllGradesBySubject(subid); // 서비스에서 리스트를 가져옴

        if (grades.isEmpty()) {
            return ResponseEntity.noContent().build(); // 데이터가 없으면 204 No Content
        }

        return ResponseEntity.ok(grades); // 데이터와 함께 200 OK 전송
    }
}