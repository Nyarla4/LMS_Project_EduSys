package koreanit.lms.edusys.Controller;

import koreanit.lms.edusys.Dto.WorkSubmitDTO;
import koreanit.lms.edusys.Entity.WorkSubmit;
import koreanit.lms.edusys.Service.WorkSubmitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/work-submits")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class WorkSubmitController {
    private final WorkSubmitService workSubmitService;

    @PostMapping("/submit")
    public ResponseEntity<?> submitWork(
            @RequestParam("wid") Integer wid,
            @RequestParam("sid") Integer sid,
            @RequestParam("file") MultipartFile file) {
        try {
            WorkSubmit submit = workSubmitService.submitWork(wid, sid, file);
            return ResponseEntity.ok(new WorkSubmitDTO(submit));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("제출 실패: " + e.getMessage());
        }
    }

    @GetMapping("/work/{wid}")
    public List<WorkSubmitDTO> getSubmissions(@PathVariable Integer wid) {
        return workSubmitService.findSubmissionsByWork(wid).stream()
                .map(WorkSubmitDTO::new)
                .collect(Collectors.toList());
    }

    @GetMapping("/work/{wid}/student/{sid}")
    public ResponseEntity<WorkSubmitDTO> getMySubmission(@PathVariable Integer wid, @PathVariable Integer sid) {
        return workSubmitService.findSubmissionByWorkAndStudent(wid, sid)
                .map(s -> ResponseEntity.ok(new WorkSubmitDTO(s)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{wsid}/grade")
    public ResponseEntity<WorkSubmitDTO> gradeWork(@PathVariable Integer wsid, @RequestBody String grade) {
        // JSON에서 문자열만 올 경우 따옴표 제거 로직이 필요할 수 있습니다.
        String cleanGrade = grade.replace("\"", "");
        WorkSubmit updated = workSubmitService.updateGrade(wsid, cleanGrade);
        return ResponseEntity.ok(new WorkSubmitDTO(updated));
    }
}