package koreanit.lms.edusys.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import koreanit.lms.edusys.Entity.Progress;
import koreanit.lms.edusys.Repository.ProgressRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProgressService {
    private final ProgressRepository progressRepository;

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
}