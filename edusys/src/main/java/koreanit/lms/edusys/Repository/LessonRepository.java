package koreanit.lms.edusys.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import koreanit.lms.edusys.Entity.Lesson;

public interface LessonRepository extends JpaRepository<Lesson, Integer> {
    List<Lesson> findBySubjectSubid(Integer subid);
}