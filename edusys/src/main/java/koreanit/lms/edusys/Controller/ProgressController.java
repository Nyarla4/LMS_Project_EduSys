package koreanit.lms.edusys.Controller;

import koreanit.lms.edusys.Dto.ProgressDTO;
import koreanit.lms.edusys.Entity.Progress;
import koreanit.lms.edusys.Service.ProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/progresses")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ProgressController {

    private final ProgressService progressService;

    @GetMapping
    public List<ProgressDTO> getAllProgresses() {
        return progressService.findAllProgresses().stream()
                .map(ProgressDTO::new)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ProgressDTO getProgressById(@PathVariable Integer id) {
        Progress progress = progressService.findProgressById(id)
                .orElseThrow(() -> new RuntimeException("Progress not found with id: " + id));
        return new ProgressDTO(progress);
    }

    @GetMapping("/student/{studentId}")
    public List<ProgressDTO> getProgressByStudent(@PathVariable Integer studentId) {
        List<Progress> progresses = progressService.findAllProgressesByStudent(studentId);
        return progresses.stream()
                .map(ProgressDTO::new)
                .collect(Collectors.toList());
    }

    @GetMapping("/student/{studentId}/video/{videoId}")
    public ResponseEntity<ProgressDTO> getProgress(@PathVariable Integer studentId, @PathVariable Integer videoId) {
        return progressService.getProgressByStudentAndLesson(studentId, videoId)
                .map(p -> ResponseEntity.ok(new ProgressDTO(p)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/update")
    public ProgressDTO updateProgress(
            @RequestParam Integer studentId,
            @RequestParam Integer videoId,
            @RequestParam Integer lastTime) {
        return new ProgressDTO(progressService.updateProgress(studentId, videoId, lastTime));
    }

    @PostMapping
    public ProgressDTO saveProgress(@RequestBody Progress progress) {
        return new ProgressDTO(progressService.createProgress(progress));
    }

    @DeleteMapping("/{id}")
    public void deleteProgress(@PathVariable Integer id) {
        progressService.deleteProgress(id);
    }
}