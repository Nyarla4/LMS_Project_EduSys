package koreanit.lms.edusys.Controller;

import koreanit.lms.edusys.Dto.ExamDTO;
import koreanit.lms.edusys.Entity.Exam;
import koreanit.lms.edusys.Service.AIService;
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
    public Integer gradeExam(@PathVariable Integer eid, @RequestBody String answer) {
        Integer score = aiService.gradeExam(eid, answer);
        if(score == -1) {
            throw new IllegalArgumentException("시험이 존재하지 않습니다. ID: " + eid);
        }
        return score;
    }
}