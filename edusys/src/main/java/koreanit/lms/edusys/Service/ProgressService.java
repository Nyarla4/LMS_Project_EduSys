package koreanit.lms.edusys.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private final AttendanceService attendanceService;

    @Transactional(readOnly = true)
    public List<Progress> findAllProgresses() {
        return progressRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Progress> findAllProgressesByStudent(Integer sid) {
        return progressRepository.findByStudentSid(sid);
    }

    @Transactional(readOnly = true)
    public List<Progress> findAllProgressesBySubject(Integer subid) {
        return progressRepository.findByLessonSubjectSubid(subid);
    }

    @Transactional(readOnly = true)
    public List<Progress> findAllProgressesByLesson(Integer lid) {
        return progressRepository.findByLessonLid(lid);
    }

    public Optional<Progress> findProgressById(Integer pid) {
        if(pid == null) {
            return Optional.empty();
        }
        return progressRepository.findById(pid);
    }

    @Transactional(readOnly = true)
    public Optional<Progress> getProgressByStudentAndLesson(Integer studentId, Integer lessonId) {
        return progressRepository.findByStudentSidAndLessonLid(studentId, lessonId);
    }

    @Transactional
    public Progress updateProgress(Integer studentId, Integer lessonId, Integer lastTime) {
        Lesson lesson = lessonService.findLessonById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        Progress progress = progressRepository.findByStudentSidAndLessonLid(studentId, lessonId)
                .orElse(new Progress());
        
        if (progress.getPid() == null) {
            Student student = studentService.findById(studentId);
            progress.setStudent(student);
            progress.setLesson(lesson);
        }
        
        // 이미 더 높은 진도가 기록되어 있다면 업데이트 무시 (역전 방지 로직)
        if (progress.getProgressed() != null && progress.getProgressed() > lastTime) {
            return progress;
        }

        progress.setProgressed(lastTime);
        Progress saved = progressRepository.save(progress);

        // 시청률 계산 및 90% 이상 시 출석 처리
        Integer duration = lesson.getDuration();
        if (duration != null && duration > 0) {
            double ratio = (double) lastTime / duration;
            if (ratio >= 0.9) {
                if (lesson.getSubject() != null) {
                    attendanceService.markAsPresent(studentId, lesson.getSubject().getSubid(), lesson.getDate());
                }
            }
        }
        
        return saved;
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
        progress.setLesson(lesson);
        return progressRepository.save(progress);
    }

    public Progress createProgress(Progress progress) {
        if(progress == null) {
            return null;
        }
        return progressRepository.save(progress);
    }

    public void deleteProgress(Integer pid) {
        if(pid == null) {
            return;
        }
        progressRepository.findById(pid).ifPresent(progressRepository::delete);
    }
}