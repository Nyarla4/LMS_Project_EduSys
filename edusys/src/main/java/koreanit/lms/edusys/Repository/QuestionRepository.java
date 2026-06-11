package koreanit.lms.edusys.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import koreanit.lms.edusys.Entity.Question;

public interface QuestionRepository extends JpaRepository<Question, Integer> {
    List<Question> findByStudentSid(Integer sid);
    List<Question> findByLessonLid(Integer lid);
    List<Question> findByLessonSubjectSubid(Integer subid);
}