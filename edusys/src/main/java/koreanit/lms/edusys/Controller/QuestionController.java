package koreanit.lms.edusys.Controller;

import koreanit.lms.edusys.Dto.QuestionDTO;
import koreanit.lms.edusys.Entity.Lesson;
import koreanit.lms.edusys.Entity.Question;
import koreanit.lms.edusys.Service.LessonService;
import koreanit.lms.edusys.Service.QuestionService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/question")
@RequiredArgsConstructor
public class QuestionController {
    private final QuestionService questionService;
    private final LessonService lessonService;

    @GetMapping("/{lid}")
    public ResponseEntity<List<QuestionDTO>> getAllQuestions(@PathVariable Integer lid) {
        Optional<Lesson> oLesson = lessonService.findLessonById(lid);
        if (oLesson.isEmpty())
            return null;
        List<QuestionDTO> result = new ArrayList<QuestionDTO>();
        for (Question q : questionService.findAllByLesson(oLesson.get().getLid())) {
            QuestionDTO qdto = new QuestionDTO(q);
            result.add(qdto);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/detail/{id}")
    public ResponseEntity<QuestionDTO> getQuestionById(@PathVariable Integer id) {
        Question question = questionService.findQuestionById(id)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + id));
        return ResponseEntity.ok(new QuestionDTO(question));
    }

    @PostMapping
    public ResponseEntity<QuestionDTO> createQuestion(@RequestBody QuestionDTO question) {
        Question createdQuestion = questionService.createQuestion(question.getSid(), question.getLid(), question.getContent());
        return ResponseEntity.ok(new QuestionDTO(createdQuestion));
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuestionDTO> updateQuestion(@PathVariable Integer id, @RequestBody QuestionDTO question) {
        Question updatedQuestion = questionService.updateQuestion(id, question.getContent());
        return ResponseEntity.ok(new QuestionDTO(updatedQuestion));
    }

    @DeleteMapping("/{id}")
    public void deleteQuestion(@PathVariable Integer id) {
        questionService.deleteQuestion(id);
    }
}