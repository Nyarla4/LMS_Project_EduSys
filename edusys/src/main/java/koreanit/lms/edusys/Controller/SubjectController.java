package koreanit.lms.edusys.Controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;

import koreanit.lms.edusys.Dto.LessonSubDTO;
import koreanit.lms.edusys.Dto.SubjectDTO;
import koreanit.lms.edusys.Entity.Subject;
import koreanit.lms.edusys.Entity.Teacher;
import koreanit.lms.edusys.Service.SubjectService;
import koreanit.lms.edusys.Service.TeacherService;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/subjects")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class SubjectController {
    private final TeacherService teacherService;
    private final SubjectService subjectService;

    @GetMapping("/teacher/{tid}")
    public ResponseEntity<List<SubjectDTO>> getSubjectsByTeacherId(@PathVariable Integer tid) {
        Teacher teacher = teacherService.findTeacherById(tid);
        if (teacher == null) {
            return ResponseEntity.notFound().build();
        }
        List<SubjectDTO> subjects = subjectService.findSubjectsByTeacherId(teacher.getTid())
                .stream().map(SubjectDTO::new).collect(Collectors.toList());
        return ResponseEntity.ok(subjects);
    }

    @GetMapping("/{suid}")
    public ResponseEntity<SubjectDTO> getSubjectById(@PathVariable Integer suid) {
        Subject subject = subjectService.findSubjectById(suid);
        if (subject == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(new SubjectDTO(subject));
    }
    // 강의등록 버튼으로 API 요청
    @PostMapping
    public ResponseEntity<?> createLesson(@RequestBody LessonSubDTO request) 
    {
        subjectService.createLesson(request);
        return ResponseEntity.ok().build();
    }
}