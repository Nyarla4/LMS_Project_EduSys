package koreanit.lms.edusys.Controller;

import koreanit.lms.edusys.Dto.ExamSetDTO;
import koreanit.lms.edusys.Entity.ExamSet;
import koreanit.lms.edusys.Service.ExamSetService;
import koreanit.lms.edusys.Service.ExamGradeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/examsets")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ExamSetController {
    private final ExamSetService examSetService;
    private final ExamGradeService examGradeService;

    @GetMapping("/subject/{subid}")
    public ResponseEntity<List<ExamSetDTO>> getExamSetsBySubject(
            @PathVariable Integer subid,
            @RequestParam(required = false) Integer sid) {
        List<ExamSet> examSets = examSetService.findAllExamSetsBySubject(subid);
        List<ExamSetDTO> dtos = examSets.stream()
                .map(es -> {
                    ExamSetDTO dto = new ExamSetDTO(es);
                    if (sid != null) dto.setTotalScore(examGradeService.calculateTotalScore(es.getEsid(), sid));
                    return dto;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{esid}")
    public ResponseEntity<ExamSetDTO> getExamSetById(@PathVariable Integer esid) {
        ExamSet examSet = examSetService.findExamSetById(esid)
                .orElseThrow(() -> new RuntimeException("ExamSet not found with id: " + esid));
        return ResponseEntity.ok(new ExamSetDTO(examSet));
    }

    @PostMapping
    public ResponseEntity<ExamSetDTO> createExamSet(@RequestBody ExamSetDTO examSetDTO) {
        ExamSet createdExamSet = examSetService.createExamSet(
                examSetDTO.getSubid(),
                examSetDTO.getName(),
                examSetDTO.getExamDate(),
                examSetDTO.getStatus()
        );
        return ResponseEntity.ok(new ExamSetDTO(createdExamSet));
    }

    @PutMapping("/{esid}")
    public ResponseEntity<ExamSetDTO> updateExamSet(@PathVariable Integer esid, @RequestBody ExamSetDTO examSetDTO) {
        ExamSet updatedExamSet = examSetService.updateExamSet(
                esid,
                examSetDTO.getName(),
                examSetDTO.getExamDate(),
                examSetDTO.getStatus()
        );
        return ResponseEntity.ok(new ExamSetDTO(updatedExamSet));
    }

    @DeleteMapping("/{esid}")
    public ResponseEntity<Void> deleteExamSet(@PathVariable Integer esid) {
        examSetService.deleteExamSet(esid);
        return ResponseEntity.noContent().build();
    }
}