package koreanit.lms.edusys.subject;

import koreanit.lms.edusys.subject.Subject;
import koreanit.lms.edusys.subject.SubjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/subjects")
@RequiredArgsConstructor
public class SubjectController {

    private final SubjectService subjectService;

    @GetMapping
    public List<Subject> getAllSubjects() {
        return subjectService.findAll();
    }

    @GetMapping("/{id}")
    public Subject getSubjectById(@PathVariable Long id) {
        return subjectService.findById(id)
                .orElseThrow(() -> new RuntimeException("Subject not found with id: " + id));
    }

    @PostMapping
    public Subject saveSubject(@RequestBody Subject subject) {
        return subjectService.save(subject);
    }

    @DeleteMapping("/{id}")
    public void deleteSubject(@PathVariable Long id) {
        subjectService.deleteById(id);
    }
}