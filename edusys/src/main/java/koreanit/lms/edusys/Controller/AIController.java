package koreanit.lms.edusys.Controller;

import koreanit.lms.edusys.Dto.ExamDTO;
import koreanit.lms.edusys.Service.AIService;
import koreanit.lms.edusys.Service.AIService.ExamGradeResponse;
import koreanit.lms.edusys.Service.AIService.IncorrectNoteResponse;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDate;

import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AIController {
    private final AIService aiService;

    @GetMapping("/recommend-exam/{esid}")
    public ExamDTO recommendExam(@PathVariable Integer esid, @RequestParam Boolean isObjective) {
        return aiService.createExamFromAI(esid, isObjective);
    }

    @PutMapping("/grade-exam/{eid}")
    public ExamGradeResponse gradeExam(@PathVariable Integer eid, @RequestBody String answer) {
        ExamGradeResponse result = aiService.gradeExam(eid, answer);
        if(result.score() == -1) {
            throw new IllegalArgumentException("시험이 존재하지 않습니다. ID: " + eid);
        }
        return result;
    }

    @Getter
    @Setter
    @ToString
    public static class IncorrectNoteRequest {
        private String answer;
        private String score;
    }

    @PutMapping("/incorrect-note/{eid}")
    public IncorrectNoteResponse incorrectNote(@PathVariable Integer eid, @RequestBody IncorrectNoteRequest request) {
        IncorrectNoteResponse result = aiService.noteExam(eid, request.answer, request.score);
        if(result.analysis().isEmpty()) {
            throw new IllegalArgumentException("시험이 존재하지 않습니다. ID: " + eid);
        }
        return result;
    }
}