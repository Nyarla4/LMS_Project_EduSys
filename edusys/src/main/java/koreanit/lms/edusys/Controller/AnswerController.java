package koreanit.lms.edusys.Controller;

import koreanit.lms.edusys.Dto.AnswerDTO;
import koreanit.lms.edusys.Entity.Answer;
import koreanit.lms.edusys.Service.AnswerService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/answer")
@RequiredArgsConstructor
public class AnswerController {
    private final AnswerService answerService;

    @GetMapping("/{queid}")
    public ResponseEntity<List<AnswerDTO>> getAllAnswers(@PathVariable Integer queid) {
        List<AnswerDTO> result = new ArrayList<AnswerDTO>();
        for (Answer a : answerService.findAllByQuestion(queid)) {
            AnswerDTO adto = new AnswerDTO(a);
            result.add(adto);
        }
        return ResponseEntity.ok(result);
    }
    
    @PostMapping
    public ResponseEntity<AnswerDTO> createAnswer(@RequestBody AnswerDTO answer) {
        Answer createdAnswer = answerService.createAnswer(answer.getQueid(), answer.getTid(), answer.getContent());
        return ResponseEntity.ok(new AnswerDTO(createdAnswer));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AnswerDTO> updateAnswer(@PathVariable Integer id, @RequestBody AnswerDTO answer) {
        Answer updatedAnswer = answerService.updateAnswer(id, answer.getQueid(), answer.getTid(), answer.getContent());
        return ResponseEntity.ok(new AnswerDTO(updatedAnswer));
    }

    @DeleteMapping("/{id}")
    public void deleteAnswer(@PathVariable Integer id) {
        answerService.deleteAnswer(id);
    }
}