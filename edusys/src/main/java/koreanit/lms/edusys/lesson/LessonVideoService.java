package koreanit.lms.edusys.lesson;

import koreanit.lms.edusys.lesson.LessonVideo;
import koreanit.lms.edusys.lesson.LessonVideoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LessonVideoService {

    private final LessonVideoRepository lessonVideoRepository;

    public List<LessonVideo> findAll() {
        return lessonVideoRepository.findAll();
    }

    public Optional<LessonVideo> findById(Long id) {
        return lessonVideoRepository.findById(id);
    }

    public LessonVideo save(LessonVideo lessonVideo) {
        return lessonVideoRepository.save(lessonVideo);
    }

    public void deleteById(Long id) {
        lessonVideoRepository.deleteById(id);
    }

    public List<LessonVideo> findByLessonId(Long lessonId) {
        return lessonVideoRepository.findByLessonId(lessonId);
    }
}