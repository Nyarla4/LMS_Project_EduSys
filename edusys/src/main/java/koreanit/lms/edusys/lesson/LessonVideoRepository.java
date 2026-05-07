package koreanit.lms.edusys.lesson;

import koreanit.lms.edusys.lesson.LessonVideo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LessonVideoRepository extends JpaRepository<LessonVideo, Long> {
    List<LessonVideo> findByLessonId(Long lessonId);
}