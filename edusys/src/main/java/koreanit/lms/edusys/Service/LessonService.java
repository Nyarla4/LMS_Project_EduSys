package koreanit.lms.edusys.Service;

import koreanit.lms.edusys.Entity.Lesson;
import koreanit.lms.edusys.Repository.LessonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LessonService {
    private final LessonRepository lessonRepository;

    public List<Lesson> findAllLessons() {
        return lessonRepository.findAll();
    }

    public Optional<Lesson> findLessonById(Integer id) {
        if (id == null) return Optional.empty();
        return lessonRepository.findById(id);
    }

    @Transactional
    public Lesson createLesson(Lesson lesson) {
        if (lesson == null) return null;
        return lessonRepository.save(lesson);
    }

    @Transactional
    public void deleteLesson(Integer id) {
        if (id != null && lessonRepository.existsById(id)) {
            lessonRepository.deleteById(id);
        }
    }
}