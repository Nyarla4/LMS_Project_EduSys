package koreanit.lms.edusys.Controller;

import koreanit.lms.edusys.Entity.Progress;
import koreanit.lms.edusys.Service.ProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/progresses")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService progressService;

    @GetMapping
    public List<Progress> getAllProgresses() {
        return progressService.findAll();
    }

    @GetMapping("/{id}")
    public Progress getProgressById(@PathVariable Long id) {
        return progressService.findById(id)
                .orElseThrow(() -> new RuntimeException("Progress not found with id: " + id));
    }

    @GetMapping("/student/{studentId}/video/{videoId}")
    public Optional<Progress> getProgress(@PathVariable Long studentId, @PathVariable Long videoId) {
        return progressService.getProgressByStudentAndVideo(studentId, videoId);
    }

    @PostMapping("/update")
    public Progress updateProgress(
            @RequestParam Long studentId,
            @RequestParam Long videoId,
            @RequestParam Integer lastTime) {
        return progressService.updateProgress(studentId, videoId, lastTime);
    }

    @PostMapping
    public Progress saveProgress(@RequestBody Progress progress) {
        return progressService.save(progress);
    }

    @DeleteMapping("/{id}")
    public void deleteProgress(@PathVariable Long id) {
        progressService.deleteById(id);
    }
}