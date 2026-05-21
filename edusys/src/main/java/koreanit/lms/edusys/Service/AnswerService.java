package koreanit.lms.edusys.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import koreanit.lms.edusys.Entity.Answer;
import koreanit.lms.edusys.Entity.Question;
import koreanit.lms.edusys.Entity.Teacher;
import koreanit.lms.edusys.Repository.AnswerRepository;
import koreanit.lms.edusys.Repository.QuestionRepository;
import koreanit.lms.edusys.Repository.TeacherRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AnswerService {
    private final AnswerRepository answerRepository;
    private final QuestionRepository questionRepository;
    private final TeacherRepository teacherRepository;

    public List<Answer> findAllAnswers() {
        return answerRepository.findAll();
    }

    public List<Answer> findAllByTeacher(Integer tid) {
        return answerRepository.findByTeacherTid(tid);
    }

    public List<Answer> findAllByQuestion(Integer queid) {
        return answerRepository.findByQuestionQueid(queid);
    }

    public Optional<Answer> findAnswerById(Integer ansid) {
        if(ansid == null) {
            return null;
        }
        return answerRepository.findById(ansid);
    }

    public Answer createAnswer(Integer queid, Integer tid, String content) {
        Answer answer = new Answer();
        if(queid == null || tid == null){
            return null;
        }
        Optional<Question> oQuestion = questionRepository.findById(queid);
        if(oQuestion.isEmpty()){
            return null;
        }
        Optional<Teacher> oTeacher = teacherRepository.findById(tid);
        if(oTeacher.isEmpty()){
            return null;
        }
        answer.setQuestion(oQuestion.get());
        answer.setTeacher(oTeacher.get());
        answer.setContent(content);
        return answerRepository.save(answer);
    }

    public Answer updateAnswer(Integer ansid, Integer queid, Integer tid, String content) {
        if(ansid == null || queid == null || tid == null){
            return null;
        }
        Optional<Answer> oAnswer = answerRepository.findById(ansid);
        if(oAnswer.isEmpty()){
            return null;
        }
        Optional<Question> oQuestion = questionRepository.findById(queid);
        if(oQuestion.isEmpty()){
            return null;
        }
        Optional<Teacher> oTeacher = teacherRepository.findById(tid);
        if(oTeacher.isEmpty()){
            return null;
        }
        Answer answer = oAnswer.get();
        answer.setQuestion(oQuestion.get());
        answer.setTeacher(oTeacher.get());
        answer.setContent(content);
        return answerRepository.save(answer);
    }

    public void deleteAnswer(Integer ansid) {
        if(ansid == null) {
            return;
        }
        Answer existingAnswer = answerRepository.findById(ansid).orElse(null);
        if (existingAnswer != null) {
            answerRepository.delete(existingAnswer);
        }
    }
}