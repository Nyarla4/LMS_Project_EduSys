package koreanit.lms.edusys.Controller;

import koreanit.lms.edusys.Dto.CounselDTO;
import koreanit.lms.edusys.Entity.Counsel;
import koreanit.lms.edusys.Entity.Student;
import koreanit.lms.edusys.Entity.Teacher;
import koreanit.lms.edusys.Entity.UserEntity;
import koreanit.lms.edusys.Service.CounselService;
import koreanit.lms.edusys.Service.StudentService;
import koreanit.lms.edusys.Service.TeacherService;
import koreanit.lms.edusys.Service.UserService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/counsel")
@RequiredArgsConstructor
public class CounselController {
    private final UserService userService;
    private final CounselService counselService;
    private final StudentService studentService;
    private final TeacherService teacherService;

    @GetMapping("/{loginid}")
    public ResponseEntity<List<CounselDTO>> getAllCounsels(@PathVariable String loginid) {
        UserEntity user = userService.getUser(loginid);
        if (user == null)
            return null;
        List<CounselDTO> result = new ArrayList<CounselDTO>();
        switch (user.getUsertype()) {
            case S:
                Student s = studentService.findbyUserId(loginid);
                for (Counsel counsel : counselService.findAllByStudent(s.getSid())) {
                    CounselDTO dto = new CounselDTO(counsel);
                    result.add(dto);
                }
                return ResponseEntity.ok(result);
            case T:
                Teacher t = teacherService.findbyUserId(loginid);
                for (Counsel counsel : counselService.findAllByTeacher(t.getTid())) {
                    CounselDTO dto = new CounselDTO(counsel);
                    result.add(dto);
                }
                return ResponseEntity.ok(result);
            default:
                return null;
        }
    }

    @GetMapping("/detail/{id}")
    public ResponseEntity<CounselDTO> getCounselById(@PathVariable Integer id) {
        CounselDTO dto = new CounselDTO(counselService.findCounselById(id)
                .orElseThrow(() -> new RuntimeException("Counsel not found with id: " + id)));
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    public ResponseEntity<CounselDTO> creatCounsel(@RequestBody CounselDTO counsel) {
        CounselDTO dto = new CounselDTO(counselService.createCounsel(counsel.getSid(), counsel.getTid(),
                counsel.getTitle(), counsel.getContent()));
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/{id}")
    public ResponseEntity<CounselDTO> answerCounsel(@PathVariable Integer id, @RequestBody CounselDTO comment) {
        CounselDTO dto = new CounselDTO(counselService.answerCounsel(id, comment.getComment()));
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/{id}")
    public void deleteCounsel(@PathVariable Integer id) {
        counselService.deleteCounsel(id);
    }
}