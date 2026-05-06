package koreanit.lms.edusys.lecture;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LectureService {

    private final LectureRepository lectureRepository;

    public List<Lecture> findAll() {
        return lectureRepository.findAll();
    }

    public Optional<Lecture> findById(Long id) {
        return lectureRepository.findById(id);
    }

    public Lecture save(Lecture lecture) {
        return lectureRepository.save(lecture);
    }

    public void deleteById(Long id) {
        lectureRepository.deleteById(id);
    }
}