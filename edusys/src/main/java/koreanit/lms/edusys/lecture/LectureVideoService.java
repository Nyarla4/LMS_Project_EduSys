package koreanit.lms.edusys.lecture;

import koreanit.lms.edusys.lecture.LectureVideo;
import koreanit.lms.edusys.lecture.LectureVideoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LectureVideoService {

    private final LectureVideoRepository lectureVideoRepository;

    public List<LectureVideo> findAll() {
        return lectureVideoRepository.findAll();
    }

    public Optional<LectureVideo> findById(Long id) {
        return lectureVideoRepository.findById(id);
    }

    public LectureVideo save(LectureVideo lectureVideo) {
        return lectureVideoRepository.save(lectureVideo);
    }

    public void deleteById(Long id) {
        lectureVideoRepository.deleteById(id);
    }
}
