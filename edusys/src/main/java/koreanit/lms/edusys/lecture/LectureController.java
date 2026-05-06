package koreanit.lms.edusys.lecture;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/lectures")
@RequiredArgsConstructor
public class LectureController {

    private final LectureService lectureService;

    @GetMapping
    public List<Lecture> getAllLectures() {
        return lectureService.findAll();
    }

    @GetMapping("/{id}")
    public Lecture getLectureById(@PathVariable Long id) {
        return lectureService.findById(id)
                .orElseThrow(() -> new RuntimeException("Lecture not found with id: " + id));
    }

    @PostMapping
    public Lecture createLecture(@RequestBody Lecture lecture) {
        return lectureService.save(lecture);
    }

    @DeleteMapping("/{id}")
    public void deleteLecture(@PathVariable Long id) {
        lectureService.deleteById(id);
    }

}