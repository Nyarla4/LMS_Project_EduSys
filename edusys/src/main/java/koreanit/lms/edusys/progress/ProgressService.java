package koreanit.lms.edusys.progress;

import koreanit.lms.edusys.progress.Progress;
import koreanit.lms.edusys.progress.ProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProgressService {
    private final ProgressRepository progressRepository;

    public List<Progress> findAll() {
        return progressRepository.findAll();
    }

    public Optional<Progress> findById(Long id) {
        return progressRepository.findById(id);
    }

    public Progress save(Progress progress) {
        return progressRepository.save(progress);
    }

    public void deleteById(Long id) {
        progressRepository.deleteById(id);
    }

    public Progress updateProgress(Long studentId, Long videoId, Integer lastTime) {
        return progressRepository.findByStudentIdAndVideoId(studentId, videoId)
                .map(p -> {
                    p.setProgress(lastTime);
                    return progressRepository.save(p);
                })
                .orElseGet(() -> {
                    Progress newProgress = new Progress();
                    newProgress.setStudentId(studentId);
                    newProgress.setVideoId(videoId);
                    newProgress.setProgress(lastTime);
                    return progressRepository.save(newProgress);
                });
    }

    public Optional<Progress> getProgressByStudentAndVideo(Long studentId, Long videoId) {
        return progressRepository.findByStudentIdAndVideoId(studentId, videoId);
    }

    public List<Progress> findByStudentId(Long studentId) {
        return progressRepository.findByStudentId(studentId);
    }
}