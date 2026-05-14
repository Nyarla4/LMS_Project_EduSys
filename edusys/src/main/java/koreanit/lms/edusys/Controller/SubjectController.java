package koreanit.lms.edusys.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;

import koreanit.lms.edusys.Dto.LessonSubDTO;
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
    public ResponseEntity<List<Subject>> getSubjectsByTeacherId(@PathVariable Integer tid) {
        Teacher teacher = teacherService.findTeacherById(tid);
        if (teacher == null) {
            return ResponseEntity.notFound().build();
        }
        List<Subject> subjects = subjectService.findSubjectsByTeacherId(teacher.getTid());
        return ResponseEntity.ok(subjects);
    }

    @GetMapping("/{suid}")
    public ResponseEntity<Subject> getSubjectById(@PathVariable Integer suid) {
        Subject subject = subjectService.findSubjectById(suid);
        if (subject == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(subject);
    }
    // 강의등록 버튼으로 API 요청
    @PostMapping
    public ResponseEntity<?> createLesson(@RequestBody LessonSubDTO request) 
    {
        subjectService.createLesson(request);
        return ResponseEntity.ok().build();
    }
}