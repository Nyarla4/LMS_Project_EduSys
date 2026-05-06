package koreanit.lms.edusys.progress;

import koreanit.lms.edusys.progress.Progress;
import koreanit.lms.edusys.progress.ProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

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

    @PostMapping
    public Progress saveProgress(@RequestBody Progress progress) {
        return progressService.save(progress);
    }

    @DeleteMapping("/{id}")
    public void deleteProgress(@PathVariable Long id) {
        progressService.deleteById(id);
    }
}