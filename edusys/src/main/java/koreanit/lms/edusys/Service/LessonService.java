package koreanit.lms.edusys.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import koreanit.lms.edusys.Entity.Lesson;
import koreanit.lms.edusys.Entity.Subject;
import koreanit.lms.edusys.Repository.LessonRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LessonService {
    private final LessonRepository lessonRepository;
    private final SubjectService subjectService;

    public List<Lesson> findAllLessons() {
        return lessonRepository.findAll();
    }

    public List<Lesson> findAllLessonsBySubject(Integer subid) {
        return lessonRepository.findBySubjectSubid(subid);
    }

    public Optional<Lesson> findLessonById(Integer lid) {
        if(lid == null) {
            return null;
        }
        return lessonRepository.findById(lid);
    }

    public Lesson createLesson(Integer subid, String name, String file) {
        Lesson lesson = new Lesson();
        Subject subject = subjectService.findSubjectById(subid);
        if(subject == null) {
            return null;
        }
        lesson.setSubject(subject);
        lesson.setName(name);
        lesson.setFile(file);
        return lessonRepository.save(lesson);
    }

    public void deleteLesson(Integer lid) {
        if(lid == null) {
            return;
        }
        Lesson existingLesson = lessonRepository.findById(lid).orElse(null);
        if (existingLesson != null) {
            lessonRepository.delete(existingLesson);
        }
    }
}