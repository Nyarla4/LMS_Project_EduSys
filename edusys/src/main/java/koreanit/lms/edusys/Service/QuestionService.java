package koreanit.lms.edusys.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import koreanit.lms.edusys.Entity.Question;
import koreanit.lms.edusys.Entity.Student;
import koreanit.lms.edusys.Entity.Lesson;
import koreanit.lms.edusys.Repository.QuestionRepository;
import koreanit.lms.edusys.Repository.StudentRepository;
import koreanit.lms.edusys.Repository.LessonRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class QuestionService {
    private final QuestionRepository questionRepository;
    private final StudentRepository studentRepository;
    private final LessonRepository lessonRepository;

    public List<Question> findAllQuestions() {
        return questionRepository.findAll();
    }

    public List<Question> findAllByStudent(Integer sid) {
        return questionRepository.findByStudentSid(sid);
    }

    public List<Question> findAllByLesson(Integer lid) {
        return questionRepository.findByLessonLid(lid);
    }

    public List<Question> findAllBySubject(Integer subid) {
        return questionRepository.findByLessonSubjectSubid(subid);
    }

    public Optional<Question> findQuestionById(Integer qid) {
        if(qid == null) {
            return null;
        }
        return questionRepository.findById(qid);
    }

    public Question createQuestion(Integer sid, Integer lid, String content) {
        Question question = new Question();
        if(sid == null || lid == null){
            return null;
        }
        Optional<Student> oStudent = studentRepository.findById(sid);
        if(oStudent.isEmpty()){
            return null;
        }
        Optional<Lesson> oLesson = lessonRepository.findById(lid);
        if(oLesson.isEmpty()){
            return null;
        }
        question.setStudent(oStudent.get());
        question.setLesson(oLesson.get());
        question.setContent(content);
        return questionRepository.save(question);
    }

    public Question updateQuestion(Integer qid, String content) {
        if(qid == null) {
            return null;
        }
        Question existingQuestion = questionRepository.findById(qid).orElse(null);
        if (existingQuestion != null) {
            existingQuestion.setContent(content);
            return questionRepository.save(existingQuestion);
        }
        return null;
    }

    public void deleteQuestion(Integer qid) {
        if(qid == null) {
            return;
        }
        Question existingQuestion = questionRepository.findById(qid).orElse(null);
        if (existingQuestion != null) {
            questionRepository.delete(existingQuestion);
        }
    }
}