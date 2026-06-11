package koreanit.lms.edusys.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;

import koreanit.lms.edusys.Entity.Teacher;
import koreanit.lms.edusys.Service.TeacherService;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/teachers")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class TeacherController {
    private final TeacherService teacherService;

    @GetMapping("/{loginId}")
    public ResponseEntity<Teacher> getTeacherByUserId(@PathVariable String loginId) {
        Teacher teacher = teacherService.findbyUserId(loginId); // 서비스에서 특정 유저를 가져옴

        if (teacher == null) {
            return ResponseEntity.notFound().build(); // 유저가 없으면 404 Not Found
        }

        return ResponseEntity.ok(teacher); // 데이터와 함께 200 OK 전송
    }

    @GetMapping("/unApproved")
    public ResponseEntity<List<Teacher>> getUnapprovedTeachers() {
        List<Teacher> unapprovedTeachers = teacherService.findUnapprovedTeachers();
        unapprovedTeachers = unapprovedTeachers.stream()
                .filter(t -> t.getUser() != null && t.getUser().getLoginid() != null).toList();
        return ResponseEntity.ok(unapprovedTeachers);
    }

    @GetMapping("/approved")
    public ResponseEntity<List<Teacher>> getApprovedTeachers() {
        List<Teacher> approvedTeachers = teacherService.findApprovedTeachers();
        approvedTeachers = approvedTeachers.stream()
                .filter(t -> t.getUser() != null && t.getUser().getLoginid() != null).toList();
        return ResponseEntity.ok(approvedTeachers);
    }
    
    @PostMapping("/approve/{tid}")
    public ResponseEntity<Teacher> approveTeacher(@PathVariable Long tid) {
        Teacher teacher = teacherService.approveTeacher(tid);
        if (teacher == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(teacher);
    }
    
    @PutMapping("/subject/{subid}/{tid}")
    public ResponseEntity<Teacher> changeSubject(@PathVariable Integer tid, @PathVariable Integer subid) {
        teacherService.changeSubject(tid, subid);
        return ResponseEntity.ok().build();
    }
}