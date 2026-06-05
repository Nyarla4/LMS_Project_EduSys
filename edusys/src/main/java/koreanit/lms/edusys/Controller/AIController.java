package koreanit.lms.edusys.Controller;

import koreanit.lms.edusys.Dto.ExamDTO;
import koreanit.lms.edusys.Service.AIService;
import koreanit.lms.edusys.Service.AIService.ExamGradeResponse;
import koreanit.lms.edusys.Service.AIService.IncorrectNoteResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;


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

    @PutMapping("/incorrect-note/{eid}")
    public IncorrectNoteResponse incorrectNote(@PathVariable Integer eid, @RequestBody String answer) {
        IncorrectNoteResponse result = aiService.noteExam(eid, answer);
        if(result.analysis().isEmpty()) {
            throw new IllegalArgumentException("시험이 존재하지 않습니다. ID: " + eid);
        }
        return result;
    }
}