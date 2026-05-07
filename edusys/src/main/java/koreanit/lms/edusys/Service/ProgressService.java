package koreanit.lms.edusys.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import koreanit.lms.edusys.Entity.Lesson;
import koreanit.lms.edusys.Entity.Progress;
import koreanit.lms.edusys.Entity.Student;
import koreanit.lms.edusys.Entity.Subject;
import koreanit.lms.edusys.Repository.ProgressRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProgressService {
    private final ProgressRepository progressRepository;
    private final StudentService studentService;
    private final SubjectService subjectService;
    private final LessonService lessonService;

    public List<Progress> findAllProgresses() {
        return progressRepository.findAll();
    }

    public List<Progress> findAllProgressesByStudent(Integer sid) {
        return progressRepository.findByStudentSid(sid);
    }

    public List<Progress> findAllProgressesBySubject(Integer subid) {
        return progressRepository.findBySubjectSubid(subid);
    }

    public List<Progress> findAllProgressesByLesson(Integer lid) {
        return progressRepository.findByLessonLid(lid);
    }

    public Optional<Progress> findProgressById(Integer pid) {
        if(pid == null) {
            return null;
        }
        return progressRepository.findById(pid);
    }

    public Progress createProgress(Integer sid, Integer subid, Integer lid) {
        Progress progress = new Progress();
        Student student = studentService.findById(sid);
        if(student == null) {
            return null;
        }
        Subject subject = subjectService.findSubjectById(subid);
        if(subject == null) {
            return null;
        }
        Optional<Lesson> optionalLesson = lessonService.findLessonById(lid);
        if(optionalLesson.isEmpty()) {
            return null;
        }
        Lesson lesson = optionalLesson.get();
        progress.setStudent(student);
        progress.setSubject(subject);
        progress.setLesson(lesson);
        return progressRepository.save(progress);
    }

    public void deleteProgress(Integer pid) {
        if(pid == null) {
            return;
        }
        Optional<Progress> optionalProgress = progressRepository.findById(pid);
        if(optionalProgress.isPresent()) {
            progressRepository.delete(optionalProgress.get());
        }
    }