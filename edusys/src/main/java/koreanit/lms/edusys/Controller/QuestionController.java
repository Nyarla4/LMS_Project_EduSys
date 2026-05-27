package koreanit.lms.edusys.Controller;

import koreanit.lms.edusys.Dto.QuestionDTO;
import koreanit.lms.edusys.Entity.Answer;
import koreanit.lms.edusys.Entity.Lesson;
import koreanit.lms.edusys.Entity.Question;
import koreanit.lms.edusys.Service.AnswerService;
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
@CrossOrigin(origins = "http://localhost:3000")
public class QuestionController {
    private final QuestionService questionService;
    private final LessonService lessonService;
    private final AnswerService answerService;

    @GetMapping("/{lid}")
    public ResponseEntity<List<QuestionDTO>> getAllQuestions(@PathVariable Integer lid) {
        Optional<Lesson> oLesson = lessonService.findLessonById(lid);
        if (oLesson.isEmpty())
            return ResponseEntity.notFound().build();

        List<QuestionDTO> result = new ArrayList<QuestionDTO>();
        for (Question q : questionService.findAllByLesson(oLesson.get().getLid())) {
            // 가장 최근에 등록된 답변을 가져오도록 수정 (수정 효과 반영)
            Answer answer = answerService.findAllByQuestion(q.getQueid()).stream()
                    .reduce((first, second) -> second)
                    .orElse(null);
            QuestionDTO qdto = new QuestionDTO(q, answer);
            result.add(qdto);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/subject/{subid}")
    public ResponseEntity<List<QuestionDTO>> getQuestionsBySubject(@PathVariable Integer subid) {
        List<Question> questions = questionService.findAllBySubject(subid);
        List<QuestionDTO> result = new ArrayList<>();
        for (Question q : questions) {
            // 가장 최근 답변 반영
            Answer answer = answerService.findAllByQuestion(q.getQueid()).stream()
                    .reduce((first, second) -> second)
                    .orElse(null);
            result.add(new QuestionDTO(q, answer));
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/detail/{id}")
    public ResponseEntity<QuestionDTO> getQuestionById(@PathVariable Integer id) {
        Question question = questionService.findQuestionById(id)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + id));
        // 가장 최근 답변 반영
        Answer answer = answerService.findAllByQuestion(question.getQueid()).stream()
                .reduce((first, second) -> second)
                .orElse(null);
        return ResponseEntity.ok(new QuestionDTO(question, answer));
    }

    @PostMapping
    public ResponseEntity<QuestionDTO> createQuestion(@RequestBody QuestionDTO question) {
        Question createdQuestion = questionService.createQuestion(question.getSid(), question.getLid(), question.getContent());
        return ResponseEntity.ok(new QuestionDTO(createdQuestion, null));
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuestionDTO> updateQuestion(@PathVariable Integer id, @RequestBody QuestionDTO question) {
        Question updatedQuestion = questionService.updateQuestion(id, question.getContent());
        // 가장 최근 답변 반영
        Answer answer = answerService.findAllByQuestion(updatedQuestion.getQueid()).stream()
                .reduce((first, second) -> second)
                .orElse(null);
        return ResponseEntity.ok(new QuestionDTO(updatedQuestion, answer));
    }

    @DeleteMapping("/{id}")
    public void deleteQuestion(@PathVariable Integer id) {
        questionService.deleteQuestion(id);
    }
}