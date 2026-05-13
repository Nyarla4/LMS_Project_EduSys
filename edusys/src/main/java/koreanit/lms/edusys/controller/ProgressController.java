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
        return progressService.findAllProgresses();
    }

    @GetMapping("/{id}")
    public Progress getProgressById(@PathVariable Integer id) {
        return progressService.findProgressById(id)
                .orElseThrow(() -> new RuntimeException("Progress not found with id: " + id));
    }

    // 임시로 주석처리, 추후 Lesson Video 수정시 참조

    // @GetMapping("/student/{studentId}/video/{videoId}")
    // public Optional<Progress> getProgress(@PathVariable Integer studentId, @PathVariable Long videoId) {
    //     return progressService.getProgressByStudentAndVideo(studentId, videoId);
    // }

    // @PostMapping("/update")
    // public Progress updateProgress(
    //         @RequestParam Integer studentId,
    //         @RequestParam Long videoId,
    //         @RequestParam Integer lastTime) {
    //     return progressService.updateProgress(studentId, videoId, lastTime);
    // }

    @PostMapping
    public Progress saveProgress(@RequestBody Progress progress) {
        return progressService.createProgress(progress);
    }

    @DeleteMapping("/{id}")
    public void deleteProgress(@PathVariable Integer id) {
        progressService.deleteProgress(id);
    }
}