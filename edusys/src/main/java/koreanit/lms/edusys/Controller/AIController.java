package koreanit.lms.edusys.Controller;

import koreanit.lms.edusys.Dto.ExamDTO;
import koreanit.lms.edusys.Entity.Exam;
import koreanit.lms.edusys.Service.AIService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AIController {
    private final AIService aiService;

    @GetMapping("/recommend-exam/{esid}")
    public ExamDTO recommendExam(@PathVariable Integer esid, @RequestParam Boolean isObjective) {
        // DB에 저장하지 않고 생성된 객체만 반환하거나, 
        // 기존 AIService 로직대로 저장 후 반환할 수 있습니다.
        return aiService.createExamFromAI(esid, isObjective);
    }
}