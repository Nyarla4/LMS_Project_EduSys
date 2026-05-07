package koreanit.lms.edusys.Service;

import koreanit.lms.edusys.Entity.Lesson;
import koreanit.lms.edusys.Repository.LessonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LessonService {

    private final LessonRepository lessonRepository;

    public List<Lesson> findAll() {
        return lessonRepository.findAll();
    }

    public Optional<Lesson> findById(Long id) {
        return lessonRepository.findById(id);
    }

    public Lesson save(Lesson lesson) {
        return lessonRepository.save(lesson);
    }

    public void deleteById(Long id) {
        lessonRepository.deleteById(id);
    }
}