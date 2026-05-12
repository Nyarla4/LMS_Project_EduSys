package koreanit.lms.edusys.Controller;

import org.springframework.http.ResponseEntity;

import koreanit.lms.edusys.Entity.Student;
import koreanit.lms.edusys.Service.StudentService;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class StudentController {
    private final StudentService studentService;

    @GetMapping("/{loginId}")
    public ResponseEntity<Student> getStudentByUserId(@PathVariable String loginId) {
        Student student = studentService.findbyUserId(loginId); // 서비스에서 특정 유저를 가져옴

        if (student == null) {
            return ResponseEntity.notFound().build(); // 유저가 없으면 404 Not Found
        }


        return ResponseEntity.ok(student); // 데이터와 함께 200 OK 전송
    }
}