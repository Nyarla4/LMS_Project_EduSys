package koreanit.lms.edusys.Controller;

import koreanit.lms.edusys.Entity.Lesson;
import koreanit.lms.edusys.Service.LessonService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/lessons")
@RequiredArgsConstructor
public class LessonController {

    private final LessonService lessonService;

    @GetMapping
    public List<Lesson> getAllLessons() {
        return lessonService.findAll();
    }

    @GetMapping("/{id}")
    public Lesson getLessonById(@PathVariable Long id) {
        return lessonService.findById(id)
                .orElseThrow(() -> new RuntimeException("Lesson not found with id: " + id));
    }

    @PostMapping
    public Lesson createLesson(@RequestBody Lesson lesson) {
        return lessonService.save(lesson);
    }

    @DeleteMapping("/{id}")
    public void deleteLesson(@PathVariable Long id) {
        lessonService.deleteById(id);
    }
}