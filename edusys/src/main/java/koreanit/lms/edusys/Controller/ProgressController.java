package koreanit.lms.edusys.Controller;

import koreanit.lms.edusys.Entity.Progress;
import koreanit.lms.edusys.Service.ProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

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

    @GetMapping("/student/{studentId}")
    public List<Map<String, Object>> getProgressByStudent(@PathVariable Integer studentId) {
        List<Progress> progresses = progressService.findAllProgressesByStudent(studentId);
        // 프론트엔드의 progressMap 구성에 맞게 데이터 변환 (videoId, progress)
        return progresses.stream().map(p -> {
            Map<String, Object> map = new HashMap<>();
            map.put("videoId", p.getLesson() != null ? p.getLesson().getLid() : null);
            map.put("progress", p.getProgressed());
            return map;
        }).collect(Collectors.toList());
    }

    @GetMapping("/student/{studentId}/video/{videoId}")
    public Optional<Progress> getProgress(@PathVariable Integer studentId, @PathVariable Integer videoId) {
        return progressService.getProgressByStudentAndLesson(studentId, videoId);
    }

    @PostMapping("/update")
    public Progress updateProgress(
            @RequestParam Integer studentId,
            @RequestParam Integer videoId,
            @RequestParam Integer lastTime) {
        return progressService.updateProgress(studentId, videoId, lastTime);
    }

    @PostMapping
    public Progress saveProgress(@RequestBody Progress progress) {
        return progressService.createProgress(progress);
    }

    @DeleteMapping("/{id}")
    public void deleteProgress(@PathVariable Integer id) {
        progressService.deleteProgress(id);
    }
}