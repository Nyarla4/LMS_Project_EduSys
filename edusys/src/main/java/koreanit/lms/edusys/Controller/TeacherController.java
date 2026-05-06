package koreanit.lms.edusys.Controller;

import org.springframework.http.ResponseEntity;

import koreanit.lms.edusys.Entity.Teacher;
import koreanit.lms.edusys.Service.TeacherService;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/teachers")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class TeacherController {
    private final TeacherService teacherService;

    @GetMapping("/{uid}")
    public ResponseEntity<Teacher> getTeacherByUserId(@PathVariable Long uid) {
        Teacher teacher = teacherService.findbyUserId(uid); // 서비스에서 특정 유저를 가져옴

        if (teacher == null) {
            return ResponseEntity.notFound().build(); // 유저가 없으면 404 Not Found
        }

        return ResponseEntity.ok(teacher); // 데이터와 함께 200 OK 전송
    }
}