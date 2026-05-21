package koreanit.lms.edusys.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import koreanit.lms.edusys.Entity.Answer;

public interface AnswerRepository extends JpaRepository<Answer, Integer> {
    List<Answer> findByTeacherTid(Integer tid);
    List<Answer> findByQuestionQueid(Integer queid);
}